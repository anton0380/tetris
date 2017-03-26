var GAME_TIMEOUT = 1000;
var GAME_DELTA_TIMEOUT = 20;
var GAME_TIMEOUT_FACTOR = 0.05;
var STEP_SIZE = 20;
var POINT_SIDE = 20;
var COL_COUNT = 10;
var ROW_COUNT = 20;

var ELEMENT_SCORE = 1;
var LINE_SCORE = 10;


var TETRIS_WIDTH = COL_COUNT * POINT_SIDE;
var TETRIS_HEIGHT = ROW_COUNT * POINT_SIDE;

var ELEMENT_HEIGHT = 100;
var ELEMENT_WIDTH = 200;

var colorsFigure = ['#8B3A3A', //IndianRed4
    '#8B7E66', //Wheat4
    '#B8860B', //DarkGoldenrod
    '#8B5A2B', //Tan4
    '#9370DB', // MediumPurple
    '#006400']; //DarkGreen


var figLine = [{elem: null, left: 0, top: 0},
    {elem: null, left: 1, top: 0},
    {elem: null, left: 2, top: 0},
    {elem: null, left: 3, top: 0}];
var figGRight = [{elem: null, left: 0, top: 0},
    {elem: null, left: 1, top: 0},
    {elem: null, left: 2, top: 0},
    {elem: null, left: 2, top: 1}];
var figGLeft = [{elem: null, left: 0, top: 0},
    {elem: null, left: 1, top: 0},
    {elem: null, left: 2, top: 0},
    {elem: null, left: 0, top: 1}];
var figT = [{elem: null, left: 0, top: 0},
    {elem: null, left: 1, top: 0},
    {elem: null, left: 2, top: 0},
    {elem: null, left: 1, top: 1}];
var figZRight = [{elem: null, left: 0, top: 0},
    {elem: null, left: 1, top: 0},
    {elem: null, left: 1, top: 1},
    {elem: null, left: 2, top: 1}];
var figZLeft = [{elem: null, left: 0, top: 1},
    {elem: null, left: 1, top: 1},
    {elem: null, left: 1, top: 0},
    {elem: null, left: 2, top: 0}];
var FIG_COUNT = 6;

