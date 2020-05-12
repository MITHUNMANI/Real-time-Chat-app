const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users')
const {username, room} = Qs.parse(location.search,{
  ignoreQueryPrefix: true
});
console.log(username, room);


const socket = io();

//Join chatRoom
socket.emit('joinRoom',{username, room});

socket.on('roomUsers',({ room, users})=>{
  outputRoomname = room;
  outputUsers = users;
});

//message from server 
socket.on('message', message=>{
  console.log(message);
  outputMessage(message);
  //Scroll down on every page filled
  chatMessages.scrollTop = chatMessages.scrollHeight;
})

//Message submit
chatForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  //get message text
  const msg = e.target.elements.msg.value;
  //console.log(msg);
  //emit message to server
  socket.emit('chatMessage', msg);

  //clear the input field after the message is sent
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
})

function outputMessage(message){
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username}<span> ${message.time}</span></p>
  <p class="text">
  ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);

}

// add room name to DOM
function outputRoomname(room){
 roomName.innerHTML = room;
}

// add users
function outputUsers(users){
  userList.innerHTML = `${users.map(user =`<li>${user.username}.</li>`).join('')}`;

}