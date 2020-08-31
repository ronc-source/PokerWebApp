/*
Rough Summary of Library Functions (Express and Socket.io library):

File communication (handled by Express)
  -Client asks server for a file (Ex: customImage.png)

Package communication (handeled by Socket.io)
  -Client sends data to server (Ex: Input)
  -Server sends data to client (Ex: Object position)

URL Format:
      mywebsite.come      :2000          /client/customImage.png
URL = DOMAIN              PORT           PATH
      laptop              usbport        query
*/

/*
-Code to do file communication with express (Sufficient enough for 1 web page)
-Creates the server and listens to the port 2000
-Domain will fall under localhost
NOTE: -This code will display the MainPage.html contents only when the server is started
       under the cmd command 'C:\Users....\PokerWebApp> node app.js' under localhost:2000
      -Start the server then type 'localhost:2000' in the web browser url
*/
var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/MainPage.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(2000);
console.log("Server started");

/*
-Code to do package communication with socket.io library
-Whenever there is a connection the anonymous function 'function(socket)' will be called to display 'socket connection' in CMD
*/


//List of unique clients connected to the server
var SOCKET_LIST = {};

//List of clients at seats
const numSeats = 2; //number of seats as constant - can modify numSeats easily
var playerSeats = [];
for (i = 0; i < numSeats; i++){
  playerSeats.push(0); // 0 represents empty seat - no client socket id can have value 0
  //console.log(playerSeats[i]);
}

function updateLobbyState(){ //updates lobby info for users
  for(var i in SOCKET_LIST){
    var user = SOCKET_LIST[i];
    //data.reason = button id that was clicked on
    user.emit('LobbyState', playerSeats);
    }
}




/*#######
Main
#######*/

//server startup
var io = require('socket.io')(serv,{});
// user connection event
io.sockets.on('connection', function(socket){
  socket.id = Math.floor(1 + (1000 * Math.random()));
  socket.atSeat = false;

  //Format: SOCKET_LIST = {socket.id:socket, socket.id:socket, ...}
  SOCKET_LIST[socket.id] = socket;
  updateLobbyState();

  //managing list when a player disconnects
  socket.on('disconnect', function(){
    console.log('disconnected:', socket.id)
    for (p in playerSeats){

      if ( playerSeats[p] == socket.id){
        playerSeats[p] = 0;
      }
    }
    delete SOCKET_LIST[socket.id];
    updateLobbyState();
  });

  console.log('socket connection');

  for (var i in SOCKET_LIST)// display current connected users
      console.log("Socket list:" + i)

  //Receive message from the client under condition 'joining' and display unique client id wanting to play poker
  socket.on('joining', function(data){
    console.log("User " + socket.id + " wants to play poker.");
    if (socket.atSeat == false){ //prevent locking into seat if already in other seat
      if (data.reason == "seat1"){
        playerSeats[0] = socket.id;
        socket.atSeat = true;
      }
      else{
        playerSeats[1] = socket.id;
        socket.atSeat = true;
      }
    }
    console.dir("Player seats: " + playerSeats);

  //emit a message back to all clients to update button for user wanting to join
  updateLobbyState();
  });

  //Game chat server response to update all clients with new chat messages
  socket.on('sendMsgToServer', function(data){
    for(var i in SOCKET_LIST){
      SOCKET_LIST[i].emit('addToChat', socket.id + ': ' + data);
    }
  });

});
/*
Trying to test Deck class

var testDeck = require('./Deck.js');
var deck1 = testDeck.constructor();
console.dir(deck1.deck.length);*/
