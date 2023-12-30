import http from 'http'

let server = http.createServer((req, res) => {
  res.end("HELLO FROM SERVER")
})

server.listen(8585)