import { spawn } from 'node:child_process'
import {
  SpawnManager,
  wp,
  updateCP
} from "utils/my_config"


updateCP(process.argv[2])

console.log('Spawing...')

let mySpawns = new SpawnManager('Server')

mySpawns.addProcess('nodeServer',
  'node', ['./server.js'],
  {
    cwd: './node/'
  }
)


process.on('SIGTERM', _ => {
  mySpawns.exitAll()
})