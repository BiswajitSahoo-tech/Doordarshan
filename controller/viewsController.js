const AppError = require('./../util/appError')
const User= require('./../model/userModel')
const authController = require('./authController')
const userController = require('./usersController')
const Connection = require('./../model/connectionModel')

exports.getLoginForm =  ( req, res )=>{
    res.status(200).render('login',{
        title: 'Sign In'
    })
}
exports.getSignupForm = (req, res)=> {
    res.status(200).render('signup',{
        title: 'Sign Up❤️'
    })
}

exports.getAccount = ( req, res)=>{
    res.status(200).render('account',{
        title: 'Your Account'
    })
}



exports.getRoot= async ( req, res)=>{
    
    if( req.user){
        req.recentContacts = await userController.populateRecentContact(req)
        console.log('----result------',req.recentContacts)
        res.status(200).render('home',{
            title: "Home",
            contacts: req.recentContacts,
            req
        })
    }
    else{
        res.status(200).render('landing',{
            title: "Landing"
        })
    }
}

exports.getWorkspace = async ( req, res, next)=>{
    const conId = req.params.conid
    try{
        const con = await Connection.findById(conId)
        if(!con){
            res.status(404).render('404')
            return
        }
        res.status(200).render('workspace',{
            title: 'Workspace',
            con
        })
    }catch( err){
        return next( err)
    }
}

exports.getMe = ( req, res, next)=>{
    res.status('200').render('me')

}

