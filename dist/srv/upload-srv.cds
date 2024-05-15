service ExcelUploadService {
    @odata.singleton
    @cds.persistence.skip
    entity ExcelUpload {
        @Core.MediaType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        file : LargeBinary;
    }
}