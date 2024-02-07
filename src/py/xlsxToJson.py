# Convert excel file to json (removing any metadata like formula)
# input: excel file path
# output: converted excel file in json format
"""
# input example [file: mit.xlsx]
|----------|-----------|-------------------------------------|
| Name     | Element   | Phone                               |
|----------|-----------|-------------------------------------|
| Anshul   | flowers   | Pixel 7A                            |
| Devanshu | chocolate | Some Samsung Device startes with M  |
|----------|-----------|-------------------------------------|

# output in JSON [outFile: mit.json]
## Not a standard way, just for our project
{
  "totalColumns": 2,                       # number of total columns
  "headers": ["Name", "Element", "Phone"], # array of headers
  "byCols": [
    ["Anshul", "Devanshu"],
    ["flowers", "chocolate"],
    ["Pixel 7A", "Some Samsung Device startes with M"]
  ],
  "byRows": [
    {
      "name": "Anshul",
      "Element: "flowers",
      "Phone": "Pixel 7A"
    },
    {
      "name": "Devanshu",
      "ELement": "chocolate",
      "Phone": "Some Samsung Device startes with M"
    }
  ]
}

### as of now can choose to skip byCols implementaion
"""

import sys
import os

# create a function that will read xlsxFilePath
# and convert it into a dictionary and save as
# json file to outJsonFilePath
def xlsxToJson(xlsxFilePath, outJsonFilePath):
  # write code here, nahhh write anywhere you like
  
  pass

if __name__ == '__main__':

  # check if enough arguments provided
  if len(sys.argv) < 3:
    sys.exit(1)
  
  excelFilePath = sys.argv[1]
  jsonFilePath  = sys.argv[2]

  # check if excel file exists
  if not os.path.exists(excelFilePath):
    print('File Path:', excelFilePath, 'does not exists')
    sys.exit(2)

  if not os.path.exists(os.path.dirname(jsonFilePath)):
    print('Dir Path:', os.path.dirname(jsonFilePath), 'does not exists')
    sys.exit(2)


  xlsxToJson(sys.argv[1], sys.argv[2])