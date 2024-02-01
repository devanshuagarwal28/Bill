import App from 'utils/app'
import { Log } from 'utils/log'
import {readFileSync} from 'node:fs'
import { getEnv } from 'utils/my_config'
import multer from 'multer'


let app = new App()
let log = null


function test(data, req, res)
{
  return new Promise((resolve, reject) => {
    req.on('data', chunk => {
      console.log({chunk})
    })
    req.on('end', resolve)
  })
}

export default class ClientApp
{
  constructor(config) {
    this.config = config
    this.init()
  }
  start(port = 8181, host = '0.0.0.0', cb)
  {
    log = new Log("ClientApp")
    app.start(port, host, cb)
  }
  init()
  {
    let uploadXlsx = multer({dest: getEnv('TEMP_DIR')})

    app.get('/', async (data, req, res) => {
      return {code: 200, data: JSON.stringify(this.config)}
    })
    app.get('/test', async (data, req, res) => {
      return {code: 200, data: readFileSync(this.config['staticFiles']+"/test.html")}
    })
    app.post('/test', (data, req, res) => {
      return new Promise((resolve, reject) => {
        uploadXlsx.single('fileName')(req, res, err => {
          if ( err )
          {
            console.log(err)
            return resolve({code: 404, data: 'ERROR'})
          }
          console.log(req.file, req.body)
          resolve({code: 200, data: readFileSync(this.config['staticFiles']+"/test.html")})
        })

        // await test(data, req, res)
        // console.log(data.data.toString())
        // return {code: 200, data: "submitted"}
      })
    })
  }
}