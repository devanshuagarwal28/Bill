import http from 'http'
import { readConfig } from 'utils/my_config'
import ClientApp from './app/clientApp.js'
import {LogManager, Log} from 'utils/log'

LogManager.init(
  `${process.env[process.env['CONFIG_PREFIX']+'LOG_DIR']}/client/`
)

let log = new Log('Client')

let myConfig = readConfig(process.argv[2])

let ca = new ClientApp(myConfig)

ca.start(myConfig['host']['port'], myConfig['host']['address'], _ => {
  log.i("Client Server Started:", myConfig['host'])
})
