window.addEventListener("contextmenu", e => e.preventDefault());
const MINE = '💣'
const EMPTY = ''
const FLAG = '🚩'
    //
var gBoard
var gGameInterval
var gNumOfFlags
var firstClick
var gNumOfLives
var hintIsOn
var gNumOfHints
var gNumOfSafeClicks
var gEmptyList
var gCounter

var gLevel = {
    SIZE: 4,
    MINES: 2
};

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,

}

function init() {
    startGame()
    gBoard = createMat(gLevel.SIZE)
    addMines(gBoard, gLevel.MINES)
    setNegsCount(gBoard)
    printMat(gBoard, '.board-container')
}

function addMines(board, count) {
    for (var i = 0; i < count; i++) {
        var randIdxI = getRandomIntInclusive(0, board.length - 1)
        var randIdxJ = getRandomIntInclusive(0, board.length - 1)
        if (board[randIdxI][randIdxJ].isMine) {
            i--
            continue
        } else {
            board[randIdxI][randIdxJ] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: true,
                isMarked: false,
            }

        }
    }
}
// cell clicked //////////////////////////////////////////////////////////////////////////////////////////////////////
function cellClicked(cellI, cellJ) {
    var currCell = gBoard[cellI][cellJ]
    if (gGame.isOn) {
        if (currCell.isShown || currCell.isMarked) { // check if its an marked or shown cell
            return
        }
        if (hintIsOn) { // if hint on, give hint
            giveHint(cellI, cellJ)
            return
        }
        if (!firstClick) { // check if its first click
            setTime()
            firstClick = true
        }
        if (!currCell.isMine && currCell.minesAroundCount) { // check if its a cell with negs
            currCell.isShown = true
        }
        if (!currCell.isMine && !currCell.minesAroundCount) { // check if its a lonely cell
            expandEmpty(cellI, cellJ)
        }
        if (currCell.isMarked && currCell.isShown) { // in case the cell was marked and then shown 
            if (!currCell.isMine) {
                gGame.markedCount--;
                gNumOfFlags++;
            }
        }
        if (currCell.isMine) { //else its a mine
            gNumOfLives--;
            gGame.markedCount++;
            gNumOfFlags--;
            currCell.isShown = true
            if (gNumOfLives === 0) {
                gameOver()
            }
        }
        gGame.shownCount = countShown()
        printMat(gBoard, '.board-container')
        checkWin()
    }

}
// print mat ////////////////////////////////////////////////////////////////////////////////////////////////
function printMat(mat, selector) {
    var strHTML = '<table border="0"><tbody>';
    var elFlags = document.querySelector('span.flagsNums')
    var elHints = document.querySelector('span.hintsNums')
    var elSafeClicks = document.querySelector('span.sc')
    var elCellsShown = document.querySelector('span.shown')
    var elLives = document.querySelector('span.lives')
    var elContainer = document.querySelector(selector);
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j];
            var className = `cell-${i}-${j}`
            if (!cell.isShown && !cell.isMarked) {
                cell = EMPTY
            } else if (cell.isMine && cell.isShown) {
                cell = MINE
                className = 'mine'
            } else if (cell.isShown && !cell.isMarked) {
                cell = cell.minesAroundCount
                className = 'shown'
            } else if (cell.isMarked) {
                cell = FLAG
            } else if (!cell.isShown) {
                cell = EMPTY
            }
            strHTML += `<td oncontextmenu="placeFlag(${i},${j})" onclick="cellClicked(${i},${j})" class="${className}">${cell}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    elContainer.innerHTML = strHTML;
    elFlags.innerText = gNumOfFlags
    elCellsShown.innerText = countShown()
    elLives.innerText = createHearts()
    elHints.innerText = gNumOfHints
    elSafeClicks.innerText = gNumOfSafeClicks
}

function setMinesNegsCount(board, cellI, cellJ) {
    if (board[cellI][cellJ].isMine) return
    var minesCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            var currCell = board[i][j]
            if (currCell.isMine) {
                minesCount++
            }

        }
    }
    if (minesCount === 0) {
        minesCount = ''
    }
    board[cellI][cellJ] = { minesAroundCount: minesCount, isShown: false, isMine: false, isMarked: false }
}

function placeFlag(i, j) {
    var elFlags = document.querySelector('span.flagsNums')
    if (gBoard[i][j].isMarked || gBoard[i][j].isShown) {
        return
    }
    if (gNumOfFlags > 0) {
        gBoard[i][j].isMarked = true
        gNumOfFlags--;
        gGame.markedCount++;
        elFlags.innerText = gNumOfFlags
        checkWin()
        printMat(gBoard, '.board-container')

    }
}


function showAllMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var currCell = board[i][j]
            if (currCell.isMine) {
                currCell.isShown = true
            }
        }
    }

}

function setNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            setMinesNegsCount(board, i, j)
        }
    }
}

function checkWin() {
    var allEmpty = checkForEmptyCells()
    var totalNumberOfCells = gLevel.SIZE * gLevel.SIZE
    var desiredSize = totalNumberOfCells - gLevel.MINES
    if (allEmpty) { // check that all non mine cells are shown
        if (desiredSize === gGame.shownCount && gGame.markedCount === gLevel.MINES) {
            //check if desiredSize equals showCount and all mines are marked
            win()
        }
        if (desiredSize < gGame.shownCount && gGame.markedCount === gLevel.MINES) {
            //
            win()
        }

    }
}
// reset //////////////////////////////////////////////////////////////////////////////////////////////////////////////
function reset() {
    var elHint = document.querySelector('.dashboard .hint')
    var elModal = document.querySelector('.modal')
    var elSmily = document.querySelector('button.reset')
    var elTimer = document.querySelector('span.time')
    var elFlags = document.querySelector('span.flagsNums')
    var elCellsShown = document.querySelector('span.shown')
    clearInterval(gGameInterval)
    gGame.markedCount = 0
    gGame.shownCount = 0
    elSmily.innerText = '😀'
    elTimer.innerText = '0'
    elHint.style.color = 'rgb(87, 4, 4)'
    elFlags.innerText = gLevel.MINES - gGame.markedCount
    elCellsShown.innerText = countShown()
    elModal.classList.add('hide')
    init()
}


function giveHint(cellI, cellJ) {
    if (hintIsOn) {
        var elHint = document.querySelector('.dashboard .hint')
        if (gNumOfHints < 0) return
        for (var i = cellI - 1; i <= cellI + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue;
            for (var j = cellJ - 1; j <= cellJ + 1; j++) {
                if (j < 0 || j >= gBoard[i].length) continue;
                var currCell = gBoard[i][j]
                currCell.isShown = true
            }
        }
        printMat(gBoard, '.board-container');
        for (var i = cellI - 1; i <= cellI + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue;
            for (var j = cellJ - 1; j <= cellJ + 1; j++) {
                if (j < 0 || j >= gBoard[i].length) continue;
                var currCell = gBoard[i][j]
                currCell.isShown = false
            }
        }
        setTimeout(function() {
            gNumOfHints--;
            hintIsOn = false
            elHint.style.color = 'rgb(87, 4, 4)'
            printMat(gBoard, '.board-container');
        }, 1000)
    }
}

function setMinesNegsCount1(board, cellI, cellJ) {
    var minesCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            var currCell = board[i][j]
            if (currCell.isMine) {
                minesCount++
            }

        }
    }
    return minesCount
}

function expandEmpty(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j > gBoard[i].length - 1) continue;
            if (i === cellI && j === cellJ) continue;
            var emptyCount = setMinesNegsCount1(gBoard, i, j);
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                var currCell = gBoard[i][j]
                currCell.isShown = true
                if (!emptyCount) expandEmpty(i, j);
            }
        }
    }
}

function startGame() {
    gNumOfSafeClicks = 3
    gNumOfHints = 3
    gNumOfLives = 3
    hintIsOn = false
    firstClick = false
    gGame.isOn = true
    gNumOfFlags = gLevel.MINES
}

function countShown() {
    var counter = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            currCell = gBoard[i][j]
            if (currCell.isShown) {
                counter++
            }
        }
    }
    return counter
}


function safeClick() {
    if (gNumOfSafeClicks > 0) {
        var emptyCell = findNotMine()
        emptyCell.isShown = true
        printMat(gBoard, '.board-container')

        emptyCell.isShown = false
        gNumOfSafeClicks--;
        setTimeout(function() {
            printMat(gBoard, '.board-container');
        }, 2000)

    }
}