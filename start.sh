#!/bin/bash
cp coursefrontend/nginx.conf /etc/nginx/
cd coursefrontend && bower install --allow-root --config.interactive=false

service nginx start
