const Notifies = require('../models/notifyModal');
const notifyCtrl = {
   createNotify: async (req, res) =>{
     try {
        const {id, recipients, url, text, content, image} = req.body
        if(recipients.includes(req.user._id.toString())) return;

        const notify = new Notifies({
            id, recipients, url, text, content, image, user:req.user._id
        })

        await notify.save();
        return res.json({notify});
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
          
          return res.json({notify});
      } 
      
      catch (err) {
          return res.status(500).json({msg: err.message})
      }
  },

// isme basically reciients ko find kro yr 
  getNotify: async (req, res) =>{
     try {
         const notifies = await Notifies.find({recipients:req.user._id})
        .sort('isRead').populate('user', 'avatar username');
          return res.json({notifies});
     }
     
     catch (error) {
        return res.status(500).json({msg:error.message})
     }

  },


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