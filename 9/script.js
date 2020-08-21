$(window).on('load',function(){    
    const game = new Game();
});

class Game{
    constructor() {
        const _self = this;

        _self.role = 1;
        _self.endFlag = false;
        _self.turnPlayer = 1;
        _self.turnCount = 1;
        _self.board = [1, 0, 0, 2, 0, 0, 0, 4, 3, 0, 0];
        _self.playerPath = [[], [
            [1, 4, 5], [2, 5], [6, 7],
            [0, 4, 8], [0, 5, 8], [1, 2, 6, 9, 10], [2, 7, 10], [],
            [4, 5, 9], [5, 10], [6, 7]
        ], [
            [1, 3, 4, 5], [0, 2, 5], [1, 5, 6, 7],
            [0, 4, 8], [0, 3, 5, 8], [0, 1, 2, 4, 6, 8, 9, 10], [2, 5, 7, 10], [2, 6, 10],
            [3, 4, 5, 9], [5, 8, 10], [5, 6, 7, 9]
        ]];
        _self.opponentPath = [[], [
            [3, 4], [0, 5], [1, 5, 6],
            [], [0, 3, 8], [0, 1, 4, 8, 9], [2, 5, 10], [2, 6, 10],
            [3, 4], [5, 8], [5, 6, 9]
        ], [
            [1, 3, 4, 5], [0, 2, 5], [1, 5, 6, 7],
            [0, 4, 8], [0, 3, 5, 8], [0, 1, 2, 4, 6, 8, 9, 10], [2, 5, 7, 10], [2, 6, 10],
            [3, 4, 5, 9], [5, 8, 10], [5, 6, 7, 9]
        ]];
        _self.flow = [[],
            [2, 3, 4, 1, 2, 3, 4, 5, 2, 3, 4],
            [4, 3, 2, 5, 4, 3, 2, 1, 4, 3, 2]
        ];
        
        _self.canvas = document.getElementById("canvas");
        _self.ctx = _self.canvas.getContext("2d");
        _self.changeSize(720, 400);
        _self.canvas.addEventListener("click", function(e){
            const rect = e.target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            _self.clickBoard(x, y);
        }, false);
        _self.canvas.addEventListener("mousemove", function(e){
            const rect = e.target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            // console.log(x, y);
            _self.overBoard(x, y);
        }, false);
        _self.canvas.addEventListener("mouseout", function(e){
            $("#canvas").removeClass("cursor");
        }, false);

        // ウサギと猟犬変更
        $("#radio1a").on('click', function(){_self.changeRole(1);});
        $("#radio1b").on('click', function(){_self.changeRole(2);});

        // リセットボタン
        $("#resetBtn").on('click', function(){_self.resetBoard();});

        // 盤面初期化
        $("#resetBtn").click();
    }

    changeRole(role = 1) {
        const _self = this;
        _self.role = role;
        _self.resetBoard();
    }

    resetBoard() {
        const _self = this;
        _self.endFlag = false;
        _self.turnCount = 1;
        _self.changeTurnPlayer(1);
        if (_self.role === 1) {
            _self.board = [1, 0, 0, 2, 0, 0, 0, 4, 3, 0, 0];
        } else {
            _self.board = [0, 0, 1, 4, 0, 0, 0, 2, 0, 0, 3];
        }

        _self.drawBoard();
    }

    changeTebanText(txt = "あなたの手番です") {
        $("#tebanText").text(txt);
    }
    addTebanText(txt) {
        const str = $("#tebanText").text() + txt;
        $("#tebanText").text(str);
    }

