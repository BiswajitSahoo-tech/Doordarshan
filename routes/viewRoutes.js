const express = require('express')
const viewsController = require('./../controller/viewsController')
const authController = require('./../controller/authController');
const userController = require('./../controller/usersController')
const app = require('../app');


const router = express.Router();

router.get('/',authController.isLoggedIn,viewsController.getRoot)
router.get('/login' , viewsController.getLoginForm)
router.get('/signup' ,viewsController.getSignupForm)
router.get('/workspace/:conid', authController.protect, viewsController.getWorkspace)
router.get('/me', authController.protect , viewsController.getMe)
// router.use(authController.isLoggedIn)
// if(req.user){
//     app.get('/',viewsController.getLanding)
// }
// else{
//     app.get('/',viewsController.getHome)
// }
// router.get('/me', authController.protect , viewsController.getAccount)

// router.post('/submit-user-data',authController.protect, viewsController.updateUserData)

module.exports = router