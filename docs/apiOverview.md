# API Overview

Proj Bill

## api

> createSession
`POST`
	
#### Query
* uuid
  
#### Steps
* create a tempDir with uuid
* save in local storage

#### Response
statusCode = 200 | 500 \
data = (empty)

---
> addAndParseFile
`POST`
	
#### Query
* uuid
* data : file (multipart or default)
	
#### Steps
* save file in tempDir of uuid
* convert file data to json and save to ${fileName}.json

### Resp
statusCode = 200 | 500 \
data = jsonData

---
> codeInfo
`GET`

#### Query
* uuid
* code
	
#### Steps
* search the file with code

#### Resp
statusCode = 200 | 404 | 500 \
data = codeInfo if found in file

---
> addCode
`PUT`

#### Query
* uuid
* code
* codeInfo
	
#### Steps
* add code and codeInfo in data file

#### Resp
statusCode = 200 | 500
data = (empty)

---
> updateFile `PUT`

update file that is in the session with the data from the UI

#### Query
* uuid
* fileData in csv or json
	
#### Steps
* update/overwrite the data in the file

#### Response
code = 200 | 500

---
> getFile `GET`

#### Query
* uuid

#### Resp
code = 200 | 404
data = file if found


---
> getPdf `GET` 
	
#### Query
* uuid
* data : full html page to be converted
	
#### Steps
* save the incomming html to file in tempDir
* convert html file to pdf via pdfgen in python
		(https://pypi.org/project/pdfgen/)

#### Resp
code = 200 | 404 | 500
data = pdfFile if no error


*****************

Steps to follow by user
1) create session
2) upload File
3) update File
3) add code Info
4) download lates filled file
5) download pdf

Features
* List of prev sessions (optional)
* Auto delete previus sessions
* Single Page
* Auto Start with Windows (just the service/server)
* Automated Testing scripts
<!-- * modular UI structure  -->