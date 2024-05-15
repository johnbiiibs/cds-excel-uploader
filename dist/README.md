# @johnbiiibs/cds-excel-uploader
> This is a **personal project**, hence there is no offical support. Feel free to use it though, and open issues and I will try my best to fix any. Cheers!

This package aims to provide utility middlewares / handlers to simplify the process of handling Excel (XLSX) uploads in the SAP Cloud Application Programming Model (CAP).

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

# Support
Please use the GitHub bug tracking system to post questions or to report bugs.