    changeTurnPlayer(num = 0) {
        const _self = this;
        num = parseInt(num);
        if (num !== 0) {
            _self.turnPlayer = num;
        } else if(_self.turnPlayer === 1) {
            _self.turnPlayer = 2;
        } else {
            _self.turnPlayer = 1;
        }
        if (_self.turnPlayer === _self.role) {
            _self.changeTebanText(`あなたの手番です(${_self.turnCount}/30)`);
        } else {
            _self.changeTebanText(`相手の手番です(${_self.turnCount}/30)`);
        }
    }
    overBoard(x, y) {
        const _self = this;
        $("#canvas").removeClass("cursor");
        for (const btn of _self.btn) {
            if (_self.checkInnerCircle(x, y, btn.circle.x, btn.circle.y, btn.circle.r)) {
                $("#canvas").addClass("cursor");
            }
        }

        const circlePosX = [200, 360, 520, 40, 200, 360, 520, 680, 200, 360, 520];
        const circlePosY = [40, 40, 40, 200, 200, 200, 200, 200, 360, 360, 360];
        const moveRabit = [[],
            [1, 2, 4, 5, 6, 7, 9, 10],
            [0, 1, 3, 4, 5, 6, 8, 9],
        ];
        if (_self.turnCount === 1) {
            for (const i of moveRabit[_self.role]) {
                if (_self.checkInnerCircle(x, y, circlePosX[i], circlePosY[i], 25)) {
                    $("#canvas").addClass("cursor");
                }
            }
        }
    }
    clickBoard(cx, cy) {
        const _self = this;
        if (_self.endFlag) {
            return;
        }
        for (const btn of _self.btn) {
            if (_self.checkInnerCircle(cx, cy, btn.circle.x, btn.circle.y, btn.circle.r)) {
                _self.action(btn.from, btn.to);
                _self.overBoard(cx, cy);
                return;
            }
        }
        const circlePosX = [200, 360, 520, 40, 200, 360, 520, 680, 200, 360, 520];
        const circlePosY = [40, 40, 40, 200, 200, 200, 200, 200, 360, 360, 360];
        const moveRabit = [[],
            [1, 2, 4, 5, 6, 7, 9, 10],
            [0, 1, 3, 4, 5, 6, 8, 9],
        ];
        if (_self.turnCount === 1) {
            for (const i of moveRabit[_self.role]) {
                if (_self.checkInnerCircle(cx, cy, circlePosX[i], circlePosY[i], 25)) {
                    for (let j = 0; j <= 10; j++) if (_self.board[j] === 4) _self.board[j] = 0;
                    _self.board[i] = 4;
                    _self.changeTurnPlayer(_self.turnPlayer);
                    _self.drawBoard();
                    return;
                }
            }
        }
    }

    action(from, to) {
        const _self = this;
        _self.board[to] = _self.board[from];
        _self.board[from] = 0;

        // ターン制限判定
        if (_self.turnCount >= 30) {
            _self.endFlag = true;
            if (_self.role === 1) {
                _self.changeTebanText("相手の勝ちです");
            } else {
                _self.changeTebanText("あなたの勝ちです");
            }
            _self.drawBoard();
            return;
        }

        // 動けない判定
        let lockFlag = true;
        for (let i = 0; i <= 10; i++) {
            if (_self.board[i] !== 4) continue;
            if (_self.turnPlayer === 1) {
                for (const to of _self.opponentPath[2][i]) {
                    if (_self.board[to] === 0)lockFlag = false;
                }
            } else {
                for (const to of _self.playerPath[2][i]) {
                    if (_self.board[to] === 0)lockFlag = false;
                }
            }
        }
        if (lockFlag) {
            _self.endFlag = true;
            if (_self.role === 1) {
                _self.changeTebanText("あなたの勝ちです");
            } else {
                _self.changeTebanText("相手の勝ちです");
            }
            _self.drawBoard();
            return;
        }
        
        // 脱出判定
        let dog = 10, rabbit = 10;
        for (let i = 0; i <= 10; i++) {
            if (_self.board[i] === 0)continue;
            if (_self.board[i] === 4) {
                rabbit = _self.flow[_self.role][i];
                continue;
            }
            const tmp = _self.flow[_self.role][i];
            if (dog > tmp) dog = tmp;
        }
        if (rabbit <= dog) {
            _self.endFlag = true;
            if (_self.role === 1) {
                _self.changeTebanText("相手の勝ちです");
            } else {
                _self.changeTebanText("あなたの勝ちです");
            }
            _self.drawBoard();
            return;
        }

        _self.turnCount++;
        _self.changeTurnPlayer();
        _self.drawBoard();
    }

