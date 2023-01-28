const express = require('express');
const comment = require('./../controllers/comment-controller');

const router = express.Router();

// router.post('/',comment.addComment);
// router.patch('/',comment.editComment);
// router.delete('/',comment.deleteComment);
// router.get("/",comment.getComments);

router.route('/')
.post(comment.addComment)
.get(comment.getComments)
.patch(comment.editComment)
.delete(comment.deleteComment)

router.post('/list',comment.getCommentByRecord);


module.exports = router;