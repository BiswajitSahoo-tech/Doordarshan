const User = require('./../model/userModel')
const jwt =require('jsonwebtoken')
const AppError = require('./../util/appError')
const {promisify} = require('util')
const Email = require('./../util/email')
const crypto = require('crypto')
// const { token } = require('morgan')

const signToken = (id)=>{
    return jwt.sign({id: id} , process.env.JWT_SECRET ,{
        expiresIn: process.env.JWT_EXPIRES_IN
    })

}
const sendToken = (user, statusCode , res)=>{
    const token = signToken(user._id)
    
    var cookieOption = {
        httpOnly: true,
        expires: new Date( Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000)
    }
    if(process.env.NODE_ENV == 'production'){
        cookieOption.secure = true
    }
    user.password = undefined
    res.cookie('jwt' , token , cookieOption)
    res.status(statusCode).json({
        status: 'success',
        
        msg:{
            user
        }
        
    })
}
exports.signup = async (req, res , next)=>{
    try{
        try{
            var user = await User.create({
                name: req.body.name,
                email: req.body.email,
                peerId:req.body.peerId,
                password: req.body.password,
                passwordConfirm: req.body.passwordConfirm,
                peerId: req.body.peerId
            })
        }catch( err){
            console.log('Insertion--->',err)
            throw err
        }
        
        // NOT SENDING EMAIL DUE TO NETWORK ISSUE
        // const url = req.protocol+'://'+req.get('host')+'/me'
        // try{
        //     await new Email( user, url).sendWelcome()
        // }catch( err){
        //     console.log('Email--->', err)
        //     throw err
        // }
        

        sendToken(user , 200 , res)
        
    }catch( err){
        
        next( new AppError('We are working on it.' , 400))
    }
}

exports.login = async (req, res, next)=>{
    try{
        //check if email and pwd exist, validating the user input
        const {email,password} = req.body
        if( !email || !password){
            //here we return becuz it will cause a 
            //immidiate exit to this function
            //if that would not, leads to an multiple header set
            //error
            return next(new AppError('please provide pwd and email' , 400))
        }
        //check for email and match with the pwd
        const user = await User.findOne({
            email: email
        }).select('+password')//by default we exclude the pwd field from
                             // our resultset, but if we want to add it
                             //explicitly then we have to add 
                             //select('+password') 

        // console.log(user)
       //use of instance method , which are available to the every document object
       //
        if(!user || !( await user.correctPassword(password , user.password))){
            return next(new AppError('Incorrect email or pwd' , 401))
        }
        //if everything work better, create token and send it
        sendToken(user , 200 , res)
    }catch(err){
        next( err)
    }
}

exports.logout = ( req, res)=>{
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 1000* 10),
        httpOnly: true
    })
    res.status(200).json({
        status: 'success'
    })
}

exports.protect = async (req, res, next)=>{
    //get the token and check if it is exist
    let token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }
    else if( req.cookies.jwt){
        token  =  req.cookies.jwt ;
    }

    if(!token || token === 'loggedout'){
        return next(new AppError('you are not logged in. Please log in to access this page', 401))
    }
    //validate the token // verify the signautre
    //below promise return the decoded payload as resolved value
    try{
        var decoded = await promisify(jwt.verify)(token , process.env.JWT_SECRET)
        
        // console.log(decoded.id) 
    }catch( err){
        // console.log(err.name)
        next( err)
    }
    
    //check the user still exist
    //maybe i logged in now and i have a valid token, valid for let
    //say 90d but in the mean time, after 2days i delete my accunt 
    //and if someone else have my token that lead to the fault and can
    // access behalf of me
    // console.log(decoded.id) 
    const freshUser = await User.findById(decoded.id)
    if(!freshUser){
        return next( new AppError('the user belong to the user does not exist', 404))
    }
    
    //check if user changed pwd after the token issued
    if(freshUser.changedPasswordAfter(decoded.iat)){
        return next( new AppError('user change pwd, please login again', 401))
    }

    req.user = freshUser
    res.locals.user = freshUser
    //grant access to protected data
    next()
}




//is only used in case of rendered page
//below middleware is not for the protect,
//therefore even if token does not exist , it do not send
//any error to global middleware,
// by this there is no user in local , and in turn
// there is no user in pug files
// and it will render the nav something else

// and everything happens otherwise if
// there exist an valid token with valid user

