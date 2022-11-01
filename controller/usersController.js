
const AppError = require('../util/appError')
const User = require('../model/userModel')
const multer = require('multer')
const sharp = require('sharp')//--> img processing library

//complete defination of how and where we store incoming img in 
//form data
//diskStorage() --> Returns a StorageEngine implementation 
//configured to store files on the local file system.
// const multerStorage = multer.diskStorage( {
//     destination: ( req, file, cb)=>{
//         cb( null , 'public/img/users');
//     },
//     filename: ( req, file , cb)=>{
//         //'user-112ffnfjjj-2322424.jpeg'
//         const ext = file.mimetype.split('/')[1]
//         cb(null , 'user-'+req.user.id+'-'+Date.now()+'.'+ext)

//     }
// })

//this below way the photo stored in main memory
//and not written into the disk
//becuz we want that file , in future middleware, for img processing
const multerStorage = multer.memoryStorage() 

const multerFilter = (req,file,cb)=>{
    if( file.mimetype.split('/')[0] === 'image'){
        cb(null , true)
    } else{
        cb( new AppError('Please upload only images', 400) , false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})
exports.uploaduserPhoto = upload.single('photo') ;


exports.resizeUserPhoto = async ( req, res, next)=>{
    if(! req.file) 
        return next()
    req.file.filename = 'user-'+req.user.id+'-'+Date.now()+'.jpeg'

    await sharp( req.file.buffer)
        .resize(500,500)
        .toFormat('jpeg')
        .jpeg({ quality: 90})
        .toFile('public/img/users/' + req.file.filename)

    next()
}


const filterObj = (obj , ...allowedFields)=>{
    var newObj = {}
    Object.keys(obj).forEach(elm => {
        if(allowedFields.includes(elm)){
            newObj[elm] = obj[elm]
        }
    })
    return newObj
}

exports.get_user = async (req, res, next)=>{
    try{
        
        const query = User.findOne( {_id : req.params.id})
        
        const doc = await query

        
        if(!doc){
                return next( new AppError('Id is not found',404))
        }
        res.status(200).json({
            status:'success',
            body: doc
        })
    }catch( err){
        next( err)
    }
}
exports.create_user= (req , res) =>{
    res.status(500).json({
        status : "error",
        message: "this route on working"
    })
}


exports.updateMe = async (req , res ,next)=>{

    //create error if user post password data
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for pwd update,' ,400 ))
    }
    const filteredBody = filterObj(req.body , 'name' , 'email','peerId','bio','active')
    if(req.file) filteredBody.photo = req.file.filename
    try{
        const updatedUser = await User.findByIdAndUpdate(req.user._id , filteredBody,{
            new: true,
            runValidators: true
        })

        res.status(200).json({
            status:'success',
            updatedUser
        })
    }catch( err){
        return next( err)
    }

    
    

    
    //update the user document
}

exports.deleteMe = async (req, res, next)=>{
    try{
        await User.findByIdAndUpdate(req.user._id,{status: false})
        res.status(200).json({
            status:'success'
            
        })
    }catch( err){
        return next( err)
    }
}

exports.getMe=(req, res, next)=>{
    req.params.id = req.user._id
    next();
}

exports.updateActive = async (req, res, next)=>{
    const id = req.user._id
    try{
        const updateUser = await User.findByIdAndUpdate(id,{active: req.body.active},{
            new: true,
            runValidators: true
        })
        res.status(200).json({
            status:'success',
            data:{
                updateUser
            }
        })
    }catch( err){
        return next(err)
    }
}


exports.addRecentContact = async (req, res, next)=>{
    try{
        console.log(':))))', req.user._id, req.body.contact)
        // const arr = []
        await User.findByIdAndUpdate(req.user._id, {
                    $addToSet:{
                        recentContact:{
                            $each:  [req.body.contact]
                        }
                    }
                })
        res.status(200).json({
            status:'success'
        })
        return
    }catch( err){
        return next( err)
    }
    
}
exports.getRecentContact = async ( req, res, next)=>{
    const recentContactsId = req.user.recentContact
    // console.log(recentContactsId)
    
    var recentContacts = []
    for(var i = 0;i<recentContactsId.length; i++){
        try{
            var __user = await User.findById(recentContactsId[i]).select('-recentContact -status -passwordChangedAt -passwordResetToken  -passwordResetExipres -password -passwordConfirm')
            recentContacts.push(__user)
        }catch( err){
            return next( err)
        }
        
    }
    // const promises = recentContactsId.map(async (id) => {
    //     try{
    //         await User.findById(id)//.select('-recentContact -status -passwordChangedAt -passwordResetToken  -passwordResetExipres -password -passwordConfirm')
    //     }catch( err){
    //         return next( err)
    //     }
    // });
    // console.log(promises)
    // try{
    //     var recentContacts = []// = await Promise.all(promises)
    //     for(var i = 0;i<promises.length; i++){
    //         recentContacts.push(await promises[i])
    //     }
    // }catch( err){
    //     return next( err)
    // }
    // console.log('----result-----',recentContacts)
    
    res.status(200).json({
        status:'success',
        data:{
            recentContacts
        }
    })
    return
    
}
exports.populateRecentContact = async (req)=>{
    // if( req.user === undefined){
    //     return next()
    // }
    const recentContactsId = req.user.recentContact
    // console.log(recentContactsId)
    
    var recentContacts = []
    for(var i = 0;i<recentContactsId.length; i++){
        try{
            var __user = await User.findById(recentContactsId[i]).select('-recentContact -status -passwordChangedAt -passwordResetToken  -passwordResetExipres -password -passwordConfirm')
            recentContacts.push(__user)
        }catch( err){
            return next( err)
        }
        
    }
    req.user.recentContacts= recentContacts
    console.log(req.user.recentContacts)
    return recentContacts
}

exports.getPhotoByPeerId = async ( req, res, next)=>{
    const peerId = req.params.peerId
    
    try{
        const user = await User.findOne({
            peerId
        })
        if( !user){
            res.status( 200).render('404')
        }
        res.status( 200).json({
            status:'success',
            data: user.photo
        })
    }catch( err){
        res.status( 500).json({
            status:'fail',
            msg: err
        })
    }
}