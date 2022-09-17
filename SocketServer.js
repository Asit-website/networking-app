let users = [];
// EditData mai data,id aur call rahega
const EditData = (data, id, call) =>{
    const newData = data.map(item => 
       item.id === id ? {...item, call} : item
  )
  return newData 
}
//socketServer mai ap socket.to lagao and follow the program from server to client
const SocketServer = (socket) =>{
    // connect and disconnect
   socket.on('joinUser', user =>{
    users.push({id: user._id, socketId: socket.id, followers: user.followers})
    
   })

   // disconnect ka concept vi hame parna hoga
   socket.on('disconnect', () =>{
       const data = users.find(user => user.socketId === socket.id)
       if(data){
           const clients = users.filter(user =>
               data.followers.find(item => item._id === user.id)
            )

            if(clients.length > 0){
               clients.forEach(client => {
                   socket.to(`${client.socketId}`).emit('checkUserOffline', data.id)
               })
            }

            // console.log(data);
            if(data.call) {
                const callUser = users.find(user => user.id === data.call)
                if(callUser){
                    // agar callUser hoga to EditData mai(users,callUser.id, null)
                    users = EditData(users, callUser.id, null);
                    socket.to(`${callUser.id}`).emit('callerDisconnect');
                }
            }
       }

       users = users.filter(user => user.socketId !== socket.id)
   })

   //likes

   socket.on('likePost', newPost =>{
       // ids mai apka array ke form nepost.user.followers aur nepost.user._id hoga
       const ids = [...newPost.user.followers, newPost.user._id];
       const clients = users.filter(user => ids.includes(user.id))
       if(clients.length > 0){
           clients.forEach(client => {
               socket.to(`${client.socketId}`).emit('likeToClient', newPost)
           })
       }
   })

//    unlike

socket.on('unLikePost', newPost =>{
    // ids apna include karwane ke liye hai yr 
    const ids = [...newPost.user.followers, newPost.user._id]
    const clients = users.filter(user => ids.includes(user.id))
    if(clients.length > 0){
        clients.forEach(client => {
            socket.to(`${client.socketId}`).emit('unLikeToClient', newPost)
        })
    }
})

//Comments(createComments ka concept hai ye yar)
socket.on('createComment', newPost =>{
    const ids = [...newPost.user.followers, newPost.user._id]
    const clients = users.filter(user => ids.includes(user.id))
    if(clients.length > 0){
        clients.forEach(client => {
            socket.to(`${client.socketId}`).emit('createCommentToClient', newPost)
        })
    }

})


socket.on('deleteComment', newPost =>{
    const ids = [...newPost.user.followers, newPost.user._id]
    const clients = users.filter(user => ids.includes(user.id))
    if(clients.length > 0){
        clients.forEach(client => {
            socket.to(`${client.socketId}`).emit('deleteCommentToClient', newPost)
        })
    }

})


//follow
socket.on('follow', newUser =>{
  const user = users.find(user => user.id === newUser._id)
  user && socket.to(`${user.socketId}`).emit('followToClient', newUser)
})


socket.on('unFollow', newUser =>{
    const user = users.find(user => user.id === newUser._id)
    user && socket.to(`${user.socketId}`).emit('unFollowToClient', newUser)
  })
  
// notification
socket.on('createNotify', msg =>{
     const client = users.find(user => msg.recipients.includes(user.id))
     client &&  socket.to(`${client.socketId}`).emit('createNotifyToClient', msg)
})

// changing the client position
socket.on('removeNotify', msg =>{
    const client = users.find(user => msg.recipients.includes(user.id));
    client &&  socket.to(`${client.socketId}`).emit('removeNotifyToClient', msg)
})


// Message
socket.on('addMessage', msg =>{
    const user = users.find(user => user.id === msg.recipient)
    user && socket.to(`${user.socketId}`).emit('addMessageToClient', msg)
})


//check user online/ofline
socket.on('checkUserOnline', data => {
    const following = users.filter(user =>
         data.following.find(item => item._id === user.id)
    )

    socket.emit('checkUserOnlineToMe', following)

    const clients = users.filter(user => 
        data.followers.find(item => item._id === user.id)
        )

        if(clients.length > 0){
           clients.forEach(client =>{
               socket.to(`${client.socketId}`).emit('checkUserOnlineToClient', data._id)
           })
        }
        
})

//call user 

socket.on('callUser', data =>{
    users = EditData(users, data.sender, data.recipient)

    const client = users.find(user => user.id === data.recipient)

    if(client) {
        if(client.call){
            users = EditData(users, data.sender, null);
            socket.emit('userBusy', data)
        }
        
        else{
            users = EditData(users, data.recipient, data.sender);
            socket.to(`${client.socketId}`).emit('callUserToClient', data)
          
        }
    }
})

socket.on('endCall', data =>{
    // console.log(data)
    const client = users.find(user => user.id === data.sender)
    if(client){
        socket.to(`${client.socketId}`).emit('endCallToClient', data)
        users = EditData(users, client.id, null)

        if(client.call){
            const clientCall = users.find(user => user.id === client.call)
            clientCall &&  socket.to(`${clientCall.socketId}`).emit('endCallToClient', data)

            users = EditData(users, client.call, null)
        }

    }
})


}

module.exports = SocketServer