exports.isLoggedIn = async (req, res, next)=>{
    //get the token and check if it is exist
    
    if( req.cookies.jwt){
        const token  =  req.cookies.jwt ;
    
        
        try{
            //here an error can be exist , when we send an malformed
            // jwt after log out and reload, it send an 
            //json webtoken error
            var decoded = await promisify(jwt.verify)(token , process.env.JWT_SECRET)
            
        }catch( err){
            
            return next()
        }
        
        
        const freshUser = await User.findById(decoded.id)
        if(!freshUser){
            return next()
        }
        
        
        if(freshUser.changedPasswordAfter(decoded.iat)){
            return next()
        }


        //there is a logged in user
        //each pug file has access to the res.locals like we pass in render
        req.user = freshUser
        res.locals.user = freshUser
        
    }

    next()
}


exports.restrictsTo = (...roles)=>{
    //this function is a wrapper function helps to add varible
    //args to the middleware function
    // below middleware function has access to the roles array
    //because of  JS closures
    return (req,res,next)=>{
        //roles is an array from arbitary args ['user' , 'admin']
        
        if(!roles.includes(req.user.role)){
            return next( new AppError('You dont have permission' , 403))
        }
        next()

    }
}

exports.forgetPassword = async (req , res ,next)=>{
    try{
        var user = await User.findOne({email: req.body.email})
    }catch( err){
        console.log( err)
    }
    
    if(!user){
        return next( new AppError('there is no email like that' , 404))
    }
    //each time user request for the pwd forget,
    // we will provide them a resetToken which is in turn is a
    // token to reset pwd,
    // we thrrefore encrypt it and save it on the user documents
    //such that we can match the one that is coming from user and
    // the encrypt one that is store on the documents
    const resetToken = user.createPasswordResetToken() // --> we did it on  the fat model bcuz this is someting related to the documents
    //above function call only modify the doc on the buffer,
    //but to save it on DB we have to call save() method
    await user.save({ validateBeforeSave: false }) // this option deable
    // all the validator on the schema
    const resetURL = req.protocol + '://'+req.get('host')+'/api/v1/user/resetPassword/'+resetToken
    console.log(resetURL)
    // console.log(resetURL)
    // const message = 'forgot your pwd ,click on the link, with your new pwd  - <a href="'+resetURL+'"> CLICK HERE </a>'
    // console.log(message)
    try{
        // await sendEmail({
        //     email: user.email,
        //     subject:'your pwd reset token valid for 10min',
        //     message
        // })

        // await new Email(user , resetURL).sendPasswordReset()

        res.status(200).json({
            status:'success',
            msg:'token send to the email'+" "+req.body.email
        })
    }catch( err){
        user.passwordResetToken = undefined
        user.passwordResetExipres = undefined
        await user.save({ validateBeforeSave: false })
        return next(err)
    }
}
exports.resetPassword = async (req , res , next) =>{

    try{
        //get the user based on the token
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExipres:{
                $gte:Date.now()
            }
        })

        
        
        //if token is not expired and user exist set the pwd
        if(!user){
            return next( new AppError('token is invalid or expired',400))
        }
        
        user.password = req.body.password
        user.passwordConfirm = req.body.passwordConfirm
        //update the changedPasswordAt 
        // user.passwordChangedAt = Date.now() --> now at fat model
        user.passwordResetToken = undefined
        user.passwordResetExipres = undefined
        await user.save() //no validaiton off
        //actually the DB commit is bit slow than the jwt ist
        //therefore pwdCHangedAt would be later than jwt ist
        //and user never able to log in
        //therefore we subtract 1s from the pwdCHangedAt 

        //log the user send the JWT
        sendToken(user , 200 , res)
        
            

    }catch( err){
        return next(err);
    }
    
}

exports.updatePassword = async (req , res , next)=>{
    try{
        //console.log(req.body.password , req.body.passwordConfirm,req.body.passwordCurrent)
        //user req to pass pwd even if you are already logged in
        // get user from collection
        const user = await User.findById(req.user._id).select('+password')
        // console.log(user)
        //check for thr pwd correct
        // console.log(req.body.currentPassword)
        if(! (await user.correctPassword(req.body.currentPassword , user.password) )){
            return next( new AppError('Current password id wrong', 401))
        }
        //update the pwd
        user.password = req.body.password
        user.passwordConfirm = req.body.passwordConfirm
        await user.save()

        //send the token
        sendToken(user , 200 , res)

    }catch( err){
        next(err)
    }
    
}