const express = require('express');
const route = express.Router();
const records = require('../controllers/record-controller');

route.post('/list',records.getRecordsList);
route.post("/",records.addRecords);
route.get("/",records.getAll);
route.post("/details",records.getRecordDetails);
route.delete('/',records.deleteRecord);
route.post('/advancelookup',records.advanceLookup);
route.post('/edit',records.editRecord);
route.post('/upload/:id',records.multer.single('document'),records.uploadFile);

module.exports = route;