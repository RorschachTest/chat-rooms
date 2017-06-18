const express = require('express');
const socket = require('socket.io');

var app = express();

var server = app.listen(8080, function(){
  console.log('server is started at port 8080');
});

// Static files
app.use(express.static('public'));

// Socket setup
var io = socket(server);

io.on('connection', function(socket){
  console.log('connection has been established ', socket.id);

  socket.on('chat', function(data){
    io.sockets.emit('chat', data);
  });

  socket.on('typing', function(data){
    socket.broadcast.emit('typing', data);
  });
});
