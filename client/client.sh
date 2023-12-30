#!/bin/bash

config=$CONFIG_PREFIX"config.txt"

if [ ! -e $config ]
then
  echo "Please run ./configure first"
  exit 1
else
  # STEPS
  # Run the client server if required
  # start the client
  c=($(cat $config))
  
  runSomethingInBill ${c[0]} ${c[1]} ${c[2]}

  if [ 0 -ne $? ]; then exit 1; fi

  if [ "${c[3]}" = "browser" ]; then
    xdg-open ${c[4]}
  fi
fi