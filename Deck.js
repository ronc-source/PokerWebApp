class Deck {
    constructor() {
      this.deck = [];

      const suits = ['Hearts', 'Spades', 'Clubs', 'Diamonds'];
      const values = ['Ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'Jack', 'Queen', 'King'];

      for (var s in suits) {
        for (var v in values) {
          //this.deck.push(`${values[value]} of ${suits[suit]}`);
          var card = {value:values[v], suit:suits[s]};
          this.deck.push(card);
        }
      }
    }

    swapCards(location1, location2){//swaps cards in deck
      var temp = this.deck[location1]; //temporarily store 1st swap location value
      this.deck[location1] = this.deck[location2];
      this.deck[location2] = temp;
    }

    shuffle(){//swaps around cards in deck 100 times to shuffle
      const numCards = 52 //number of cards in a standard deck

      for (var i = 0; i < 100; i++){
        var swap1 = Math.floor((numCards * Math.random()));
        var swap2 = Math.floor((numCards * Math.random()));

        this.swapCards(swap1, swap2)

      }
    }

    drawTop(){
        var topCard = this.deck[0];
        this.swapCards(0, this.deck.length - 1);
        /*Drawn card is put at the bottom of deck
        Potentially needs improvement*/

        //Remove the last card from the deck, which is the top card returned
        this.deck.pop();

        return topCard;
    }


  }

module.exports = Deck;
  /*
const deck1 = new Deck();
console.log(deck1.deck);*/
