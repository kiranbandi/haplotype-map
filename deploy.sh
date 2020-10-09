rm -rf /var/www/hapmap/*
cp -r dist/. /var/www/hapmap
systemctl reload nginx
echo "deploy complete"
