const express = require('express');
const socket = require('socket.io');

var app = express();
var openRoom = {}; // { {roomId: 1, members: {"rihaz", "zuckerberg", "mark"}, member_count } } -info on all the open room with socketid of each member
var chatId = new Set();

// Property of socket {id, avatar, room}

// Static files
app.use(express.static('public'));

// Creating server
var server = app.listen(8080, function(){
  console.log('server is listening to port 8080');
});

var generateRand = function R(){
  let x = Math.floor((Math.random() * 1000000));
  if(!chatId.has(x)){
    chatId.add(x);
    return x;
  }
  else return R();
}

// Socket setup
var io = socket(server);

io.on('connect', function(socket){
  console.log('connected to ', socket.id);

  // Sending openRoom info for initilization
  socket.emit('openRoom', {openRoom: openRoom});


  // On avatar creation
  socket.on('createAvatar', function(data){
    socket.avatar = data.avatar;
    console.log('avatar name: ', data.avatar);
  });


  // Create new chat
  socket.on('createchat', function(){
    let gid = generateRand();

    socket.room = gid;
    openRoom[gid] = {roomId: gid, members: [socket.id], member_count: 1};
    socket.join(gid.toString()); // members join rooms

    io.sockets.emit('openRoom', {openRoom: openRoom});
  });

  // Add member to the group
  socket.on('addMember', function(data){
    openRoom[data.roomId].members.push(socket.id);
    socket.join(data.roomId.toString());
    socket.room = data.roomId;


    if(++(openRoom[data.roomId].member_count) == 2){
      //send activation signal
      // io.in(data.roomId).emit('big-announcement', 'the chat will start soon');
      // if(data.roomId) io.in(data.roomId.toString()).emit('activateRoom');
    }

    io.sockets.emit('openRoom', {openRoom: openRoom});
  });

  // new message send
  socket.on('newMessage', function(data){
    console.log(data);
    if(socket.room) io.in(socket.room.toString()).emit('newMessage', data);
  });

  // Remove member
  socket.on('removeMember', function(){
    var idx = -1;

    if(socket.room){
      idx = openRoom[socket.room].members.indexOf(socket.id);
      socket.to(socket.room.toString()).emit('memberLeft', {name: socket.avatar});
    }
    console.log('index ', idx);

    if(idx>-1){
      openRoom[socket.room].members.splice(idx, 1);
      if(--(openRoom[socket.room].member_count) === 0){
        delete openRoom[socket.room];
      }

      // deleting user from room
      socket.leave(socket.room.toString());
      delete socket.room;
      io.sockets.emit('openRoom', {openRoom: openRoom});
    }
  });

  socket.on('disconnect', function(){
    var idx = -1;

    if(socket.room !== undefined){
      idx = openRoom[socket.room].members.indexOf(socket.id);
      socket.to(socket.room.toString()).emit('memberLeft', {name: socket.avatar});
    }

    if(idx>-1){
      openRoom[socket.room].members.splice(idx, 1);
      if(--(openRoom[socket.room].member_count) === 0){
        delete openRoom[socket.room];
      }
    }

    io.sockets.emit('openRoom', {openRoom: openRoom});
  });

});
