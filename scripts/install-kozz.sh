#!/usr/bin/env bash
# Kozz installer/updater/runner (idempotent)
# - Installs missing: node (>=22), ffmpeg, git, openssl, pm2
# - Clones/updates 3 repos; reinstalls deps only when repo changed/new
# - Generates keys via kozz-gw/scripts/generate_key_pair.sh, copies to others
# - Always runs via PM2 (creates ecosystem), prints resurrect instructions
# - Persists prefs in ~/.kozz.preferences (PM + base dir)

set -Eeuo pipefail

### ---------- config ----------
PREF_FILE="$HOME/.kozz.preferences"
DEFAULT_BASE_DIR="$HOME/kozz"
REPOS=(
  "kozz-gw|https://github.com/Kozz-Bot/Kozz-Gateway.git"
  "kozz-baileys|https://github.com/Kozz-Bot/kozz-baileys.git"
  "kozz-module-scaffold|https://github.com/Kozz-Bot/kozz-module-scaffolding.git"
)

log()  { echo -e "\033[1;36m[KOZZ]\033[0m $*"; }
warn() { echo -e "\033[1;33m[WARN]\033[0m $*"; }
err()  { echo -e "\033[1;31m[ERR ]\033[0m $*" >&2; }

require_cmd() { command -v "$1" >/dev/null 2>&1; }
node_major()  { local v; v="$(node -v 2>/dev/null || echo v0.0.0)"; v="${v#v}"; echo "${v%%.*}"; }

git_default_branch() {
  git remote show origin 2>/dev/null | sed -n 's/ *HEAD branch: //p'
}

prefer_master_or_head() {
  # If "master" exists on remote, prefer it; else use HEAD default branch
  git ls-remote --heads origin master >/dev/null 2>&1 && echo "master" && return
  local defb; defb="$(git_default_branch)"; [[ -n "$defb" ]] && echo "$defb" || echo "master"
}

pm_install_cmd() {
  local pm="$1"
  if [[ "$pm" == "npm" ]]; then
    if [[ -f package-lock.json ]]; then echo "npm ci"; else echo "npm install"; fi
  elif [[ "$pm" == "yarn" ]]; then
    if [[ -f yarn.lock ]]; then echo "yarn install"; else echo "yarn install"; fi
  else # pnpm
    if [[ -f pnpm-lock.yaml ]]; then echo "pnpm install"; else echo "pnpm install"; fi
  fi
}

pm2_script_args() {
  local pm="$1"
  if [[ "$pm" == "npm" ]]; then
    echo '"script": "npm", "args": "run start"'
  elif [[ "$pm" == "yarn" ]]; then
    echo '"script": "yarn", "args": "start"'
  else
    echo '"script": "pnpm", "args": "start"'
  fi
}

### ---------- detect OS ----------
OS="$(uname -s)"
ID_LIKE=""
if [[ -f /etc/os-release ]]; then
  # shellcheck disable=SC1091
  . /etc/os-release
  ID_LIKE="${ID_LIKE:-$ID}"
fi

### ---------- install helpers (install only if missing) ----------
ensure_linux_pkg() {
  local pkg="$1"      # apt/dnf package name(s) (may include spaces)
  local cmd="$2"      # command to check
  local installed_msg="$3"

  if require_cmd "$cmd"; then
    log "$installed_msg"
    return 0
  fi

  echo "Installing $pkg ..."

  if [[ "$ID_LIKE" =~ (debian|ubuntu) ]]; then
    sudo apt-get update -y
    sudo apt-get install -y $pkg
  elif [[ "$ID_LIKE" =~ (rhel|centos|fedora) ]]; then
    if command -v dnf >/dev/null 2>&1; then
      sudo dnf install -y $pkg
    else
      sudo yum install -y $pkg
    fi
  else
    err "Unsupported Linux distro for installing: $pkg"
    exit 1
  fi
}

