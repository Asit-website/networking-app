const Notifies = require('../models/notifyModal');
// find ya delete ham recipients ko krenge jo ki req.user._id mai mojud hoga 
//populate-- lets you refrence documents in other collections
// ek remove aur ek deleteAllNotifies 
const notifyCtrl = {
   createNotify: async (req, res) =>{
     try {
        // user aur isRead ko ni le rahe hote hai apan
        const {id, recipients, url, text, content, image} = req.body
// agar recipients includes krta hai req.user._id to sirf return kara do ap 
        if(recipients.includes(req.user._id.toString())) return;

        const notify = new Notifies({
            id, recipients, url, text, content, image, user:req.user._id
        })

        await notify.save();

        return res.json({notify})

     } 
     
     catch (error) {
        return res.status(500).json({msg: error.message})
     }
   },
// id ko req.params.id aur url ko req.query.url 
   removeNotify: async (req, res) => {
      try {
          const notify = await Notifies.findOneAndDelete({
              id: req.params.id, url: req.query.url
          })
          
          return res.json({notify})
      } catch (err) {
          return res.status(500).json({msg: err.message})
      }
  },
// isme basically reciients ko find kro yr 
  getNotify: async (req, res) =>{
     try {
      // populate refrence model leta hai aur uske attribute vi 
         const notifies = await Notifies.find({recipients: req.user._id})
        .sort('isRead').populate('user', 'avatar username')

          return res.json({notifies})
     }
     
     catch (error) {
        return res.status(500).json({msg:error.message})
     }

  },
// isReadNotifies mai ap isRead ko true kr do bs aur _id:req.params.id
  isReadNotify: async (req, res) =>{
     try {
         const notifies = await Notifies.findOneAndUpdate({_id:req.params.id},{
             isRead:true
         })

         return res.json({notifies})
     } 
     
     catch (error) {
         return res.status(500).json({msg:error.message})
     } 
  },
// delete vi recipients ko krna hai aur get vi jo ki req.user._id hota hai 
  deleteAllNotifies: async (req, res) =>{
      try {
          const notifies = await Notifies.deleteMany({recipients: req.user._id})

          return res.json({notifies})
      } 
      
      catch (error) {
        return res.status(500).json({msg:error.message})
      }
  }
}

module.exports = notifyCtrl;