@echo off

set CONFIG_PREFIX="ag_"

rem got %* from https://stackoverflow.com/a/357338/8071073
node --trace-uncaught bill.js %*
