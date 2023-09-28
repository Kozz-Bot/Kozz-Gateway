#!/bin/bash

# Check if module name was provided
if [ $# -ge 1 ]; then
    # Path helper variables
    module_name="$1"
    current_folder="$(cd "$(dirname "$0")" && pwd)"
    two_folders_up="${current_folder%/*/*}"
    one_folder_up="${current_folder%/*}"
    boundary_folder=$two_folders_up/kozz-$module_name
    wa_keys_folder_path="$boundary_folder/keys"
    gw_keys_folder_path="$one_folder_up/keys"

    echo "Cloning boundary from Github"
    cd $two_folders_up
    git clone git@github.com:Kozz-Bot/Kozz-$module_name.git

    # If keys are not generated, generate them
    if [ ! -d "$gw_keys_folder_path" ]; then
        echo "Generating keypair"
      ./kozz-gw/scripts/generate_key_pair.sh
    fi
    
    echo "Copying keys"

    mkdir $wa_keys_folder_path
    cp $gw_keys_folder_path/privatekey.pem $wa_keys_folder_path

    echo Installing dependencies
    cd $boundary_folder
    yarn

    echo -e "\n\n"
    echo Boundary added with success!
    echo Now you can cd into $boundary_folder and run \"yarn start\"
    echo Use of PM2 is highly encouraged

else
    echo "Please specify which boundary you want to add"
fi