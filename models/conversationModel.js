const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    recipients: [{type:mongoose.Types.ObjectId, ref: 'user'}],
    text:String,
    media:Array,
    call: Object
}, 
{
    timestamps:true
})
// text media aur call three things to be happen

module.exports = mongoose.model('conversation', ConversationSchema)
