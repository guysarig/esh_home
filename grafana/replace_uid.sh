sed -i.bak -E '/"type": "prometheus"/{N;s/"uid": "[^"]*"/"uid": "'"$1"'"/;}' dashboard.json
