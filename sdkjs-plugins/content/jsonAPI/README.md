## Overview

The plugin is designed for receiving, parsing and inserting the results of a get request from a third-party site or service into spreadsheet cells.
Arbitrary get requests are implemented, parsing using JSONPath expressions, saving previously made requests in a separate (special) sheet, updating cell values in accordance with previously generated queries on the sheet.

![Example JSON API plugin](https://github.com/VyachL05/onlyoffice.github.io/assets/93988186/6c8d4dcd-f11b-48ce-ab1a-9c7867661590)

## Install
Follow onlyoffice instructions:
https://api.onlyoffice.com/plugin/installation/onpremises#plugin-folder

## How to use

1. Start SpreadsheetEditor
2. Select some range of cells in which you want to paste your data from request
3. Open the Plugins tab and press "JSON API"/ API JSON
4. Edit "Request URL" field
5. Edit JSON path expression field. If you want to get several rows you can provide sevevral JsonPath expressions separated by ;  
6. Tap Ok button and enjoy with your result
7. If you want to update values in your cells, tap JSON API/ Start

## Using example

![Start this gif](https://github.com/VyachL05/onlyoffice.github.io/blob/703ada8fd431d4a4f2c9277eccfb7626dadefb78/sdkjs-plugins/content/jsonAPI/resources/img/JSONApi.gif)

If you need more information about how to use or write your own plugin, please see this https://api.onlyoffice.com/plugin/basic
