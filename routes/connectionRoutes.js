const express = require('express')
const authController = require('./../controller/authController')
const connectionController = require('./../controller/connectionController')
const connectionRouter = express.Router()

connectionRouter.use(authController.protect)
connectionRouter.post('/',connectionController.addConnection)
connectionRouter.get('/:id',connectionController.getConnection)
connectionRouter.patch('/:id',connectionController.updateConnection)
connectionRouter.delete('/:id', connectionController.deleteConnection)

module.exports = connectionRouter
