const router = require('express').Router()
const auth = require('./auth/controller')

router.use('/auth', auth)

module.exports = router