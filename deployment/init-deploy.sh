#!/bin/bash

# Directory containing Kubernetes YAML files
CONFIG_DIR="./k8s"

# Create namespace if not exists
NAMESPACE="default"

echo "Deploying services to Minikube..."

# Loop through all YAML files in the directory and apply them
for file in "$CONFIG_DIR"/*.yaml; do
  echo "Applying configuration: $file"
  kubectl apply -f "$file" -n $NAMESPACE
done

./init-mongo-replicas.sh

echo "All services deployed successfully!"
