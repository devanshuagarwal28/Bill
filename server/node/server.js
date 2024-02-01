import http from 'http'
import { readConfig } from 'utils/my_config'
import ServerApp from './app/serverApp.js'
import {LogManager, Log} from 'utils/log'


LogManager.init(
  `${process.env[process.env['CONFIG_PREFIX']+'LOG_DIR']}/server/`
)

let log = new Log('Server')

let myConfig = readConfig(process.argv[2])

let sa = new ServerApp()

sa.start(myConfig["host"]["port"], myConfig["host"]["address"], _ => {
  log.i("Server Stated..", myConfig["host"])
})