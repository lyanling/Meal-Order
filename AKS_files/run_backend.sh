#! /bin/bash

kubectl apply -f configmap.yaml --namespace=meal-order
kubectl apply -f secret.yaml --namespace=meal-order
kubectl apply -f backend-deployment.yaml --namespace=meal-order