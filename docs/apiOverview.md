# API Overview

Proj Bill

## api

> createSession
`POST`
	
#### Query
* name : session name (optional)

#### Data
* file (multipart or default)
  
#### Steps
* generate a `uuid`
* `uniqueName` = `${fileName}_${uuid}`
* create `sessionDir` with name `${uniqueName}`
* save file in `sessionDir` with name `original_${fileName}`
* copy `${fileName}` to `${name}_${fileName}`
* convert file data to json and save to `${fileName}.json`
* create a `bill_${fileName}.json` a/c to `${fileName}.json`
* save session metadata in sqlite3
	* uuid : `${uuid}`
	* name : name if provided in query
	* uniqueName : `${uniqueName}`
	* fileName : `${fileName}`
	* datetime : creation datetime
	* billFileName : `bill_${fileName}.json`
* respond `uuid`

#### Response
statusCode = 200 | 500 \
data = jsonData = {uuid} for newly created session

---
> getSessions
`GET`

list all session

#### Query

#### Steps
* select * from sessiosn db

#### Response
statusCode = 200 | 500 \
data = jsonData (array) containd all session info

---
> getSession
`GET`

get a specefic session

#### Query
* uuid : uuid of session
* fileData : [true|false]

#### Steps
* select info from session table with uuid
* if fileData is requested read `${uniqueName}/filled_${name}_${fileName}`

#### Response
statusCode = 200 | 404 \
data = {metadata, fileData: (fileData if queried else {})} json

---
> getSessionFile
`POST`

get the file in different format

#### Query
* uuid
* type : [filled=default|original]
* format : [json=default for work|csv|xlsx=default for original|xls]
	
#### Steps
* check for session in sql and file requested in directory
* convert if required

### Resp
statusCode = 200 | 404 | 500 \
data = requested file if exist and readed/parsed without error

---
> codeInfo
`GET`

#### Query
* code
	
#### Steps
* search the file/db with code

#### Resp
statusCode = 200 | 404 | 500 \
data = codeInfo in JSON if found in file

---
> addCode
`PUT`

#### Query
* code
* codeInfo
	
#### Steps
* add code and codeInfo in data file

#### Resp
statusCode = 200 | 500
data = (empty)

---
> updateFile `PUT`

update session file with the data from the UI

#### Query
* uuid
* format = [json=default|csv]

#### Data
* fileData
	
#### Steps
* read from sql with uudi
* update/overwrite the data in the filled file
* create/update `${fileName}.json`

#### Response
code = 200 | 500

---
> getBill `GET`

get the Current Bill file

#### Query
* uuid
* format=[json=default|pdf]

#### Steps
* get info from sql with uuid
* create/update `bill_${fileName}.json` (preserving the extra billInfo) file a/c to `${fileName}.json` 
* respond `bill_${fileName}.json` if format=json
* create `bill` dir in sessionDir
* create `bill_${fileName}.html`
* create `bill_${fileName}.pdf` (https://pypi.org/project/pdfgen/)
* respond `bill_${fileName}.pdf`

#### Response
code = 200 | 404 | 500\
data = jsonData

---
> updateBill `PUT`

update some bill info from the UI

#### Query
* uuid

#### Data
* Full jsonData for updated Bill Info

#### Steps
* get data from sql by uuid
* replace `bill_{fileName}.json` in sessionDir

#### Response
code = 200 | 404 | 500

*****************

Steps to follow by user
1) create session and upload file/select session
3) update File
3) add code Info if required
4) download bill
5) edit Bill
6) download pdf

Features
* List of prev sessions
* Auto delete previus sessions
* Auto Start with Windows (just the service/server)
* Automated Testing scripts (maybe not)