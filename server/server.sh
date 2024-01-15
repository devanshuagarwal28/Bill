#!/bin/bash

config=$CONFIG_PREFIX"config.txt"

if [ ! -e $config ]
then
  echo "Please run ./configure first"
  exit 1
else
  h=($@)
  c=($(cat $config))

  if [ "${h[0]}" = "stop" ]; then
    runSomethingInBill ${c[0]} ${c[1]} stop
  else
    runSomethingInBill ${c[0]} ${c[1]} ${c[2]}
    if [ 0 -ne $? ]; then exit 1; fi
  fi
fi