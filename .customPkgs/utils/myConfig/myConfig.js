import fs from 'node:fs'

class MyConfig
{
  constructor(filePath)
  {
    this
  }
}

function readConfig(configFile, type = "json")
{
  switch(type)
  {
    case "json": {
      return JSON.parse(fs.readFileSync(configFile))
    }
    default: {
      return {}
    }
  }
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

export { readConfig, saveConfig, removeConfig };