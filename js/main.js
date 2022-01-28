'use strict'


const MINE = '💣';
const HAPPYSMILEY = '😝';
const SADSMILEY = '😭'
const FLAG = '🇮🇱'
const WINSMILEY = '🤑'



var gWinAmount = (localStorage.gWinAmount) ? localStorage.gWinAmount : 0;
localStorage.gWinAmount = gWinAmount;
var gPlays;
var gCurrPlay = [];
var gSafeClickCount;
var gHintCount;
var gLives;
var gTimerInterval;
var gLevel = {};
var gBoard;
var gCurrMouseLocation;
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    mode: 'normal',
}
var gFirstClick = true;

var elWinCount = document.querySelector(".stats .win-amount");
var elTimer = document.querySelector(".timer span");
var elLives = document.querySelector(".lives span");
var elHints = document.querySelector('.hints span');
var elSafeBtn = document.querySelector('.safe-click span');
var elFrame = document.querySelector(".frame");

elWinCount.innerText = gWinAmount;

function initGame() {
    gBoard = buildBoard(gLevel);
    gPlays = [];
    gLives = 3;
    gHintCount = 3;
    gSafeClickCount = 3;
    livesUpdate();
    hintUpdate();
    gGame.secsPassed = 0;
    gGame.isOn = true;
    gGame.mode = 'normal';
    clearInterval(gTimerInterval);
    gTimerInterval = null;
    gFirstClick = true;
    elTimer.innerText = gGame.secsPassed;
    elSafeBtn.innerText = gSafeClickCount;
    elFrame.classList.remove('win');
    var elSmiley = document.querySelector(".smiley")
    elSmiley.innerText = HAPPYSMILEY;
    // setMinesNegsCount(gBoard)
    // cellMarked()
    renderBoard(gBoard, ".main-board")
}

function buildBoard(level) {
    var nextId = 1;
    var board = [];
    for (var i = 0; i < level.size; i++) {
        board.push([]);
        for (var j = 0; j < level.size; j++) {
            board[i][j] = {
                id: nextId++,
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
        }
    }
    return board;
}

function addMines(mode, board, level, k = 0, l = 0) {
    switch (mode) {
        case 'normal':
            for (var i = 0; i < level.mines; i++) {
                var randomI = getRandomLoc(board).i
                var randomJ = getRandomLoc(board).j
                if (randomI === k && randomJ === l) continue;
                board[randomI][randomJ].isMine = true;
            }
            break;
        case '7Boom':
            for (var i = 0; i < board.length; i++) {
                for (var j = 0; j < board[0].length; j++) {
                    var currCell = board[i][j];
                    if (currCell.id % 7 === 0 || (currCell.id - 7) % 10 === 0) currCell.isMine = true;
                }
            }
            break;
    }
    setMinesNegsCount(gBoard);
    renderBoard(board, ".main-board");
}

function setMode(elMode) {
    if (!gFirstClick) {
        alert('Game has started, reset and try again');
        return;
    }
    var mode = elMode.innerText;
    gGame.mode = mode;
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
    if (gFirstClick) addMines(gGame.mode, gBoard, gLevel, i, j);
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
        gBoard[i][j].isShown = true;
        renderBoard(gBoard, ".main-board")
        gLives--;
        livesUpdate();
        gPlays.push([{ i: i, j: j }]);
        if (gLives === 0) {
            gameOver(gBoard);
            gGame.isOn = false;
        }
        if (gLives > 0) checkWin(gBoard);
        return;
    }
    gCurrPlay = [];
    checkArea(i, j)
    gPlays.push(gCurrPlay);
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
            if (currCell.isMarked || currCell.isShown) continue;
            if (!currCell.isMine) {
                currCell.isShown = true;
                if (!currCell.minesAroundCount) checkArea(k, l);
                gCurrPlay.push({ i: k, j: l })
            }
        }
    }
    renderBoard(gBoard, ".main-board")
}


function gameOver(board) {
    gGame.isOn = false;
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            if (currCell.isMine) currCell.isShown = true;
        }
    }
    var elSmiley = document.querySelector(".smiley")
    elSmiley.innerText = SADSMILEY;
    clearInterval(gTimerInterval);

    renderBoard(gBoard, ".main-board")
}

function checkWin(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var isShown = board[i][j].isShown;
            var isMarked = board[i][j].isMarked;
            var isMine = board[i][j].isMine;
            if (!isShown && isMarked && isMine) continue;
            if (!isShown) return;
        }
    }
    winGame();
}

