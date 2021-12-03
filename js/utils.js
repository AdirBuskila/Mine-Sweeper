function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function shuffle(items) {
    var randIdx, keep;
    for (var i = items.length - 1; i > 0; i--) {
        randIdx = getRandomInt(0, items.length);
        randIdx = getRandomInt(0, i + 1);

        keep = items[i];
        items[i] = items[randIdx];
        items[randIdx] = keep;
    }
    console.log('items :>> ', items);
    return items;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

function printMat(mat, selector) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j];
            var className = `cell cell-${i}-${j}`
            strHTML += `<td class="${className}">${cell}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

function setLevel(str) {
    clearInterval(gGameInterval)
    if (str === 'easy') {
        gLevel = { SIZE: 4, MINES: 2 };
        gNumOfFlags = gLevel.MINES
    } else if (str === 'medium') {
        gLevel = { SIZE: 8, MINES: 12 };
        gNumOfFlags = gLevel.MINES
    } else if (str === 'hard') {
        gLevel = { SIZE: 12, MINES: 30, };
        gNumOfFlags = gLevel.MINES
    }
    reset()
}

function gameOver() {
    var elModal = document.querySelector('.modal')
    var elMsg = elModal.querySelector('span.msg')
    var elSmily = document.querySelector('button.reset')
    var elEmj = elModal.querySelector('span.emj')
    clearInterval(gGameInterval)
    showAllMines(gBoard)
    gGame.isOn = false
    elMsg.innerText = 'You Lost..!'
    elEmj.innerText = 'Better Luck Next Time'
    elSmily.innerText = '🥵'
    elModal.classList.toggle('hide')

}

function win() {
    var elSmily = document.querySelector('button.reset')
    var elModal = document.querySelector('.modal')
    var elMsg = elModal.querySelector('span.msg')
    var elEmj = elModal.querySelector('span.emj')
    elModal.classList.toggle('hide')
    elMsg.innerText = 'You Have Won!'
    elEmj.innerText = 'Mama Must Be Proud'
    gGame.isOn = false
    clearInterval(gGameInterval)
    elSmily.innerText = '🤩'
}


function createHearts() {
    str = ''
    for (var i = 0; i < gNumOfLives; i++) {
        str += '❤ '
    }
    return str
}

function createMat(length) {
    var mat = []
    for (var i = 0; i < length; i++) {
        mat[i] = []
        for (var j = 0; j < length; j++) {
            mat[i][j] = []
        }
    }
    return mat
}

function checkForEmptyCells() {
    var allEmpty
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j]
            if (!currCell.isShown && !currCell.isMine) {
                allEmpty = false
                return allEmpty
            }
        }
    }
    allEmpty = true
    return allEmpty
}

function setTime() {
    gGame.secsPassed = Date.now()
    gGameInterval = setInterval(function() {
        var elTimer = document.querySelector('span.time')
        var miliSecs = Date.now() - gGame.secsPassed
        elTimer.innerText = ((miliSecs) / 1000).toFixed(3)
    }, 10)
}

function turnOnHint() {
    if (gNumOfHints < 0) {
        console.log('im here', gNumOfHints);
        return


    } else if (gNumOfHints > 0) {
        var elHint = document.querySelector('.dashboard .hint')
        elHint.style.color = '#0fc1c7f1'
        hintIsOn = true
        console.log(gNumOfHints);
    }


}

function findNotMine() {
    var emptyList = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            currCell = gBoard[i][j]
            if (!currCell.isShown && !currCell.isMine) {
                emptyList.push(currCell)
            }
        }
    }
    var randIdx = getRandomIntInclusive(0, emptyList.length - 1)
    return emptyList[randIdx]
}