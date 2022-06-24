const router = require('express').Router();
// router on the version of its things 
const authCtrl = require('../controllers/authCtrl');

router.post('/register',authCtrl.register);

router.post('/login',authCtrl.login);

router.post('/logout',authCtrl.logout);

router.post('/refresh_token',authCtrl.generateAccessToken);

module.exports = router;