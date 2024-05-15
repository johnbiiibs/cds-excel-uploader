const cds = require('./srv/utils/cds-utils');
const express = require('./srv/utils/express-utils');

const ExcelUploader = {
    cds,
    express
}

module.exports = ExcelUploader;