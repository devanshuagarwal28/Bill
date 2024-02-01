import fs from 'fs'

/**
 * Define structure of a log line
 */
class LogLine
{
  datetime = null
  name = null
  type = null
  logString = ""
  /**
   * Create a new LogLine
   * @param {string} name 
   * @param {string} logString 
   */
  constructor(name, type, logString)
  {
    this.datetime = +(new Date())
    this.name = name
    this.type = type
    this.logString = logString
  }


  /**
   * Convert LogLine into String
   * @param {LogLine} logLine 
   */
  static parseLogLine(logLine)
  {
    let {datetime, name, type, logString} = logLine
    return (
      `${datetime} ${name}\t${type}\t|\t${logString}\n`
    )
  }
}



/**
 * Log Writer Object
 * @constructor
 */
class Writer  {
  constructor(name, logWriter)
  {
    this.name = name
    this.logWriter = logWriter
  }

  parseArgs(args)
  {
    let str = ``

    for ( let arg of args )
    {
      if ( typeof(arg) == 'string' )
      {
        str += arg + ' '
        continue
      }
      try {
        str += JSON.stringify(arg) + ' '
      } catch(err) { str += ' ' }
    }
    return str
  }

  d() 
  {
    let str = this.parseArgs(arguments)
    this.logWriter(new LogLine(this.name, 'debug', str))
  }

  info()
  {
    let str = this.parseArgs(arguments)
    this.logWriter(new LogLine(this.name, 'info', str))
  }

  i = this.info

  error()
  {
    let str = this.parseArgs(arguments)
    this.logWriter(new LogLine(this.name, 'error', str))  
  }
  e = this.error
}

/** Log Manager Class */
class LogManager
{
  /**
   * @type {string[]}
   */
  logQueue = []
  /**
   * Create LogManager
   * @param {string} logPath - path to store logs
   */
  constructor(logPath = "./")
  {
    this.logQueue = []
    this.isProcessing = false
    try
    {
      fs.statSync(logPath)
    }
    catch(err)
    {
      fs.mkdirSync(logPath, {recursive: true})
    }
    
    this.fd = fs.openSync(`${logPath}/${+(new Date())}.log`,'w+')
  }

  async processQueue()
  {
    if ( ! (this.isProcessing == false && this.logQueue.length > 0) )
    {
      return
    }

    this.isProcessing = true
    
    let logMe = () =>
    {
      let currentLog = this.logQueue.splice(0,1)[0]
      // console.log(currentLog.trim())
      fs.write(this.fd, currentLog, err => {
        console.log(currentLog.trim())
        
        if ( this.logQueue.length > 0 )
        {
          logMe()
        }
        else
        {
          this.isProcessing = false
        }
      })
    }

    logMe()

  }

  /**
   * Write actual logs
   * @param {LogLine} logLine
   */
  async logWriter(logLine)
  {
    this.logQueue.push(LogLine.parseLogLine(logLine))
    this.processQueue()
  }

  /**
   * Add Log and return the log writer
   * @param {Log} log
   * @returns {Writer}
   */
  getWriter(log)
  {
    return new Writer(log.name, this.logWriter.bind(this))
  }

  /**
   * Init
   */
  static init(path = './') {
    this.manager = new LogManager(path)
  }

  /**
   * Function to get logManager
   * @static @function
   * @returns {LogManager}
   */
  static getManager()
  {
    // console.log(this.manager)
    if ( this.manager == null )
    {
      this.manager = new LogManager()
    }
    return this.manager
  }

  /**
   * Get Writer
   * @param {Log} log 
   * @returns {Writer}
   */
  static getWriter(log)
  {
    return LogManager.getManager().getWriter(log)
  }
}

class Log {
  constructor(name) {
    this.name = name
    return LogManager.getWriter(this)
  }
}

// let l = new Log('A')
// let b = new Log('B')
// let w = new Log('C')

// w.d("Hello")
// console.log(w)


export {LogManager, Log}