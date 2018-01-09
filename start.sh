#!/bin/bash
echo "1. 启动前台"
cd website
node app.js>/dev/null 2>&1 &

echo "2. 启动后台"
cd ../webserver/spy
node index.js>/dev/null 2>&1 &

echo "==>启动完毕!"
