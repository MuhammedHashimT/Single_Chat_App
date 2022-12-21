const express = require('express')
const path = require('path')
const http = require('http')
const formatMessages = require('./controllers/messages')
const socket = require('socket.io')
const { userJoin, getCurrentUser, userLeave,
  getRoomUsers } = require('./controllers/users')

const app = express()
const PORT = 5678
const server = http.createServer(app)

app.use(function (req, res, next) {
  res.setHeader(
    'Content-Security-Policy-Report-Only',
    "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'"
  );
  next();
});

// static files
app.use(express.static(path.join(__dirname, "public")))

// Socket 
const io = socket(server)

// new clint connection 
io.on('connection', socket => {
  console.log('new WS connected')
 
  socket.on('joinRoom', ({ username, room }) => {

    const user = userJoin(socket.id, username, room)
    console.log(user)

    const botname = "chatbook"

    socket.join(user.room)  
    // welcoming corrent user
    socket.emit("message", formatMessages(botname, `Welcome ${username} to ChatBook`))

     // Send users and room info
    socket.emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room)
    }) 
    
    // massage for each user join to chat
    socket.broadcast.to(user.room).emit('message', formatMessages(botname, `${username} has joined to chat`))

  })

  // reserve the massage from clint
  socket.on("chatMassage", (msg) => {
    const user = getCurrentUser(socket.id)
    console.log(socket.id)
    console.log(msg)
    console.log(user)
    io.to(user.room).emit("message", formatMessages(user.username, msg))
  })

  // massage for each user left from chat
  socket.on("disconnect", () => {
    const user = userLeave(socket.id)
    if (user) {
      io.to(user.room).emit("message", formatMessages("user", `${user.username} has left the room`))
      socket.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room)
      })

    }
  })
})




server.listen(PORT, () => console.log(`server is running on ${PORT}`))


// https://www.cmu.edu/gelfand/lgc-educational-media/digital-education-modules/new-the-world-of-the-internet-handouts.pdf