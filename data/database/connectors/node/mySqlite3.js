import sqlite3 from "sqlite3"
import { open } from "sqlite"

export default class MySqlite3
{
  constructor(dbName)
  {
    this.dbName = dbName
    this.dbCon
  }
  async openDb()
  {
    if ( !this.dbName )
    {
      throw new Error("NODB")
    }
    return await open(
      {
        filename: this.dbName,
        driver: sqlite3.Database
      }
    )
  }
}