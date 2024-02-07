/**
 * Session Repository
 */
import { SessionDBProvider, SessionIOProvider } from "./sessionProvider.js";
import { v4 as uuidv4 } from "uuid";
import { getEnv } from 'utils/my_config'
import { createJsonFile } from "utils/dyn"

export default class Session
{
  /**
   * Create Session Repo with given Provider
   * @constructor
   * @param {SessionDBProvider} db
   * @param {SessionIOProvider} io 
   */
  constructor(db, io)
  {
    this.db = db
    this.io = io
  }

  /**
   * 
   * @param {URLSearchParams} data 
   */
  async createSession(data)
  {
    if ( !data["name"] || !data["file"] || !data["file"]["path"] )
    {
      throw "NOT ENOUGH DATA"
    }
    /** Step1 : Generate UUID */
    let uuid = uuidv4()

    /** Setp2: Create variables */
    this.io.init(uuid, data)

    console.log(this.io)

    /** Create Session Directory */
    await this.io.createSessionDir()

    /** Save file in Session Directory */
    await this.io.saveOriginalFile(data['file']['path'])

    /** Convert file to JSON */
    let cjf = await createJsonFile(this.io.workFilePath, this.io.jsonFilePath)
    if ( cjf.data )
    {
      cjf.data = cjf.data.toString()
    }
    console.log(cjf)
    return {code: 200, data: `${JSON.stringify(cjf)}`}



    
    

  }
}


export { SessionDBProvider, SessionIOProvider }