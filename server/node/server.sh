#!/bin/bash

PID_FILE=~+/server.pid

if [ -e $PID_FILE ]; then
  echo "Killing existing server"
  kill $(cat $PID_FILE)
  rm $PID_FILE
fi

if [ "$1" = "REST" ]; then
  # cd node
  node server.js $CONFIG_PREFIX"config.json" &
  node_pid=$!
  echo $node_pid > $PID_FILE
fi