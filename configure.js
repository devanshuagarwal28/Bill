import { readConfig } from "utils/my_config"

/*
 From:
 https://stackoverflow.com/a/70863372/8071073
*/
import { fileURLToPath } from 'node:url';
import { basename, dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)
const filename = basename(__filename)
/**/

class Client
{
  constructor(clinetConfig)
  {
    this.config = clinetConfig
  }
}


if ( process.argv[1] == __filename )
{
  // Open global config file
  const G_CONF_FILE = "configure.json"
  console.log(process.cwd())
  console.log(readConfig(G_CONF_FILE))
}