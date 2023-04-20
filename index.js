/*
  This code sample shows Custom Model operations with the Azure Form Recognizer client library.

  To learn more, please visit the documentation - Quickstart: Form Recognizer Javascript client library SDKs
  https://docs.microsoft.com/en-us/azure/applied-ai-services/form-recognizer/quickstarts/try-v3-javascript-sdk
*/

const { AzureKeyCredential, DocumentAnalysisClient } = require('@azure/ai-form-recognizer')
const { Console } = require('console');
const fs = require('fs')
const path = require('path')
const readline = require('readline')
require('dotenv').config()

const waitForEnter = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise(resolve => rl.question('', input => {
      rl.close();
      if (input === '') // just hit enter and keep hitting
        resolve(input);
  }))
}

const analyzeDocument = async (client, filePath, logger) => {

  const modelId = process.env.FORM_RECOGNIZER_CUSTOM_MODEL_ID || 'prebuilt-invoice'
  const readStream = fs.createReadStream(filePath)
  logger.log(filePath)  

  const poller = await client.beginAnalyzeDocument(modelId, readStream)

  const {
	  documents: [document],
    pages,
    tables,
    keyValuePairs
  } = await poller.pollUntilDone()

  if (!document) {
	  throw new Error('Expected at least one document in the result.')
  }

  logger.log(`Extracted document from :${filePath}`, document.docType, `(confidence: ${document.confidence || "<undefined>"})`)
  logger.table(document.fields)
  
  // const result = await poller.pollUntilDone()

  let rows = []
  for (const table of tables || []) {
    for (let i = 0; i < table.rowCount; i++) {
      let row = {}
      table.cells.filter(cell => cell.rowIndex === i).map(cell => {row[cell.columnIndex] = cell.content})
      rows.push(row)
    }
  }
  logger.log('Tables: ');
  logger.table(rows)

  // let keyValuePairs = result.keyValuePairs;

  let keyValuePairsArr = []
  if (!keyValuePairs || keyValuePairs.length <= 0) {
    logger.log('No key-value pairs were extracted from the document.');
  } else {
    logger.log('Key-Value Pairs:');
    for (const { key, value, confidence } of keyValuePairs) {
      keyValuePairsArr.push({ key: key?.content, value: value?.content, confidence: confidence })
    }
  }
  logger.table(keyValuePairsArr);

  // const json = poller.GetRawResponse().Content.ToString()
  // logger.log(json)

  readStream.close()
}



/*
* This sample shows how to analyze a document using a model with a given ID. The model ID may refer to any model,
* whether custom, prebuilt, composed, etc.
*
* @summary analyze a document using a model by ID
*/
(async () => {
  /*
	Remember to remove the key from your code when you're done, and never post it publicly. For production, use
	secure methods to store and access your credentials. For more information, see
	https://docs.microsoft.com/en-us/azure/cognitive-services/cognitive-services-security?tabs=command-line%2Ccsharp#environment-variables-and-application-configuration
  */
  const endpoint = process.env.FORM_RECOGNIZER_ENDPOINT || 'https://westeurope.api.cognitive.microsoft.com/'
  const apiKey = process.env.FORM_RECOGNIZER_API_KEY || false

  if (!apiKey) {
    console.log('API Key is missing!')
    return
  }

  const credential = new AzureKeyCredential(apiKey)
  const client = new DocumentAnalysisClient(endpoint, credential)

  if (!fs.existsSync('invoices')){
    fs.mkdirSync('invoices');
  }

  if (!fs.existsSync('process_logs')){
    fs.mkdirSync('process_logs');
  }

  let nbr_files_processed = 0;
  fs.readdir('invoices/', async (err, files) => {
    for (let i = 0; i < files.length; i++) {
      // const step = await waitForEnter()
      
      let file = files[i]

      const myLogger = new Console({
        stdout: fs.createWriteStream(`process_logs/${path.parse(file).name}-out.log`),
        stderr: fs.createWriteStream(`process_logs/${path.parse(file).name}-err.log`),
      })
      
      myLogger.log('filename: ' + file)
      analyzeDocument(client, `invoices/${file}`, myLogger)
    
      nbr_files_processed++
      myLogger.log('number of files processed so far: ' + nbr_files_processed)
    }
  })
})()

