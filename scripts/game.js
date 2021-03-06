﻿var restartGame = function (e) {
    if (gameOver) {
        var rect = canvas.getBoundingClientRect();
        var click = { x: e.clientX - rect.left, y: e.clientY - rect.top, w: 2, h: 2 }
        if (hittest(restarImageSize, click)) {
            bombArray = [];
            explosionArray = [];
            staticBlockArray = [];
            nonStBlockArray = [];
            powerUpArray = []; 
            gameOver = false;
            winner = null;
            song.pause();
            song.currentTime = 0;
            restartGameInit();
        }
    }
}

function restartGameInit() {
    initPlayer();
    initEnvironment();
    initBlocks();
    initPowerups();
}

var checkPowerUps = function (player) {
    var result = false;
    for (var i = 0; i < powerUpArray.length; ++i) {
        if (hittest(powerUpArray[i], player)) {
            result = powerUpArray[i];
        }
    }

    if (result) {
        powerUpArray.splice(powerUpArray.indexOf(result), 1);
        
        var collectSound = new Audio(collectUrl);
        collectSound.play();

        switch (result.type) {
            case "bombAdd":
                ++player.avalibleBombs;
                break;
            case "bombUp":
                ++player.explosionSize;
                break;
            case "speedUp":
                player.speed += 1;
                break;
        }
    }

    return result;
}


var playerOnBomb = function (player, playerTest) {
    var result = true;
    if (player.onBomb != null) {
        if (!hittest(player, player.onBomb)) {
            player.onBomb = null;
        }
        var diffBomb = checkHitWithBomb(playerTest);
        if (diffBomb && diffBomb != player.onBomb) {
            result = false;
        }
    } else {
        result = !checkHitWithBomb(playerTest);
    }
    return result;
}


var bombExplode = function (bomb, player) {
    if (!gameOver) {
        var currentBomb = bombArray.shift();
        ++player.avalibleBombs;
        explosion(currentBomb, player);
    }
}



var explosion = function (bomb, player, iteration = 0, up = true, down = true, left = true, right = true, createdBombs = []) {
    try {      
        if (!gameOver) {
            if (iteration == 0) {
                var newExplosion = { image: explosionImage, x: bomb.x, y: bomb.y, w: blockSize, h: blockSize };
                explosionArray.push(newExplosion);
                createdBombs.push(newExplosion);
                checkHitWithPlayer(newExplosion);
            }
            else {
                var newExplosion;
                for (var i = 0; i < 4; ++i) {
                    var addExplosion = false;
                    switch (i) {
                        case 0:
                            if (right) {
                                newExplosion = { image: explosionImage, x: bomb.x + (blockSize * iteration), y: bomb.y, w: blockSize, h: blockSize };
                                if (checkHitWithStaticBlock(newExplosion)) {
                                    right = false;
                                } else {
                                    addExplosion = true;
                                    if (destroyBlocks(newExplosion)) {
                                        right = false;
                                    } else {
                                        checkHitWithPlayer(newExplosion);
                                    }
                                }
                            }
                            break;
                        case 1:
                            if (left) {
                                newExplosion = { image: explosionImage, x: bomb.x - (blockSize * iteration), y: bomb.y, w: blockSize, h: blockSize };
                                if (checkHitWithStaticBlock(newExplosion)) {
                                    left = false;
                                } else {
                                    addExplosion = true;
                                    if (destroyBlocks(newExplosion)) {
                                        left = false;
                                    } else {
                                        checkHitWithPlayer(newExplosion);
                                    }
                                }
                            }
                            break;

                        case 2:
                            if (down) {
                                newExplosion = { image: explosionImage, x: bomb.x, y: bomb.y + (blockSize * iteration), w: blockSize, h: blockSize };
                                if (checkHitWithStaticBlock(newExplosion)) {
                                    down = false;
                                } else {
                                    addExplosion = true;
                                    if (destroyBlocks(newExplosion)) {
                                        down = false;
                                    } else {
                                        checkHitWithPlayer(newExplosion);
                                    }
                                }
                            }
                            break;
                        case 3:
                            if (up) {
                                newExplosion = { image: explosionImage, x: bomb.x, y: bomb.y - (blockSize * iteration), w: blockSize, h: blockSize };
                                if (checkHitWithStaticBlock(newExplosion)) {
                                    up = false;
                                } else {
                                    addExplosion = true;
                                    if (destroyBlocks(newExplosion)) {
                                        up = false;
                                    } else {
                                        checkHitWithPlayer(newExplosion);
                                    }
                                }
                            }
                            break;

                    }
                    if (addExplosion) {
                        if (!checkHitWithStaticBlock(newExplosion)) {
                            explosionArray.push(newExplosion);
                            createdBombs.push(newExplosion);
                            var explosionSound = new Audio(explosionUrl);
                            explosionSound.play();
                        }
                    }
                }
            }
            if (iteration < player.explosionSize) {
                setTimeout(function () { explosion(bomb, player, ++iteration, up, down, left, right, createdBombs); }, 50);
            } else {
                setTimeout(function () { removeExplosion(createdBombs); }, 500);
            }
        }
    } catch (e) {
        //Wyjątek przy restarcie a nie chce mi sie ściągać timeoutów
    }
}

