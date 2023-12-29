// Game Version 1.3

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Create a single part of snake body
class SnakePart {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// Initialize game variables
// set up grid size and number
// 20 X 20 = 400
var numGrid = 20;
var gridSize = canvas.width / numGrid;

// initialize character start position
var headX = 10;
var headY = 15;
// initialize food start position
var foodX = 15;
var foodY = 5;

// set up character's initial tail length and speed
const snakeParts = [];
var tailLength = 1;
var speed = 5;

// initialize keyboard input direction variables
var inputsXVelocity = 0;
var inputsYVelocity = 0;
// initialize character's move direction variables
var xVelocity = 0;
var yVelocity = 0;

const themeSong = new Audio("theme.mp3");
const gulpSound = new Audio("gulp.mp3");
const wowSound = new Audio("wow.mp3");
const failSound = new Audio("fail.mp3");

const lightSquareColor = "white";
const darkSquareColor = "#C4E2FF";

window.addEventListener("load", outputScores);

// output score module
// GET request to API endpint for list of scores & names
function outputScores() {
  var scoreList = document.getElementById("scoreList");

  fetch("https://www.wlkevin.com/api/scores/list")
    .then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Error fetching scores: " + response.status);
      }
    })
    .then(function (data) {
      // Extract relevant columns ('name', 'level', 'points') from the database
      var extractedData = data.map(function (score) {
        return {
          name: score.name,
          level: score.level,
          points: score.points,
        };
      });

      // Clear the existing score list
      scoreList.innerHTML = "";

      // Iterate over the extracted data and create score list
      extractedData.forEach(function (score) {
        var newRecord = document.createElement("li");
        newRecord.textContent =
          score.name + " - " + score.level + " - " + score.points;
        scoreList.appendChild(newRecord);
      });
    })
    .catch(function (error) {
      console.error(error);
    });
}

// level selection module

var levelOutput = document.getElementById("levelOutput");
var speedOutput = document.getElementById("speedOutput");

const levels = [
  { name: "easy", x: 50, y: 50 },
  { name: "medium", x: 150, y: 50 },
  { name: "hard", x: 250, y: 50 },
];

let difficultyLevel = null;

//listen to mouse position for level selection
canvas.addEventListener("click", handleCanvasClick);
canvas.addEventListener("mousemove", handleMouseMove);

function handleCanvasClick(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    if (
      x >= level.x &&
      x <= level.x + 100 &&
      y >= level.y &&
      y <= level.y + 50
    ) {
      setDifficulty(level.name);
      return;
    }
  }
}

function setDifficulty(level) {
  canvas.removeEventListener("click", handleCanvasClick);
  canvas.removeEventListener("mousemove", handleMouseMove);
  canvas.style.cursor = "default";
  canvas.style.border = "none";
  difficultyLevel = level;
  console.log(level);
  levelOutput.innerHTML = "Difficulty Level: " + level.toUpperCase();
  drawGame();
}

//mouse click recognization/effectiveness area
function handleMouseMove(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  let isHovering = false;

  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    if (
      x >= level.x &&
      x <= level.x + 100 &&
      y >= level.y &&
      y <= level.y + 50
    ) {
      isHovering = true;
      break;
    }
  }

  updateCanvasElements(x, y, isHovering);
}

function updateCanvasElements(x, y, isHovering) {
  // Clear the canvas, draw level selection
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawLevelText();

  drawLevels();

  if (isHovering) {
    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];
      if (
        x >= level.x &&
        x <= level.x + 100 &&
        y >= level.y &&
        y <= level.y + 50
      ) {
        // Draw a gradient text with the level's color when hovering over it
        canvas.style.cursor = "pointer";
        let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop("0.3", " magenta");
        gradient.addColorStop("0.9", "blue");
        gradient.addColorStop("0.1", "red");
        ctx.fillStyle = gradient;
        ctx.font = "bold 16px Arial";
        ctx.fillText(level.name, level.x + 25, level.y + 30);

        break;
      }
    }
  }
}
// level selection images
let image = new Image();
image.src = "images/introImg.webp";

let frameImg = new Image();
frameImg.src = "images/frameImg.webp";

function drawLevelText() {
  let levelText = "Choose Difficulty Level";
  ctx.fillText(levelText, 110, 30);
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "black";
}
// draw level frame and intro images
function drawLevels() {
  drawLevelText();

  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    ctx.drawImage(frameImg, level.x, level.y, 100, 50);
    ctx.fillStyle = "black";
    ctx.font = "bold 16px Arial";
    ctx.fillText(level.name, level.x + 25, level.y + 30);
  }

  ctx.drawImage(image, 130, 150, 150, 200);
}

drawLevels();