ensure_node_22_plus() {
  local mj; mj="$(node_major || echo 0)"
  if (( mj >= 22 )); then
    log "Node $(node -v) already OK (>=22)."
    return 0
  fi

  log "Installing Node.js 22.x ..."
  if [[ "$OS" == "Darwin" ]]; then
    if ! require_cmd brew; then err "Homebrew not installed. Install it and re-run."; exit 1; fi
    brew install node@22
    # Prefer not to force-link automatically; user’s PATH may already include it via brew shim
    if ! require_cmd node; then
      warn "node not on PATH after brew install. You may need: brew link --force node@22"
    fi
  elif [[ "$OS" == "Linux" ]]; then
    if [[ "$ID_LIKE" =~ (debian|ubuntu) ]]; then
      curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
      sudo apt-get install -y nodejs
    elif [[ "$ID_LIKE" =~ (rhel|centos|fedora) ]]; then
      curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo -E bash -
      if command -v dnf >/dev/null 2>&1; then
        sudo dnf install -y nodejs
      else
        sudo yum install -y nodejs
      fi
    else
      err "Unsupported Linux distro for NodeSource setup."
      exit 1
    fi
  else
    err "Unsupported OS: $OS"
    exit 1
  fi

  local newmj; newmj="$(node_major || echo 0)"
  if (( newmj < 22 )); then
    err "Failed to get Node >= 22 (detected $(node -v)). Check PATH and retry."
    exit 1
  fi
}

ensure_pm2() {
  if require_cmd pm2; then
    log "PM2 already installed."
    return 0
  fi
  log "Installing PM2 globally..."
  # Try without sudo first (works for Homebrew/Nodesource user installs), then fallback
  if npm i -g pm2 >/dev/null 2>&1; then
    :
  else
    sudo npm i -g pm2
  fi
}

ensure_ffmpeg_git_openssl() {
  if [[ "$OS" == "Darwin" ]]; then
    if ! require_cmd brew; then err "Homebrew not installed. Install it and re-run."; exit 1; fi
    require_cmd ffmpeg || brew install ffmpeg
    require_cmd git    || brew install git
    require_cmd openssl || brew install openssl@3
  elif [[ "$OS" == "Linux" ]]; then
    if [[ "$ID_LIKE" =~ (debian|ubuntu) ]]; then
      ensure_linux_pkg "ffmpeg" ffmpeg "ffmpeg already installed."
      ensure_linux_pkg "git"    git    "git already installed."
      ensure_linux_pkg "openssl" openssl "openssl already installed."
    else
      # best effort for rpm-based
      ensure_linux_pkg "ffmpeg" ffmpeg "ffmpeg already installed."
      ensure_linux_pkg "git"    git    "git already installed."
      ensure_linux_pkg "openssl" openssl "openssl already installed."
    fi
  else
    err "Unsupported OS for package installation: $OS"
    exit 1
  fi
}

ensure_pm_available() {
  local pm="$1"
  if require_cmd "$pm"; then return 0; fi
  # Use Corepack to provision yarn/pnpm when missing
  if [[ "$pm" == "yarn" || "$pm" == "pnpm" ]]; then
    log "Activating $pm via Corepack..."
    corepack enable
    corepack prepare "$pm@stable" --activate
    if ! require_cmd "$pm"; then
      err "Failed to activate $pm via Corepack. Install it manually and re-run."
      exit 1
    fi
  else
    err "Package manager '$pm' not found."
    exit 1
  fi
}

### ---------- ensure system deps ----------
ensure_ffmpeg_git_openssl
ensure_node_22_plus
ensure_pm2

### ---------- preferences ----------
PM_DEFAULT="yarn"
BASE_DIR_DEFAULT="$DEFAULT_BASE_DIR"

if [[ -f "$PREF_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$PREF_FILE"
  PM="${PM:-$PM_DEFAULT}"
  BASE_DIR="${BASE_DIR:-$BASE_DIR_DEFAULT}"
  log "Loaded prefs (PM=$PM, BASE_DIR=$BASE_DIR) from $PREF_FILE"
else
  echo
  log "First run: creating $PREF_FILE"
  read -r -p "Preferred package manager (npm|yarn|pnpm) [$PM_DEFAULT]: " PM_IN || true
  PM="${PM_IN:-$PM_DEFAULT}"
  case "$PM" in npm|yarn|pnpm) ;; *) warn "Unknown '$PM', falling back to '$PM_DEFAULT'"; PM="$PM_DEFAULT";; esac
  read -r -p "Base directory for Kozz repos [$BASE_DIR_DEFAULT]: " BD_IN || true
  BASE_DIR="${BD_IN:-$BASE_DIR_DEFAULT}"
  cat >"$PREF_FILE" <<EOF
