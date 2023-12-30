#!/bin/bash

if [ "$1" = "node" ]; then
  cd node
  node server.js ../$CONFIG_PREFIX"config.json" &
fi