var tetris = {
    recordCurrent: 0,
    flagEndGame: true,
    currentTimeout: GAME_TIMEOUT,
    gameTimer: null,
    scoreCurrent: 0,
    currentFigure: {
        figure: undefined,
        color: undefined,
        center: undefined
    },
    nextFigure: {
        figure: undefined,
        color: undefined,
        center: undefined
    },
    points: [],
    start: function () {
        tetris.stop();
        tetris.flagEndGame = false;
        currentTimeout = GAME_TIMEOUT;
        tetris.createFigure();
        tetris.gameTimer = setInterval(tetris.gameTimeout, tetris.currentTimeout);
    },
    stop: function () {
        if (tetris.gameTimer) {
            clearInterval(tetris.gameTimer);
            tetris.gameTimer = null;
        }
        tetris.points = [];
        var poul = document.getElementById("poul");
        poul.innerHTML = "";
        tetris.clearScore();
        tetris.flagEndGame = true;
    },
    pause: function () {
        if (tetris.gameTimer) {
            clearInterval(tetris.gameTimer);
            tetris.gameTimer = null;
        } else {
            if (!tetris.flagEndGame) {
                tetris.gameTimer = setInterval(tetris.gameTimeout, tetris.currentTimeout);
            }
        }
    },
    addScore: function (value) {
        if (Math.floor(GAME_TIMEOUT_FACTOR*tetris.scoreCurrent)<Math.floor(GAME_TIMEOUT_FACTOR*(tetris.scoreCurrent+value))) {
            // game level up
            if (tetris.gameTimer) {
                clearInterval(tetris.gameTimer);
                tetris.gameTimer = null;
                var newTimeout = tetris.currentTimeout - GAME_DELTA_TIMEOUT;
                tetris.currentTimeout = (newTimeout > 0)?newTimeout:1;
                tetris.gameTimer = setInterval(tetris.gameTimeout, tetris.currentTimeout);
            }
        }
        tetris.scoreCurrent += value;
        paintScore(tetris.scoreCurrent);
    },
    clearScore: function () {
        tetris.scoreCurrent = 0;
        paintScore(tetris.scoreCurrent);
    },
    elemsToPoints: function () {
        tetris.addScore(ELEMENT_SCORE);
        // add points
        for (var i = 0; i < tetris.currentFigure.figure.length; i++) {
            var curValue = tetris.currentFigure.figure[i];
            var obj = {
                elem: curValue.elem,
                top: parseInt(curValue.elem.style.top),
                left: parseInt(curValue.elem.style.left)
            };
            tetris.points.push(obj);
        }
        // check fill lines to clear
        tetris.checkFillLine();
        // add new figure
        tetris.createFigure();
    },
    checkFillLine: function(){
        for (var top = TETRIS_HEIGHT - POINT_SIDE; top >= 0; top-=POINT_SIDE) {
            var count = 0;
            for (var i = 0; i < tetris.points.length; i++) {
                var curPoint = tetris.points[i];
                if (parseInt(curPoint.elem.style.top) == top) {
                    count ++;
                }
            }
            if (count == COL_COUNT) {
                // delete line
                for (var i = 0; i < tetris.points.length; i++) {
                    var curPoint = tetris.points[i];
                    if (parseInt(curPoint.elem.style.top) == top) {
                        curPoint.elem.remove();
                        tetris.points.splice(i,1);
                        i --;
                    }
                }
                // move all down
                for (var i = 0; i < tetris.points.length; i++) {
                    var curPoint = tetris.points[i];
                    if (parseInt(curPoint.elem.style.top) < top) {
                        curPoint.elem.style.top = (parseInt(curPoint.elem.style.top) + POINT_SIDE) + 'px';
                        curPoint.top += POINT_SIDE;
                    }
                }
                tetris.addScore(LINE_SCORE);
                top += POINT_SIDE;
            }

        }
    },
    gameTimeout: function () {
        tetris.downOneStep();
    },
    downOneStep: function () {
        // check bottom
        for (var i = 0; i < tetris.currentFigure.figure.length; i++) {
            var curValue = tetris.currentFigure.figure[i];
            if (parseInt(curValue.elem.style.top) + POINT_SIDE == TETRIS_HEIGHT) {
                tetris.elemsToPoints();
                return false;
            }
        }
        // check points
        for (var i = 0; i < tetris.currentFigure.figure.length; i++) {
            var curValue = tetris.currentFigure.figure[i];
            for (var j = 0; j < tetris.points.length; j++) {
                var curPoint = tetris.points[j];
                if ((parseInt(curValue.elem.style.top) + POINT_SIDE == curPoint.top) &&
                    (parseInt(curValue.elem.style.left) == curPoint.left)) {
                    tetris.elemsToPoints();
                    return false;
                }
            }
        }
        // move down
        tetris.currentFigure.center.top += POINT_SIDE;
        for (var i = 0; i < tetris.currentFigure.figure.length; i++) {
            var curValue = tetris.currentFigure.figure[i];
            curValue.elem.style.top = (parseInt(curValue.elem.style.top) + POINT_SIDE) + 'px';
        }
        return true;
    },
    getRotateCoords: function(centerTop, centerLeft, rotateTop, rotateLeft) {
        var deltaTop = Math.abs(centerTop - rotateTop);
        var deltaLeft = Math.abs(centerLeft - rotateLeft);
        var top = centerTop + deltaLeft;
        var left = centerLeft + deltaTop;
        if (centerTop < rotateTop && centerLeft == rotateLeft)
        {
            //top = centerTop - deltaLeft;
            left = centerLeft - deltaTop;
        }
        if (centerTop == rotateTop && centerLeft > rotateLeft)
        {
            top = centerTop - deltaLeft;
            //left = centerLeft + deltaTop;
        }
        if (centerTop > rotateTop && centerLeft > rotateLeft)
        {
            top = centerTop - deltaLeft;
            left = centerLeft + deltaTop;
        }
        if (centerTop < rotateTop && centerLeft < rotateLeft)
        {
            top = centerTop + deltaLeft;
            left = centerLeft - deltaTop;
        }
        if (centerTop < rotateTop && centerLeft > rotateLeft)
        {
            top = centerTop - deltaLeft;
            left = centerLeft - deltaTop;
        }
        if (centerTop > rotateTop && centerLeft < rotateLeft)
        {
            top = centerTop + deltaLeft;
            left = centerLeft + deltaTop;
        }
        //alert('top='+top+'left='+left+'ct='+ centerTop + 'cl='+ centerLeft + 'rt='+rotateTop+'rl='+rotateLeft);
        return {top:top, left:left};
    },
    correctMove:function(coords) {
        if (coords.top + POINT_SIDE > TETRIS_HEIGHT) {
            return false;
        }
        if (coords.top < 0) {
            return false;
        }
        if (coords.left < 0) {
            return false;
        }
        if (coords.left  + POINT_SIDE > TETRIS_WIDTH) {
            return false;
        }
        for (var i = 0; i < tetris.points.length; i++) {
            var curPoint = tetris.points[i];
            if ((coords.top == curPoint.top) &&
                (coords.left == curPoint.left)) {
                return false;
            }
        }
        return true;
    },
    rotate: function () {
        var canRotate = true;
        var centerLeft = tetris.currentFigure.center.left;
        var centerTop = tetris.currentFigure.center.top;
        var rotateLeft;
        var rotateTop;
        var coords;
        for (var i = 0; i < tetris.currentFigure.figure.length; i++) {
            var curValue = tetris.currentFigure.figure[i];
            rotateLeft = parseInt(curValue.elem.style.left);
            rotateTop = parseInt(curValue.elem.style.top);
            coords = tetris.getRotateCoords(centerTop, centerLeft, rotateTop, rotateLeft);
            if (!tetris.correctMove(coords)) {
                return;
            }
        }
        for (var i = 0; i < tetris.currentFigure.figure.length; i++) {
            var curValue = tetris.currentFigure.figure[i];
            rotateLeft = parseInt(curValue.elem.style.left);
            rotateTop = parseInt(curValue.elem.style.top);
            coords = tetris.getRotateCoords(centerTop, centerLeft, rotateTop, rotateLeft);
            curValue.elem.style.top = coords.top + 'px';
            curValue.elem.style.left = coords.left + 'px';

        }

    },
    down: function() {
        if (!tetris.flagEndGame && tetris.gameTimer != null) {
            while (tetris.downOneStep()) {};
        }
    },
    createNextFigure: function () {
        var figType = Math.round(Math.random() * (FIG_COUNT - 1));
        var next = null;
        tetris.nextFigure = {
            figure: undefined,
            color: undefined
        };
        switch (figType) {
            case 0:
                tetris.nextFigure.figure = figLine.slice();
                break;
            case 1:
                tetris.nextFigure.figure = figGRight.slice();
                break;
            case 2:
                tetris.nextFigure.figure = figGLeft.slice();
                break;
            case 3:
                tetris.nextFigure.figure = figT.slice();
                break;
            case 4:
                tetris.nextFigure.figure = figZRight.slice();
                break;
            case 5:
                tetris.nextFigure.figure = figZLeft.slice();
                break;
        }
        tetris.nextFigure.color = tetris.getFigureColor();
        tetris.showNext();

    },
    checkEndGame: function () {
        for (var i = 0; i < tetris.currentFigure.figure.length; i++) {
            var curValue = tetris.currentFigure.figure[i];
            for (var j = 0; j < tetris.points.length; j++) {
                var curPoint = tetris.points[j];
                if ((parseInt(curValue.elem.style.top) == curPoint.top) &&
                    (parseInt(curValue.elem.style.left) == curPoint.left)) {
                    tetris.flagEndGame = true;
                    if (tetris.scoreCurrent > tetris.recordCurrent) {
                        tetris.recordCurrent = tetris.scoreCurrent;
                        saveRecord(tetris.recordCurrent);
                        paintRecord(tetris.recordCurrent);
                    }
                    tetris.pause();
                    return;
                }
            }
        }
    },
    figureMove:function(move) {
        // check points
        for (var i = 0; i < tetris.currentFigure.figure.length; i++) {
            var curValue = tetris.currentFigure.figure[i];
            if (parseInt(curValue.elem.style.left)+move < 0) {
                return;
            }
            if (parseInt(curValue.elem.style.left)+move > TETRIS_WIDTH-POINT_SIDE) {
                return;
            }
            for (var j = 0; j < tetris.points.length; j++) {
                var curPoint = tetris.points[j];
                if ((parseInt(curValue.elem.style.top) == curPoint.top) &&
                    (parseInt(curValue.elem.style.left)+move == curPoint.left)) {
                    return;
                }
            }
        }
        tetris.currentFigure.center.left += move;
        for (var i = 0; i < tetris.currentFigure.figure.length; i++) {
            var curValue = tetris.currentFigure.figure[i];
            curValue.elem.style.left = (parseInt(curValue.elem.style.left) + move) + 'px';
        }
    },
    moveLeft:function() {
        tetris.figureMove(-POINT_SIDE);
    },
    moveRight:function() {
        tetris.figureMove(POINT_SIDE);
    },
    getFigureColor: function () {
        return colorsFigure[Math.round(Math.random() * (colorsFigure.length - 1))];
    },
    createFigure: function () {
        tetris.currentFigure = tetris.nextFigure;
        tetris.createNextFigure();
        var poul = document.getElementById("poul");
        var center = Math.round(0.5 * COL_COUNT) - 1;
        tetris.currentFigure.center = {left: POINT_SIDE*(center+1), top:0};
        for (var i = 0; i < tetris.currentFigure.figure.length; i++) {
            var curValue = tetris.currentFigure.figure[i];
            curValue.elem = document.createElement('div');
            curValue.elem.className = "point";
            curValue.elem.style.width = POINT_SIDE + 'px';
            curValue.elem.style.height = POINT_SIDE + 'px';
            curValue.elem.style.left = POINT_SIDE * (curValue.left + center) + 'px';
            curValue.elem.style.top = POINT_SIDE * curValue.top + 'px';
            curValue.elem.style.background = tetris.currentFigure.color;
            poul.appendChild(curValue.elem);
        }
        tetris.checkEndGame();
    },
    showNext: function () {
        var next = document.getElementById("next");
        next.innerHTML = "";
        var heightMove = Math.round(0.5 * ELEMENT_HEIGHT - POINT_SIDE);
        var widthMove = Math.round(0.5 * ELEMENT_WIDTH - 1.5 * POINT_SIDE);
        for (var i = 0; i < tetris.nextFigure.figure.length; i++) {
            var curValue = tetris.nextFigure.figure[i];
            curValue.elem = document.createElement('div');
            curValue.elem.className = "point";
            curValue.elem.style.width = POINT_SIDE + 'px';
            curValue.elem.style.height = POINT_SIDE + 'px';
            curValue.elem.style.left = widthMove + POINT_SIDE * curValue.left + 'px';
            curValue.elem.style.top = heightMove + POINT_SIDE * curValue.top + 'px';
            curValue.elem.style.background = tetris.nextFigure.color;
            next.appendChild(curValue.elem);
        }

    }

}


