$(document).ready(function () {
  let canvasContainer;
  let canvas;
  let ctx;
  const collisionTypes = {
    virus: 'virus',
    medicine: 'medicine',
    noCollision: 'noCollision',
  };
  let collision = {
    isCollision: false,
    collisionType: collisionTypes.noCollision,
    x: 0,
    y: 0,
  };

  // Game state variables

  let isDraggingPlayer = false;
  let score = 987654000;

  let animationFrameId = null;
  const hitSound = new Audio('sound/hit.mp3');
  const tingSound = new Audio('sound/ting.mp3');
  // Set canvas dimensions and handle window resize
  function setCanvasDimensions() {
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight - 40;
  }

  window.addEventListener('resize', setCanvasDimensions);

  let player;
  let elements = [];
  const virusImage = document.querySelector('#virusImg');
  const medicineImage = document.querySelector('#medicineImg');
  let elementInternal = null;
  const timer = { seconds: 30000, interval: null };

  // Create junk food items
  function createElement() {
    let isVirus = Math.random() > 0.5;
    const element = {
      isVirus,
      image: isVirus ? virusImage : medicineImage,
      x: canvas.width + 20,
      y: Math.random() * canvas.height,
      speedX: -3.5,
      speedY: 0,
    };

    elements.push(element);
  }

  // Game loop
  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPlayer();
    drawElements();
    if (collision.isCollision) {
      drawCollision(collision);
    }
    if (!isGameOver()) {
      animationFrameId = requestAnimationFrame(update);
    }
  }

  function isGameOver() {
    return lives <= 0 || timer.seconds <= 0;
  }

  function drawElements() {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      element.x += element.speedX;
      element.y += element.speedY;

      ctx.drawImage(element.image, element.x - 10, element.y - 10, 90, 90);

      if (checkCollisionWithPlayer(element)) {
        handleCollision(element);
        elements.splice(i, 1);
      }

      if (isOutOfBounds(element)) {
        elements.splice(i, 1);
      }
    }
  }

  function drawPlayer() {
    ctx.drawImage(
      $('#playerImg')[0],
      player.x - player.size / 2,
      player.y - player.size,
      player.size,
      player.size * 2
    );
    // ctx.fillStyle = "blue";
    // ctx.fillRect(player.x - player.size / 2, player.y - player.size / 2, player.size, player.size);
  }

  function drawCollision(collision) {
    let collisionImgId =
      collision.collisionType == collisionTypes.virus
        ? 'virusCollisionImg'
        : 'medicineCollisionImg';
    console.log(collisionImgId);
    ctx.drawImage($(`#${collisionImgId}`)[0], collision.x, collision.y, 60, 60);
  }

  function drawScore() {
    // $('#lives').html(
    //   `<img src="img/lives/3.png" height="40" alt="" /> <span>: ${score}</span>`
    // );
  }

  function checkCollisionWithPlayer(element) {
    return (
      element.x >= player.x - player.size / 2 - 50 &&
      element.x <= player.x + player.size / 2 &&
      element.y >= player.y - player.size - 60 &&
      element.y <= player.y + player.size
    );
  }

  function handleCollision(element) {
    collision.x = element.x;
    collision.y = element.y;
    collision.isCollision = true;
    if (element.isVirus) {
      collision.collisionType = collisionTypes.virus;
      hitSound.play();
      tingSound.currentTime = 0;
      score -= 1000;
    } else {
      collision.collisionType = collisionTypes.medicine;
      score += 1000;
      hitSound.currentTime = 0;
      tingSound.play();
    }

    isDraggingPlayer = false;
    setTimeout(() => {
      collision.isCollision = false;
      collision.collisionType = collisionTypes.noCollision;
    }, 300);

    drawScore();
    // if (lives <= 0) {
    //   gameOver();
    // }
  }

  function isOutOfBounds(element) {
    return (
      (element.isVirus &&
        (element.y > canvas.height - 30 ||
          element.x < -20 ||
          element.x > canvas.width + 20)) ||
      (!element.isVirus &&
        (element.x < -20 ||
          element.x > canvas.width + 20 ||
          element.y < -20 ||
          element.y > canvas.height + 20))
    );
  }

  function gotoInstructionsPage() {
    $('#startPage').hide();
    $('#instructionsPage').show();
  }

  function startGame() {
    $('#instructionsPage').hide();
    $('#gamePage').show();
    setGame();
    update();
  }

  function setGame() {
    isDraggingPlayer = false;
    collision.isCollision = false;
    collision.collisionType = collisionTypes.noCollision;
    canvasContainer = document.querySelector('.canvasContainer');
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    player = { x: 100, y: canvas.height / 2 + 20, size: 50 };
    elements.length = 0;
    timer.seconds = 30;
    score = 987654000;
    drawScore();
    // Event listeners
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    canvas.addEventListener('mousedown', handleTouchStart);
    canvas.addEventListener('mousemove', handleTouchMove);
    canvas.addEventListener('mouseup', handleTouchEnd);

    setCanvasDimensions();
    timer.interval = setInterval(countDown, 1000);
    elementInternal = setInterval(createElement, 1000);
  }

  function playAgain() {
    $('#finalPage').hide();
    $('#startPage').show();
  }

  function countDown() {
    timer.seconds--;
    document.getElementById('timer').textContent = `${
      timer.seconds < 10 ? '0' + timer.seconds : timer.seconds
    } sec`;
    if (timer.seconds <= 0) {
      gameOver();
    }
  }

  function gameOver() {
    cancelAnimationFrame(animationFrameId);
    resetGame();
    $('#gamePage').hide();
    $('#finalPage').show();
  }

  function resetGame() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }
    clearInterval(timer.interval);
    clearInterval(elementInternal);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawScore();
    document.getElementById('timer').textContent = `Time: ${timer.seconds}`;
  }

  function handleTouchStart(e) {
    let touchX;
    let touchY;
    if (e.type == 'touchstart') {
      touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
      touchY = e.touches[0].clientY - canvas.getBoundingClientRect().top;
    } else {
      touchX = e.clientX - canvas.getBoundingClientRect().left;
      touchY = e.clientY - canvas.getBoundingClientRect().top;
    }

    if (isInsidePlayerBounds(touchX, touchY)) {
      isDraggingPlayer = true;
    }
  }

  function handleTouchMove(e) {
    if (isDraggingPlayer) {
      // let touchX;
      let touchY;
      if (e.type == 'touchmove') {
        touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
        touchY = e.touches[0].clientY - canvas.getBoundingClientRect().top;
      } else {
        touchX = e.clientX - canvas.getBoundingClientRect().left;
        touchY = e.clientY - canvas.getBoundingClientRect().top;
      }

      //Update player position based on touch input within canvas bounds
      player.x = player.x;
      player.y = Math.max(
        player.size,
        Math.min(canvas.height - player.size, touchY)
      );
    }
  }

  function handleTouchEnd() {
    isDraggingPlayer = false;
  }

  function isInsidePlayerBounds(x, y) {
    return (
      x >= player.x - player.size / 2 &&
      x <= player.x + player.size / 2 &&
      y >= player.y - player.size / 2 &&
      y <= player.y + player.size / 2
    );
  }

  // $(document).on('contextmenu', function (e) {
  //   e.preventDefault();
  // });

  $(document).on('dblclick', function (e) {
    e.preventDefault();
  });

  /* handle buttons */
  $('#gotoInstructionsButton').on('click', gotoInstructionsPage);
  $('#startButton').on('click', startGame);
  $('#playAgainButton').on('click', playAgain);
});
