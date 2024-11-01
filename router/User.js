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

const PostWordValidation = {
    body: Joi.object({
        languageId: Joi.number().required(),
        word: Joi.string().required()

    }),
};

const GetLanguageValidation = {
    params: Joi.object({
        languageId: Joi.number().required(),

    }),
};

const LearntWordValidation = {
    body: Joi.object({
        id: Joi.number().required(),
        languageId: Joi.number().required(),
        word: Joi.string().required()

    }),
};

const UpdateProfileValidation = {
    body: Joi.object({
        name: Joi.string().required(),
        surname: Joi.string().required(),
        imageUrl: Joi.string().required()

    }),
};

const PostStoryValidation = {
    body: Joi.object({
        languageId: Joi.number().required(),
        storyTitle: Joi.string().required(),
        story: Joi.string().required()

    }),
};

const DeleteStoryValidation = {
    body: Joi.object({
        storyId: Joi.number().required()

    }),
};

const router = express.Router();

router.post("/first-info", validate(FirstInfoValidation), AuthMiddleware(), UserController.PostFirstInfo)
router.post("/set-language", validate(LanguageValidation), AuthMiddleware(), UserController.SetLanguage)
router.post("/set-country", validate(CountryValidation), AuthMiddleware(), UserController.SetCountry)

//SAVED WORDS
router.post("/word", validate(PostWordValidation), AuthMiddleware(), UserController.PostWord)
router.get("/languages",  AuthMiddleware(), UserController.GetLanguageByUserId)
router.get("/language/:languageId", validate(GetLanguageValidation), AuthMiddleware(), UserController.GetLanguageDetail)
router.post("/leant-word", validate(LearntWordValidation), AuthMiddleware(), UserController.SendWordToLearn)

//LEARNT WORDS
router.get("/learnt-languages",  AuthMiddleware(), UserController.GetLearntLanguageByUserId)
router.get("/learnt-language/:languageId", validate(GetLanguageValidation), AuthMiddleware(), UserController.GetLearntLanguageDetail)

router.post("/update-profile", validate(UpdateProfileValidation), AuthMiddleware(), UserController.UpdateProfile)

//SAVED STORİES
router.post("/story", validate(PostStoryValidation), AuthMiddleware(), UserController.PostStory)
router.get("/stories",  AuthMiddleware(), UserController.GetStoriesByUserId)
router.get("/story/:languageId", AuthMiddleware(), UserController.getStoriesByLanguageId)
router.get("/story-detail/:storyId", AuthMiddleware(), UserController.getStoryDetail)
router.delete("/story", AuthMiddleware(), UserController.DeleteStory)

module.exports = router;    
