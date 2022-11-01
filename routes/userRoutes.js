const express = require('express')
const userController = require('./../controller/usersController')
const userRouter = express.Router()
const authController = require('./../controller/authController')
const morgan = require('morgan')

//configure multer

//below router is against the RESTAPI format
userRouter.post('/signup' , authController.signup)
userRouter.post('/login' , authController.login)
userRouter.get('/logout' , authController.logout)

userRouter.route('/forgetPassword').post( authController.forgetPassword)
userRouter.route('/resetPassword/:token').patch( authController.resetPassword)


//in case of password whether it is creating one or a updating, or reseeting it
//must go through the save()/create() becuz then only our all pre save middlewarw
// will execute and encrypt our pwd and also run validator on confirmPwd

userRouter.use(authController.protect)

userRouter.route('/updatePassword').patch( authController.updatePassword)
userRouter.get('/me' ,  userController.getMe, userController.get_user);
userRouter.route('/recentContact')
          .get(userController.getRecentContact )
          .patch(userController.addRecentContact)
userRouter.get('/photo/:peerId', userController.getPhotoByPeerId)

//upload.single is middleware which takes photes from form and save it 
//to the dest
//'photo' is the name of the field which contains the img
//it also add some info about the uploaded photo to the req
userRouter.route('/updateMe').patch(userController.uploaduserPhoto,userController.resizeUserPhoto, userController.updateMe)
userRouter.route('/deleteMe').delete( userController.deleteMe)
userRouter.patch('/updateActive', userController.updateActive)

userRouter.param('id' , (req , res, next, val) =>{
    // console.log(val)
    next()
})

module.exports = userRouter 
