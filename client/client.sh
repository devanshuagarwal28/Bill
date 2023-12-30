#!/bin/bash

config=$CONFIG_PREFIX"config.txt"

if [ ! -e $config ]
then
  echo "Please run ./configure first"
  exit 1
else
  echo "Nice"
fi