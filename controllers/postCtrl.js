const Posts = require("../models/postModal");
const Comments = require("../models/commentModal");
const Users = require("../models/userModal")

class APIfeatures {
    constructor(query,queryString){
      this.query = query
      this.queryString = queryString
    }

    paginating(){
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 9
        const skip = (page-1) * limit
        this.query = this.query.skip(skip).limit(limit)
        return this;
    }
}

const postCtrl = {
  
    createPost:async(req,res) =>{
        try {
          const {content, images} = req.body

          if(images.length === 0)
            return res.status(500).json({msg: "Please Add Your pic"})

          const newPost = await new Posts({
              content, images, user: req.user._id
          })

          await newPost.save();

          res.json({
              msg:'Create Post!',
              newPost:{
                  ...newPost._doc,
                     user:req.user
              }
          })
        } 
        
        catch (error) {
            return res.status(500).json({msg:error.message})
        }
    },

   getPost:async(req,res) => {
       try {
           const features = new APIfeatures(Posts.find({
               user: [...req.user.following, req.user._id]
            }), req.query).paginating()

           const posts = await features.query.sort('-createdAt').populate("user likes", "avatar username fullname followers")
           .populate({
               path: "comments",
               populate:{
                   path:"user likes",
                   select:"-password",  
               } 
           })
            
           res.json({
               msg:'Success!',
               result: posts.length,
               posts
           })
       }
       
       catch (error) {
        return res.status(500).json({msg:error.message})   
       }
   },

   updatePost:async(req,res) =>{
       try {
           const {content, images} = req.body

           const post = await Posts.findOneAndUpdate({_id:req.params.id}, {
               content, images
           }).populate("user likes", "avatar username fullname")
           .populate({
            path: "comments",
            populate:{
                path:"user likes",
                select:"-password"
            } 
        })

           res.json({
               msg:"Update Post!",
               newPost:{
                  ...post._doc,  // sare ke sare post a jayenge
                   content,images
               }
           })
       } 
       
       catch (error) {
        return res.status(500).json({msg:error.message})   
       }
   },

   likePost:async(req,res) =>{
       try {
           const post = await Posts.find({_id:req.params.id, likes:req.user._id})
         
           if(post.length>0) {
              return res.status(400).json({msg:"You liked this post."})
           }

       const like = await Posts.findOneAndUpdate({_id:req.params.id},{
             $push:{likes: req.user._id}
         }, {new:true})  
// push aur pull lagate waqt new ko true kro
         if(!like) return res.status(400).json({msg:"This Post Does not exist"})

         res.json({msg:'Liked Post!'})
       } 
       
       catch (error) {
        return res.status(500).json({msg:error.message})   
       }
   },

   unLikePost:async(req,res) =>{
    try {
      await Posts.findOneAndUpdate({_id:req.params.id},{
          $pull:{likes: req.user._id}
      }, {new:true})  

      res.json({msg:'UnLiked Post!'})
    } 
    
    catch (error) {
     return res.status(500).json({msg:error.message})   
    }
},
// user ka post prapt krne ka function yaha populate ni krenge
getUserPosts:async(req,res) =>{
    try {
        const features = new APIfeatures(Posts.find({user:req.params.id}), req.query)
        .paginating()
         const posts = await features.query.sort("-createdAt")  // vo user hai jo login hokar ni a rahe hai 

      res.json({
          posts,
          result:posts.length
      })
       
       
    }
    
    catch (error) {
        return res.status(500).json({msg:error.message})    
    }
},
// ab get posts
getPosts:async(req,res) =>{
    try {
        // id wale post ke liye 
        // id wale post aur simple get post mai ap 2 populate method lagao 
        const post = await Posts.findById(req.params.id).
        populate("user likes", "avatar username fullname followers")
           .populate({
               path: "comments",
               populate:{
                   path:"user likes",
                   select:"-password"
               } 
           })

           if(!post) return res.status(400).json({msg:"This Post does not exist"})

           res.json({
               post
           })
    } 
    
    catch (err) {
         return res.status(500).json({msg:err.message})
    }
},
// discover kro 
getPostDiscover: async(req,res) =>{
   try {

    const newArr = [...req.user.following, req.user._id]

    const num  = req.query.num || 9
// posts.aggregate lagao ap 
    const posts = await Posts.aggregate([
        { $match: { user: { $nin: newArr } } },
        { $sample: { size: Number(num) } },
      
    ]).project("-password")
     
  return res.json({
        msg:'Success!',
        result: posts.length, 
        posts
    })
       
   } 
   
   catch (error) {
       return res.status(500).json({msg:error.msg})
   }


},

deletePost: async(req,res) =>{
    try {
        // _id aur user ko find kro yr 
        const post = await Posts.findOneAndDelete({_id:req.params.id, user:req.user._id})
          // deletepost mai id ko aur user ko dono ko delete
          // comments ko vi posts ke stah associated krte hai 
        await Comments.deleteMany({_id:{$in:post.comments}})
// user is req.user 
        res.json({
            msg:"deleted Posts!",
            newPost:{
                ...post,
                user:req.user
            }
     })

    } 
    
    catch (error) {
         return res.status(500).json({msg:message.error})
    }
},

savePost: async (req, res) => {
    try {
        // saved req.params.id mai hoga 
        const user = await Users.find({_id: req.user._id, saved: req.params.id})
        if(user.length > 0) return res.status(400).json({msg: "You saved this post."})

        const save = await Users.findOneAndUpdate({_id: req.user._id}, {
            $push: {saved: req.params.id}
        }, {new: true})

        if(!save) return res.status(400).json({msg: 'This user does not exist.'})

        res.json({msg: 'Saved Post!'})

    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
},

unSavePost: async (req, res) => {
    try {
        const save = await Users.findOneAndUpdate({_id: req.user._id}, {
            $pull: {saved: req.params.id}
        }, {new: true})
// save ni hai to user hi exist ni krega yr 
        if(!save) return res.status(400).json({msg: 'This user does not exist.'})
        res.json({msg: 'unSaved Post!'})

    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
},
// features.query.sort("-createdAt") kro sabse best _id jo ki req.user.saved par mojud hai
// savepost ko prapt krna 
getSavePosts: async (req, res) => {
    try {
        // features ko ap new APIfeatures kro _id, req.user.saved ke andar hona chaye apka 
        const features = new APIfeatures(Posts.find({
            _id: {$in: req.user.saved}
        }), req.query).paginating()

        const savePosts = await features.query.sort("-createdAt")

        res.json({
            savePosts,
            result: savePosts.length
        })

    } 
    
    catch (err) {
        return res.status(500).json({msg: err.message})
    }
},

}

module.exports = postCtrl;