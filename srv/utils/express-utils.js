const xlsx = require('xlsx');

const ExpressMiddleware = {
    /**
     * Uploads imported data template to Table in the HANA Database.
     *
     * @param {express.Request} req - The request object where file is stored
     * @param {express.Response} res - The response object where we pass the resulting status
     */
    parseExcel: async (req, res, next) => {
        const { files } = req;

        try {
            // Current limitation, get first file only
            const data = files[Object.keys(files)[0]].data;
            const workbook = xlsx.read(data);

            const sheets = workbook.Sheets;
            const sheetNames = workbook.SheetNames;

            const xlsxOpts = {
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
};

module.exports = ExpressMiddleware;