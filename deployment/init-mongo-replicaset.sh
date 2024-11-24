#!/bin/bash

# Namespace where MongoDB is deployed
NAMESPACE="default"

# MongoDB StatefulSet name
STATEFULSET_NAME="mongo"

# Replica set name
REPLICA_SET_NAME="rs0"

# Number of replicas
REPLICA_COUNT=3

echo "Initializing MongoDB Replica Set..."

# Construct the replica set configuration JSON
CONFIG="{
  _id: \"$REPLICA_SET_NAME\",
  members: [
"
for i in $(seq 0 $((REPLICA_COUNT - 1))); do
  CONFIG="$CONFIG    { _id: $i, host: \"$STATEFULSET_NAME-$i.$STATEFULSET_NAME-headless:27017\" }"
  if [ "$i" -lt $((REPLICA_COUNT - 1)) ]; then
    CONFIG="$CONFIG,"
  fi
  CONFIG="$CONFIG
"
done
CONFIG="$CONFIG  ]
}"

# Output the replica set configuration for verification
echo "Replica Set Configuration:"
echo "$CONFIG"

# Execute the replica set initiation command in the first pod
echo "Connecting to the primary MongoDB pod to initialize the replica set..."
kubectl exec -it "$STATEFULSET_NAME-0" -n "$NAMESPACE" -- mongosh --eval "rs.initiate($CONFIG)"

# Check the status of the replica set
echo "Checking replica set status..."
kubectl exec -it "$STATEFULSET_NAME-0" -n "$NAMESPACE" -- mongosh --eval "rs.status()"

echo "MongoDB Replica Set initialization completed."