var removeExplosion = function (createdBombs) {
    if (!gameOver) {
        for (var i = 0; i < createdBombs.length; ++i) {
            explosionArray.splice(explosionArray.indexOf(createdBombs[i]), 1);
        }
    }
}


var destroyBlocks = function (explosion) {
    var blockToDestroy = false;
    if (blockToDestroy = checkHitWithNonStBlock(explosion)) {
        nonStBlockArray.splice(nonStBlockArray.indexOf(blockToDestroy), 1);
    }
    return blockToDestroy;
}

var checkHitWithPlayer = function (explosion) {
    if (hittest(player1, explosion)) {
        win(player2);
    } else if (hittest(player2, explosion)) {
        win(player1);
    }
}


var win = function (player) {

    song.play();

    gameOver = true;
    winner = player;
}


var hittest = function (a, b) {
    if (((a.x < (b.x + b.w)) && ((a.x + a.w) > b.x) && (a.y < (b.y + b.h)) && ((a.y + a.h) > b.y))) {
        return true;
    } else {
        return false;
    }
}


var checkHitWithStaticBlock = function (a) {
    var result = false;
    for (var i = 0; i < staticBlockArray.length; ++i) {
        if (hittest(staticBlockArray[i], a)) {
            return staticBlockArray[i];
        }
    }
    return result;
}

var checkHitWithNonStBlock = function (a) {
    var result = false;
    for (var i = 0; i < nonStBlockArray.length; ++i) {
        if (hittest(nonStBlockArray[i], a)) {
            return nonStBlockArray[i];
        }
    }
    return result;
}


var checkHitWithBlock = function (a) {
    var result = false;
    result = checkHitWithStaticBlock(a);
    if (!result) {
        result = checkHitWithNonStBlock(a);
    }
    return result;
}

var checkBombMovement = function (a) {
    var result = false;
    result = checkHitWithBomb(a);

    return result;
}



var checkHitWithBomb = function (a) {
    var result = false;
    for (var i = 0; i < bombArray.length; ++i) {
        if (hittest(bombArray[i], a)) {
            return bombArray[i];
        }
    }
    return result;
}




var initEnvironment = function () {
    var k = 0;
    for (var j = 0; j < Math.floor((gameHeight / blockSize) / 2); ++j) {
        for (var i = 0; i < Math.floor((gameHeight / blockSize) / 2); ++i) {
            staticBlockArray[k++] = { image: staticBlockImage, x: (i * (blockSize * 2) + blockSize), y: (j * (blockSize * 2) + blockSize), w: blockSize, h: blockSize };
        }
    }
}

var initBlocks = function () {
    var k = 0;
    for (var j = 0; j < gameHeight / blockSize; ++j) {
        for (var i = 0; i < gameHeight / blockSize; ++i) {
            if ((i * blockSize > (blockSize) || (j * blockSize > blockSize) && (j * blockSize < gameHeight - (blockSize * 2))) && (i * blockSize) < (gameHeight - (blockSize * 2)) || (j * blockSize > blockSize) && (j * blockSize < gameHeight - (blockSize * 2))) {
                var curX = i * blockSize;
                var curY = j * blockSize;
                var newStBlock = { image: nonStBlockImage, x: curX, y: curY, w: blockSize, h: blockSize };

                if (!checkHitWithStaticBlock(newStBlock)) {
                    nonStBlockArray[k++] = newStBlock;
                }
            }
        }
    }
}


