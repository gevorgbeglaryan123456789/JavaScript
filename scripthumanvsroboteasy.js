let origBoard;
let humanPlayer;
let aiPlayer = 'X';
let canvas;
let isAITurn = false; // Variable to track whether it's AI's turn
let aiMoveTriggered = false; // Add a flag to track whether AI move has been triggered by timer

const winCombos = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[6, 4, 2]
]

const cells = document.querySelectorAll('.cell');

startGame();

function selectSym(sym) {
  humanPlayer = sym;
  aiPlayer = sym === 'O' ? 'X' : 'O';
  origBoard = Array.from(Array(9).keys());
  
  for (let i = 0; i < cells.length; i++) {
    cells[i].addEventListener('click', turnClick, false);
  }
  
  if (aiPlayer === 'X') {
    turn(bestSpot(), aiPlayer);
  }
  
  document.querySelector('.selectSym').style.display = "none";
}

function startGame() {
  origBoard = Array.from(Array(9).keys());
  humanPlayer = null; // No player selected initially
  document.querySelector('.endgame').style.display = "none";
  document.querySelector('.endgame .text').innerText = "";
  document.querySelector('.selectSym').style.display = "block";
  
  for (let i = 0; i < cells.length; i++) {
    cells[i].innerText = '';
    cells[i].style.removeProperty('background-color');
    cells[i].removeEventListener('click', turnClick); // Remove existing listeners
  }
  
  if (canvas && canvas.parentNode) {  // Remove existing winning line canvas
    canvas.parentNode.removeChild(canvas);
    canvas = undefined; // Set canvas to undefined to avoid reuse
  }
}

function selectSym(sym) {
  humanPlayer = sym;
  aiPlayer = sym === 'O' ? 'X' : 'O';
  origBoard = Array.from(Array(9).keys());
  
  for (let i = 0; i < cells.length; i++) {
    cells[i].addEventListener('click', turnClick, false);
  }
  
  if (aiPlayer === 'X') {
    turn(bestSpot(), aiPlayer);
  }
  
  document.querySelector('.selectSym').style.display = "none";
}

function turnClick(square) {
  if (!isAITurn && humanPlayer === null || typeof origBoard[square.target.id] === 'number') {
    turn(square.target.id, humanPlayer);
    square.target.innerHTML = humanPlayer;
    if (!checkWin(origBoard, humanPlayer) && !isDraw()) {
      // Disable human clicks during the AI's turn
      isAITurn = true;
      // Reset flag for AI move trigger
      aiMoveTriggered = false;
      // Disable event listener for cell clicks
      for (let i = 0; i < cells.length; i++) {
        cells[i].removeEventListener('click', turnClick);
      }
      // Call the AI's turn after a delay of 3 seconds
      setTimeout(() => {
        if (!aiMoveTriggered) {
          turn(bestSpot(), aiPlayer);
          aiMoveTriggered = true;
          isAITurn = false; // Re-enable human clicks
          // Re-enable event listener for cell clicks
          for (let i = 0; i < cells.length; i++) {
            cells[i].addEventListener('click', turnClick, false);
          }
        }
      }, 3000);
    }
  }
  return;
}

function turn(squareId, player) {
  origBoard[squareId] = player;
  document.getElementById(squareId).innerHTML = player;
  let gameWon = checkWin(origBoard, player);
  if (gameWon) gameOver(gameWon);
  isDraw();
}

function checkWin(board, player) {
  let plays = board.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []);
  for (let [index, win] of winCombos.entries()) {
    if (win.every(elem => plays.indexOf(elem) > -1)) {
      return { index: index, player: player };
    }
  }
  return null;
}

function gameOver(gameWon) {
  for (let index of winCombos[gameWon.index]) {
    document.getElementById(index).style.backgroundColor =
      gameWon.player === humanPlayer ? "#CC0066" : "#CC0066";
  }
  
  // Draw winning line
  drawWinLine(gameWon.index);
  
  // Disable click events on cells after game over
  for (let i = 0; i < cells.length; i++) {
    cells[i].removeEventListener('click', turnClick, false);
  }
  
  // Declare winner
  declareWinner(gameWon.player === humanPlayer ? "You win!" : "You lose");
}

function drawWinLine(winIndex) {
  canvas = document.createElement('canvas');
  const table = document.querySelector('table');
  const tableWidth = table.offsetWidth;
  canvas.width = canvas.height = tableWidth;
  canvas.style.position = 'absolute';
  canvas.style.left = canvas.style.top = '0';
  table.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 10;
  ctx.beginPath();

  const cellSize = tableWidth / 3;
  let startX, startY, endX, endY;

  const [a, b, c] = winCombos[winIndex];
  
  if (a % 3 === b % 3 && a % 3 === c % 3) {
    // Vertical win
    startX = (a % 3) * cellSize + cellSize / 2;
    startY = 10; // Add some padding
    endX = startX;
    endY = tableWidth - 10; // Subtract padding
  } // Horizontal win
	else if (Math.floor(a / 3) === Math.floor(b / 3) && Math.floor(a / 3) === Math.floor(c / 3)) {
    startX = 10; // Add some padding
    startY = (Math.floor(a / 3)) * cellSize + cellSize / 2;
    endX = tableWidth - 10; // Subtract padding
    endY = startY;
  } else {
    // Diagonal win
    if ((a === 0 && c === 8) || (a === 2 && c === 6)) {
      startX = 10; // Add some padding
      startY = 10; // Add some padding
      endX = tableWidth - 10; // Subtract padding
      endY = tableWidth - 10; // Subtract padding
    } else {
      startX = tableWidth - 10; // Subtract padding
      startY = 10; // Add some padding
      endX = 10; // Add some padding
      endY = tableWidth - 10; // Subtract padding
    }
  }

  // Draw line within cells (for horizontal, vertical, and diagonal wins)
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
}

function declareWinner(winner) {
	document.querySelector(".endgame").style.display = "block";
	document.querySelector(".endgame .text").innerText = winner;
}

function emptySquares() {
	return origBoard.filter(s => typeof s == 'number');
}

function bestSpot() {
	return emptySquares()[0];
}

function isDraw() {
	if (emptySquares().length == 0) {
		for (var i = 0; i < cells.length; i++) {
			// cells[i].style.backgroundColor = "green";
			cells[i].removeEventListener('click', turnClick, false);
		}
		declareWinner("Try again!")
		return true;
	}
	return false;
}

function goHome() {
	window.location.href = "buttonsfirstpage.html";
}

