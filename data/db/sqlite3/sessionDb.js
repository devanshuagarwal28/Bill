import {SessionDBProvider} from "utils/dyn"

export default class SessionSqlite3 extends SessionDBProvider
{
  constructor(dbPath)
  {
    super(dbPath)
  }

  createSession(data)
  {

  }
}