const Conversations = require('../models/conversationModel');

const Messages = require('../models/messageModel');

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


const messageCtrl = {
   createMessage: async (req,res) =>{
       // message craete krte waqt converstauon model ko upadte 
       try {
           const {sender, recipient, text, media, call} = req.body;

           if(!recipient || (!text.trim() && media.length === 0 && !call)) return;
// $or hamesa array hota hai 
           const newConversation = await Conversations.findOneAndUpdate({
               $or:[
                   // sender == req.user._id
                   {recipients: [sender, recipient]},
                   {recipients: [recipient, sender]}
               ]
           }, {
                recipients: [sender, recipient],
                text, media, call
           },{new:true, upsert:true})

           const newMessage = new Messages({
            conversation: newConversation._id,
            sender,call,
            recipient, text, media
           })

           await newMessage.save();

           res.json({msg:"create Success"})
       } 
       
       catch (error) {
          return res.status(500).json({msg:error.message})
       }
   },

   getConversations: async (req, res) =>{
       try {

           const features = new APIfeatures(Conversations.find({
               recipients:req.user._id
           }), req.query).paginating()

            const conversations = await features.query.sort('-updatedAt')
           .populate('recipients', 'avatar username fullname')

           res.json({
               conversations,
               result: conversations.length
            })

       } 
       
       catch (error) {
           return res.status(500).json({msg:error.message})
       }
   },

   getMessages: async (req, res) => {
    try {
        const features = new APIfeatures(Messages.find({
            
            $or: [
                {sender: req.user._id, recipient: req.params.id},
                {sender: req.params.id, recipient: req.user._id},
            ]

        }), req.query).paginating()

         const messages = await features.query.sort('-createdAt')
   

        res.json({
            messages,
            result: messages.length
         })
    } 
    
       
       catch (error) {
           return res.status(500).json({msg: error.message})
       }
   },

   deleteMessages: async (req, res) =>{
       try {
           await Messages.findOneAndDelete({_id: req.params.id, sender:req.user._id}) 
           res.json({msg:'Delete Success'})
       } 
       
       catch (error) {
           return res.status(500).json({msg: error.message})
       }
   },

   deleteConversation: async (req, res) =>{
    try {
        const newConver = await Conversations.findOneAndDelete({
            $or:[
                {recipients: [req.user._id, req.params.id]},
                {recipients: [req.params.id, req.user._id]},
            ]
        }) 
        // delete many mai new converstaion._id
        await Messages.deleteMany({conversation: newConver._id})
        res.json({msg:'Delete Success'})
    } 
    
    catch (error) {
        return res.status(500).json({msg:error.message})
    }
      
   }

 
}



module.exports = messageCtrl