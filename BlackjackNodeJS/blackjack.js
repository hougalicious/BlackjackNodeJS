var deck = [];	// the deck that will hold the 52 cards

function clearOutput() {
	console.log('\u001B[2J\u001B[0;0f');	// clear text from this session
	console.log("**********************************************************************");
}

// populate the deck with values 1-52
// spades, clubs, hearts, and diamonds being 1-13, 14-26, 27-39, and
// 40-52, respectively
function resetDeck() {
	deck = [];
	for (var i=0; i<52; i++) {
		deck[i] = i+1;
	}
}

// pick a card from the deck at random
function dealCard() {
	var index = Math.round(Math.random()*(deck.length-1));
	var value = deck[index];
	deck.splice(index, 1);	// remove the card from the deck
	return value;
}

// get the group of the card number passed in ("Spades", "Clubs", etc.)
function group(number) {
	switch(Math.floor((number-1)/13)) {
		case 0:
			return "Spades"; break;
		case 1:
			return "Clubs"; break;
		case 2:
			return "Hearts"; break;
		case 3:
			return "Diamonds"; break;
		default:
			return "Derp";
	}
}

// get the title of the card number passed in ("Ace", "2", etc.)
function title(number) {
	switch((number) % 13) {
		case 1:
			return "Ace"; break;
		case 11:
			return "Jack"; break;
		case 12:
			return "Queen"; break;
		case 0:
			return "King"; break;
		default: // cases 2-10 (twos, threes, ..., tens)
			return number % 13;
	}
}

// get the actual value of the card number passed in 
function actualValue(number) {
	switch((number) % 13) {
		case 1:
			return 1; break;	// Aces (11 is a special case handled in score())
		case 11:
		case 12:
		case 0:
			return 10; break;
		default: // cases 2-10 (twos, threes, ..., tens)
			return number % 13;
	}
}

// takes the numerical value from the deck and translates it to actual card
// terminology. Example: 1 would be "Ace of Spades", 26 would be "King of
// Clubs", etc.
function cardName(number) {
	return (title(number) + " of " + group(number));
}

// Calculate the total score of the hand passed in
function score(hand) {
	var aces = 0;
	var score = 0;
	for(var i=0; i<hand.length; i++) {
		if (title(hand[i]) === "Ace")
			aces++;
		score += actualValue(hand[i]);
	}
	// for cases of 11 or less, you can treat any aces as 11's instead
	// (by adding 10, since 1 of their points was already counted)
	if (score < 12 && aces > 0) {
		score += 10;
	}
	
	return score;	
}

// Return a string that lists each card in your hand
function displayHand(hand) {
	var handStr = cardName(hand[0]);
	for (var i=1; i<hand.length; i++) {
		handStr += ", " + cardName(hand[i]);
	}
	return handStr;
}

// the main function that's run in the browser
function game() {
	var yourCards, dealerCards;
	var winCount = 0;
	var lossCount = 0;
	var tieCount = 0;
	var win = "";
	
	function hit() {
		yourCards.push(dealCard());
		if (score(yourCards) > 21) {
			win = "dealer";
		}
			
		// dealer has the option to hit
		if (score(dealerCards) < 15) {
			dealerCards.push(dealCard());
			if (score(dealerCards) > 21) {
				win = "user";
			}
		}
	}

	// if the user hasn't busted and has decided to stand, the dealer will hit until his score is >= 15
	function dealerFinish() {
		if (win !== "dealer") {
			while (score(dealerCards) < 15) {
				dealerCards.push(dealCard());
				if (score(dealerCards) > 21) {
					win = "user";
					break;
				}
			}
		}
	}

	// display your current record for this session
	function myRecord() {
		return "Wins: " + winCount + "    Losses: " + lossCount + "    Ties: " + tieCount + "\n\n";
	}

	function processResults() {
		clearOutput();
		if (win == "dealer") {
			lossCount++;
			console.log(myRecord() + "You lose!\n\nYou busted with a score of " + score(yourCards) + "!");
		}
		else if (win == "user") {
			winCount++;
			console.log(myRecord() + "You win!\n\nThe dealer busted with a score of " + score(dealerCards) + "!");
		}
		else if (score(yourCards) === score(dealerCards)) {
			tieCount++;
			console.log(myRecord() + "It's a tie! You both had a score of " + score(yourCards));
		}
		else if (score(yourCards) > score(dealerCards)) {
			winCount++;console.log
			console.log(myRecord() + "You win with a score of " + score(yourCards) + "!\n(The dealer had " + score(dealerCards) + ")");
		}
		else {
			lossCount++;
			console.log(myRecord() + "You lost with a score of " + score(yourCards) + "!\n(The dealer had " + score(dealerCards) + ")");
		}
	}


	var readline = require('readline');
	var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout //, terminal: true
	});

	state = 'gamePrompt';
	clearOutput();
	console.log(myRecord() + "Start a new game?");
	rl.setPrompt(">");
	rl.prompt();
	rl.on('line', function(feedback) {
		switch (state) {
			case 'gamePrompt':
				if (feedback.match(/^(yes|YES|Yes|y|Y)$/)) {
					yourCards = [];
					dealerCards = [];
					resetDeck();
					win = "nobody";
					
					// deal initial hands
					yourCards.push(dealCard()); 
					dealerCards.push(dealCard());
					yourCards.push(dealCard());	
					dealerCards.push(dealCard());

					state = 'hitPrompt';
					clearOutput();
					console.log(myRecord() + "Your hand: \n" + displayHand(yourCards) + "\n\nYour score: " + score(yourCards) + "\n\nWould you like to hit?");
					rl.prompt();
				}
				else if (feedback.match(/^(no|NO|No|n|N)$/)) {
					console.log("**********************************************************************");
					process.exit(0);
				}
				break;
			case 'hitPrompt':
				if (feedback.match(/^(yes|YES|Yes|y|Y)$/)) {
					hit();
					// if somebody busted...
					if (win !== "nobody") {
						processResults();

						state = 'endOfGame'
						console.log("Hit enter to continue...");
						rl.prompt();
					}
					// don't allow the user to hit if they're at 21
					else if (score(yourCards) === 21) {
						dealerFinish();
						processResults();

						state = 'endOfGame';
						console.log("Hit enter to continue...");
						rl.prompt();
					}
					else {
						clearOutput();
						console.log(myRecord() + "Your hand: \n" + displayHand(yourCards) + "\n\nYour score: " + score(yourCards) + "\n\nWould you like to hit?");
						rl.prompt();
					}
				}
				else if (feedback.match(/^(no|NO|No|n|N)$/)) {
					dealerFinish();
					processResults();

					state = 'endOfGame';
					console.log("Hit enter to continue...");
					rl.prompt();
				}
				break;
			case 'endOfGame':
				clearOutput();
				state = 'gamePrompt';
				console.log(myRecord() + "Start a new game?");
				rl.prompt();
				break;
			default:
				console.log("BROKEN STATE MACHINE");
				process.exit(0);
		}
	}).on('close', function() {
		process.exit(0);
	});
}

game();