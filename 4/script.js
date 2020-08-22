$(window).on('load',function(){    
    const app = new App();
});

class Game{
    constructor(game) {
        const _self = this;
        _self.reset();
        if (game) {
            _self.turn = game.turn;
            for (let y = 1; y <= 6; y++) {
                for (let x = 1; x <= 7; x++) {
                    _self.board[y][x] = game.board[y][x] + 0;
                }
            }
            _self.winner = game.winner + 0;
            _self.turnPlayer = game.turnPlayer + 0;
        }
    }
    reset() {
        const _self = this;
        _self.turn = 1;
        _self.board = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]
        ];
        _self.winner = 0;
        _self.turnPlayer = 1;
    }
    show() {
        const _self = this;
        console.log(`turn player : ${_self.turnPlayer}`);
        console.log(`winner : ${_self.winner}`);
        for (let y = 6; y >= 1; y--) {
            let row = y + ":";
            for (let x = 1; x <= 7; x++) row += _self.board[y][x];
            console.log(row);
        }
    }
    endCheck() {
        const _self = this;
        for (let x = 1; x <= 7; x++) {
            if (_self.board[6][x] === 0) break;
            if (x === 7) {
                _self.winner = 3;
                return 3;
            }
        }
        const dx = [0, 1, 1, 1, 0, -1, -1, -1];
        const dy = [1, 1, 0, -1, -1, -1, 0, 1];
        for (let y = 1; y <= 6; y++) {
            for(let x = 1; x <= 7; x++) {
                if (_self.board[y][x] === 0) continue;
                for (let d = 0; d < 8; d++) {
                    for (let i = 1; i <= 3; i++) {
                        const nx = x + i * dx[d];
                        const ny = y + i * dy[d];
                        if (_self.board[y][x] !== _self.board[ny][nx]) {
                            break;
                        }
                        if (i === 3) {
                            _self.winner = _self.board[y][x] + 0;
                            return _self.winner + 0;
                        }
                    }
                }
            }
        }
        return 0;
    }
    canPut(x) {
        const _self = this;
        if (_self.winner !== 0)return false;
        return _self.board[6][x] === 0;
    }
    put(X) {
        const _self = this;
        if (!_self.canPut(X)) return;
        for (let y = 1; y <= 6; y++) {
            if (_self.board[y][X] === 0) {
                _self.board[y][X] = _self.turnPlayer;
                break;
            }
        }
        _self.endCheck();
        if (_self.winner === 0) {
            _self.turnPlayer = 3 - _self.turnPlayer;
            _self.turn++;
        }
    }
    autoPlay() {
        const _self = this;
        while (_self.winner === 0) {
            const x = 1 + Math.floor( Math.random() * 7);
            if (_self.canPut(x))_self.put(x);
        }
        return _self.winner + 0;
    }
    eval(step = 500) {
        const _self = this;
        const res = [0, 0, 0, 0];
        for (let i = 0; i < step; i++) {
            const simu = new Game(_self);
            res[simu.autoPlay()]++;
        }
        return res;
    }
    evalHand(player = null, depth = 0, limit = 0, step = 50) {
        const _self = this;
        if (!player) player = _self.turnPlayer + 0;
        const res = [0, 0, 0, 0, 0, 0, 0, 0];
        for (let x = 1; x <= 7; x++) {
            if (!_self.canPut(x)) {
                continue;
            }
            const simu = new Game(_self);
            simu.put(x);
            if (depth === limit) {
                res[x] = simu.eval(step)[player];
            } else{
                const tmp = simu.evalHand(3 - player, depth + 1, limit, step);
                let mx = 0;
                for (let i = 1; i <= 7; i++) {
                    if (mx < tmp[i]) mx = tmp[i] + 0;
                }
                res[x] = step - mx;
            }
        }
        return res;
    }
};

