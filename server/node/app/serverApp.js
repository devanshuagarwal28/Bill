import App from 'utils/app'
import { getEnv } from 'utils/my_config'
import { Log } from 'utils/log'
import { Session, SessionSqlite3, SessionIOProvider } from 'utils/dyn'
import multer from 'multer'


let app = new App()
let log = null


export default class ServerApp
{
  constructor(config) {
    this.config = config
    this.init()
    this.uploadXlsx = multer({dest: getEnv('TEMP_DIR')})
  }
  start(port = 8080, host = '0.0.0.0', cb)
  {
    log = new Log('ServerApp')
    app.start(port, host, cb)
  }

  /** need to make more moduleable */
  uploadXlsxFile(fieldName, req, res)
  {
    return new Promise((resolve, reject) => {
      this.uploadXlsx.single(fieldName)(req, res, err => {
        if ( err ) 
        {
          return resolve({})
        }
        req.body[fieldName] = req.file
        return resolve(req.body)
      })
    })
  }

  init()
  {
    app.post('/createSession', async (data, req, res) => {
   
      let formData = await this.uploadXlsxFile('file', req, res)
      let sessionDb = new SessionSqlite3(getEnv("SESSION_DB_FILE"))
      let sessionIo = new SessionIOProvider()
      let session = new Session(sessionDb, sessionIo)
      try {
        let myData = {...data.url.sp,...formData}
        console.log(myData)
        let sessionResp = await session.createSession(myData)
        return sessionResp
      }
      catch(err)
      {
        console.log(err)
        log.e(err)
        res.end(JSON.stringify({"error":true}))
      }
    })
  }
}