const mongoose = require('mongoose')
const connectionSchemaObject = {
    callerId: {
        type : mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true , 'A review must belong to a user']
    },
    receiverId: {
        type : mongoose.Schema.ObjectId,
        ref: 'User',
        // required: [true , 'A review must belong to a user']
    },
    callerPeerId: {
        type: 'string',
        // required: [true, 'A connection must have a caller peer id']
    },
    receiverPeerId: {
        type: 'string',
        // required: [true, 'A connection must have a receiver peer id']
    },
    estAt : {
        type: Date,
        default: Date()
    }
    
    
}

const connectionSchema = new mongoose.Schema(connectionSchemaObject)

const Connection = mongoose.model('Connection', connectionSchema)

module.exports = Connection