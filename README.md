# azure-form-recognizer-script
Small script to parse invoices using the azure form recognizer SDK for JS 

> **_Important Note !!!_** 
Form recognizer pricing is based on the pages we send them to analyze, so try not to run the script for the same file multiple times.

# Configuration and Environment
It is supposed to be run in local, it is tested with:
* Node -> v18.9.0
* NPM -> v8.19.1

## Environment Variables
For the API Key, got to main Azure portal, from there follow ``All resources`` -> ``FormRecognizerResource`` -> ``Keys and Endpoints`` 
```
FORM_RECOGNIZER_CUSTOM_MODEL_ID=prebuilt-invoice
FORM_RECOGNIZER_ENDPOINT=https://westeurope.api.cognitive.microsoft.com/
FORM_RECOGNIZER_API_KEY=**************************
```

# Usage
```
npm install
node index.js
```

# What will it do
In the same project folder, it will fetch every invoice files in the ``invoices`` folder and send them to azure form recognizer API, 
fetch the analysis results and store the logs in seperate files for each invoice under ``process_logs`` folder.
