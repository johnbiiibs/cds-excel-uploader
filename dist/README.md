# @johnbiiibs/cds-excel-uploader
> This is a **personal project**, hence there is no offical support. Feel free to use it though, and open issues and I will try my best to fix any. Cheers!

This package aims to provide utility middlewares / handlers to simplify the process of handling Excel (XLSX) uploads in the SAP Cloud Application Programming Model (CAP). It takes in an Excel file then parses it into a JSON Object.

This package is built on top of [SheetJS](https://docs.sheetjs.com/docs/getting-started/installation/nodejs).

# Install
```
npm i @johnbiiibs/cds-excel-uploader
```

# Usage
The package comes with two (2) middleware utility functions: one as a CAP CDS Handler, and another as an Express Middleware.

## CAP Handler
This method is inspired by the following blog on community.sap.com. Please check out the original blog: [Upload data from excel in CAP (Node.js)](https://community.sap.com/t5/technology-blogs-by-members/upload-data-from-excel-in-cap-node-js/ba-p/13554121)

Start by projecting the ExcelUpload entity from the ExcelUploadService. This entity is a Singleton entity (@odata.singleton).
```
// service.cds
using { ExcelUploadService } from '@johnbiiibs/cds-excel-uploader';

service MyService {
    entity ExcelUpload as projection on ExcelUploadService.ExcelUpload;
}
```
Then get the `parseExcel` utility function from the CDS Middleware, and attach it to the entity.
```
// service.js

const { cds: middleware } = require("@johnbiiibs/cds-excel-uploader");
const { parseExcel } = middleware;

module.exports = async srv => {
    const { ExcelUpload } = srv.entities;

    // handler for the excel file
    srv.on("PUT", ExcelUpload, parseExcel);

    // handler for the parsed excel data
    srv.on("PUT", ExcelUpload, async (req, next) => {
        // 'req.data.fileData' contains the excel data
    });
};
```
Sample UI5 file uploader for this implementation.
```
// FileUploader.fragment.xml (UI5)

<u:FileUploader
    id="uploader"
    name="myFileUpload"
    uploadUrl="/srv-api/excel-upload-srv/ExcelUpload/file"
    width="100%"
    tooltip="Upload your file to the local server"
    sendXHR="true"
    useMultipart="false"
    uploadStart="handleUploadStart"
    uploadComplete="handleUploadComplete"
    httpRequestMethod="Put"
/>
```

## Express Middleware
This middleware focuses integration through the `server.js` file as an Express.js Middleware.

This method has a dependency on the [express-fileupload](https://www.npmjs.com/package/express-fileupload) package.
```
// server.js
const fileUpload = require("express-fileupload");
const { express: middleware } = require("@johnbiiibs/cds-excel-uploader");
const { parseExcel } = middleware;

cds.on("bootstrap", (app) => {
    app.post("/upload", fileUpload(), parseExcel, (req, res, next) => {
        // 'req.fileData' contains the excel data
        res.json(req.fileData);
    });
});
```
Sample UI5 file uploader for this implementation.
```
// FileUploader.fragment.xml (UI5)

<u:FileUploader
    id="uploader"
    name="myFileUpload"
    uploadUrl="/upload"
    width="100%"
    tooltip="Upload your file to the local server"
    sendXHR="true"
    fileType="xls,xlsx"
    uploadComplete="handleUploadComplete"
/>
```

## Parsing Options
As mentioned, this package is heavily dependent on [SheetJS](https://docs.sheetjs.com/docs/getting-started/installation/nodejs), particularly the `XLSX.utils.sheet_to_json` utility function.

As such, its `options` argument can also be applied to the `parseExcel` method. By default, the package uses this configuration:
```
const options = {
    cellText: true,
    cellDates: true,
    dateNF: 'dd"."mm"."yyyy',
    rawNumbers: false,
    defval: ""
}
```

### Sample CAP Implementation
```
// Same code as the sample above...

// Sample options.
// This would overwrite the default.
const options = {
    cellDates: false,
    rawNumbers: true,
    defval: "X"
}

// handler for the excel file
srv.on("PUT", ExcelUpload, parseExcel(options));
```

### Sample Express Implementation
```
// Same code as the sample above...

// Sample options.
// This would overwrite the default.
const options = {
    cellDates: false,
    rawNumbers: true,
    defval: "X"
}

cds.on("bootstrap", (app) => {
    app.post("/upload", fileUpload(), parseExcel(options), (req, res, next) => {
        // 'req.fileData' contains the excel data
        res.json(req.fileData);
    });
});
```

# Support
Please use the GitHub bug tracking system to post questions or to report bugs.
