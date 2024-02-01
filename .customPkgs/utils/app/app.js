import http, { IncomingMessage, ServerResponse } from 'http'
import {Log} from 'utils/log'
import { getEnv } from "utils/my_config"
import multer from 'multer'

let log = null

class Route
{
  constructor(path, cb, options = null)
  {
    this.path = path
    this.paths = this.path.split('/')
    this.cb = cb
    if ( !options ) { this.options = {parseAllData: false} }
    else { this.options = options }
  }
}

export default class App
{
  routes = {}

  constructor(options = {})
  {
    this.beforeConnSocket = options.beforeConnSocket || (async () => {})
    if ( !options['tempDir'] )
    {
      options['tempDir'] = getEnv("TEMP_DIR")
    }
    this.options = options
    this.routes = {
      '*': [
        new Route('*',
          async (req, res) => ({code: 404, data: '404'})
        )
      ],
    }
    this.server = http.createServer(this.onConnection.bind(this))
  }

  /**
   * 
   * @param {IncomingMessage} req 
   * @param {ServerResponse} res 
   */
  parseReqData(req, res)
  {
    return new Promise((resolve, reject) => {
      if ( req.headers['content-type'].indexOf('multipart') != -1 )
      {
        // do something and return
      }
      let data = Buffer.alloc(0)
      req.on('data', chunk => {
        // console.log('Chunk', chunk)
        data = Buffer.concat([data, chunk])
      })
      req.on('end', _ => {
        resolve(data)
      })
    })
  }

  /**
   * Prase Headers -- NO NEED --
   * @param {IncomingMessage} req
   */
  parseHeaders(req) {
    // req.headers['']
  }

  /**
   * Parse and call the routes
   * @param {URL} url
   * @param {IncomingMessage} req 
   * @param {ServerResponse} res 
   */
  async parseRoute(url, req, res)
  {
    // log.d(new URL(iUrl))
    // console.log(new URL(iUrl))

    /**
     * Splits incomming path
     * @type {String[]}
     */
    let paths = url.pathname.split('/')
    
    /**
     * Incomming path array length
     * @type {Number}
     */
    let pLen = paths.length

    // console.log(paths, this.routes[req.method])

    /**
     * If current method is not in route
     * then call the default callback
     */
    if ( !this.routes[req.method] )
    {
      return await this.routes['*'][0].cb(req, res)
    }
    
    /**
     * to store pathVariable to be
     * sent to route's callback
     * @type {Object}
     */
    let pathData = {}

    /**
     * Current selected route
     * @type {Route}
     */
    let route = null

    /**
     * flag varibale for checking if route
     * is found/selected or not
     * @type {Boolean}
     */
    let isSelected = false
    
    /**
     * check each route against incomming path
     */
    for ( route of this.routes[req.method]  )
    {
      /**
       * Reset the path data every time
       */
      pathData = {}
      
      /**
       * Path Number
       * @type {Number}
       */
      let pn = 0

      /**
       * Route's Path
       * @type {String[]}
       */
      let rp = route.paths

      /**
       * if route length is not sufficient
       * then check next route 
       */
      if ( rp.length < pLen )
      {
        continue
      }

      /**
       * check incomming path in parallel with route path
       * pn is Path Number of current checking incomming Path
       */
      for ( ; pn < pLen; pn++ )
      {
        // console.log(`checking R = ${rp[pn]} and P = ${paths[pn]}`)
        /**
         * If route contains a * then no need to
         * check futher
         * NOTE:
         * condition like / path1 / * / path2
         * is NOT IMPLEMENTED (may be in next versions)
         */
        if ( rp[pn][0] == '*' )
        {
          pn = pLen
          break
        }

        /**
         * if route start with a $
         * then store the varibale to provide in callback
         * and continue checking next incomming path
         */
        if ( rp[pn][0] == '$' )
        {
          pathData[rp[pn]] = paths[pn]
          continue
        }

        /**
         * if current route path is not
         * equal to incomming path then break
         * the loop;
         * exiting before final increment means
         * matching is not successful
         */
        if ( rp[pn] != paths[pn] )
        {
          break
        }
      }
      /**
       * If previous loop completed without
       * any break then we got a route match
       */
      if ( pn == pLen )
      {
        isSelected = true
        break
      }
    }

    /**
     * if route is found
     */
    if ( isSelected )
    {
      let myData = {path: pathData, paths, url, data: null}
      // console.log('Selected Route', route)
      if ( route.options['parseAllData'] == true )
      {
        let reqData = await this.parseReqData(req, res)
        myData['data'] = reqData
      }
      return await route.cb(myData, req, res)
    }

    /**
     * else call the default route
     */
    else
    {
      // console.log('No Luck')
      return await this.routes['*'][0].cb(req, res)
    }
    
  }

  /**
   * Handle WebSocket Upgrade
   * @param {IncomingMessage} req 
   * @param {ServerResponse} res 
   */
  async handleUpgrades(url, req, res)
  {
    if ( req.headers['upgrade'] != 'websocket' )
    {
      return true;
    }
    // handle websocket
  }

  /**
   * Handle HTTP Connection
   * @param {IncomingMessage} req 
   * @param {ServerResponse} res 
   */
  async onConnection(req, res)
  {

    let mAdd = req.socket.address()
    /**
     * Build the incomming URL.
     */
    let iUrl = `http://${mAdd.address}:${mAdd.port}${req.url}`
    
    /**
     * New WHATWG URL API object
     * currently just used for getting
     * queries in a data structure
     * @type {URL}
     */
    let url = new URL(iUrl)
    /** convert searchParams to object */
    url.sp = {}
    for ( let [key, val] of url.searchParams.entries() )
    {
      url.sp[key] = val
    }

    // call preConnction function
    // by calling cb provided while construction App
    await this.beforeConnSocket(url, req, res);

    let routeResult = {}

    // Check for WS Connection
    if ( await this.handleUpgrades(url, req, res) )
    {
      if ( res.socket )
      {
        routeResult = await this.parseRoute(url, req, res)
      }
    }
    
    if ( res.socket )
    {
      if ( !res.headersSent )
      {
        // send default headers
        res.setHeader('nouse-header', 'X7')

        // check for routeResult
        if ( routeResult && routeResult.headers )
        {
          for ( let header in routeResult.headers )
          {
            res.setHeader(header, routeResult.headers[header])
          }
        }
        else
        {
          res.setHeader('some-important-default-header', 'with default value')
        }
      }
  
      if ( !res.writableEnded )
      {
        // check for routeResult code
        if ( routeResult )
        {
          if ( routeResult.code )
          {
            res.statusCode = routeResult.code
          }

          if ( routeResult.data )
          {
            // TODO :  check for not buffer or string data
            res.end(routeResult.data)
          }
        }
        else
        {
          // end the request here
          res.end('DEFAULT')
        }
      }
    }

  }

  route(method, path, cb, options = null)
  {
    
    if ( !this.routes[method] ) { this.routes[method] = [...this.routes['*']] }
    this.routes[method].unshift(new Route(path, cb, options))

  }

  get(path, cb, options = null)
  {
    this.route('GET', path, cb, options)
  }

  post(path, cb, options = null)
  {
    this.route('POST', path, cb, options)
  }

  start(port = 8080, host = '0.0.0.0', cb)
  {
    log = new Log('App')
    this.server.listen(port, host, cb)
  }
}