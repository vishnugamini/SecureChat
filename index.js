const path = require('path')
const http = require('http')
const express = require("express")
const socketio = require("socket.io")
const mongoose = require('mongoose');
require('dotenv').config();
const {generateMessage,generateLocationMessage} = require('./src/utils/messages')
const {details,sizePassCur,incrCurMembers,decCurMembers,deleteRoom,delRoom,addRoom,addUser,removeUser,getUser,getUsersInRoom,checkRoomAvailable} = require('./src/utils/users')

const {getOrCreateStats,incrementRoomsCount,incrementTextsCount,incrementUsersCount} = require('./src/utils/schema')

const statsSchema = new mongoose.Schema({
    rooms: { type: Number, default: 0 },
    users: { type: Number, default: 0 },
    texts: { type: Number, default: 0 },
});
const Stats = mongoose.models.Stats || mongoose.model('Stats', statsSchema);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'/public')

app.use(express.static(publicDirectoryPath))

app.get('/stats', async (req, res) => {
    try {
      const stats = await Stats.findOne();
      res.json(stats);
    } catch (error) {
      res.status(500).send(error);
    }
});

app.get('/statistics', (req, res) => {
    res.sendFile(path.join(publicDirectoryPath, 'stats.html'));
});


io.on('connection', (socket) => {
    console.log("New WebSocket connection")
    socket.on('create',(options,callback) => {
        let {username, room, roomSize, password } = options;
        if(password === ''){
            password = undefined
        }
        if (typeof(roomSize) === 'undefined' || roomSize === '') {
            roomSize = undefined;
        } else {
            roomSize = Number(roomSize);
        }

        if (typeof(roomSize) !== 'undefined') {
            if (roomSize <= 1) {
                return callback("Room size must be more than 1");
            }
        }
        if(checkRoomAvailable(room)){
            return callback("Room already exists!")
        }
        const roooms = addRoom({room,roomSize,password,current:1})
        const {error,user} = addUser({id: socket.id,username,room})
        if (error){
           return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessage('Connection Established!'))
        socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined!`))
        if(user && user.room){
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
        details()
        callback()
    })

    socket.on('join', ({username,room,password:userPassword},callback) => {
        if(!checkRoomAvailable(room)){
            return callback("Room does not exists")
        }
        const {roomSize,password,current} = sizePassCur(room) || {}

        if(typeof(password) !== 'undefined' && password !== userPassword){
            return callback("Incorrect password!")
        }


        if(typeof(roomSize) !== "undefined" && current >= roomSize){
            return callback("Room is full")
        }

        if(typeof(roomSize) !== "undefined"){
            const roomDeet = incrCurMembers(room)
        }
        const {error,user} = addUser({id: socket.id,username,room})
        if (error){
            decCurMembers(room)
           return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessage('Connection Established!'))
        socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined!`))
        if(user && user.room){
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
        details()
        callback()
    })

    socket.on('sendMessage', (message,callback) => {
        const user = getUser(socket.id)
        if(user && user.room){
            io.to(user.room).emit('message',generateMessage(user.username,message))
        }
        incrementTextsCount()
        callback()
    })

    socket.on('sendLocation',(coords,callback) => {
        const user = getUser(socket.id)
        if (user && user.room){
            io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        }
        incrementTextsCount()
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user && user.room){
            deleteRoom(user.room)
            delRoom(user.room)
            decCurMembers(user.room)
            io.to(user.room).emit('message',generateMessage(`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
        details()
    })

})


server.listen(port, () => {
    console.log(`server is up on port ${port}`)
})