var initPowerups = function () {
    var k = 0;
    for (var j = 0; j < gameHeight / blockSize; ++j) {
        for (var i = 0; i < gameHeight / blockSize; ++i) {
            if ((i * blockSize > (blockSize) || (j * blockSize > blockSize) && (j * blockSize < gameHeight - (blockSize * 2))) && (i * blockSize) < (gameHeight - (blockSize * 2)) || (j * blockSize > blockSize) && (j * blockSize < gameHeight - (blockSize * 2))) {
                var curX = i * blockSize;
                var curY = j * blockSize;
                if (Math.floor(Math.random() * 3) == 1) {
                    var newPowerUp;
                    switch (Math.floor(Math.random() * 3)) {
                        case 0:
                            newPowerUp = { image: bombAddImage, x: curX, y: curY, w: blockSize, h: blockSize, type: "bombAdd" };
                            break;
                        case 1:
                            newPowerUp = { image: bombUpImage, x: curX, y: curY, w: blockSize, h: blockSize, type: "bombUp" };
                            break;
                        case 2:
                            newPowerUp = { image: speedUpImage, x: curX, y: curY, w: blockSize, h: blockSize, type: "speedUp" };
                            break;
                    }
                    if (!checkHitWithStaticBlock(newPowerUp)) {
                        powerUpArray[k++] = newPowerUp;
                    }
                }
            }
        }
    }
}

var drawPowerUps = function () {
    for (var i = 0; i < powerUpArray.length; i++) {
        context.drawImage(powerUpArray[i].image, powerUpArray[i].x, powerUpArray[i].y, powerUpArray[i].w, powerUpArray[i].h);
    }
}


var drawStaticBlock = function () {
    for (var i = 0; i < staticBlockArray.length; i++) {
        context.drawImage(staticBlockArray[i].image, staticBlockArray[i].x, staticBlockArray[i].y, staticBlockArray[i].w, staticBlockArray[i].h);
    }
}

var drawNonStaticBlock = function () {
    for (var i = 0; i < nonStBlockArray.length; i++) {
        context.drawImage(nonStBlockArray[i].image, nonStBlockArray[i].x, nonStBlockArray[i].y, nonStBlockArray[i].w, nonStBlockArray[i].h);
    }
}

var drawBombs = function () {
    for (var i = 0; i < bombArray.length; i++) {
        context.drawImage(bombArray[i].image, bombArray[i].x, bombArray[i].y, bombArray[i].w, bombArray[i].h);
    }
}

var drawExplosions = function () {
    for (var i = 0; i < explosionArray.length; i++) {
        context.drawImage(explosionArray[i].image, explosionArray[i].x, explosionArray[i].y, explosionArray[i].w, explosionArray[i].h);
    }
}


var drawPlayers = function () {
    context.drawImage(player1.image, player1.x, player1.y, player1.w, player1.h);
    context.drawImage(player2.image, player2.x, player2.y, player2.w, player2.h);
}

var drawWinner = function () {
    var winImage;
    switch (winner) {
        case player2:
            winImage = player2WinImage;
            break;
        case player1:
            winImage = player1WinImage;
            break;
    }
    context.fillStyle = "#808080";
    context.fillRect(gameWidth / 5, gameHeight / 5, (gameWidth / 5) * 3, (gameHeight / 5) * 3);
    context.drawImage(winImage, (gameWidth / 2) - 4 * (winImageSize.w / 10), (gameHeight / 2) - 5 * (winImageSize.h / 6), winImageSize.w, winImageSize.h);
    context.drawImage(restartImage, restarImageSize.x, restarImageSize.y, restarImageSize.w, restarImageSize.h);
}


var render = function () {
    context.drawImage(bgImage, 0, 0);

    drawStaticBlock();
    drawPowerUps();
    drawNonStaticBlock();
    drawBombs();
    drawPlayers();
    drawExplosions();

    if (gameOver) {
        drawWinner();
    }
}

function main() {
    render();
    keysUpdate();
    requestAnimationFrame(main);
};


function startGame() {
    initPlayer();
    initEnvironment();
    initBlocks();
    initPowerups();
    main();
}