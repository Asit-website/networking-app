const Users = require("../models/userModal");
// select is used to select documents field that are to be returned in the query
// select use krne par ap us chig ko easly achieve kar sakte hai // req.query.username
const userCtrl = {
    searchUser: async (req,res) => {
       try {
         const users = await Users.find({username: {$regex: req.query.username}})
         .limit(10).select("fullname username avatar")
         res.json({users})
       } 
       
       catch (error) {
           return res.status(500).json({msg:error.message})
       }  
    },

    getUser: async (req,res) =>{
      try {
        // params pehle se hi mojud hota hai hamara
        const user = await Users.findById(req.params.id).select('-password')
        .populate("followers following", "-password")
        if(!user) return res.status(400).json({msg:"User does not exist"})
        res.json({user})
      } 
      
      catch (error) {
          return res.status(500).json({msg:error.message})
      }  
    },

    updateUser:async (req,res) =>{
       try {
         const { avatar, fullname, mobile, address, story, website, gender } = req.body

         if(!fullname) return res.status(400).json({msg:"Please Add Your FullName"})

         await Users.findOneAndUpdate({_id:req.user._id},{
          avatar, fullname, mobile, address, story, website, gender
         })

         res.json({msg:"Upadte Success"})
       } 
       
       catch (error) {
        return res.status(500).json({msg:error.message})
       }
    },

    follow: async (req,res) => {
       try {
         // jo mere ko follow krega vo user rahega 
         const user = await Users.find({_id:req.params.id, followers: req.user._id})
         if(user.length > 0) return res.status(400).json({msg:"You followed this users"})

     const newUser = await Users.findOneAndUpdate({_id: req.params.id},{
           $push: {followers: req.user._id}
         },{new:true}).populate("followers following", "-password")
// new ko true karna bahut jarurat hai 
         await Users.findOneAndUpdate({_id: req.user._id},{
          $push: {following: req.params.id} // other user are req.params.id ... and auth user are req.user._id
        },{new:true})

         res.json({newUser})
            
       } 
       
       catch (error) {
          return res.status(500).json({msg:error.message})
       }
    },

    unfollow: async (req,res) => {
      try {
      
    const newUser = await Users.findOneAndUpdate({_id: req.params.id},{
          $pull: {followers: req.user._id}
        },{new:true}).populate("followers following", "-password")

        await Users.findOneAndUpdate({_id: req.user._id},{
         $pull: {following: req.params.id} // other user are req.params.id ... and auth user are req.user._id
       },{new:true})

        res.json({newUser})

      } 
      
      catch (error) {
         return res.status(500).json({msg:error.message})
      }
   },
   // suggestion user website ke right side mai hai 
   suggestionsUser:async (req,res) =>{
    try {
      const newArr = [...req.user.following, req.user._id]

      const num  = req.query.num || 10

      const users = await Users.aggregate([
          { $match: { _id: { $nin: newArr } } },
          { $sample: { size: Number(num) } },
          { $lookup: { from: 'users', localField: 'followers', foreignField: '_id', as: 'followers' } },
          { $lookup: { from: 'users', localField: 'following', foreignField: '_id', as: 'following' } },
      ]).project("-password")

      return res.json({
          users,
          result: users.length
      })

  } catch (err) {
      return res.status(500).json({msg: err.message})
  }

   }
}

module.exports = userCtrl;