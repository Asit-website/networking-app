const mongoose = require('mongoose')
// this is notify model jisme ki id vi rahega // notifyschema mai ap receipents ko sirf array lo
// url,text,content aur image vi hota hai yr-- isRead type hota hai that is Boolean type
const notifySchema = new mongoose.Schema({
   id: mongoose.Types.ObjectId,
   user:{type: mongoose.Types.ObjectId, ref:'user'},
   recipients: [mongoose.Types.ObjectId],
   url:String,
   text:String,
   content:String,
   image:String,
   isRead: {type: Boolean, default: false}
}, {
    timestamps: true
})

module.exports = mongoose.model('notify', notifySchema)