const express = require("express");
const { Joi, validate } = require('express-validation');
const UserController = require("../controller/UserController"); 
const { AuthMiddleware } = require("../middleware/AuthMiddleware");

const FirstInfoValidation = {
    body: Joi.object({
        countryId: Joi.number().required(),
        languageId: Joi.number().required(),
        spokenLanguageId: Joi.number().required()
    }),
};

const LanguageValidation = {
    body: Joi.object({
        spokenLanguageId: Joi.number().required()
    }),
};

const CountryValidation = {
    body: Joi.object({
        countryId: Joi.number().required()
    }),
};

const router = express.Router();

router.post("/first-info", validate(FirstInfoValidation), AuthMiddleware(), UserController.PostFirstInfo)
router.post("/set-language", validate(LanguageValidation), AuthMiddleware(), UserController.SetLanguage)
router.post("/set-country", validate(CountryValidation), AuthMiddleware(), UserController.SetCountry)

module.exports = router;    
