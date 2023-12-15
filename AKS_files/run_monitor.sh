#! /bin/bash

helm upgrade -i kube-prometheus-stack prometheus-community/kube-prometheus-stack --namespace monitoring

# After re-installing the stack
# kubectl port-forward -n=monitoring svc/kube-prometheus-stack-grafana 8080:80
# kubectl patch service kube-prometheus-stack-grafana -n monitoring --type='json' -p '[{"op":"replace","path":"/spec/type","value":"LoadBalancer"}]'
# Grafana passwd: prom-operator