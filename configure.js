import { readConfig, saveConfig, removeConfig } from "utils/my_config"

/*
 From:
 https://stackoverflow.com/a/70863372/8071073
*/
import { fileURLToPath } from 'node:url';
import { basename, dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)
const filename = basename(__filename)
/**/



const configFilePrefix = process.env["CONFIG_PREFIX"] || "ag_"
const PLATFORM = process.platform
const SCRIPT_EXT = PLATFORM == "linux" ? "sh" : "bat"
const myRegex = RegExp(/\$.*?\$/g)
let gv = {
  "PROJ_DIR": process.cwd()
}


// replace $vars with value
// from gv
function parseValue(value)
{
  let varsInValue = value
    .match(myRegex)

  if ( !varsInValue )
  {
    return value
  }
  
  // remove start and end $
  varsInValue = varsInValue.map(el => el.slice(1,-1))

  // console.log(varsInValue)
  varsInValue.forEach(myVar => {
    if ( gv[myVar] )
    {
      value = value.replace(`$${myVar}$`, gv[myVar])
    }
  })
  // console.log(varsInValue, value)
  return value
}

// not universal; just for this project
class Config {
  myConfigs = {}
  constructor() { }
  addConfig(id, fileBaseDir, fileName, cb, arg)
  {
    this.myConfigs[id] = {
      file: `${fileBaseDir}/${configFilePrefix}${fileName}`,
      cb,
      arg
    }
  }
  clearConfig() {
    for ( let conf in this.myConfigs )
    {
      removeConfig(this.myConfigs[conf].file)
    }
  }
  makeConfig(baseConfig = "null", newArg = null) {

    let cConf = this.myConfigs[baseConfig]
    if ( !cConf )
    {
      return
    }
    let {cb, arg, file} = cConf
    if ( newArg ) { arg = newArg }

    let nextConfigs = cb (arg,
      (data) => {
        if ( !saveConfig(file, data) ) 
        {
          throw("ERROR in Saving Config")
        }
      }
    )
    if ( nextConfigs )
    {
      nextConfigs.forEach(
        confData => {
          this.makeConfig(confData[0], confData[1])
        }
      )
    }
  }
  mkConfig() { }
  handleAction(action, customActions)
  {
    switch(action)
    {
      case "clear":
      case "clean":
        console.log("cleaning")
        this.clearConfig()
        break
      case "make":
        this.clearConfig()
        if ( customActions["make"] )
        {
          customActions["make"]()
        }
        break
      default:
        console.log("No Such Action:", action)
    }
  }
}

class Server extends Config
{
  constructor(serverConf)
  {
    super()
    this.conig = serverConf
    this.addConfig(
      "server",
      gv["SERVER_DIR"], "config.txt",
      this.makeServerConfig, serverConf
    )
    this.addConfig(
      "nodeServerConf",
      `${gv["SERVER_DIR"]}/node`, "config.json",
      this.makeNodeServerConfig
    )
  }

  makeServerConfig(config, save)
  {
    let {type} = config
    let mType = config['types'][type]
    let finalConfig = ``
    switch(type)
    {
      case "node":
        finalConfig += `node/ server.sh ${config["st"]}`
        save(finalConfig)
        return [
          [
            "nodeServerConf",
            mType
          ]
        ]
      default:
          
    }
  }

  makeNodeServerConfig(config, save)
  {
    save(JSON.stringify(config))
  }

  mkConfig(action = "make")
  {
    this.handleAction(action, {
      "make": _ => { this.makeConfig("server") }
    })
    
  }
}

class Client extends Config
{
  constructor(clinetConfig)
  {
    super()
    this.config = clinetConfig
    this.addConfig(
      "client",
      gv["CLIENT_DIR"], "config.txt",
      this.makeClientConfig, clinetConfig
    )

    this.addConfig(
      "webFileServer",
      `${gv["CLIENT_DIR"]}/web/server/file`, "config.json",
      this.makeWebFileServerConfig
    )

  }
  
  makeClientConfig(config, save)
  {
    let {type} = config
    let mType = config['types'][type]
    let finalConfig = ``
    switch(type)
    {
      case 'web':
        finalConfig += 
        `${type}/server/${mType['server']} server.${SCRIPT_EXT}`
        switch(mType['server'])
        {
          case 'file':
            let serverType = mType['servers'][mType['server']]
            let provider = serverType['provider']
            
            finalConfig += ` ${provider}`
            finalConfig += `\nbrowser\n`
            finalConfig += `${mType["url"]}`
            save(finalConfig)
            return [
              [
                "webFileServer",
                mType['servers'][mType['server']]
              ]
            ]
        }
        break

    }
  }

  makeWebFileServerConfig(config, save)
  {
    save(JSON.stringify({
      "staticFiles": config['staticFiles'],
      "urlMapping": config['urlMapping']
    }))
  }

  mkConfig(action = "make")
  {
    this.handleAction(action, {
      "make": _ => { this.makeConfig("client") }
    })
    
  }
  
}

function parseVars(vals)
{
  if ( typeof(vals) == "string" )
  {
    return parseValue(vals)
  }
  else
  {
    for ( let k in vals )
    {
      vals[k] = parseVars(vals[k])
      if ( k[0] == '$' )
      {
        // console.log('isVar')
        gv[k.slice(1)] = vals[k]
      }
    }
  }
  return vals
}

if ( process.argv[1] == __filename )
{

  // Open global config file
  const G_CONF_FILE = "configure.json"
  // console.log(process.cwd())
  let configs = readConfig(G_CONF_FILE)
  configs = parseVars(configs)
  // console.log(configs)

  // parse client
  let client = new Client(configs["client"])
  client.mkConfig(process.argv[2])
  let server = new Server(configs["server"])
  server.mkConfig(process.argv[2])
  console.log("Done")
}