    calculatePos(from, to) {
        const circlePosX = [200, 360, 520, 40, 200, 360, 520, 680, 200, 360, 520];
        const circlePosY = [40, 40, 40, 200, 200, 200, 200, 200, 360, 360, 360];
        const xa = circlePosX[from];
        const ya = circlePosY[from];
        const xb = circlePosX[to];
        const yb = circlePosY[to];
        const xd = xb - xa;
        const yd = yb - ya;
        const xn = xd / Math.sqrt(xd * xd + yd * yd);
        const yn = yd / Math.sqrt(xd * xd + yd * yd);
        const xp = parseInt(xa + 60 * xn);
        const yp = parseInt(ya + 60 * yn);
        return {x : xp, y : yp, r : 20, xn : xn, yn : yn};
    }

    addBtn() {
        const _self = this;

        
        const circlePosX = [200, 360, 520, 40, 200, 360, 520, 680, 200, 360, 520];
        const circlePosY = [40, 40, 40, 200, 200, 200, 200, 200, 360, 360, 360];
        
        _self.btn = [];
        if (_self.endFlag) {
            return;
        }
        for (let i = 0; i <= 10; i++) {
            if (_self.board[i] === 0)continue;
            if ((_self.board[i] === 4 && _self.turnPlayer === 2)
            || (_self.board[i] !== 4 && _self.turnPlayer === 1)) {
                if (_self.turnPlayer === _self.role) {
                    for (const to of _self.playerPath[_self.turnPlayer][i]) {
                        if (_self.board[to] !== 0)continue;
                        _self.btn.push({
                            from : i,
                            to : to,
                            circle : _self.calculatePos(i, to)
                        });
                    }
                } else {
                    for (const to of _self.opponentPath[_self.turnPlayer][i]) {
                        if (_self.board[to] !== 0)continue;
                        _self.btn.push({
                            from : i,
                            to : to,
                            circle : _self.calculatePos(i, to)
                        });
                    }
                }
            }
        }
    }
    drawBtn(circle, recommend = false) {
        const _self = this;
        _self.drawCircle(circle.x, circle.y, circle.r, _self.rgb(255, 255, 255), -1);
        const xa = parseInt(circle.x + 15 * circle.xn);
        const ya = parseInt(circle.y + 15 * circle.yn);
        const xb = parseInt(circle.x - 15 * circle.yn);
        const yb = parseInt(circle.y + 15 * circle.xn);
        const xb2 = parseInt(circle.x - 8 * circle.yn);
        const yb2 = parseInt(circle.y + 8 * circle.xn);
        const xc = parseInt(circle.x - 15 * circle.xn);
        const yc = parseInt(circle.y - 15 * circle.yn);
        const xd = parseInt(circle.x + 15 * circle.yn);
        const yd = parseInt(circle.y - 15 * circle.xn);
        const xd2 = parseInt(circle.x + 8 * circle.yn);
        const yd2 = parseInt(circle.y - 8 * circle.xn);
        
        if (recommend) {
            const color = _self.rgb(255, 100, 100);
            _self.drawLine(xa, ya, xb, yb, color, 3);
            _self.drawLine(xa, ya, xc, yc, color, 3);
            _self.drawLine(xa, ya, xd, yd, color, 3);

        } else {
            const color = _self.rgb(100, 100, 255);
            _self.drawLine(xa, ya, xb2, yb2, color, 3);
            _self.drawLine(xa, ya, xd2, yd2, color, 3);

        }
    }
    drawBoard() {
        const _self = this;
        _self.drawScreen(_self.rgb(100, 200, 100));
        const circlePosX = [200, 360, 520, 40, 200, 360, 520, 680, 200, 360, 520];
        const circlePosY = [40, 40, 40, 200, 200, 200, 200, 200, 360, 360, 360];
        const path = [
            [1, 3, 4, 5], [0, 2, 5], [1, 5, 6, 7],
            [0, 4, 8], [0, 3, 5, 8], [0, 1, 2, 4, 6, 8, 9, 10], [2, 5, 7, 10], [2, 6, 10],
            [3, 4, 5, 9], [5, 8, 10], [5, 6, 7, 9]
        ];
        const moveRabit = [[],
            [1, 2, 4, 5, 6, 7, 9, 10],
            [0, 1, 3, 4, 5, 6, 8, 9],
        ];
        for (let i = 0; i <= 10; i++) {
            for (let j = 0; j < path[i].length; j++) {
                const k = path[i][j];
                _self.drawLine(circlePosX[i], circlePosY[i], circlePosX[k], circlePosY[k], _self.rgb(50, 50, 50), 5);
            }
        }

        for (let i = 0; i <= 10; i++) {
            _self.drawCircle(circlePosX[i], circlePosY[i], 35, _self.rgb(50, 50, 50), -1);
            _self.drawCircle(circlePosX[i], circlePosY[i], 30, _self.rgb(255, 255, 255), -1);
            if (1 <= _self.board[i] && _self.board[i] <= 3) {
                _self.drawCircle(circlePosX[i], circlePosY[i], 25, _self.rgb(128, 128, 128), -1);

            }
        }

        if (_self.turnCount === 1) {
            for (const i of moveRabit[_self.role]) {
                _self.drawCircle(circlePosX[i], circlePosY[i], 25, _self.rgb(200, 200, 128), -1);
                _self.drawCircle(circlePosX[i], circlePosY[i], 18, _self.rgb(255, 255, 255), -1);    
            }
        }

        for (let i = 0; i <= 10; i++) {
            if (_self.board[i] === 4) {
                _self.drawCircle(circlePosX[i], circlePosY[i], 25, _self.rgb(128, 128, 0), -1);
                _self.drawCircle(circlePosX[i], circlePosY[i], 18, _self.rgb(255, 255, 255), 2);
            }
        }

        _self.addBtn();
        for (const btn of _self.btn) {
            _self.drawBtn(btn.circle);    
        }
        


        // _self.calculateRecommend();
        _self.calculateRecommend2();
    }

