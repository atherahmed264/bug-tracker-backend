const express = require('express');
const task = require('./../controllers/task-controller')
const {authenticate} = require('./../controllers/auth-controller')

const router = express.Router();

// router.post('/',comment.addComment);
// router.patch('/',comment.editComment);
// router.delete('/',comment.deleteComment);
// router.get("/",comment.getComments);

router.route('/')
.post(task.addTask)
.get(task.getTasks)
.patch(task.editTask)
.delete(task.deleteTask)


module.exports = router;