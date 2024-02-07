/**
 * Session Provider
 */

import { getEnv } from "utils/my_config"
import { copyFile, mkdir, rm } from "node:fs/promises"

class SessionDBProvider
{
  constructor(dbPath) {
    this.dbPath = dbPath
  }
  
  /**
   * Create Session
   */
  createSession(data) { }


  /**
   * List all sessions
   */
  listAllSessions() { }

  /**
   * Get session Info
   * @param {String} uuid 
   */
  getSession(uuid) { }

}

class SessionIOProvider
{
  sessionsDirPath = './'
  constructor() {
    this.sessionsDirPath = getEnv("SESSION_DIR")
  }

  /**
   * @param {String} uuid 
   * @param {URLSearchParams} data 
   */
  init(uuid, data)
  {
    let fileName = data["file"]["originalname"]
    this.uuid = uuid
    this.name = data["name"]
    this.fileName = fileName
    this.uniqueName = `${this.name}_${fileName}_${uuid}`.replace(/[. ]/g,'_')
    this.datetime = new Date()
    this.jsonFileName = `json_${this.name}_${fileName}.json`
    this.billFileName = `bill_${fileName}.json`
    this.sessionDir = `${this.sessionsDirPath}/${this.uniqueName}`
    this.originalFilePath = `${this.sessionDir}/original_${this.fileName}`
    this.workFilePath = `${this.sessionDir}/${this.name}_${this.fileName}`
    this.jsonFilePath = `${this.sessionDir}/${this.jsonFileName}`
  }

  initViaData(data)
  {
    this.uuid = data.uuid
    this.name = data.name
    this.fileName = data.fileName
    this.uniqueName = data.uniqueName
    this.datetime = data.datetime
    this.billFileName = data.billFileName
    this.jsonFileName = data.jsonFileName
    this.sessionDir = `${this.sessionsDirPath}/${this.uuid}`
  }

  /**
   * Create Session Dir
   */
  async createSessionDir() {
    try {
      let res = await mkdir(this.sessionDir)
    }
    catch(err)
    {
      throw err
    }
  }

  async saveFile(fromFilePath, toDir, fileName = null)
  {
    try
    {
      if ( fileName != null )
      {
        toDir = `${toDir}/${fileName}`
      }
      let res = await copyFile(fromFilePath, toDir)
    }
    catch(err)
    {
      throw err  
    }
  }

  /**
   * Save file in sessionDir
   */
  async saveOriginalFile(tempFilePath)
  {
    try
    {
      /** Save Original File */
      await this.saveFile(tempFilePath, this.sessionDir, `original_${this.fileName}`)
      /** Save a copy with name, this file will be the working file */
      await this.saveFile(tempFilePath, this.sessionDir, `${this.name}_${this.fileName}`)
      /** Delete the tempFile */
      await rm(tempFilePath)
    }
    catch(err)
    {
      throw err
    }
  }
}

export {SessionDBProvider, SessionIOProvider}