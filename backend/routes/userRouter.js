//create router
var express = require('express');
const router = express.Router();
//import controller
const userController = require('../controllers/userController');
const userAuth = require('../middlewares/userAuth');

//create routes
router.post('/phone-login', userController.phoneLoginRoute);
router.get('/protected', userAuth, userController.Protected);
router.get('/', userAuth, userController.GetUser);

//export router
module.exports = router;