PM="$PM"
BASE_DIR="$BASE_DIR"
EOF
  chmod 600 "$PREF_FILE"
  log "Saved preferences to $PREF_FILE"
fi

ensure_pm_available "$PM"
mkdir -p "$BASE_DIR"
cd "$BASE_DIR"

### ---------- repo sync & deps ----------
ANY_CHANGED=0

sync_repo() {
  local name="$1" url="$2"
  if [[ -d "$name/.git" ]]; then
    log "[$name] repo exists. Checking updates..."
    pushd "$name" >/dev/null
    # Prefer master if present, else HEAD default branch
    local branch; branch="$(prefer_master_or_head)"
    git fetch origin "$branch" --quiet || true
    local remote localc
    remote="$(git rev-parse "origin/$branch" 2>/dev/null || echo '')"
    localc="$(git rev-parse HEAD 2>/dev/null || echo '')"
    if [[ -n "$remote" && "$remote" != "$localc" ]]; then
      log "[$name] updates found on '$branch'. Pulling (ff-only)..."
      if ! git pull --ff-only origin "$branch"; then
        warn "[$name] pull failed (local changes?). Skipping update; you may need to commit/stash."
      else
        ANY_CHANGED=1
      fi
    else
      log "[$name] up to date."
    fi
    # reinstall deps if changed OR node_modules missing
    if [[ "$ANY_CHANGED" -eq 1 || ! -d node_modules ]]; then
      local cmd; cmd="$(pm_install_cmd "$PM")"
      log "[$name] installing deps: $cmd"
      eval "$cmd"
    fi
    popd >/dev/null
  else
    log "[$name] cloning..."
    git clone "$url" "$name"
    pushd "$name" >/dev/null
    local cmd; cmd="$(pm_install_cmd "$PM")"
    log "[$name] installing deps: $cmd"
    eval "$cmd"
    popd >/dev/null
    ANY_CHANGED=1
  fi
}

for entry in "${REPOS[@]}"; do
  IFS='|' read -r name url <<<"$entry"
  sync_repo "$name" "$url"
done

### ---------- keys via kozz-gw script ----------
log "[kozz-gw] generating keys via scripts/generate_key_pair.sh ..."
( cd "kozz-gw" && ./scripts/generate_key_pair.sh )

# Copy (overwrite to keep in sync)
for other in "kozz-baileys" "kozz-module-scaffolding"; do
  log "Copying keys to $other ..."
  rm -rf "$other/keys"
  cp -R "kozz-gw/keys" "$other/"
done

### ---------- PM2 ecosystem & start ----------
ECOSYS="$BASE_DIR/kozz.pm2.ecosystem.json"
log "Writing PM2 ecosystem: $ECOSYS"

{
  echo '{ "apps": ['
  idx=0
  for r in kozz-gw kozz-baileys kozz-module-scaffolding; do
    ((idx>0)) && echo ','
    echo '  {'
    echo "    \"name\": \"$r\","
    echo "    \"cwd\": \"$BASE_DIR/$r\","
    echo "    $(pm2_script_args "$PM"),"
    echo '    "autorestart": true,'
    echo '    "restart_delay": 2000,'
    echo '    "env": { "NODE_ENV": "production" }'
    echo '  }'
    ((idx++))
  done
  echo '] }'
} > "$ECOSYS"

log "Starting (or reloading) apps with PM2..."
pm2 startOrReload "$ECOSYS"
pm2 save

echo
log "All set!"
echo "  • Repos: $BASE_DIR"
echo "  • PM2 list: pm2 ls"
echo "  • Logs: pm2 logs"
echo
log "To resurrect on boot (one-time setup):"
echo "    pm2 startup"
echo "  (follow the printed command, then run: pm2 save)"