// input player name module
const nameInput = document.getElementById("name");
const confirmBtn = document.getElementById("confirmBtn");
const playerName = nameInput.value;
// disable the button after entering the name
function confirmName() {
  nameInput.disabled = true;
  confirmBtn.disabled = true;
}

// draw game background module
function clearScreen() {
  for (let i = 0; i < numGrid; i++) {
    for (let j = 0; j < numGrid; j++) {
      if ((i + j) % 2 === 0) {
        ctx.fillStyle = lightSquareColor;
      } else {
        ctx.fillStyle = darkSquareColor;
      }
      ctx.fillRect(i * gridSize, j * gridSize, gridSize, gridSize);
    }
  }
}

// display score module
var score = 0;

function drawScore() {
  let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop("0.9", " magenta");
  gradient.addColorStop("0.9", "blue");
  gradient.addColorStop("0.9", "red");
  ctx.fillStyle = gradient;
  ctx.font = "15px Verdana";
  ctx.fillText("Score: " + score, canvas.width - 230, 15);
}

// draw character module
const snakeHeadUpImg = new Image();
snakeHeadUpImg.src = "images/snakeHeadUp.png";

const snakeHeadDownImg = new Image();
snakeHeadDownImg.src = "images/snakeHeadDown.png";

const snakeHeadLeftImg = new Image();
snakeHeadLeftImg.src = "images/snakeHeadLeft.png";

const snakeHeadRightImg = new Image();
snakeHeadRightImg.src = "images/snakeHeadRight.png";

let snakeHeadImg = snakeHeadUpImg;

let snakebodyImg = new Image();
snakebodyImg.src = "images/snakebodyImg.png";

function drawSnake() {
  for (let i = 0; i < snakeParts.length; i++) {
    let part = snakeParts[i];
    ctx.drawImage(
      snakebodyImg,
      part.x * numGrid,
      part.y * numGrid,
      gridSize,
      gridSize
    );
  }

  snakeParts.push(new SnakePart(headX, headY));
  while (snakeParts.length > tailLength) {
    snakeParts.shift();
  }

  // draw head direction according to keyboard inputs
  if (inputsYVelocity === -1) {
    snakeHeadImg = snakeHeadUpImg;
  } else if (inputsYVelocity === 1) {
    snakeHeadImg = snakeHeadDownImg;
  } else if (inputsXVelocity === -1) {
    snakeHeadImg = snakeHeadLeftImg;
  } else if (inputsXVelocity === 1) {
    snakeHeadImg = snakeHeadRightImg;
  }

  let gridSizeLarge = gridSize + 4;

  ctx.drawImage(
    snakeHeadImg,
    headX * numGrid,
    headY * numGrid,
    gridSizeLarge,
    gridSizeLarge
  );
}

function changeSnakePosition() {
  headX = headX + xVelocity;
  headY = headY + yVelocity;
}

// draw food module
const foodImgs = [
  "images/foodImg1.png",
  "images/foodImg2.png",
  "images/foodImg3.png",
  "images/foodImg4.png",
];

let currentFoodImg = foodImgs[0];

function drawFood() {
  let foodImg = new Image();
  foodImg.src = currentFoodImg;
  ctx.drawImage(foodImg, foodX * numGrid, foodY * numGrid, gridSize, gridSize);
}

// check collision module
function checkFoodCollision() {
  if (foodX === headX && foodY === headY) {
    foodX = Math.floor(Math.random() * numGrid);
    foodY = Math.floor(Math.random() * numGrid);
    tailLength++;
    score++;
    gulpSound.play();
    let randomIndex = Math.floor(Math.random() * foodImgs.length);
    currentFoodImg = foodImgs[randomIndex];
  }
  /*
  if (
    dragonPosition &&
    headX === dragonPosition.x &&
    headY === dragonPosition.y
  ) {
    tailLength = 1; // Reset tail length to 1 upon collision
    dragonPosition = null;
    wowSound.play();
  }
  */
}

// draw the game, including several functional modules
function drawGame() {
  //keybord input directions
  xVelocity = inputsXVelocity;
  yVelocity = inputsYVelocity;

  // set up level associated with speed
  if (!difficultyLevel) return;

  if (score > 0) {
    if (difficultyLevel === "easy") {
      speed = 6;
    } else if (difficultyLevel === "medium") {
      speed = 8;
    } else if (difficultyLevel === "hard") {
      speed = 12;
    }
  }
  // output speed
  speedOutput.innerHTML = "Current Speed: " + speed;

  if (themeSong.paused) {
    themeSong.play();
  }

  // a few modules that control the game logic
  changeSnakePosition();
  let result = isGameOver();
  if (result) {
    return;
  }

  clearScreen();

  checkFoodCollision();

  drawFood();

  drawSnake();

  drawScore();

  /* 
  if (score > 0 && score % 7 === 0) {
    drawDragon();
  }
  */

  setTimeout(drawGame, 1000 / speed);
}

