'use strict'




function renderBoard(board, selector) {
    var strHTML = `<table><tbody>`;
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            var cell = '';
            var className = '';
            if (currCell.isMine && currCell.isShown) {
                cell = MINE;
            }
            if (!currCell.isMine && currCell.isShown) {
                cell = currCell.minesAroundCount
            }
            if (currCell.isMarked) {
                cell = FLAG;
                className = 'marked '
            }
            className += 'cell cell-' + i + '-' + j;
            if (currCell.isShown) className += ' sellected'
            var onClickName = 'cellClicked(this, ' + i + ', ' + j + ')'
            var onMouseOver = 'updateLoc(' + i + ',' + j + ')';
            strHTML += `<td title="${MINE}" onmouseover=${onMouseOver} onclick="${onClickName}" class="${className}">${cell}</td>`;
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'
    var elBoard = document.querySelector(selector);
    elBoard.innerHTML = strHTML;
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomLoc(board) {
    var loc = {
        i: getRandomInt(0, board.length - 1),
        j: getRandomInt(0, board.length - 1)
    }
    return loc;
}