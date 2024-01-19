import http, { IncomingMessage, ServerResponse } from 'http'
import {Log} from 'utils/log'

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
  constructor()
  {
    this.routes = {
      '*': [
        new Route('*',
          async (req, res) => { 
            res.statusCode = 404
            res.end('404')
          }
        )
      ],
    }
    this.server = http.createServer(this.onConnection.bind(this))
  }

  /**
   * Parse and call the routes
   * @param {IncomingMessage} req 
   * @param {ServerResponse} res 
   */
  async parseRoute(req, res)
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
    if ( !req.method )
    {
      await this.routes['*'][0].cb(req, res)
      return
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
      console.log('Selected Route', route)
      await route.cb({path: pathData, paths, url}, req, res)
    }

    /**
     * else call the default route
     */
    else
    {
      await this.routes['*'][0].cb(req, res)
      console.log('No Luck')
    }
    
  }

  /**
   * Handle WebSocket Upgrade
   * @param {IncomingMessage} req 
   * @param {ServerResponse} res 
   */
  async handleUpgrades(req, res)
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
    // handle preConnction steps
    // by calling cb provided while construction App
    // -- not yet implemented --

    // Check for WS Connection
    if ( await this.handleUpgrades(req, res) )
    {
      if ( res.socket )
      {
        await this.parseRoute(req, res)
      }
    }
    
    if ( res.socket )
    {
      if ( !res.headersSent )
      {
        // send default headers
        res.setHeader('nouse-header', 'X7')
      }
  
      if ( !res.writableEnded )
      {
        // end the request here
        res.end('DEFAULT')
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

  start(port = 8080, host = '0.0.0.0', cb)
  {
    log = new Log('App')
    this.server.listen(port, host, cb)
  }
}