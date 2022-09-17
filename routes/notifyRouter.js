const router = require('express').Router();
const auth = require('../middleware/auth')
const notifyCtrl = require('../controllers/notifyCtrl');
// personally remove wale par id lagayenge na ki ham deleteallMany par
router.post('/notify', auth, notifyCtrl.createNotify) 
router.delete('/notify/:id', auth, notifyCtrl.removeNotify)
router.get('/notifies', auth, notifyCtrl.getNotify)

router.patch('/isReadNotify/:id', auth, notifyCtrl.isReadNotify);

router.delete('/deleteAllNotify', auth, notifyCtrl.deleteAllNotifies);


module.exports = router;