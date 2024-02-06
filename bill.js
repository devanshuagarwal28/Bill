/**
 * Start the Client and Server with saved config
 */
import {
  getEnv,
  readFile,
  writeFile,
  fileExists,
  rmFile,
  updateCP,
  wp, // with prefix
  createDir,
  clearDir,
  SpawnManager
} from "utils/my_config"

import process, { kill } from 'node:process'
import { spawn } from 'node:child_process'

let CONFIG_PREFIX = 'ag_'
const exitArgs = ['kill', 'exit', 'stop']
const PID_FILE = './bill.pid'


/**
 * Check for existing bill.pid file
 * if exist then kill the existing process
 */
let pid = process.pid
if ( false !== (pid = readFile(PID_FILE)) )
{
  console.log(`Killing existing server with PID: ${pid}`)
  rmFile(PID_FILE)
  try
  {
    kill(pid)
  }
  catch(err)
  {
    console.log(`error killing process: ${pid}`)
  }
}

/**
 * Check if 1st arg for exitArgs
 */
if ( -1 != exitArgs.indexOf(process.argv[2]) )
{
  console.log('Exiting..')
  process.exit(0)
}

/**
 * check for prefix file
 */
if ( false === (CONFIG_PREFIX = readFile('./prefix.txt').toString()) )
{
  console.log('No prefix.txt file, exiting..')
  process.exit(1)
}
updateCP(CONFIG_PREFIX)

let ENVS = {CONFIG_PREFIX}

let envFile = ''
/**
 * Check if environment file exists
 */
if ( false === (envFile = readFile(wp('env.sh'))) )
{
  console.log('Please run config first')
  process.exit(1)
}

/**
 * add envfile to ENVS
 */
envFile.toString()
.split('\n')
.forEach(el => {
  let eqIndx = el.indexOf('=')
  if ( -1 === eqIndx ) { return }
  let key = el.slice(0, eqIndx)
  ENVS[key] = el.slice(eqIndx+1)
})

/** update process.env */
process.env = {...process.env, ...ENVS}

/**
 * save current pid in bill.pid file
 */
if ( false === writeFile('./bill.pid', process.pid) )
{
  console.log('Failed to save process id, exiting..')
  process.exit(1)
}

let logDir = ENVS[wp('LOG_DIR')]

/**
 * create log dir if not exists
 */
if ( false === fileExists(logDir) && false == createDir(logDir) )
{
  console.log(`failed to create TEMP DIR: ${logDir}`)
  process.exit(1)
}

const bill_args = {
  'lf': {
    description: 'Log Functions',
    args: {
      '--clean-logs, -cl': {
        required: false,
        description: 'Clear logs before running the app',
        exec: () => {
          console.log(`Deleting logs from ${logDir}/*`)
          if ( false == clearDir(logDir, 'logs') )
          {
            console.log('Failed to delete logs')
            process.exit(1)
          }
        },
      },
    }
  }
}

let inputArgs = process.argv.slice(2)
/**
 * check for args
 */
for ( let argGroup in bill_args )
{
  for ( let args in bill_args[argGroup]['args']  )
  {
    // console.log(args)
    let myArgs = args.split(',').map(el=>el.trim())
    myArgs.forEach(arg => {
      if ( -1 !== inputArgs.indexOf(arg) )
      {
        bill_args[argGroup]['args'][args].exec()
      }
    })

  }
}

let mySpawns = new SpawnManager('Bill')

/**
 * Run Server
 */

mySpawns.addProcess('server',
  'node',['./server.js', CONFIG_PREFIX],
  {
    cwd: './server/'
  }
)

process.on('SIGTERM', _ => {
  mySpawns.exitAll()
})

process.on('exit', _ => {
  rmFile(PID_FILE)
})
