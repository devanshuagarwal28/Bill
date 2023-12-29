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

export { readConfig };