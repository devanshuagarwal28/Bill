// connector b/w node and python
import { spawn } from "node:child_process"
import { readConfigWithName } from 'utils/my_config'

const API = readConfigWithName("API_FILE_PATH")

function GetFromAPI(apiName, args = {}, inputStream = null)
{
  return new Promise((resolve, reject) => {
    if ( !API[apiName] )
    {
      return reject(`No Such API: ${apiName}`)
    }
    let {bin, filePath, argv} = API[apiName]

    let argToSend = []
    for ( let a in argv )
    {
      if ( args[a] )
      {
        argToSend.push(args[a])
        continue
      }
      argToSend.push(argv[a])
    }

    let myRes = spawn(`${bin} ${filePath}`, argToSend)
    if ( inputStream != null )
    {
      myRes.stdin.pipe(inputStream)
    }
    let resData = {
      stdout: Buffer.alloc(0),
      stderr: Buffer.alloc(0)
    }
    myRes.stdout.setEncoding('hex')
    myRes.stdout.on('data', (chunk) => {
      resData.stdout = Buffer.concat([resData.stdout, chunk])
    })

    myRes.stderr.setEncoding('hex')
    myRes.stderr.on('data', (chunk) => {
      resData.stderr = Buffer.concat([resData.stderr, chunk])
    })

    myRes.on('close', (code) => {
      if ( code != 0 )
      {
        return reject(`EXIT CODE: ${code}`)
      }
      resolve(resData)
    })
  })
}

/**
 * Create JSON Data file from xlxs file
 * @param {String} filePath 
 * @param {String} jsonFilePath 
 * @returns 
 */
async function createJsonFile(filePath, jsonFilePath)
{
  try
  {
    return await GetFromAPI('xlsxToJson', {filePath, jsonFilePath})
  }
  catch(err)
  {
    throw err
  }
}

export { createJsonFile }