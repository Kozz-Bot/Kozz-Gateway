#!/usr/bin/env sh


current_folder="$(cd "$(dirname "$0")" && pwd)"
one_folder_up="${current_folder%/*}"

folder_path="$one_folder_up/keys"

if [ ! -d "$folder_path" ]; then
  mkdir -p "$folder_path"
fi

openssl genrsa -out $one_folder_up/keys/privatekey.pem 2048
openssl rsa -in $one_folder_up/keys/privatekey.pem -out $one_folder_up/keys/publickey.pem -pubout -outform PEM
