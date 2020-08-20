const path = require("path")
const http = require("http")
const express = require("express");
const socketio = require("socket.io")
const Filter = require("bad-words")
const {generateMessage, generateLocationMessage} = require("./utils/messages")
const {addUser, removeUser, getUser, getUsersInRoom} = require("./utils/users")

//create the express app 
const app = express()

//create a new server and pass express application
const server = http.createServer(app)

//configure web socket to work with the server by creating new instance of socket.io
//adding support of web sockets to the server
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, "../public")

//serve the publicDirectory using express.static middleware
app.use(express.static(publicDirectoryPath))

//gives message when the client connect to the server (callback function runs whwn an event occurs)
//connection is run when socket.io gets new connection
// let count = 0

io.on('connection', (socket) => {
console.log("New Web socket connection")

//send the count to the client that just opened the connection 
//send an event from the server and that sends data back to client
//countUpdated sends initial count to the client and updated count once the count is updated
// socket.emit('countUpdated', count)

//recieve an increment event from the client
// socket.on("increment", () => {
    // count++;
    //sends the updated count to the client
    // socket.emit("countUpdated", count) //emit an event to particular connection

//     io.emit("countUpdated", count) //emit an event to all connections available
// })

socket.on("join", ({username, room}, callback) => {
//new user has joined so call addUser()
const {error, user} = addUser({id:socket.id, username, room})

//if the person has not successfully join

if (error) {
 return callback(error)
}

//socket.join is only used only on the server
socket.join(user.room)

//emit an event to everybody in a particular room
//io.to.emit
socket.emit("message", generateMessage( "Admin", "Welcome!"));

//broadcast means send a message to all users except the one who broadcast message 
//emit an event for everyone except for the specific client in a particular chat room
//socket.broadcast.to.emit
socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${user.username} has joined!`))

//send to everyone in that room including new user
io.to(user.room).emit("roomData",{
room:user.room,
users:getUsersInRoom(user.room)

})



//calling callback without passing arguments means no error
callback()
})

socket.on("sendMessage", (message, callback) => {
    //get the user
    const user = getUser(socket.id)

    //initialize bad-words module
    const filter = new Filter()

    if(filter.isProfane(message)) {
        return callback('Profanity is not allowed')
    }

    io.to(user.room).emit("message", generateMessage(user.username, message))
    //call callback to acknowledge the event
    callback()
})

socket.on("sendLocation", (coords, callback) =>{
 const user = getUser(socket.id)   
io.to(user.room).emit("locationMessage", generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
callback()      //event is acknowledged by the server
})

//given user is disconnected
socket.on("disconnect", () => {

 const user = removeUser(socket.id)

//if user is a part of a room
 if (user) {
 //send message to all connected clients in the room that user left
 io.to(user.room).emit("message", generateMessage("Admin", `${user.username} has left!`))
io.to(user.room).emit("roomData", {
    room: user.room,
    users: getUsersInRoom(user.room)
}) 
}
})
})
//start the server
server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})