    // 乱択シミュレーション（弱い）
    calculateRecommend() {
        const _self = this;
        if (_self.endFlag) return;

        let bestIdx = -1, bestScore = -1;
        for (let i = 0; i < _self.btn.length; i++) {
            let score = 0;
            for (let cnt = 0; cnt < 5000; cnt++) {
                let tmpCount = _self.turnCount;
                let tmpPlayer = _self.turnPlayer;
                const tmpBoard = [];
                for (let j = 0; j <= 10; j++) tmpBoard.push(_self.board[j]);
                
                for (let step = 0; step < 35; step++) {
                    let from = -1, to = -1;
                    if (step === 0) {
                        from = _self.btn[i].from;
                        to = _self.btn[i].to;
                    }
                    const res = tmpAction(from, to);
                    if (res === 0) continue;
                    if (res === _self.turnPlayer) {
                        score++;
                    }
                    break;
                }

                function tmpAction(from = -1, to = -1) {
                    const tmpPath = [];
                    for (let j = 0; j <= 10; j++) {
                        if (tmpBoard[j] === 0)continue;
                        if ((tmpBoard[j] === 4 && tmpPlayer === 2)
                        || (tmpBoard[j] !== 4 && tmpPlayer === 1)) {
                            if (tmpPlayer === _self.role) {
                                for (const tmpTo of _self.playerPath[tmpPlayer][j]) {
                                    if (tmpBoard[tmpTo] !== 0)continue;
                                    tmpPath.push({from: j, to: tmpTo});
                                }
                            } else {
                                for (const tmpTo of _self.opponentPath[tmpPlayer][j]) {
                                    if (tmpBoard[tmpTo] !== 0)continue;
                                    tmpPath.push({from: j, to: tmpTo});
                                }
                            }
                        }
                    }
                    for (let j = tmpPath.length - 1; j > 0; j--) {
                        const k = Math.floor( Math.random() * j);
                        let tmp = tmpPath[j];
                        tmpPath[j] = tmpPath[k];
                        tmpPath[k] = tmp;
                    }
                    tmpPath.push({from: from, to: to});
                    for (let j = tmpPath.length - 1; j >= 0; j--) {
                        if (tmpPath[j].from < 0) continue;
                        const tmp = tmpBoard[tmpPath[j].to];
                        tmpBoard[tmpPath[j].to] = tmpBoard[tmpPath[j].from];
                        tmpBoard[tmpPath[j].from] = tmp;
                        break;
                    }

                    if (tmpCount >= 30) {
                        return 2;
                    }
                    
                    let tmpLockFlag = true;
                    for (let j = 0; j <= 10; j++) {
                        if (tmpBoard[j] !== 4) continue;
                        if (tmpPlayer === 1) {
                            for (const tmpTo of _self.opponentPath[2][j]) {
                                if (tmpBoard[tmpTo] === 0)tmpLockFlag = false;
                            }
                        } else {
                            for (const tmpTo of _self.playerPath[2][j]) {
                                if (tmpBoard[tmpTo] === 0)tmpLockFlag = false;
                            }
                        }
                    }
                    if (tmpLockFlag) {
                        return 1;
                    }

                    let dog = 10, rabbit = 10;
                    for (let j = 0; j <= 10; j++) {
                        if (tmpBoard[j] === 0)continue;
                        if (tmpBoard[j] === 4) {
                            rabbit = _self.flow[_self.role][j];
                            continue;
                        }
                        const tmp = _self.flow[_self.role][j];
                        if (dog > tmp) dog = tmp;
                    }
                    if (rabbit <= dog) {
                        return 2;
                    }

                    tmpCount++;
                    if (tmpPlayer === 2) tmpPlayer = 1;
                    else tmpPlayer = 2;
                    return 0;
                }
                


            }
            // console.log(_self.btn[i].from, _self.btn[i].to, score);
            if (bestScore < score) {
                bestScore = score;
                bestIdx = i;
            }
        }

        _self.drawBtn(_self.btn[bestIdx].circle, true);
    }

