# Check if module name was provided
if ($args.Count -ge 1) {
    # Path helper variables
    $module_name = $args[0]
    $current_folder = $PSScriptRoot
    $two_folders_up = (Get-Item -Path $current_folder).Parent.Parent.FullName
    $one_folder_up = (Get-Item -Path $current_folder).Parent.FullName
    $boundary_folder = Join-Path $two_folders_up "kozz-$module_name"
    $wa_keys_folder_path = Join-Path $boundary_folder "keys"
    $gw_keys_folder_path = Join-Path $one_folder_up "keys"

    Write-Host "Cloning boundary from Github"
    Set-Location $two_folders_up
    Write-Host $two_folders_up
    git clone "https://github.com/Kozz-Bot/kozz-$module_name/"

    # If keys are not generated, generate them
    if (-not (Test-Path -Path $gw_keys_folder_path -PathType Container)) {
        Write-Host "Generating keypair"
        Invoke-Expression -Command $one_folder_up/scripts/generate_key_pair.ps1
    }

    Write-Host "Copying keys"
    New-Item -Path $wa_keys_folder_path -ItemType Directory -Force
    Copy-Item -Path "$gw_keys_folder_path\privatekey.pem" -Destination $wa_keys_folder_path -Force

    Write-Host "Installing dependencies"
    Set-Location $boundary_folder
    yarn

    Write-Host ""
    Write-Host "Boundary added with success!"
    Write-Host "Now you can cd into $boundary_folder and run 'yarn start'"
    Write-Host "Use of PM2 is highly encouraged"
}
else {
    Write-Host "Please specify which boundary you want to add"
}