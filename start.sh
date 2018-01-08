#!/bin/bash
echo "1. 启动前台"
cd website
node app.js&

echo "2. 启动后台"
cd ../webserver/spy
node index.js&

echo "==>启动完毕!"
