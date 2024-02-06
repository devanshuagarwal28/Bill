import { spawn } from 'node:child_process'
import fs from 'node:fs'

let CONFIG_PREFIX = 'ag_'

class MyConfig
{
  constructor(filePath)
  {
    this
  }
}

function updateCP(cp)
{
  CONFIG_PREFIX = cp
}

function wp(name)
{
  return `${CONFIG_PREFIX}${name}`
}

function writeFile(filePath, data)
{
  try {
    if ( typeof(data) == 'number' )
    {
      data = data.toString()
    }
    return fs.writeFileSync(filePath, data)
  } catch(err)
  {
    console.log(err)
    return false
  }
}

function getEnv(envName = "")
{
  let envNameWithPrefix = process.env['CONFIG_PREFIX'] + envName
  return process.env[envNameWithPrefix]
}

function readConfig(configFile, type = "json")
{
  switch(type)
  {
    case "json": {
      try 
      {
        return JSON.parse(fs.readFileSync(configFile))
      }
      catch(err)
      {
        return {}
      }
    }
    default: {
      return {}
    }
  }
}

// I confused also
function readConfigWithName(configName)
{
  let config = getEnv(configName)
  if ( !config )
  {
    return {}
  }
  let fileExt = config.slice(config.lastIndexOf('.')+1)
  return readConfig(config, fileExt)
}

function saveConfig(configFile, data)
{
  try
  {
    fs.writeFileSync(configFile, data)
    return true
  }
  catch(err)
  {
    console.log(err)
    return false
  } 
}


function removeConfig(configFile)
{
  try {
    fs.rmSync(configFile)
  }
  catch(err)
  {

  }  
}

function readFile(filePath)
{
  try {
    return fs.readFileSync(filePath)
  }
  catch(err)
  {
    return false
  }
}

function fileExists(filePath)
{
  try {
    let stat = fs.statSync(filePath)
    return stat
  }
  catch(err)
  {
    return false
  }
}

function rmFile(filePath)
{
  try {
    fs.rmSync(filePath)
    return true
  }
  catch(err)
  {
    return false
  }
}

function createDir(dirPath)
{
  try
  {
    fs.mkdirSync(dirPath)
    return true
  }
  catch(err)
  {
    return false
  }
}

function clearDir(dirPath, type)
{
  try
  {
    if ( -1 === dirPath.indexOf(type) )
    {
      return false
    }
    fs.readdirSync(dirPath).forEach(dirName => {
      console.log(`deleting.. ${dirPath}/${dirName}`)
      fs.rmSync(`${dirPath}/${dirName}`,{recursive: true})
    })
    return true
  }
  catch(err)
  {
    console.log(err)
    return false
  }
}


class SpawnManager
{
  constructor(id)
  {
    this.id = id
    this.mySpawns = {}
  }

  exit(name)
  {
    this.mySpawns[name].sp.kill()
  }

  exitAll()
  {
    for ( let name in this.mySpawns )
    {
      console.log('exiting..', this.id,  name)
      this.exit(name)
    }
  }
  addProcess(name, argv0, args, options)
  {
    try {
      this.mySpawns[name] = {
        sp: spawn(argv0, args, options),
        cb: {}
      }
      this.makeHandler(name)
    }
    catch(err)
    {
      console.log(err)
    }
  }

  makeHandler(mSpawn)
  {
    this.mySpawns[mSpawn].sp.stdout.on('data', data => {
      console.log(this.id, 'DATA', mSpawn, `${data}`)
    })
  
    this.mySpawns[mSpawn].sp.stderr.on('data', data => {
      console.log(this.id, 'ERR', mSpawn, `${data}`)
    })
  
    this.mySpawns[mSpawn].sp.on('close', code => {
      console.log(this.id, 'END', mSpawn, `Server exited with code: ${code}`)
    })
  }
}

export { SpawnManager, clearDir, createDir, updateCP, wp, rmFile, fileExists, writeFile, readConfig, saveConfig, removeConfig, readConfigWithName, getEnv, readFile };