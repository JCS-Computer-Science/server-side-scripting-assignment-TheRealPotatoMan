const express = require("express");
const uuid = require("uuid");
const server = express();
server.use(express.json());
server.use(express.static("public"));

//All your code goes here
let activeSessions = {};

server.get("/newgame", (req, res) => {
  let newID = uuid.v4();
  let newGame = {
    wordToGuess: "apple",
    guesses: [],
    wrongLetters: [],
    closeLetters: [],
    rightLetters: [],
    remainingGuesses: 6,
    gameOver: false,
  };

  activeSessions[newID] = newGame;
  res.status(201);
  res.send({ sessionID: newID });
});

server.get("/gamestate", (req, res) => {
  //console.log(activeSessions[req.query.sessionID]);
  res.status(200);
  let gameState = activeSessions[req.query.sessionID];
  res.send({ gameState });
});

server.post("/guess", (req, res) => {
  res.status(201);
  let guess = req.body.guess.toLowerCase();
  let sessionID = req.body.sessionID;
  let gameState = activeSessions[sessionID];
  console.log(guess);
  console.log(sessionID);

  gameState.guesses.push(guess);
  console.log(gameState.guesses);
  gameState.remainingGuesses--;
  for (let i = 0; i < 5; i++) {
    console.log("check letter");
    if (
      gameState.wordToGuess.charAt(i) ==
      gameState.guesses[gameState.guesses.length - 1].charAt(i)
    ) {
      if (checkForExistence(gameState, i, "right")) {
        console.log("existence null");
        gameState.rightLetters.push(
          gameState.guesses[gameState.guesses.length - 1].charAt(i)
        );
        console.log("right");
      }
    } else if (
      checkForInclusion(
        gameState.guesses[gameState.guesses.length - 1].charAt(i),
        gameState.wordToGuess
      )
    ) {
      if (checkForExistence(gameState, i, "close")) {
        console.log("existence null");
        gameState.closeLetters.push(
          gameState.guesses[gameState.guesses.length - 1].charAt(i)
        );
        console.log("close");
      }
    } else {
      if (checkForExistence(gameState, i, "wrong")) {
        console.log("existence null");
        gameState.wrongLetters.push(
          gameState.guesses[gameState.guesses.length - 1].charAt(i)
        );
        console.log("wrong");
      }
    }
  }
  console.log(gameState);

  res.send({ gameState });
});

function checkForExistence(gameState, position, desiredChange) {
  let letter = gameState.guesses[0].charAt(position);
  if (desiredChange == "close") {
    if (gameState.closeLetters.includes(letter)) {
      return false;
    } else {
      return true;
    }
  } else if (desiredChange == "right") {
    if (gameState.closeLetters.includes(letter)) {
      gameState.closeLetters.splice(gameState.closeLetters.indexOf(letter), 1);
    }
    if (gameState.rightLetters.includes(letter)) {
      return false;
    } else {
      return true;
    }
  } else if (desiredChange == "wrong") {
    if (gameState.wrongLetters.includes(letter)) {
      return false;
    } else {
      return true;
    }
  }
}
function checkForInclusion(letter, wordToGuess) {
  for (i = 0; i < 5; i++) {
    if (letter == wordToGuess.charAt(i)) {
      return true;
    }
  }
}

//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;
