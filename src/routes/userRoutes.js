const express = require('express');
const router = express.Router();
const user = require('./../controllers/userController');
const auth = require('./../controllers/auth-controller');

router.get('/',user.getUsers);
router.post('/signup',user.signup);
router.post('/delete',user.deleteUser);
router.post('/login',user.login);
router.patch('/update',user.updateUser);
router.post('/advancelookup',user.advanceLookupUser);
router.post('/uploadpic/:id',user.multer.single('document'),user.uploadImage);
router.post('/getdocument',user.getDocumentBase64);

module.exports = router;