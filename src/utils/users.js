const {getOrCreateStats,incrementRoomsCount,incrementTextsCount,incrementUsersCount} = require('./schema')
const users = []
const rooms = []

const sizePassCur = (room) => {
    for(let i = 0; i < rooms.length; i++){
        const { room:userRoom,roomSize,password,current } = rooms[i];
        if(userRoom === room){
            return{roomSize,password,current}
        }
    }
}

const incrCurMembers = (room) => {
    for(let i = 0; i < rooms.length; i++){
        const { room:userRoom,roomSize,password,current} = rooms[i];
        if(userRoom === room){
            rooms[i].current = rooms[i].current + 1;
            return rooms;  
        }
    }
}
const decCurMembers = (room) => {
    for(let i = 0; i < rooms.length; i++){
        const { room:userRoom,roomSize,password,current} = rooms[i];
        if(userRoom === room){
            rooms[i].current = rooms[i].current - 1;
            return rooms;  
        }
    }
}

const delRoom = (room) => {
    let bool = true;
    for(let i = 0; i < users.length; i++){
        const { id, username, room: userRoom } = rooms[i]; 
        if (Number(userRoom) === Number(room)){
            bool = false;
            return;
        }
    }
    if(bool){
        const index = rooms.findIndex(r => r.room === room);
        if (index !== -1) {
            rooms.splice(index, 1);
        }
    }
}


const addRoom = ({room,roomSize,password,current}) => {
    room = room.trim().toLowerCase()
    const roomDetails = {room,roomSize,password,current}
    rooms.push(roomDetails)
    return rooms
}

const addUser = ({id,username,room}) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    checkRoomExists(room)
    if (!username || !room){
        return {
            error: 'Username and room are required'
        }
    }
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if (existingUser){
        return{
            error:"Username is in use"
        }
    }
    incrementUsersCount()
    const user = {id,username,room}
    users.push(user)
    return {user}
}
let bool = true;

const checkRoomExists = (room) => {
    bool = true;
    for (let i = 0; i < users.length; i++) {
        const { id, username, room: userRoom } = users[i]; 
        if (userRoom === room) {
            bool = false;
            break; 
        }
    }
    if (bool) {
        incrementRoomsCount();
    }
};



const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })
    if (index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

const checkRoomAvailable = (room) => {
    bool = false;
    for (let i = 0; i < users.length; i++) {
        const { id, username, room: userRoom } = users[i]; 
        if (userRoom === room) {
            bool = true;
            break; 
        }
    }
    return bool
};



module.exports = {
    sizePassCur,
    incrCurMembers,
    decCurMembers,
    delRoom,
    addRoom,
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    checkRoomAvailable
}