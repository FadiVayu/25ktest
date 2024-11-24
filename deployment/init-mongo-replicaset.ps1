$ErrorActionPreference = "Stop"

# Namespace where MongoDB is deployed
$NAMESPACE = "default"

# MongoDB Deployment name
$DEPLOYMENT_NAME = "mongo"

# Replica set name
$REPLICA_SET_NAME = "rs0"

# Number of replicas (assume the Deployment is scaled accordingly)
$REPLICA_COUNT = 3

Write-Host "Initializing MongoDB Replica Set..."

# Get the list of Pod IPs for the MongoDB Deployment
$POD_IPS = (kubectl get pods -n $NAMESPACE -l "app=$DEPLOYMENT_NAME" -o jsonpath="{.items[*].status.podIP}").Split(" ")

if ($POD_IPS.Count -ne $REPLICA_COUNT) {
    Write-Error "The number of MongoDB pods ($($POD_IPS.Count)) does not match the expected replica count ($REPLICA_COUNT)."
    exit 1
}

# Construct the replica set configuration JSON
$MEMBERS = @()
for ($i = 0; $i -lt $POD_IPS.Count; $i++) {
    $MEMBERS += "{ _id: $i, host: `"$($POD_IPS[$i]):27017`" }"
}
$MEMBERS_JSON = $MEMBERS -join ", "

$CONFIG = "{ _id: `"$REPLICA_SET_NAME`", members: [ $MEMBERS_JSON ] }"

# Output the replica set configuration for verification
Write-Host "Replica Set Configuration:"
Write-Host $CONFIG

# Execute the replica set initiation command on the first MongoDB pod
$FIRST_POD = kubectl get pods -n $NAMESPACE -l "app=$DEPLOYMENT_NAME" -o jsonpath="{.items[0].metadata.name}"
Write-Host "Connecting to the first MongoDB pod ($FIRST_POD) to initialize the replica set..."
kubectl exec -it $FIRST_POD -n $NAMESPACE -- mongosh --eval "rs.initiate($CONFIG)"

# Check the status of the replica set
Write-Host "Checking replica set status..."
kubectl exec -it $FIRST_POD -n $NAMESPACE -- mongosh --eval "rs.status()"

Write-Host "MongoDB Replica Set initialization completed."
