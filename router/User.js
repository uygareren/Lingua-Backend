const express = require("express");
const { Joi, validate } = require('express-validation');
const UserController = require("../Controller/UserController"); // Adjust the path as needed
const { AuthMiddleware } = require("../middleware/AuthMiddleware");
const { MulterProfileImageMiddleware, MulterPostVideoMiddleware } = require("../middleware/MulterMiddleware");

const UpdateProfileValidation = {
    body: Joi.object({
        name: Joi.string().required(),
        surname: Joi.string().required(),
        phone: Joi.string().required(),
        username: Joi.string().required(),
        gender: Joi.string().required(),
        birthDate: Joi.string().required(),
    }),
}

const PostCommentValidation = {
    body: Joi.object({
        postId: Joi.number().required(),
        comment: Joi.string().required(),
    }),
};

const DeleteCommentValidation = {
    body: Joi.object({
        commentId: Joi.number().required(),
        postId: Joi.number().required(),
    }),
};

const router = express.Router();

router.put('/update-profile', validate(UpdateProfileValidation), AuthMiddleware(), UserController.UpdateProfile);

router.post('/follow', AuthMiddleware(), UserController.PostFollow);
router.get('/requests', AuthMiddleware(), UserController.GetFollowRequest);
router.post('/request-action', AuthMiddleware(), UserController.PostFollowRequestAction);

router.post('/block', AuthMiddleware(), UserController.PostBlockUser);
router.delete('/unblock', AuthMiddleware(), UserController.PostUnBlockUser);
router.get('/blocked-users', AuthMiddleware(), UserController.GetBlockedUsers);

router.get('/user/:targetUserId', AuthMiddleware(), UserController.GetUserDetail);

router.post('/update-profile', MulterProfileImageMiddleware, AuthMiddleware(), UserController.UpdateProfileImage);
router.delete('/delete-profile-image', AuthMiddleware(), UserController.DeleteProfileImage);

router.get('/posts/:userId', AuthMiddleware(), UserController.GetPostsByUserId);
router.get('/my-posts', AuthMiddleware(), UserController.GetMyPostsByUserId);
router.post('/post-video', MulterPostVideoMiddleware, AuthMiddleware(), UserController.AddPostVideo);
router.delete('/post-delete', AuthMiddleware(), UserController.DeletePost);

router.post('/post-comment', validate(PostCommentValidation), AuthMiddleware(), UserController.PostComment);
router.delete('/delete-comment', validate(DeleteCommentValidation), UserController.DeleteComment);
router.get('/comments/:postId', AuthMiddleware(), UserController.GetCommentsById);

router.post('/like', AuthMiddleware(), UserController.PostLike);
router.get('/likes/:postId', AuthMiddleware(), UserController.GetLikesByPostId);

module.exports = router;    
