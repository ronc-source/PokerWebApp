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

/*#######
Core Variables
#######*/

//List of unique clients connected to the server
var SOCKET_LIST = {};

//Setup deck class for use and shuffle cards
const Deck = require('./Deck.js');
var mainDeck = new Deck();
mainDeck.shuffle();

//set up pot
var chipPot = 0 ;

//Setup player class 
const Player = require('./Player.js');

//List of clients at seats
const numSeats = 2; //number of seats as constant - can modify numSeats easily
var playerSeats = [];
for (i = 0; i < numSeats; i++){
  playerSeats.push(0); // 0 represents empty seat - no client socket id can have value 0
  //console.log(playerSeats[i]);
}

//List of players/ all info related to players
var playerList = [];

function updateLobbyState(){ //updates lobby info for users
  for(var i in SOCKET_LIST){
    var user = SOCKET_LIST[i];
    user.emit('LobbyState', playerSeats);
    }
}

function updateGameState(){ //updates game for users
  for(var i in SOCKET_LIST){
    var user = SOCKET_LIST[i];
    user.emit('GameState', playerList);
    }
}

function playerTurn(){

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


  //Listening for the server to start the game
  socket.on('startGame', function(data){
    //at start of new game, re-initialize deck and shuffle
    mainDeck = new Deck();
    mainDeck.shuffle();
    
    chipPot = 0;


    //Add 2 cards from the top of the deck to each user in the player seats
    console.log(mainDeck.deckSize());
    for(var p in playerSeats){
        var newPlayer = new Player(p);
        holeCard1 = mainDeck.drawTop();
        holeCard2 = mainDeck.drawTop();
        newPlayer.setHand([holeCard1, holeCard2]);

        SOCKET_LIST[playerSeats[p]].emit('addStartingCards', holeCard1);
        SOCKET_LIST[playerSeats[p]].emit('addStartingCards', holeCard2);

        playerList.push(newPlayer);   
    }

    /*MAIN GAME*/
    var button = 0; //button = dealer ,blinds start left of dealer

    //chip amounts for small/ big blind
    var smallBlind = 1;
    var bigBlind = 2;

    //track highest bet in round to know who still needs to call
    var highestBet = 0;

    //circular array traversal for playerList
    playerList[((button + 1) % playerList.length)].betChips(smallBlind);
    playerList[((button + 2) % playerList.length)].betChips(bigBlind);
    chipPot = smallBlind + bigBlind;
    highestBet = bigBlind;

    for(var p = button + 3; playerList[(p % playerList.length)].currentBet() < highestBet; p++){
      var currPlayer = playerList[(p % playerList.length)];
      playerList[(p % playerList.length)].setTurnToPlay(true);
      while(playerList[(p % playerList.length)].isTurnToPlay() === true){
        socket.on('call', function(data){
          var callAmount = highestBet - currPlayer.currentBet(); //calculate amount player needs to call
          currPlayer.betChips(callAmount);
          playerList[(p % playerList.length)].setTurnToPlay(false);//the players turn has ended
        });
        socket.on('raise', function(data){
          
          playerList[(p % playerList.length)].setTurnToPlay(false);//the players turn has ended
        });
        socket.on('fold', function(data){
          
          playerList[(p % playerList.length)].setTurnToPlay(false);//the players turn has ended
        });
      
      }
    }

  });



});
/*
Trying to test Deck class

var testDeck = require('./Deck.js');
var deck1 = testDeck.constructor();
console.dir(deck1.deck.length);*/
