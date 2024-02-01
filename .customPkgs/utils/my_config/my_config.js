import fs from 'node:fs'

class MyConfig
{
  constructor(filePath)
  {
    this
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

  }
}

export { readConfig, saveConfig, removeConfig, readConfigWithName, getEnv, readFile };