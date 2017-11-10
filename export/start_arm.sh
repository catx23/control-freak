#!/usr/bin/env bash
cd ./server/nodejs_arm
#chmod +x ./server
#gnome-terminal -e "./server noob --file=start.js"
./server noob --file=start.js "$@"