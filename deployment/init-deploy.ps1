$ErrorActionPreference = "Stop"

Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Directory containing Kubernetes YAML files
$CONFIG_DIR = "./k8s"

# Namespace for Kubernetes
$NAMESPACE = "default"

Write-Host "Deploying services to Minikube..."

# Loop through all YAML files in the directory and apply them
Get-ChildItem -Path $CONFIG_DIR -Filter "*.yml" | ForEach-Object {
    Write-Host "Applying configuration: $($_.FullName)"
    kubectl apply -f $_.FullName
}

Write-Host "All services deployed successfully!"
