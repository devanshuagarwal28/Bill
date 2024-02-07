import {
  SpawnManager,
  SpawnManagerManager,
  wp,
  updateCP,
  readConfig,
  readConfigWithName
} from "utils/my_config"


updateCP(process.argv[2])

// console.log('Spawing...')

let myConfig = readConfig(wp('config.json'))
let mySpawns = new SpawnManager('Client', process.env[wp('TEMP_DIR')])

console.log(myConfig)

mySpawns.addProcess( myConfig['id'],
  myConfig['argv0'], myConfig['args'],
  {
    cwd: myConfig['cwd']
  }
)

process.on('SIGTERM', _ => {
  mySpawns.exitAll()
})

process.on('SIGINT', _ => {
  mySpawns.exitAll()
})