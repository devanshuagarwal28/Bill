import { readConfig, saveConfig, removeConfig, readFile } from "utils/my_config"

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
  "PROJ_DIR": process.cwd(),
  // "CONFIG_PREFIX": configFilePrefix
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
  name = "Config"
  myConfigs = {}
  constructor(name = "Config") { this.name = name }
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
      }, file
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
        console.log(`cleaning ${this.name}`)
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

class Dyn extends Config
{
  constructor(dynConfig)
  {
    super("Dyn")
    this.config = dynConfig
    
    this.addConfig(
      "dyn_js",
      gv["DYN_DIR"], gv["NODE_DYN_FILE"],
      this.dynJsConfig, dynConfig
    )
  }

  dynJsConfig(config, save, fileName)
  {
    save(parseValue(readFile(config["node"]).toString()))
  }

  mkConfig(action = "make")
  {
    this.handleAction(action, {
      "make": _ => { this.makeConfig("dyn_js") }
    })
  }
}

class Src extends Config
{
  constructor(srcConfig)
  {
    super("Src")
    this.config = srcConfig

    this.addConfig(
      "list_api",
      gv["SRC_DIR"], "api.json",
      this.makeListApiConfig, srcConfig
    )
  }
  makeListApiConfig(config, save, fileName)
  {
    gv["API_FILE_PATH"] = fileName
    save(JSON.stringify(config["api"]))
  }
  mkConfig(action = "make")
  {
    this.handleAction(action, {
      "make": _ => { this.makeConfig("list_api") }
    })
  }
}

class Data extends Config
{
  constructor(dataConfig)
  {
    super("Data")
    this.config = dataConfig
    
    this.addConfig(
      "db_list",
      gv["DB_DIR"], "db_list.json",
      this.makeDbListConfig, dataConfig
    )
  }

  makeDbListConfig(config, save)
  {
    save(JSON.stringify(config["database"]["db"]))
  }

  mkConfig(action = "make")
  {
    this.handleAction(action, {
      "make": _ => { this.makeConfig("db_list") }
    })
  }
}

class Server extends Config
{
  constructor(serverConf)
  {
    super("Server")
    this.conig = serverConf
    this.addConfig(
      "server",
      gv["SERVER_DIR"], "config.json",
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
    let finalJson = {}
    switch(type)
    {
      case "node":
        finalJson['argv0'] = 'node'
        finalJson['id'] = 'nodeServer'
        finalJson['args'] = ['./server.js',`${configFilePrefix}config.json`]
        finalJson['cwd'] = './node/'
        finalConfig += `node/ server.sh ${config["st"]}`
        // save(finalConfig)
        save(JSON.stringify(finalJson))
        return [
          [
            "nodeServerConf",
            {
              "server": mType,
              "host": config["host"]
            }
          ]
        ]
      default:
          
    }
  }

  makeNodeServerConfig(config, save)
  {
    save(JSON.stringify({
      "server": config["server"],
      "host": config["host"]
    }))
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
    super("Client")
    this.config = clinetConfig
    this.addConfig(
      "client",
      gv["CLIENT_DIR"], "config.json",
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
    let finalJson = {}

    switch(type)
    {
      case 'web':
        finalJson['argv0'] = 'node'
        finalJson['id'] = 'nodeServer'
        finalJson['args'] = ['./server.js',`../${configFilePrefix}config.json`]
        finalJson['cwd'] = `${type}/server/${mType['server']}/node`
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
            save(JSON.stringify(finalJson))
            // save(finalConfig)
            return [
              [
                "webFileServer",
                {
                  "client": mType['servers'][mType['server']],
                  "host": mType["host"]
                }
              ]
            ]
        }
        break

    }
  }

  makeWebFileServerConfig(config, save)
  {
    save(JSON.stringify({
      "staticFiles": config["client"]['staticFiles'],
      "urlMapping": config["client"]['urlMapping'],
      "host": config["host"]
    }))
  }

  mkConfig(action = "make")
  {
    this.handleAction(action, {
      "make": _ => { this.makeConfig("client") }
    })
    
  }
  
}

class Root extends Config
{
  constructor(rootConfig)
  {
    super("Root")
    this.conig = rootConfig
    this.addConfig(
      "root",
      gv["PROJ_DIR"], `env.${SCRIPT_EXT}`,
      this.makeRootEnvConfig, rootConfig
    )
  }
  makeRootEnvConfig(config, save)
  {
    let finalConfig = ``
    for ( let g in gv )
    {
      if ( PLATFORM == 'win32' )
      {

      }
      else
      {
        finalConfig += `${configFilePrefix}${g}=${gv[g]}\n`
      }
    }
    save(finalConfig)
  }

  mkConfig(action = "make")
  {
    this.handleAction(action, {
      "make": _ => { this.makeConfig("root") }
    })
  }
}

function setGv()
{
  if ( PLATFORM == 'win32' )
  {
    gv["PYBIN"] = "python.exe"
  }
  else
  {
    gv["PYBIN"] = "/bin/python"
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

  setGv()
  // Open global config file
  const G_CONF_FILE = "configure.json"
  // console.log(process.cwd())
  let configs = readConfig(G_CONF_FILE)
  configs = parseVars(configs)
  // console.log(configs)


  // parse client
  let client = new Client(configs["client"])
  client.mkConfig(process.argv[2])
  
  // parse server
  let server = new Server(configs["server"])
  server.mkConfig(process.argv[2])
  
  // parse data
  let data = new Data(configs["data"])
  data.mkConfig(process.argv[2])

  // parse Src
  let src = new Src(configs["src"])
  src.mkConfig(process.argv[2])

  // parse Dyn
  let dyn = new Dyn(configs["dyn"])
  dyn.mkConfig(process.argv[2])



  // parse root
  let root = new Root(configs["root"])
  root.mkConfig(process.argv[2])

  console.log("Done")
}