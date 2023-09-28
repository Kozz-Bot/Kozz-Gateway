# Get the path of the script
$current_folder = $PSScriptRoot
$one_folder_up = (Get-Item -Path $current_folder).Parent.FullName
$folder_path = Join-Path $one_folder_up "keys"

if (-not (Test-Path -Path $folder_path -PathType Container)) {
    # Create the directory if it doesn't exist
    New-Item -Path $folder_path -ItemType Directory -Force
}

# Generate a private key
openssl genrsa -out "$one_folder_up\keys\privatekey.pem" 2048

# Generate a corresponding public key
openssl rsa -in "$one_folder_up\keys\privatekey.pem" -out "$one_folder_up\keys\publickey.pem" -pubout -outform PEM