function winGame() {
    gGame.isOn = false;
    var elCells = document.querySelectorAll('.cell');
    for (var i = 0; i < elCells.length; i++) {
        var currCell = elCells[i]
        currCell.style.backgroundColor = 'lightgreen'
    }
    var elSmiley = document.querySelector(".smiley");
    elSmiley.innerText = WINSMILEY;
    elFrame.classList.add('win');
    updateWinAmout()
    elWinCount.innerText = gWinAmount;
    clearInterval(gTimerInterval)
}

function getHint(board) {
    if (gHintCount === 0 || gFirstClick || !gGame.isOn) return;
    gHintCount--;
    hintUpdate();
    var showedCells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine && !board[i][j].isShown) {
                // var elCell = document.querySelector(`.cell-${i}-${j}`)
                // elCell.classList.add("flash")
                for (var k = i - 1; k <= i + 1; k++) {
                    for (var l = j - 1; l <= j + 1; l++) {
                        if (k === -1 || l === -1 || k === gBoard.length || l === gBoard.length) continue;
                        else {
                            if (!gBoard[k][l].isShown) {
                                showedCells.push({ i: k, j: l });
                                console.log('k', k, 'l', l)
                            }
                            gBoard[k][l].isShown = true;
                            renderBoard(gBoard, ".main-board")
                        }
                    }
                }
                setTimeout(() => {
                    for (var m = 0; m < showedCells.length; m++) {
                        var currUnShow = showedCells[m];
                        gBoard[currUnShow.i][currUnShow.j].isShown = false;
                    }
                    renderBoard(gBoard, ".main-board")
                }, 1500)
                console.log(showedCells)
                return;
            }
        }
    }
}

function safeClick(board) {
    if (gSafeClickCount === 0 || gFirstClick || !gGame.isOn) return;
    gSafeClickCount--;
    elSafeBtn.innerText = gSafeClickCount;
    for (var i = 0; i < 100; i++) {
        var randI = getRandomLoc(board).i;
        var randJ = getRandomLoc(board).j;
        if (!board[randI][randJ].isMine && !board[randI][randJ].isShown) {
            var elCell = document.querySelector(`.cell-${randI}-${randJ}`);
            elCell.classList.add("flash");
            return;
        }

    }

    // for (var i = 0; i < board.length; i++) {
    //     for (var j = 0; j < board[0].length; j++) {
    //         var currCell = board[i][j];
    //         if (!currCell.isMine && !currCell.isShown) {
    //             var elCell = document.querySelector(`.cell-${i}-${j}`);
    //             elCell.classList.add("flash");
    //             return
    //         }
    //     }
    // }
}


function undo(plays, board) {
    if (gFirstClick || !gGame.isOn) return;
    var playUndone = plays[plays.length - 1]
    for (var i = 0; i < playUndone.length; i++) {
        var currPlay = playUndone[i];
        board[currPlay.i][currPlay.j].isShown = false;
    }
    plays.pop();
    renderBoard(gBoard, ".main-board");
}


function livesUpdate() {
    switch (gLives) {
        case 3:
            elLives.innerHTML = '<img src="img/heart.png"><img src="img/heart.png"><img src="img/heart.png">';
            break;
        case 2:
            elLives.innerHTML = '<img src="img/heart.png"><img src="img/heart.png">';
            break;
        case 1:
            elLives.innerHTML = '<img src="img/heart.png">';
            break;
        case 0:
            elLives.innerHTML = ''
    }
}

function hintUpdate() {
    switch (gHintCount) {
        case 3:
            elHints.innerHTML = '<img src="img/hint.png"><img src="img/hint.png"><img src="img/hint.png">';
            break;
        case 2:
            elHints.innerHTML = '<img src="img/hint.png"><img src="img/hint.png">';
            break;
        case 1:
            elHints.innerHTML = '<img src="img/hint.png">';
            break;
        case 0:
            elHints.innerHTML = ''
    }
}

function updateWinAmout() {
    gWinAmount++
    localStorage.gWinAmount++;
    elWinCount.innerText = gWinAmount;
    console.log(gWinAmount)
}


function showModes() {
    var elModeSelectors = document.querySelectorAll(".mode-set");
    for (var i = 0; i < elModeSelectors.length; i++) {
        elModeSelectors[i].classList.toggle("hide")
    }
}