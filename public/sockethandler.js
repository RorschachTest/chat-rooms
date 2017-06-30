var socket = io.connect();

var openRoom, avatarname;

// Getting DOM element
var avatarBtn = document.getElementById('avatarBtn'),
    avatar = document.getElementById('avatar'),
    enter = document.getElementById('enter'),
    menu = document.getElementById('menu'),
    newchat = document.getElementById('newchat'),
    roomList = document.getElementById('roomList'),
    chat = document.getElementById('chat'),
    chatwindow = document.getElementById('chat-window'),
    output = document.getElementById('output'),
    sendbtn = document.getElementById('send'),
    message = document.getElementById('message'),
    leavebtn = document.getElementById('leave');

// Event Handler
avatarBtn.addEventListener('click', function(){
  if(avatar.value !== ""){
    avatarname = avatar.value;
    console.log('avatar is ', avatar.value);
    socket.emit('createAvatar', {avatar: avatar.value});
    enter.style.display = "none";
    menu.style.display = "block";
  }
});

newchat.addEventListener('click', function(){
  socket.emit('createchat');
  menu.style.display = "none";
  chat.style.display = "block";
  output.innerHTML = "";
  // message.disabled = true;
  // sendbtn.disabled = true;
});

sendbtn.addEventListener('click', function(){
  if(message.value !== ""){
    socket.emit('newMessage', {avatarname: avatarname, message: message.value});
    message.value = "";
  }
});

// Leave The room
leavebtn.addEventListener('click', function(){
  console.log('leave');
  socket.emit('removeMember');
  chat.style.display = "none";
  menu.style.display = "block";
});


// Handling events from server
socket.on('openRoom', function(data){
  openRoom = data.openRoom;
  // data.openRoom.forEach(function(room){
  //   room.members.forEach(function(member){
  //     console.log(member);
  //   });
  // });

  roomList.innerHTML = "";
  console.log(openRoom);

  // Updating list of open rooms
  let i=1;
  for(let room in openRoom){
    if(typeof openRoom[room] !== 'function'){
      let node = document.createElement('BUTTON');
      let textnode = document.createTextNode('Room ' + i + ' joined members: ' + openRoom[room].member_count);
      node.appendChild(textnode);

      roomList.appendChild(node);

      roomList.lastChild.addEventListener('click', function(){
        console.log(room);
        socket.emit('addMember', {roomId: openRoom[room].roomId});

        menu.style.display = "none";
        chat.style.display = "block";
        output.innerHTML = "";
        // message.disabled = true;
        // sendbtn.disabled = true;
        console.log('can\'t send message right now wait other people to join in');
      });
    }
    i++;
  }
});

// All members have joined in
// socket.on('activateRoom', function(){
//   console.log('room is now activated');
//   // message.disabled = false;
//   // sendbtn.disabled = false;
// });

// new message received
socket.on('newMessage', function(data){
  output.innerHTML += '<p><strong>'+data.avatarname+': </strong>'+data.message+'</p>';
  chatwindow.scrollTop = chatwindow.scrollHeight;
});


socket.on('memberLeft', function(data){
  output.innerHTML += '<p><em>'+data.name+' has left</em></p>';
  output.scrollTop = output.scrollHeight;
  chatwindow.scrollTop = chatwindow.scrollHeight;
});
