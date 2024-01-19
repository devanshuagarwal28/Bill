import http from 'http'
import { readConfig } from 'utils/my_config'

let myConfig = readConfig(process.argv[2])

let server = http.createServer((req, res) => {
  res.end(`HELLO FROM SERVER ${JSON.stringify(myConfig)} ${JSON.stringify(process.env)}`)
})

server.listen(myConfig["host"]["port"], myConfig["host"]["address"], _ => {
  
})