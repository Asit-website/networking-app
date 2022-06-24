require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const SocketServer = require("./SocketServer");
const {ExpressPeerServer} = require('peer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

//socket
// createServer ke andar ap app ko le lo 
const http = require('http').createServer(app)
const io = require('socket.io')(http)

// const users = []
io.on('connection', socket =>{
   SocketServer(socket)
})

// create peer server // peerserver port aur path lete hai because it is a object 
// ExpressPeerServer({port: 3001, path:'/'})
ExpressPeerServer(http, {path: '/'})


//routes
app.use('/api',require('./routes/authRouter'));
app.use('/api',require('./routes/userRouter'));
app.use('/api',require('./routes/postRouter'));
app.use('/api', require('./routes/commentRouter'));
app.use('/api', require('./routes/notifyRouter'));
app.use('/api', require('./routes/messageRouter'));


//database connection
const URI = process.env.MONGODB_URL
mongoose.connect(URI,{
    
}).then(()=>{
    console.log("connection successfull");
}).catch(()=>{
    console.log("connection is not successfull");
})


if(process.env.NODE_ENV==='production'){
    app.use(express.static('client/build'));
    app.get('*',(req,res)=>{
        res.sendFile(path.join(__dirname,'client','build','index.html'))
    })
}

const port = process.env.PORT || 5000;

http.listen(port,()=>{
    console.log('server is runing on port',port);
})