// game-over detection module
function isGameOver() {
  let gameOver = false;

  if (yVelocity === 0 && xVelocity === 0) {
    return false;
  }
  // character out of bounds
  if (headX < 0) {
    gameOver = true;
  } else if (headX === numGrid) {
    gameOver = true;
  } else if (headY < 0) {
    gameOver = true;
  } else if (headY === numGrid) {
    gameOver = true;
  }
  // character hits tail
  for (let i = 0; i < snakeParts.length; i++) {
    let part = snakeParts[i];
    if (part.x === headX && part.y === headY) {
      gameOver = true;
      break;
    }
  }

  // game-over pocess
  // send score to the database
  // get and list existing records from the database
  // game-over text and sound effect
  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "50px Verdana";

    if (gameOver) {
      ctx.fillStyle = "white";
      ctx.font = "50px Verdana";

      let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop("0.2", " magenta");
      gradient.addColorStop("0.9", "blue");
      gradient.addColorStop("0.3", "red");
      ctx.fillStyle = gradient;

      ctx.fillText("Game Over", canvas.width / 6, canvas.height / 2);

      failSound.play();
      themeSong.pause();

      // save player names by cookies
      /*
      let playerName = getCookie("playerName");
      if (playerName) {
        saveScore(playerName, score);
        outputScores();
      } else {
        playerName = prompt("Enter your name:");
        if (playerName) {
          setCookie(playerName);
          saveScore(playerName, score);
          outputScores();
        }
      }

      function setCookie(playerName) {
        var expire = new Date();
        expire.setDate(expire.getDate() + 365);
        var cookieValue =
          "playerName = " +
          playerName +
          "; expires = " +
          expire.toGMTString() +
          "; path=/";
        document.cookie = cookieValue;
      }

      function getCookie(playerName) {
        var cookieArray = document.cookie.split("; ");
        for (var i = 0; i < cookieArray.length; i++) {
          var cookie = cookieArray[i];
          var cookieParts = cookie.split("=");
          var cookieName = cookieParts[0];
          var cookieValue = cookieParts[1];
          if (cookieName === playerName) {
            return cookieValue;
          }
        }
        return null;
      }

      */

      // player name and score storage module
      // POST request to API endpoint to online database
      function saveScore(playerName, difficultyLevel, score) {
        // create a new score object matching database table
        var scoreObject = {
          name: playerName,
          level: difficultyLevel,
          points: score,
        };

        // send the score object to the server to save in the database
        fetch("https://www.wlkevin.com/api/scores", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(scoreObject),
        })
          .then(function (response) {
            if (response.ok) {
              // score saved successfully
              return response.json();
            } else {
              // Error
              throw new Error("Error saving score: " + response.status);
            }
          })
          .then(function (data) {
            // score saved and response received from the server
            console.log(data);
          })
          .catch(function (error) {
            // srror
            console.error(error);
          });
      }

      if (playerName) {
        saveScore(playerName, difficultyLevel, score);
        outputScores();
      }
    }

    ctx.fillText("Game Over", canvas.width / 6, canvas.height / 2);
  }

  return gameOver;
}

// keyboard mapping module
document.body.addEventListener("keydown", keyDown);

// keyboard input
function keyDown(event) {
  //up
  if (event.keyCode == 38 || event.keyCode == 87) {
    //87 is w
    if (inputsYVelocity == 1) return;
    inputsYVelocity = -1;
    inputsXVelocity = 0;
  }

  //down
  if (event.keyCode == 40 || event.keyCode == 83) {
    // 83 is s
    if (inputsYVelocity == -1) return;
    inputsYVelocity = 1;
    inputsXVelocity = 0;
  }

  //left
  if (event.keyCode == 37 || event.keyCode == 65) {
    // 65 is a
    if (inputsXVelocity == 1) return;
    inputsYVelocity = 0;
    inputsXVelocity = -1;
  }

  //right
  if (event.keyCode == 39 || event.keyCode == 68) {
    //68 is d
    if (inputsXVelocity == -1) return;
    inputsYVelocity = 0;
    inputsXVelocity = 1;
  }
}

drawGame();

// add dragon to the game
/*
var dragonPosition;

function drawDragon() {
  let dragonImg = new Image();
  dragonImg.src = "images/dragonImg.webp";
  if (score > 0 && score % 7 === 0 && !dragonPosition) {
    dragonPosition = {
      x: Math.floor(Math.random() * (numGrid - 1)) * gridSize,
      y: Math.floor(Math.random() * (numGrid - 1)) * gridSize,
    };
  }

  if (dragonPosition) {
    ctx.drawImage(
      dragonImg,
      dragonPosition.x,
      dragonPosition.y,
      gridSize,
      gridSize
    );
  }
}
*/
