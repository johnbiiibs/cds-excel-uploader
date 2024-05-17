const xlsx = require('xlsx');

const ExpressMiddleware = {

    /**
     * Parses the contents of the req.query object.
     * It also accepts an (optional) object based on the XLSX.utils.sheet_to_json options argument.
     * 
     * More details here: https://docs.sheetjs.com/docs/api/utilities/array#array-output
     * 
     * @param {object} options - XLSX.utils.sheet_to_json options argument (optional)
     * @returns {Function} An Express.js middleware function
     */
    parseExcel: (options = null) => {

        /**
         * Uploads imported data template to Table in the HANA Database.
         *
         * @param {express.Request} req - The request object where file is stored
         * @param {express.Response} res - The response object where we pass the resulting status
         * @param {express.Next} next - The express.js next() callback
         */
        return async (req, res, next) => {
            const { files } = req;

            try {
                // Current limitation, get first file only
                const data = files[Object.keys(files)[0]].data;
                const workbook = xlsx.read(data);

                const sheets = workbook.Sheets;
                const sheetNames = workbook.SheetNames;

                const xlsxOpts = options || {
                    cellText: true,
                    cellDates: true,
                    dateNF: 'dd"."mm"."yyyy',
                    rawNumbers: false,
                    defval: ""
                };

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

                req.fileData = sheetData;
                next();
            } catch (error) {
                next(error);
            }
        }
    }
};

module.exports = ExpressMiddleware;