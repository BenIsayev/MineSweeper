'use strict'


const MINE = '💣';
const HAPPYSMILEY = '😝';
const SADSMILEY = '😭'
const FLAG = '🇮🇱'
const WINSMILEY = '🤑'



var gLives;
var gTimerInterval;
var gLevel = {};
var gBoard;
var gCurrMouseLocation;
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}
var gFirstClick = true;

var elTimer = document.querySelector(".timer span")
var elLives = document.querySelector(".lives span")

function initGame() {
    gLives = 3
    elLives.innerText = gLives;
    gGame.secsPassed = 0;
    gGame.isOn = true;
    clearInterval(gTimerInterval);
    gTimerInterval = null;
    gFirstClick = true;
    var elTimer = document.querySelector(".timer span")
    elTimer.innerText = gGame.secsPassed
    var elSmiley = document.querySelector(".smiley")
    elSmiley.innerText = HAPPYSMILEY;
    gBoard = buildBoard(gLevel);
    // setMinesNegsCount(gBoard)
    // cellMarked()
    renderBoard(gBoard, ".main-board")
}

function buildBoard(level) {
    var board = [];
    for (var i = 0; i < level.size; i++) {
        board.push([]);
        for (var j = 0; j < level.size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
        }
    }
    return board;
}

function addMines(board, level, k, l) {
    for (var i = 0; i < level.mines; i++) {
        var randomI = getRandomLoc(board).i
        var randomJ = getRandomLoc(board).j
        if (randomI === k && randomJ === l) continue;
        board[randomI][randomJ].isMine = true;
    }
    setMinesNegsCount(gBoard);
    renderBoard(board, ".main-board");
}


//i: 0 j:0 k:0 l:0
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var currCell = board[i][j];
            for (var k = (i - 1); k <= (i + 1); k++) {
                for (var l = (j - 1); l <= (j + 1); l++) {
                    if (k === -1 || k === board.length || l === -1 || l === board.length || k === i && l === j) continue;
                    var checkedCell = board[k][l];
                    if (checkedCell.isMine) currCell.minesAroundCount++
                }
            }

        }
    }
}

function setLevel(elLevel) {
    switch (elLevel.innerText) {
        case 'Easy':
            gLevel = {
                size: 4,
                mines: 2
            }
            break;
        case 'Medium':
            gLevel = {
                size: 8,
                mines: 12
            }
            break;
        case 'Expert':
            gLevel = {
                size: 12,
                mines: 30
            }
            break;
    }
    initGame();
}

function cellClicked(elCell, i, j) {
    if (!gGame.isOn) return;
    if (gFirstClick) addMines(gBoard, gLevel, i, j);
    var modelCell = gBoard[i][j];
    if (gFirstClick) {
        gTimerInterval = setInterval(() => {
            gGame.secsPassed++;
            elTimer.innerText = gGame.secsPassed;
        }, 1000)
        gFirstClick = false;
    }
    if (modelCell.isShown) return;
    if (modelCell.isMarked) return;
    if (gBoard[i][j].isMine) {
        debugger;
        gBoard[i][j].isShown = true;
        renderBoard(gBoard, ".main-board")
        gLives--;
        elLives.innerText = gLives;
        if (gLives === 0) {
            gameOver(gBoard);
            gGame.isOn = false;
        }
        if (gLives > 0) checkWin(gBoard);
        return;
    }
    checkArea(i, j)
    if (!modelCell.isMine) {
        elCell.innerText = modelCell.minesAroundCount;
    } else {
        elCell.innerText = MINE;
    }
    elCell.classList.add('selected')
    if (!modelCell.isShown && !modelCell.isMine) gGame.shownCount++;
    // console.log(gGame.shownCount)
    // gBoard[i][j].isShown = true;
    checkWin(gBoard);
}

function keyPressed(ev) {
    console.log(ev)
}

function updateLoc(i, j) {
    gCurrMouseLocation = { i: i, j: j }
}



var elMainBoard = document.querySelector(".main-board")
elMainBoard.addEventListener("contextmenu", function(x) {
    x.preventDefault();
    var currI = gCurrMouseLocation.i;
    var currJ = gCurrMouseLocation.j;
    var currModelCell = gBoard[currI][currJ]
    var elCurrCell = elMainBoard.querySelector(`.cell-${currI}-${currJ}`)
    if (!gGame.isOn) return;
    if (currModelCell.isShown) return;

    elCurrCell.classList.toggle("marked")
    if (!currModelCell.isMarked) {
        elCurrCell.innerText = FLAG
        currModelCell.isMarked = !currModelCell.isMarked
    } else {
        elCurrCell.innerText = ''
        currModelCell.isMarked = !currModelCell.isMarked
    }
    checkWin(gBoard);
})


function checkArea(i, j) {

    for (var k = i - 1; k <= i + 1; k++) {
        for (var l = j - 1; l <= j + 1; l++) {
            if (k === -1 || l === -1 || k === gBoard.length || l === gBoard.length) continue
            var currCell = gBoard[k][l];
            if (currCell.isMarked) continue;
            if (!currCell.isMine) {
                currCell.isShown = true;
            }
        }
    }

    renderBoard(gBoard, ".main-board")
}


function gameOver(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            currCell.isShown = true;
        }
    }
    var elSmiley = document.querySelector(".smiley")
    elSmiley.innerText = SADSMILEY;
    clearInterval(gTimerInterval)
    renderBoard(gBoard, ".main-board")
}

function checkWin(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var isShown = board[i][j].isShown;
            var isMarked = board[i][j].isMarked;
            var isMine = board[i][j].isMine;
            if (isMine && isMarked) continue;
            if (isMine && !isMarked) return;
            if (!isMine && isShown) continue;
            if (!isMine && !isShown) return;
        }
    }
    winGame();
}

function winGame() {
    var elCells = document.querySelectorAll('.cell')
    for (var i = 0; i < elCells.length; i++) {
        var currCell = elCells[i]
        currCell.style.backgroundColor = 'lightgreen'
    }
    var elSmiley = document.querySelector(".smiley")
    elSmiley.innerText = WINSMILEY;
    clearInterval(gTimerInterval)
}