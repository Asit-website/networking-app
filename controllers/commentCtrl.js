const Comments = require('../models/commentModal');
const Posts = require("../models/postModal");
const commentCtrl = {
   createComment:async(req,res) =>{
       try {
           // postid for calculate the id of post

          const {postId, content, tag, reply, postUserId} = req.body

          const post = await Posts.findById(postId)

          if(!post)  return res.status(400).json({msg:"This Post Does Not Exist"})

          if(reply){
              const cm = await Comments.findById(reply)
              if(!cm) return res.status(400).json({msg:"This Comment does not exist"})
          }

          const newComment = new Comments({
              user: req.user._id, content, tag, reply, postUserId, postId
          })
// jaha upadte waha push ho sakta hai
          await Posts.findOneAndUpdate({_id:postId},{
              $push:{comments: newComment._id}
          },{new:true})

          await newComment.save();

          res.json({newComment});

       } 
       
       catch (error) {
           return res.status(500).json({msg:error.message})
       }
   },

   updateComment: async (req,res) =>{
       try {
         const {content} = req.body;

         await Comments.findOneAndUpdate({_id:req.params.id, user:req.user._id},{content})

    

         res.json({msg:"Update Success!"})
       } 
       
       catch (error) {
        return res.status(500).json({msg:error.message})
       }
   },

   likeComment:async(req,res) =>{
    try {
        const comment = await Comments.find({_id:req.params.id, likes:req.user._id})
      
        if(comment.length>0) {
           return res.status(400).json({msg:"You liked this comment."})
        }

      await Comments.findOneAndUpdate({_id:req.params.id},{
          $push:{likes: req.user._id}
      }, {new:true})  

      res.json({msg:'Liked Comment!'})
    } 
    
    catch (error) {
     return res.status(500).json({msg:error.message})   
    }
},

unLikeComment:async(req,res) =>{
 try {
   await Comments.findOneAndUpdate({_id:req.params.id},{
       $pull:{likes: req.user._id}
   }, {new:true})  

   res.json({msg:'UnLiked Comment!'})
 } 
 
 catch (error) {
  return res.status(500).json({msg:error.message})   
 }
},

deleteComment:async (req,res) =>{
    try {
       const comment = await Comments.findOneAndDelete({
           _id:req.params.id,
           $or:[
             {user:req.user._id},
             {postUserId:req.user._id}
           ]

       }) 

       await Posts.findOneAndUpdate({_id:comment.postId},{
           $pull: {Comments: req.params.id}
       })

       res.json({msg:"Deleted Comment!"})
    } 
    
    catch (error) {
        return res.status(500).json({msg:error.message})   
    }
}


}

module.exports = commentCtrl;
