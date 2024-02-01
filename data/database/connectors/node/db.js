// wrapper for single include file
import MySqlite3 from "./mySqlite3.js";
import { readConfigWithName } from "utils/my_config";

export default class DB
{
  constructor()
  {
    this.dbList = readConfigWithName("DB_LIST_FILE")
    console.log(this.dbList)
    this.dbCon = null
    this.db = null
  }
  async sqlite3(dbName)
  {
    this.db = new MySqlite3(dbName)
    this.dbCon = await this.db.openDb()
    return this.db

  }
}

console.log(process.env['DB_LIST_DIR'])
// export {MySqlite3 as sqlite3}