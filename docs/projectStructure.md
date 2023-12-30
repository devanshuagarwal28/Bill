## Project Structure


Predicted. maybe, hopefully, possibbly.
```
/
|- client/
 |- client.sh
 |- client.bat
 |- +config.txt         # what client to start
 |- web/
  |- server/
   |- file/
    |- node/
     |- server.js        # need to pass ../config.json as argument
    |- +config.json      #+ for static files location and url mapping config file
    |- server.sh
    |- server.bat
  |- static/
   |- css/               # Css Files
   |- js/                # Js Files
   |- *.html             # Html Files
  |- URLMapping.txt      # URL mapping config file

|- configure.sh          # Generate config.[json|txt] files
|- configure.bat         # Generate config.[json|txt] files
|- configure.json
|- configure.js

|- data/                 # Dir with DB, Session and Temp files
 |- database/            # Database
  |- db/
   |- xlsx
    |- db.xlsx
  |- connectors/         # Connector
   |- py/
    |- db.py
    |- config.json       # [1]
   |- +config.json       #+ all databases directory path
 |- sessions/
  |- @Session ID
   |- session.json       # File containing session info
   |- files/             # Session Files
    |- *.[xlsx|xlsm|xls] # Excel file for the session
 |- temp/                # Temp dir

|- docs/
 |- apiOverview.md       # Overview File
 |- desc.md              # Project Description
 |- projectStructure.md  # this file

|- server/
 |- REST/
  |- node/
   |- server.js
   |- config.json        # [1]
  |- +config.json        #+ directory for src/
 |- server.sh
 |- server.bat
 |- +config.txt          #+ what server to start

|- src/                  # Actual Source Files
 |- python/
  |- *.py                # Python Files
 |- bill.sh
 |- bill.bat
 |- bill.py              # Main Python entry point
 |- bill.js              # Wrapper to start bill.py child process
 |- +config.txt          #+ [2]

----
+* : auto gen file
[1]: # for respective config file location that will be auto generated via ./configure
[2]: # directory info for data, database, connector, sessions and temp
```