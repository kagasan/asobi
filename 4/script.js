$(window).on('load',function(){    
    const game = new Game();
});

class Game{
    constructor() {
        const _self = this;

        // ゲームは終了していない
        _self.endFlag = false;
        
        _self.firstPlayer = 1;
        _self.turnPlayer = 1;
        _self.playerColor = 1;
        _self.board = [];
        for (let i = 1; i <= 8; i++) {
            const row = [];
            row.push(3);
            for (let j = 1; j <= 7; j++) {
                if (i === 1 || i === 8) {
                    row.push(3);
                } else {
                    row.push(0);
                }
            }
            row.push(3);
            _self.board.push(row);
        }

        // put
        for (let i = 1; i <= 7; i++) {
            $(`#put${i}`).on('click', function(){
                _self.put(i);
            });
        }

        // ターンプレイヤー変更
        $("#radio1a").on('click', function(){_self.changeFirst(1);});
        $("#radio1b").on('click', function(){_self.changeFirst(2);});

        $("#radio2a").on('click', function(){_self.changePlayerColor(1);});
        $("#radio2b").on('click', function(){_self.changePlayerColor(2);});


        // リセットボタン
        $("#resetBtn").on('click', function(){_self.resetGameBoard();});

        // 盤面初期化
        $("#resetBtn").click();
    }
    changeFirst(num = 1) {
        const _self = this;
        _self.firstPlayer = num;
        _self.resetGameBoard();
    }
    changeTebanText(txt = "あなたの手番です") {
        $("#tebanText").text(txt);
    }
    setRecommend(num = 0) {
        num = parseInt(num);
        $("#recommend").find("th").find("i").hide();
        if(1 <= num && num <= 7) {
            $("#recommend").find("th").eq(num - 1).find("i").show();

        } else {
            $(".spinner-border").show();
        }
    }

    // putボタン
    put(num = 0) {
        const _self = this;
        num = parseInt(num);
        if (_self.endFlag) return;
        if (_self.board[6][num] !== 0) return;
        for (let y = 1; y <= 6; y++) {
            if(_self.board[y][num] === 0) {
                _self.board[y][num] = _self.turnPlayer;
                _self.fillCell(num, y);
                _self.changeTurnPlayer();
                break;
            }
        }
        _self.eval();
    }

    // 盤面をクリアする
    resetGameBoard() {
        const _self = this;
        for (let i = 1; i <= 6; i++) {
            for (let j = 1; j <= 7; j++) {
                _self.board[i][j] = 0;
            }
        }
        $("tbody").find("td").removeClass();
        _self.endFlag = false;
        _self.changeTurnPlayer(_self.firstPlayer);
        _self.eval();
    }

    /**
     * ターンプレイヤーを変更する
     * num
     * 0 : 次のプレイヤーに変更
     * 1 : あなたに変更
     * 2 : 相手に変更
     */
    changeTurnPlayer(num = 0) {
        const _self = this;
        num = parseInt(num);
        if (num === 1) {
            _self.turnPlayer = 1;
            _self.changeTebanText("あなたの手番です");
        } else if (num === 2) {
            _self.turnPlayer = 2;
            _self.changeTebanText("相手の手番です");
        } else {
            if (_self.turnPlayer === 1) {
                _self.turnPlayer = 2;
                _self.changeTebanText("相手の手番です");
            } else {
                _self.turnPlayer = 1;
                _self.changeTebanText("あなたの手番です");
            }
        }
    }

    // cellを塗る
    fillCell(x, y) {
        const _self = this;
        const $cell = $("#cells").find("tr").eq(6 - y).find("td").eq(x - 1);
        if (_self.turnPlayer === 1) {
            if (_self.playerColor === 1) $cell.addClass("red-cell");
            else $cell.addClass("yellow-cell");
        } else {
            if (_self.playerColor === 1) $cell.addClass("yellow-cell");
            else $cell.addClass("red-cell");
        }
    }

    // cellを整える
    changePlayerColor(color) {
        const _self = this;
        if (_self.playerColor === color) return;
        _self.playerColor = color;
        for (let y = 1; y <= 6; y++) {
            for (let x = 1; x <= 7; x++) {
                const $cell = $("#cells").find("tr").eq(6 - y).find("td").eq(x - 1);
                if ($cell.hasClass("red-cell")) {
                    $cell.removeClass();
                    $cell.addClass("yellow-cell");
                } else if ($cell.hasClass("yellow-cell")) {
                    $cell.removeClass();
                    $cell.addClass("red-cell");
                }
            }
        }
    }

