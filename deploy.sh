rm -rf /var/www/blackleg/haplotype-map/*
cp -r dist/. /var/www/blackleg/haplotype-map
systemctl reload nginx
echo "deploy complete"