// Cookie work
function loadRecord() {
    var result = 0;
    var allcookies = document.cookie;
    // Отыскать начало cooki-файла с именем "record"
    var pos = allcookies.indexOf("tetris=");
    // Если cookie с данным именем найден, извлечь и использовать его значение
    if (pos != -1) {
        var start = pos + 7; // Начало значения cookie
        var end = allcookies.indexOf(";", start); // Конец значения cookie
        if (end == -1) end = allcookies.length;
        var value = allcookies.substring(start, end); // Извлекаем значение
        result = decodeURIComponent(value); // Декодируем его
    }
    if (result === undefined) {
        result = 0;
    }
    return result;
}

function saveRecord(record) {
    document.cookie = "tetris=" + encodeURIComponent(record) + "; max-age=" + (10 * 60 * 60 * 24 * 365);
}

// Init boxes sizes
function initBoxes() {
    var bourder = document.getElementById("bourder");
    bourder.style.width = (TETRIS_WIDTH + ELEMENT_WIDTH + STEP_SIZE * 3) + 'px';
    bourder.style.height = (TETRIS_HEIGHT + ELEMENT_HEIGHT + STEP_SIZE * 3) + 'px';
    var poul = document.getElementById("poul");
    poul.style.width = TETRIS_WIDTH + 'px';
    poul.style.height = TETRIS_HEIGHT + 'px';
    poul.style.left = STEP_SIZE + 'px';
    poul.style.top = STEP_SIZE + 'px';
    var control = document.getElementById("control");
    control.style.width = ELEMENT_WIDTH + 'px';
    control.style.height = ELEMENT_HEIGHT + 'px';
    control.style.left = STEP_SIZE + 'px';
    control.style.top = (TETRIS_HEIGHT + STEP_SIZE * 2) + 'px';
    var next = document.getElementById("next");
    next.style.width = ELEMENT_WIDTH + 'px';
    next.style.height = ELEMENT_HEIGHT + 'px';
    next.style.left = (TETRIS_WIDTH + STEP_SIZE * 2) + 'px';
    next.style.top = STEP_SIZE + 'px';
    var score = document.getElementById("score");
    score.style.width = ELEMENT_WIDTH + 'px';
    score.style.height = ELEMENT_HEIGHT + 'px';
    score.style.left = (TETRIS_WIDTH + STEP_SIZE * 2) + 'px';
    score.style.top = (ELEMENT_HEIGHT + STEP_SIZE * 2) + 'px';
    var record = document.getElementById("record");
    record.style.width = ELEMENT_WIDTH + 'px';
    record.style.height = ELEMENT_HEIGHT + 'px';
    record.style.left = (TETRIS_WIDTH + STEP_SIZE * 2) + 'px';
    record.style.top = (ELEMENT_HEIGHT * 2 + STEP_SIZE * 3) + 'px';
    tetris.recordCurrent = loadRecord();
    paintRecord(tetris.recordCurrent);

    tetris.clearScore();
    tetris.createNextFigure();


    addEventListener("keydown", function(event) {
        if (event.keyCode == 65) {
            tetris.moveLeft();
        }
        if (event.keyCode == 68) {
            tetris.moveRight();
        }
        if (event.keyCode == 87) {
            tetris.rotate();
        }
        if (event.keyCode == 83) {
            tetris.down();
        }
    });
}

function paintRecord(value) {
    var record = document.getElementById("record");
    record.innerHTML = "record = " + tetris.recordCurrent;
}

function paintScore(value) {
    var score = document.getElementById("score");
    score.innerHTML = "score = " + value;
}

document.addEventListener("DOMContentLoaded", initBoxes);