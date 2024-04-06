const ACTIONS = require('./Actions/Actions')
const express = require('express');
const app = express();
const http = require('http');
const { Server } = require("socket.io");


const server = http.createServer(app);
const io = new Server(server);







const userSocketMap = {}

function getAllConnectedClients(roomId) {

  // * Fetching all the clients(Socket Ids) in a specific roomId i.e in a specific room
  const Specific_RoomClients = Array.from(io.sockets.adapter.rooms.get(roomId)) || []

  const List = Specific_RoomClients.map((sockedId) => {
    return {
      socketId: sockedId,
      username: userSocketMap[sockedId]
    }
  })

  return List
}










io.on('connection', (socket) => {
  console.log('Socket Connected', socket.id);

  //  * We are listening to the event(named ACTIONS.JOIN) raised by the socket client.
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {

    // * For every new user : Storing the socked id and the corresponding user in an object
    userSocketMap[socket.id] = username

    //  * Subscribe the socket to a given channel/room.
    socket.join(roomId)

    const clients = getAllConnectedClients(roomId)

    // console.log('Clients', clients)

    clients.forEach((item) => {
      io.to(item.socketId).emit(ACTIONS.JOINED, {
        // * All currently joined clients in the specific room
        clients: clients,
        // * Username of new user joined
        username: username,
        // * sockedId of new user joined
        sockedId: socket.id
      })
    })





    socket.on(ACTIONS.HTML_CODE_CHANGE, ({ roomId, code }) => {

      // * sending event to all clients in a room except the sender
      socket.to(roomId).emit(ACTIONS.HTML_CODE_CHANGE , { code })
    })

  

    socket.on('HTML_SYNC_CODE', ({ socketId, code }) => {

      // console.log('CODE Receiving' , code)

      // * sending event to all clients in a room except the sender
      io.to(socketId).emit(ACTIONS.HTML_CODE_CHANGE , { 
        code: code
       })
    })


    socket.on(ACTIONS.CSS_CODE_CHANGE, ({ roomId, code }) => {

      // * sending event to all clients in a room except the sender
      socket.to(roomId).emit(ACTIONS.CSS_CODE_CHANGE , { code })
    })


    socket.on('CSS_SYNC_CODE', ({ socketId, code }) => {

      // console.log('CODE Receiving' , code)

      // * sending event to all clients in a room except the sender
      io.to(socketId).emit(ACTIONS.CSS_CODE_CHANGE , { 
        code: code
       })
    })


    socket.on(ACTIONS.JS_CODE_CHANGE, ({ roomId, code }) => {

      // * sending event to all clients in a room except the sender
      socket.to(roomId).emit(ACTIONS.JS_CODE_CHANGE , { code })
    })


    socket.on('JS_SYNC_CODE', ({ socketId, code }) => {

      // console.log('CODE Receiving' , code)

      // * sending event to all clients in a room except the sender
      io.to(socketId).emit(ACTIONS.JS_CODE_CHANGE , { 
        code: code
       })
    })

    

    socket.on('disconnecting', () => {

      // * Returns the rooms the socket is currently in. Returns a map
      let rooms = socket.rooms
      // * converting to array
      const roomsArr = [...rooms]

      roomsArr.forEach((roomId) => {
        // * sending event to all clients in a room except the sender
        // * Here we are sending the event to all the rooms where the user(socketID) was connected to
        socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
          socketId: socket.id,
          username: userSocketMap[socket.id]
        })
      })

      // * Deletes an object property
      delete userSocketMap[socket.id]

      // * Leaves a room.
      socket.leave()

    })


  })
});











const port = process.env.PORT || 5000

server.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});