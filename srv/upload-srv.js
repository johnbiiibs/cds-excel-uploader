const cds = require('@sap/cds');
const xlsx = require('xlsx');

const { PassThrough } = require('node:stream');
module.exports = async srv => {
    const { ExcelUpload } = srv.entities;

    /**
     * Event handler for parsing excel data upon 
     * special inclusions upload
     */
    srv.on('PUT', ExcelUpload, async (req, next) => {
        const buffers = [];
        const stream = new PassThrough();

        const xlsxOpts = {
            cellText: true,
            cellDates: true,
            dateNF: 'dd"."mm"."yyyy',
            rawNumbers: false,
            defval: ""
        }

        req.data.file.pipe(stream);

        const whenDataProcessed = new Promise((resolve, reject) => {
            try {
                stream.on('data', dataChunk => {
                    buffers.push(dataChunk);
                });

                stream.on('end', async () => {
                    const buffer = Buffer.concat(buffers);
                    const workbook = xlsx.read(buffer, Object.assign({
                        type: "buffer",
                    }, xlsxOpts));

                    const sheets = workbook.Sheets;
                    const sheetNames = workbook.SheetNames;

                    const sheetData = sheetNames.map((name) => {
                        const sheet = sheets[name];
                        const response = {};
                        const data = []

                        const jsonSheet = xlsx.utils.sheet_to_json(sheet, xlsxOpts);
                        jsonSheet.forEach((res) => {
                            data.push(JSON.parse(JSON.stringify(res)))
                        });

                        response[name] = data;
                        return response;
                    });

                    resolve(sheetData)
                });
            } catch (error) {
                reject(error);
            }
        });

        const response = await whenDataProcessed;

        req.data.fileData = response;
        return next();
    });

}