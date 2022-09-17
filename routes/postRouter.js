const router = require('express').Router();
const postCtrl = require('../controllers/postCtrl');

const auth = require('../middleware/auth');

router.route('/posts')
      .post(auth, postCtrl.createPost)
      .get(auth, postCtrl.getPost)

router.route('/posts/:id')
      .patch(auth,postCtrl.updatePost)
      .get(auth,postCtrl.getPosts)
      .delete(auth,postCtrl.deletePost)

router.patch('/posts/:id/like', auth, postCtrl.likePost)
router.patch('/posts/:id/unlike', auth, postCtrl.unLikePost)

router.get('/user_posts/:id', auth, postCtrl.getUserPosts);

router.get('/post_discover', auth, postCtrl.getPostDiscover);

router.patch('/savePost/:id', auth, postCtrl.savePost);
router.patch('/unSavePost/:id', auth, postCtrl.unSavePost);

router.get('/getSavePosts', auth, postCtrl.getSavePosts);


module.exports = router;