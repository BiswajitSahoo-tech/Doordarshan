const { default: mongoose } = require("mongoose")
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const validator = require('validator')

const userSchemaObject = {
    name: {
        type: String,
        required: [true, 'A user must have a user name'],
        maxLength: 50,
        minLength: 3,
        trim:true
    },
    email:{
        type: String,
        required: [true , 'A user must have an user email'],
        minLength: 5,
        trim: true,
        unique: true,
        lowercase: true,
        validate : [validator.isEmail , 'please provide a valid email']
    },
    peerId: {
        type:String,
        required: [true, 'A user must have an peer id.'],
        unique : true,
        maxLength: 50,
        minLength: 2
    },
    bio: {
        type: String,
        default: "",
        maxLength: 200,
        minLength: 0,
        trim:true
    },
    photo:{
        type:String,
        default: 'default.jpg'
        
    },
    password:{
        type : String , 
        required: [true , 'A user must have an user pwd'],
        minLength: 8,
        select: false 
    },
    passwordConfirm :{
        type : String , 
        required: [true , 'A user must have an user pwd'],
        minLength: 8,
        validate:{
            //this only work on save / create
            validator: function(el){
                return el === this.password
            },
            message: "pwd are not same"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExipres: Date,
    active:{
        type: Boolean,
        
    },
    status:{
        type: Boolean,
        select: false,
        default: true
    },
    recentContact: [{
        type : mongoose.Schema.ObjectId,
        ref: 'User',
        
    }]
}

const userSchema = new mongoose.Schema(userSchemaObject)

// userSchema.pre(/^find/, function(next){
//     this.populate({
//         path:'recentContact',
//         select:' -recentContact -status -passwordChangedAt -passwordResetToken  -passwordResetExipres -password passwordConfirm'
//     })
// })

userSchema.pre('save' , async function(next){
    //check whether the doc.pwd is modified
    if(!this.isModified('password'))
        return next()
    //encrypt the pwd at 12 cost
    try{
        this.password = await bcrypt.hash(this.password, 12)
        this.passwordConfirm = undefined// to remove from doc before commiting
        next()
    }
    catch(err){
        res.status(500).json({
            status: 'fail',
            err
        })
        return;
    }
    
})

userSchema.pre('save' , function(next){
    if(!this.isModified('password') || this.isNew) return next()

    this.passwordChangedAt = Date.now() - 1000
    next()
})

//instance method available for the all the document of certain collection

userSchema.methods.correctPassword = async function(candidatePassword , userPassword){
    return await bcrypt.compare(candidatePassword , userPassword)
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000 , 10)
        // console.log(changedTimestamp, JWTTimestamp)
        return JWTTimestamp < changedTimestamp
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex')
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetExipres = Date.now() + 10*60*1000
    return resetToken
}

userSchema.pre(/^find/ , function(next){
    //only work on query
    // this.find({ active: {
    //     $ne: false
    // }})
    next()
})

const User = mongoose.model('User' , userSchema)

module.exports = User