    eval() {
        const _self = this;
        let fullfill = true;
        let winner = 0;
        const dx = [0, 1, 1, 1, 0, -1, -1, -1];
        const dy = [1, 1, 0, -1, -1, -1, 0, 1];
        for (let y = 1; y <= 6; y++) {
            for (let x = 1; x <= 7; x++) {
                if (_self.board[y][x] === 0) {
                    fullfill = false;
                    continue;
                }
                for (let i = 0; i < 8; i++) {
                    let lineFlag = true;
                    for (let j = 0; j < 4; j++) {
                        const ny = y + dy[i] * j;
                        const nx = x + dx[i] * j;
                        if (_self.board[y][x] !== _self.board[ny][nx]) {
                            lineFlag = false;
                            break;
                        }
                    }
                    if (lineFlag) {
                        winner = _self.board[y][x];
                    }
                }
            }
        }
        if (fullfill && winner === 0) {
            _self.changeTebanText("引き分けです");
            _self.endFlag = true;
            return;
        }
        if (winner === 1) {
            _self.changeTebanText("あなたの勝ちです");
            _self.endFlag = true;
            return;
        }
        if (winner === 2) {
            _self.changeTebanText("相手の勝ちです");
            _self.endFlag = true;
            return;
        }
        _self.calculateRecommend();
    }
    calculateRecommend() {
        const _self = this;
        let maxScore = -100;
        let maxX = 0;
        _self.setRecommend();
        for (let X = 1; X <= 7; X++) {
            if (_self.board[6][X] !== 0)continue;
            let score = 0;
            for (let i = 0; i < 500; i++) {
                const tmpBoard = [];
                let pl = _self.turnPlayer;
                for (let y = 0; y < 8; y++) {
                    const row = [];
                    for (let x = 0; x < 9; x++) {
                        row.push(_self.board[y][x]);
                    }
                    tmpBoard.push(row);
                }
                function tmpPut(num = 0) {
                    const cols = [1, 2, 3, 4, 5, 6, 7];
                    for (let step = 0; step < 100; step++) {
                        const j = Math.floor( Math.random() * 6);
                        const k = Math.floor( Math.random() * 6);
                        let tmp = cols[j];
                        cols[j] = cols[k];
                        cols[k] = tmp;
                    }
                    // for (let j = 6; j > 0; j--) {
                    //     const k = Math.floor( Math.random() * j);
                    //     let tmp = cols[j];
                    //     cols[j] = cols[k];
                    //     cols[k] = tmp;
                    // }
                    cols.push(num);
                    for (let j = 7; j >= 0; j--) {
                        if(cols[j] === 0)continue;
                        if (tmpBoard[6][cols[j]] !== 0)continue;
                        for (let k = 1; k <= 6; k++) {
                            if(tmpBoard[k][cols[j]] === 0) {
                                tmpBoard[k][cols[j]] = pl;
                                break;
                            }
                        }
                        break;
                    }
                    if (pl === 1)pl = 2;
                    else pl = 1;
                }
                function tmpEval() {
                    let fullfill = true;
                    let winner = 0;
                    const dx = [0, 1, 1, 1, 0, -1, -1, -1];
                    const dy = [1, 1, 0, -1, -1, -1, 0, 1];            
                    for (let y = 1; y <= 6; y++) {
                        for (let x = 1; x <= 7; x++) {
                            if (tmpBoard[y][x] === 0) {
                                fullfill = false;
                                continue;
                            }
                            for (let k = 0; k < 8; k++) {
                                let lineFlag = true;
                                for (let j = 0; j < 4; j++) {
                                    const ny = y + dy[k] * j;
                                    const nx = x + dx[k] * j;
                                    if (tmpBoard[y][x] !== tmpBoard[ny][nx]) {
                                        lineFlag = false;
                                        break;
                                    }
                                }
                                if (lineFlag) {
                                    winner = tmpBoard[y][x];
                                }
                            }
                        }
                    }
                    if (winner === 1) return 1;
                    if (winner === 2) return 2;
                    if (fullfill) return 3;
                    return 0;
                }
                tmpPut(X);
                for (let j = 0; j < 42; j++) {
                    const ev = tmpEval();
                    if (ev === 0) {
                        tmpPut();
                        continue;
                    }
                    if (ev === _self.turnPlayer) {
                        score++;
                    }
                    break;
                }
                // console.log(tmpBoard);
            }
            // console.log(X, score);
            if (maxScore < score) {
                maxScore = score;
                maxX = X;
            }
        }
        _self.setRecommend(maxX);
    }
};
