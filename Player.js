class Player {
    constructor(socket) {
        var hand = [];
        var chipStack = 20;
        var amBetThisRound = 0; //to help keep track of raising and calling
        var turnToPlay = false;
       
        if (socket === undefined){ // same as overloading constructor/ multiple constructors
            var socketId = 0;
        }
        else{
            var socketId = socketId;
        } 
    }
    //====================
    myHand(){
        return this.hand;
    }
    numChips(){
        return this.chipStack;
    }
    currentBet(){
        return this.amBetThisRound;
    }
    isTurnToPlay(){
        return this.turnToPlay;
    }
    playerId(){
        return this.socketId;
    }
    
    //=====================
    setPlayerId(s){
        this.socketId = s;
    }
    setHand(listCards){
        this.hand = listCards;
    }
    setTurnToPlay(t){
        this.turnToPlay = t;
    }
    addChips(c){
        this.chipStack = this.chipStack + c;
    }

    betChips(c){
        this.chipStack = this.chipStack - c;
        this.amBetThisRound += c;
    }

    fold(){
        this.hand = [];
    }

    raise(c){
        this.chipStack = this.chipStack - c;
    }

    check(c){
        this.chipStack = this.chipStack - c;
    }
    

}

module.exports = Player;
