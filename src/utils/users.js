const users = [];
//4 functions
//addUser, removeUser, getUser, getUsersInRoom

const addUser = ({id, username, room}) => {
    //Clean the data(remove the extra spaces from username and room i.e trim and validate)
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  //Validate the data
  if(!username || !room) {
      return {
          error: "Username and room are required"
      }
  }
  //check for existing user
  const existingUser = users.find((user) => {
      return user.room === room && user.username === username
  })
  //validate username
  if(existingUser) {
      return {
          error: "Username is in use!"
      }
  }
  //Store user
  const user = {id, username, room}
  users.push(user)
  return {user:user}
}

const removeUser = (id) => {
const index = users.findIndex((user) => user.id === id)

if(index !== -1) {
    //delete items from array by index
    return users.splice(index, 1)[0]
}
}

const getUser = (id) => {
    const user = users.find((user) => user.id === id)
    if(user) {
        return user
    }
    return undefined
}
const getUsersInRoom = (room) => {
    
    //filter users that are in particular room
    room = room.trim().toLowerCase()
    const usersInRoom = users.filter((user) => user.room === room)
    if(usersInRoom) {
        return usersInRoom
    }
    return []
}

module.exports = {
    addUser:addUser,
    removeUser:removeUser,
    getUser:getUser,
    getUsersInRoom:getUsersInRoom
}