class App{
    constructor() {
        const _self = this;
        _self.game = new Game();
        const _game = _self.game;
        _self.history = [];
        _self.player = 1;
        _self.playerColor = 1;
        _self.opoEval = false;
        _self.evalLimit = 0;
        _self.evalStep = 50;
        
        $("#put1").on('click', function(){_self.put(1)});
        $("#put2").on('click', function(){_self.put(2)});
        $("#put3").on('click', function(){_self.put(3)});
        $("#put4").on('click', function(){_self.put(4)});
        $("#put5").on('click', function(){_self.put(5)});
        $("#put6").on('click', function(){_self.put(6)});
        $("#put7").on('click', function(){_self.put(7)});
        $("#resetBtn").on('click', function(){_self.reset()});
        $("#backBtn").on('click', function(){_self.back()});
        $("#radio1a").on('click', function(){_self.player = 1;_self.reset()});
        $("#radio1b").on('click', function(){_self.player = 2;_self.reset()});
        $("#radio2a").on('click', function(){_self.playerColor = 1;_self.show()});
        $("#radio2b").on('click', function(){_self.playerColor = 2;_self.show()});
        $("#radio3a").on('click', function(){_self.opoEval = false;});
        $("#radio3b").on('click', function(){_self.opoEval = true;});
        $("#radio4a").on('click', function(){_self.evalLimit = 0;_self.evalStep = 100;if(_game.turn === 1)_self.recommend();});
        $("#radio4b").on('click', function(){_self.evalLimit = 1;_self.evalStep = 100;if(_game.turn === 1)_self.recommend();});
        $("#radio4c").on('click', function(){_self.evalLimit = 2;_self.evalStep = 50;if(_game.turn === 1)_self.recommend();});
        $("#radio4d").on('click', function(){_self.evalLimit = 3;_self.evalStep = 50;if(_game.turn === 1)_self.recommend();});

        _self.show();
    }
    reset() {
        const _self = this;
        const _game = _self.game;
        _self.history = [];
        _game.reset();
        _self.show();
    }
    back() {
        const _self = this;
        if (_self.history.length === 0) return;
        _self.game = _self.history.pop();
        _self.show();
    }
    put(x) {
        const _self = this;
        const _game = _self.game;
        if (!_game.canPut(x)) return;
        _self.history.push(new Game(_game));
        _game.put(x);
        _self.show();
    }
    changeTebanText(txt) {
        $("#tebanText").text(txt);
    }
    show() {
        const _self = this;
        const _game = _self.game;
        if (_game.winner === 0) {
            if (_game.turnPlayer === _self.player) {
                _self.changeTebanText("あなたの手番です");
            } else {
                _self.changeTebanText("相手の手番です");
            }
        }
        else if (_game.winner === 3) _self.changeTebanText("引き分けです");
        else if (_game.winner === _self.player) _self.changeTebanText("あなたの勝ちです");
        else _self.changeTebanText("相手の勝ちです");
        
        for (let y = 1; y <= 6; y++) {
            for (let x = 1; x <= 7; x++) {
                const $cell = $("#cells").find("tr").eq(6 - y).find("td").eq(x - 1);
                $cell.removeClass();
                if (_game.board[y][x] === 0) continue;
                if (_game.board[y][x] === _self.player) {
                    if (_self.playerColor === 1) $cell.addClass("red-cell");
                    else $cell.addClass("yellow-cell");
                } else {
                    if (_self.playerColor === 2) $cell.addClass("red-cell");
                    else $cell.addClass("yellow-cell");
                }
            }
        }
        _self.recommend();

    }
    recommend(){
        const _self = this;
        const _game = _self.game;
        for (let x = 1; x <= 7; x++) {
            $(`#face${x}`).show();
            $(`#put${x}`).text("put");
        }
        if (_self.player !== _game.turnPlayer) {
            if (!_self.opoEval)return;
        } else {
            
        }
        const scores = _game.evalHand(null, 0, _self.evalLimit, _self.evalStep);
        let maxX = 0;
        for (let x = 1; x <= 7; x++) {
            if (scores[maxX] < scores[x]) maxX = x;
        }
        if (maxX !== 0) {
            for (let x = 1; x <= 7; x++) {
                $(`#face${x}`).hide();
            }    
            $(`#face${maxX}`).show();
        }
        // for (let x = 1; x <= 7; x++) {
        //     $(`#put${x}`).text("" + parseInt(100 * scores[x] / _self.evalStep) + "%");
        // }
        
    }
};