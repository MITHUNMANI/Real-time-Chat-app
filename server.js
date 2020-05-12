const path = require ('path');
const http = require ('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave , getUserRoom} = require('./utils/users');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
//set static folder
app.use(express.static(path.join(__dirname, 'public')));
const botName = 'ChatCord Bot';

//Run when client connects
io.on('connection', socket=>{
socket.on('joinRoom', ({username, room})=>{
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    socket.emit('message',formatMessage(botName, 'Welcome to chat cord'));
    //Broadcast when a user connects
    socket.broadcast.to(user.room).emit('message',formatMessage(botName, `${user.username}joined the chat`));
    // Send user and room info 
    io.to(user.room).emit('roomUsers',{
        room: user.room,
        users: getUserRoom(user.room)
    })
});
});

// static folder
io.on('connection', socket =>{
    const user = getCurrentUser(socket.id);
    // console.log('New socket connection');
   //Listen for chat message
    socket.on('chatMessage',msg =>{
      //console.log(msg);
      io.to(user.name).emit('message',formatMessage(`${user.username}`, msg));

    })
     //Runs when the client disconnects
     socket.on('disconnect', ()=>{

        const user = userLeave(socket.id);
        if (user){
        io.to(user.name).emit('message',formatMessage(botName, `${user.username} left the chat`));
         // Send user and room info 
        io.to(user.room).emit('roomUsers',{
        room: user.room,
        users: getUserRoom(user.room)
    })
        }
    })

    
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, ()=> console.log(`Server running in ${PORT}`));