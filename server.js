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
  if (req.query.sessionID == undefined) {
    res.status(400);
    res.send({ error: "Bad Request" });
  }
  let gameState = activeSessions[req.query.sessionID];
  if (gameState == undefined) {
    res.status(404);
    res.send({ error: "Session Not Found" });
  }
  res.status(200);
  res.send({ gameState });
});

server.post("/guess", (req, res) => {
  let guess = req.body.guess.toLowerCase();
  let sessionID = req.body.sessionID;
  let gameState = activeSessions[sessionID];
  res.status(201);

  if (gameState.remainingGuesses <= 0) {
    res.status(400);
    gameState.gameOver = true;
    res.send({ error: "Bad Request: No Guesses Remaining" });
  } else if (gameState.remainingGuesses == 1) {
    gameState.gameOver = true;
  }

  //FIX THIS \/
  if (guess == gameState.wordToGuess) {
    res.status(201);
    gameState.gameOver = true;
    res.send({ error: "Word Guessed" });
  }

  if (sessionID == undefined) {
    res.status(400);
    res.send({ error: "Bad Request" });
  }
  console.log(activeSessions);
  if (gameState == undefined) {
    res.status(404);
    res.send({ error: "Session Not Found" });
  }
  if (guess.length != 5) {
    res.status(400);
    res.send({ error: "Bad Request: Invalid Length" });
  }
  for (let i = 0; i < 5; i++) {
    if (!/[a-zA-Z]/.test(guess.charAt(i))) {
      res.status(400);
      res.send({ error: "Bad Request: Invalid Characters" });
    }
  }

  console.log(guess);
  console.log(sessionID);

  console.log(gameState.guesses);
  gameState.remainingGuesses--;
  let guessStateContainer = [];
  for (let i = 0; i < 5; i++) {
    console.log("check letter");
    if (gameState.wordToGuess.charAt(i) == guess.charAt(i)) {
      var guessState = { value: guess.charAt(i), result: "RIGHT" };
      if (checkForExistence(gameState, i, "right", guess)) {
        console.log("existence null");
        gameState.rightLetters.push(guess.charAt(i));

        console.log("right");
      }
    } else if (checkForInclusion(guess.charAt(i), gameState.wordToGuess)) {
      var guessState = { value: guess.charAt(i), result: "CLOSE" };
      if (checkForExistence(gameState, i, "close", guess)) {
        console.log("existence null");
        gameState.closeLetters.push(guess.charAt(i));
        console.log("close");
      }
    } else {
      var guessState = { value: guess.charAt(i), result: "WRONG" };
      if (checkForExistence(gameState, i, "wrong", guess)) {
        console.log("existence null");
        gameState.wrongLetters.push(guess.charAt(i));
        console.log("wrong");
      }
    }
    guessStateContainer.push(guessState);
    console.log(guessState);
  }
  gameState.guesses.push(guessStateContainer);
  res.send({ gameState });
});

function checkForExistence(gameState, position, desiredChange, guess) {
  let letter = guess.charAt(position);
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

server.delete("/reset", (req, res) => {
  if (req.query.sessionID == undefined) {
    res.status(400);
    res.send({ error: "Bad Request" });
  }
  let gameState = activeSessions[req.query.sessionID];
  if (gameState == undefined) {
    res.status(404);
    res.send({ error: "Session Not Found" });
  }
  res.status(200);
  gameState = {
    wordToGuess: undefined,
    guesses: [],
    wrongLetters: [],
    closeLetters: [],
    rightLetters: [],
    remainingGuesses: 6,
    gameOver: false,
  };
  res.send({ gameState });
});

server.delete("/delete", (req, res) => {
  let gameState = req.query.sessionID;
  if (gameState == undefined) {
    res.status(400);
    res.send({ error: "Bad Request" });
  }
  gameState = activeSessions[req.query.sessionID];
  if (gameState == undefined) {
    res.status(404);
    res.send({ error: "Session Not Found" });
  }

  activeSessions[req.query.sessionID] = null;

  res.status(204);
  res.send({});
});
//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;
