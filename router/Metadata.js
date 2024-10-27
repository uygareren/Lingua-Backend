const MetadataController = require("../controller/MetadataController");
const express = require("express");
const router = express.Router();


router.get('/country', MetadataController.GetCountry);
router.get('/language', MetadataController.GetLanguage);

module.exports = router;