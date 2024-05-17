const xlsx = require('xlsx');

const { PassThrough } = require('node:stream');

const CDSMiddleWare = {
    /**
     * Parses the contents of the req.query object.
     * It also accepts an (optional) object based on the XLSX.utils.sheet_to_json options argument.
     * 
     * More details here: https://docs.sheetjs.com/docs/api/utilities/array#array-output
     * 
     * @param {object} options - XLSX.utils.sheet_to_json options argument (optional)
     * @returns {Function} An asynchronous CAP Handler
     */
    parseExcel: (options = null) => {
        /**
         * Parses the contents of the req.query object
         * @param {object} req - The request query
         * @param {Function} next - The next process
         * @returns {object} The parsed contents of the request query
         */
        return async (req, next) => {
            const buffers = [];
            const stream = new PassThrough();

            const xlsxOpts = options || {
                cellText: true,
                cellDates: true,
                dateNF: 'dd"."mm"."yyyy',
                rawNumbers: false,
                defval: ""
            };

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
        }
    }
};

module.exports = CDSMiddleWare;