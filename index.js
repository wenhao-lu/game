const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

class SnakePart {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

var speed = 7;

var tileCount = 20;
var tileSize = canvas.width / tileCount - 2;

var headX = 10;
var headY = 10;
const snakeParts = [];
var tailLength = 2;

var appleX = 5;
var appleY = 5;

var inputsXVelocity = 0;
var inputsYVelocity = 0;

var xVelocity = 0;
var yVelocity = 0;

const gulpSound = new Audio("gulp.mp3");
const failSound = new Audio("fail.mp3");

function drawGame() {
  xVelocity = inputsXVelocity;
  yVelocity = inputsYVelocity;

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
  } else if (headX === tileCount) {
    gameOver = true;
  } else if (headY < 0) {
    gameOver = true;
  } else if (headY === tileCount) {
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

      ctx.fillText("Game Over", canvas.width / 6.5, canvas.height / 2);

      failSound.play();
    }

    ctx.fillText("Game Over", canvas.width / 6.5, canvas.height / 2);
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
  ctx.fillText("Score: " + score, canvas.width - 250, 10);
}

function clearScreen() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

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
      part.x * tileCount,
      part.y * tileCount,
      tileSize,
      tileSize
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

  let tileSizeLarge = tileSize + 4;

  ctx.drawImage(
    snakeHeadImg,
    headX * tileCount,
    headY * tileCount,
    tileSizeLarge,
    tileSizeLarge
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
    appleX * tileCount,
    appleY * tileCount,
    tileSize,
    tileSize
  );
}

/*
let appleImg = new Image();
appleImg.src = "images/appleImg.png";

function drawApple() {
  ctx.fillStyle = "red";
  ctx.fillRect(appleX * tileCount, appleY * tileCount, tileSize, tileSize);
}
*/

function checkAppleCollision() {
  if (appleX === headX && appleY == headY) {
    appleX = Math.floor(Math.random() * tileCount);
    appleY = Math.floor(Math.random() * tileCount);
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
