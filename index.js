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
// 20 X 25 = 500
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
var speed = 6;

// initialize keyboard input direction variables 
var inputsXVelocity = 0;
var inputsYVelocity = 0;
// initialize character's move direction variables
var xVelocity = 0;
var yVelocity = 0;

const themeSong = new Audio("theme.mp3");
const gulpSound = new Audio("gulp.mp3");
const failSound = new Audio("fail.mp3");

const lightSquareColor = "white";
const darkSquareColor = "#C4E2FF";


/*  new features  */

var levelOutput = document.getElementById("output");

const levels = [
  { name: "easy", color: "green", x: 50, y: 50 },
  { name: "medium", color: "yellow", x: 150, y: 50 },
  { name: "hard", color: "red", x: 250, y: 50 },
];

let difficultyLevel = null;

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
  levelOutput.innerHTML = "Difficulty Level: "+ level.toUpperCase();
  drawGame();
}

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
  // Clear the canvas
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
        // Draw a rectangle with the level's color when hovering over it
        ctx.fillStyle = level.color;
        ctx.fillRect(level.x, level.y, 100, 50);

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




function drawGame() {
  xVelocity = inputsXVelocity;
  yVelocity = inputsYVelocity;

  if (!difficultyLevel) return;
  
  if (score > 1) {
    if (difficultyLevel === "easy") {
      speed = 6;
    } else if (difficultyLevel === "medium") {
      speed = 8;
    } else if (difficultyLevel === "hard") {
      speed = 10;
    }
  }



  if (themeSong.paused) {
    themeSong.play();
  }

  changeSnakePosition();
  let result = isGameOver();
  if (result) {
    return;
  }

  clearScreen();

  checkAppleCollision();
  drawApple();
  drawSnake();

  drawScore();

  if (score > 5) {
    speed = 9;
  }
  if (score > 10) {
    speed = 11;
  }

  setTimeout(drawGame, 1000 / speed);
}

function isGameOver() {
  let gameOver = false;

  if (yVelocity === 0 && xVelocity === 0) {
    return false;
  }

  if (headX < 0) {
    gameOver = true;
  } else if (headX === numGrid) {
    gameOver = true;
  } else if (headY < 0) {
    gameOver = true;
  } else if (headY === numGrid) {
    gameOver = true;
  }

  for (let i = 0; i < snakeParts.length; i++) {
    let part = snakeParts[i];
    if (part.x === headX && part.y === headY) {
      gameOver = true;
      break;
    }
  }

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
    }

    ctx.fillText("Game Over", canvas.width / 6, canvas.height / 2);
  }

  return gameOver;
}

var score = 0;

function drawScore() {
  let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop("0.9", " magenta");
  gradient.addColorStop("0.9", "blue");
  gradient.addColorStop("0.9", "red");
  ctx.fillStyle = gradient;
  ctx.font = "10px Verdana";
  ctx.fillText("Score: " + score, canvas.width - 220, 10);
}

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

/*
function clearScreen() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
*/

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

const appleImgs = [
  "images/appleImg1.png",
  "images/appleImg2.png",
  "images/appleImg3.png",
  "images/appleImg4.png",
];

let currentAppleImg = appleImgs[0];

function drawApple() {
  let appleImg = new Image();
  appleImg.src = currentAppleImg;
  ctx.drawImage(
    appleImg,
    foodX * numGrid,
    foodY * numGrid,
    gridSize,
    gridSize
  );
}

/*
let appleImg = new Image();
appleImg.src = "images/appleImg.png";

function drawApple() {
  ctx.fillStyle = "red";
  ctx.fillRect(foodX * numGrid, foodY * numGrid, gridSize, gridSize);
}
*/

function checkAppleCollision() {
  if (foodX === headX && foodY == headY) {
    foodX = Math.floor(Math.random() * numGrid);
    foodY = Math.floor(Math.random() * numGrid);
    tailLength++;
    score++;
    gulpSound.play();
    let randomIndex = Math.floor(Math.random() * appleImgs.length);
    currentAppleImg = appleImgs[randomIndex];
  }
}

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
