const socket = io( {transports: ['websocket']})
const chatForm = document.getElementById("chat-form")
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById("room-name")
const userList = document.getElementById('users')
// Get the username and room

const urlParams = new URLSearchParams(window.location.search);
const room = urlParams.get('room');
const username = urlParams.get('username');
console.log(username, room)

//  join chat
socket.emit('joinRoom', { username, room })


socket.on('message', (message) => {
  console.log(message)
  // clint side view
  outputMessage(message)
})

socket.on('roomUsers',({room,users}) => {
  console.log(`this is the room ${room}`)
  outputRoomName(room)
  outputUsers(users)
})

// massage sent
chatForm.addEventListener('submit', (e) => {
  e.preventDefault()

  // to get text massage
  const msg = e.target.elements.msg.value

  // Emit massage to Server
  socket.emit("chatMassage", msg)
  // scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight

  e.target.elements.msg.value = ""
  e.target.elements.msg.focus()
})


function outputMessage(message) {
  const div = document.createElement('div')
  div.classList.add('message')
  div.innerHTML = `<p class="meta">${message.username}  <span>${message.time}</span></p>
<p class="text">${message.message}</p>`
  document.querySelector('.chat-messages').appendChild(div)
}
  
function outputRoomName(room){
  roomName.innerHTML = room
}

function outputUsers(users){ 
    userList.innerHTML = `${users.map((user)=> `<li>${user.username}</li>`).join('')}`
}

