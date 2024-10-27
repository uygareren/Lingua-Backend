const express = require("express");
const { Joi, validate } = require('express-validation');
const UserController = require("../controller/UserController"); 
const { AuthMiddleware } = require("../middleware/AuthMiddleware");

const FirstInfoValidation = {
    body: Joi.object({
        country: Joi.number().required(),
        language: Joi.number().required()
    }),
};

const router = express.Router();

router.post("/first-info", AuthMiddleware(), UserController.PostFirstInfo)

module.exports = router;    
