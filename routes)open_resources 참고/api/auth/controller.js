const router = require('express').Router()

/*
    POST /api/auth/register
    {
        username,
        password
    }
*/
router.post('/register', (req, res) => {
  res.send('this router is working')
});

module.exports = router;