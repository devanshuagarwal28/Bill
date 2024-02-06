import http from 'http'
import { readConfig, wp, updateCP } from 'utils/my_config'
import ServerApp from './app/serverApp.js'
import {LogManager, Log} from 'utils/log'


updateCP(process.env['CONFIG_PREFIX'])

LogManager.init(
  `${process.env[wp('LOG_DIR')]}/server/`
)

let log = new Log('Server')

let myConfig = readConfig(wp('config.json'))

let sa = new ServerApp()

sa.start(myConfig["host"]["port"], myConfig["host"]["address"], _ => {
  log.i("Server Stated..", myConfig["host"])
})