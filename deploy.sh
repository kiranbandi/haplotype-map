npm run build
rm -rf /var/www/gene-expression-map/*
cp -r dist/. /var/www/gene-expression-map
systemctl reload nginx
echo "deploy complete"
