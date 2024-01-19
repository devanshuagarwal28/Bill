import App from './app.js'

let app = new App()

app.get('/session', (data, req, res) => {
  res.end(JSON.stringify(data))
}, {parseAllData: true})

export default class ServerApp
{
  constructor() { }
  start(port = 8080, host = '0.0.0.0', cb)
  {
    app.start(port, host, cb)
  }
}