    // 木探索
    calculateRecommend2() {
        const _self = this;
        if (_self.endFlag) return;
        let bestWinIdx = -1, bestWinTurn = 50;
        let bestLoseIdx = 0, bestLoseTurn = 0;
        let map = {};
        for (let i = 0; i < _self.btn.length; i++) {
            let node = {
                board: [],
                turn: _self.turnCount + 0,
                player: _self.turnPlayer + 0
            };
            for (let j = 0; j <= 10; j++) {
                if (_self.board[j] === 0) node.board.push(0);
                else if (_self.board[j] === 4) node.board.push(2);
                else node.board.push(1);
            }
            const tmp = node.board[_self.btn[i].to];
            node.board[_self.btn[i].to] = node.board[_self.btn[i].from];
            node.board[_self.btn[i].from] = tmp;
            const res = dfs(node);
            if (res.winner === _self.turnPlayer) {
                if (res.turn < bestWinTurn) {
                    bestWinTurn = res.turn;
                    bestWinIdx = i;
                }
            } else {
                if (res.turn > bestLoseTurn) {
                    bestLoseTurn = res.turn;
                    bestLoseIdx = i;
                }
            }
        }
        // console.log(bestWinIdx, bestWinTurn);
        // console.log(bestLoseIdx, bestLoseTurn);
        
        function dfs(node) {
            const key = JSON.stringify(node);
            if (map[key]) {
                return map[key];
            }
            if (node.turn >= 30) {
                map[key] = {winner: 2, turn: node.turn};
                return map[key];
            }
            let tmpLockFlag = true;
            for (let j = 0; j <= 10; j++) {
                if (node.board[j] !== 2) continue;
                if (node.player === 1) {
                    for (const tmpTo of _self.opponentPath[2][j]) {
                        if (node.board[tmpTo] === 0)tmpLockFlag = false;
                    }
                } else {
                    for (const tmpTo of _self.playerPath[2][j]) {
                        if (node.board[tmpTo] === 0)tmpLockFlag = false;
                    }
                }
            }
            if (tmpLockFlag) {
                map[key] = {winner: 1, turn: node.turn};
                return map[key];
            }
            let dog = 10, rabbit = 10;
            for (let j = 0; j <= 10; j++) {
                if (node.board[j] === 0)continue;
                if (node.board[j] === 2) {
                    rabbit = _self.flow[_self.role][j];
                    continue;
                }
                const tmp = _self.flow[_self.role][j];
                if (dog > tmp) dog = tmp;
            }
            if (rabbit <= dog) {
                map[key] = {winner: 2, turn: node.turn};
                return map[key];
            }
            const nextPlayer = 3 - node.player;
            let winTurn = 50;
            let loseTurn = 0;
            map[key] = {winner:node.player, turn:30};
            for (let j = 0; j <= 10; j++) {
                if (node.board[j] === 0)continue;
                if (node.board[j] !== nextPlayer)continue;
                if (nextPlayer === _self.role) {
                    for (const tmpTo of _self.playerPath[nextPlayer][j]) {
                        if (node.board[tmpTo] !== 0)continue;
                        let next = {
                            board: [],
                            turn: node.turn + 1,
                            player: nextPlayer
                        };
                        for (let k = 0; k <= 10; k++) next.board.push(node.board[k]);
                        const tmp = next.board[tmpTo];
                        next.board[tmpTo] = next.board[j];
                        next.board[j] = tmp;
                        const res = dfs(next);
                        if (res.winner === nextPlayer) {
                            if (res.turn < winTurn) {
                                winTurn = res.turn;
                            }
                        } else {
                            if (res.turn > loseTurn) {
                                loseTurn = res.turn;
                            }
                        }
                    }
                } else {
                    for (const tmpTo of _self.opponentPath[nextPlayer][j]) {
                        if (node.board[tmpTo] !== 0)continue;
                        let next = {
                            board: [],
                            turn: node.turn + 1,
                            player: nextPlayer
                        };
                        for (let k = 0; k <= 10; k++) next.board.push(node.board[k]);
                        const tmp = next.board[tmpTo];
                        next.board[tmpTo] = next.board[j];
                        next.board[j] = tmp;
                        const res = dfs(next);
                        if (res.winner === nextPlayer) {
                            if (res.turn < winTurn) {
                                winTurn = res.turn;
                            }
                        } else {
                            if (res.turn > loseTurn) {
                                loseTurn = res.turn;
                            }
                        }
                    }
                }
            }
            if (winTurn < 50) {
                map[key] = {winner: nextPlayer, turn: winTurn};
            } else {
                map[key] = {winner: node.player, turn: loseTurn};
            }
            return map[key];
        }
        if (bestWinIdx >= 0) {
            _self.drawBtn(_self.btn[bestWinIdx].circle, true);
            if (_self.turnPlayer === 1) {
                _self.addTebanText(`［予想：${bestWinTurn}手で猟犬の勝ち見込み]`);
            } else {
                _self.addTebanText(`［予想：${bestWinTurn}手でウサギの勝ち見込み]`);
            }
        } else {
            _self.drawBtn(_self.btn[bestLoseIdx].circle, true);
            if (_self.turnPlayer === 1) {
                _self.addTebanText(`［予想：${bestLoseTurn}手でウサギの勝ち見込み]`);
            } else {
                _self.addTebanText(`［予想：${bestLoseTurn}手で猟犬の勝ち見込み]`);
            }
        }
    }

    checkInnerCircle(x, y, cx, cy, cr) {
        const w = cx - x;
        const h = cy - y;
        if (w * w + h * h > cr * cr) return false;
        return true;
    }

    rgb(r, g, b) {
        return "rgb(" + r + "," + g + "," + b + ")";
    }
    changeSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }
    drawBox(x1, y1, x2, y2, color, thickness = 1) {
        const w = x2 - x1;
        const h = y2 - y1;
        if (thickness < 0) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x1, y1, w, h);
        } else {
            this.ctx.lineWidth = thickness;
            this.ctx.strokeStyle = color;
            this.ctx.strokeRect(x1, y1, w, h);
        }
    }
    drawScreen(color) {
        this.drawBox(0, 0, this.canvas.width, this.canvas.height, color, -1);
    }
    drawCircle(x, y, r, color, thickness = 1){
        if(thickness < 0){
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, r, 0, Math.PI * 2, true);
            this.ctx.fill();
        }
        else{
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = thickness;
            this.ctx.beginPath();
            this.ctx.arc(x, y, r, 0, Math.PI * 2, false);
            this.ctx.stroke();
        }
    }
    drawLine(x1, y1, x2, y2, color = "#000000", thickness = 1){
        this.ctx.lineWidth = thickness;
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }
};