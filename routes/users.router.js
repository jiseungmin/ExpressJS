const express = require('express')
const usersController = require('../controllers/users.controller')
const userRouter = express.Router()

userRouter.get('/',usersController.getUsers)
userRouter.get('/:userId',usersController.getUser)
userRouter.post('/', usersController.postUser)

module.exports = userRouter
