$(window).on('load',function(){    
    const view = new View();
});

class Game {
    constructor (game) {
        const _self = this;
        _self.setFirstPlayer(2);
        _self.turnPlayer = 2;
        _self.turn = 1;
        _self.winner = 0;
        _self.board = [0, 4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4];
        _self.choice = [0, 1, 2, 3, 4, 5, 6, 0, 8, 9, 10, 11, 12, 13, 0];
        _self.reset();
        if (game) {
            _self.turnPlayer = game.turnPlayer + 0;
            _self.firstPlayer = game.firstPlayer + 0;
            _self.turn = game.turn + 0;
            _self.winner = game.winner + 0;
            for (let i = 0; i < 14; i++) _self.board[i] = game.board[i] + 0;
        }
    }
    setFirstPlayer (pl) {
        const _self = this;
        _self.firstPlayer = pl + 0;
        _self.reset();
    }
    reset () {
        const _self = this;
        _self.winner = 0;
        _self.turnPlayer = _self.firstPlayer + 0;
        _self.turn = 1;
        _self.board = [0, 4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4];
    }
    canPut (num) {
        const _self = this;
        if (_self.turnPlayer === 1 && 1 <= num && num <= 6 && _self.board[num] > 0) return true;
        if (_self.turnPlayer === 2 && 8 <= num && num <= 13 && _self.board[num] > 0) return true;
        return false;
    }
    put (num) {
        const _self = this;
        if (! _self.canPut(num)) return;
        _self.turn++;
        let stone = _self.board[num] + 0;
        _self.board[num] = 0;
        for (; stone > 0; stone--) {
            num = (num + 13) % 14;
            if (_self.turnPlayer === 1 && num == 7) {
                num = (num + 13) % 14;
            } else if (_self.turnPlayer === 2 && num == 0) {
                num = (num + 13) % 14;
            }
            _self.board[num] ++;
        }
        if (_self.turnPlayer === 1 && _self.board[num] === 1 && _self.board[14 - num] > 0
        && 1 <= num && num <= 6) {
            _self.board[0] += _self.board[num];
            _self.board[0] += _self.board[14 - num];
            _self.board[num] = 0;
            _self.board[14 - num] = 0;
       }
       if (_self.turnPlayer === 2 && _self.board[num] === 1 && _self.board[14 - num] > 0
        && 8 <= num && num <= 13) {
            _self.board[7] += _self.board[num];
            _self.board[7] += _self.board[14 - num];
            _self.board[num] = 0;
            _self.board[14 - num] = 0;
        }
        let opoSum = 0, youSum = 0;
        for (let i = 1; i <= 6; i++) opoSum += _self.board[i];
        for (let i = 8; i <= 13; i++) youSum += _self.board[i];
        if (opoSum === 0 || youSum === 0) {
            for (let i = 1; i <= 6; i++) _self.board[i] = 0;
            for (let i = 8; i <= 13; i++) _self.board[i] = 0;
            _self.board[0] += opoSum;
            _self.board[7] += youSum;
            if (_self.board[0] > _self.board[7]) _self.winner = 1;
            if (_self.board[0] < _self.board[7]) _self.winner = 2;
            if (_self.board[0] == _self.board[7]) _self.winner = 3;
            return; 
        }
        if (_self.turnPlayer === 1 && num === 0) return;
        if (_self.turnPlayer === 2 && num === 7) return;
        if (_self.turnPlayer === 1) _self.turnPlayer = 2;
        else _self.turnPlayer = 1;
        return;
    }
    makeChoice (firstChoice = 0) {
        const _self = this;
        _self.choice = [0, 1, 2, 3, 4, 5, 6, 0, 8, 9, 10, 11, 12, 13, firstChoice + 0];
        for (let i = 0; i < 100; i++) {
            const a = Math.floor( Math.random() * 14);
            const b = Math.floor( Math.random() * 14);
            const c = _self.choice[a] + 0;
            _self.choice[a] = _self.choice[b] + 0;
            _self.choice[b] = c + 0;
        }
    }
    autoPlay (firstChoice = 0, limit = 1000) {
        const _self = this;
        for (let flag = true; _self.turn < limit; flag = false) {
            _self.makeChoice(flag ? firstChoice : 0);
            for (let i = 14; i >= 0; i--) {
                const num = _self.choice[i] + 0;
                if (_self.canPut(num)) {
                    _self.put(num);
                    break;
                }
            }
            if (_self.winner !== 0) {
                return _self.winner + 0;
            }
        }
        return 4;
    }
    eval (pl, limit = 5000) {
        const _self = this;
        let cnt = 0;
        for (let i = 0; i < limit; i++) {
            const simu = new Game(_self);
            if (simu.autoPlay() === pl) cnt++;
        }
        return cnt;
    }

    // 14種のputについて、評価を求めます
    evalDfs (pl, depth = 0, limit = 100, root = null) {
        const _self = this;
        if (!root) root = new Game(_self);
        const childs = [];
        for (let i = 0; i < 14; i++) {
            const child = [-999999];
            if (!root.canPut(i)) {
                childs.push(child);
                continue;
            }
            const tmpNode = new Game(root);
            tmpNode.put(i);
            dfs(tmpNode);
            childs.push(child);
            function dfs(node) {
                // 勝者確定
                if (node.winner !== 0) {
                    if (node.winner === pl) child.push(node.eval(pl, limit));
                    return;
                }
                // プレイヤー交代
                if (node.turnPlayer !== root.turnPlayer) {
                    if (depth == 0) {
                        const res = _self.evalDfs(pl, depth + 1, limit, node);
                        let score = 0;
                        for (let j = 0; j < res.length; j++) {
                            if (score < res[j]) score = res[j];
                        }
                        child.push(score);
                    } else if (depth == 1) {
                        const res = _self.evalDfs(pl, depth + 1, limit, node);
                        let score = Math.abs(res[0]);
                        for (let j = 0; j < res.length; j++) {
                            if (score > Math.abs(res[j])) score = res[j];
                        }
                        child.push(score);
                    } else {
                        child.push(node.eval(pl, limit));
                    }
                    return;
                }
                // プレイヤー続行
                for (let j = 0; j < 14; j++) {
                    if (node.canPut(j)) {
                        const nextNode = new Game(node);
                        nextNode.put(j);
                        dfs(nextNode);
                    }
                }
            }
        }
        const hoge = [];
        for (let i = 0; i < 14; i++) {
            let mx = childs[i][0];
            for (let j = 0; j < childs[i].length; j++) {
                if (depth % 2 === 0) {
                    if (mx < childs[i][j]) mx = childs[i][j];
                } else {
                    if (Math.abs(mx) > Math.abs(childs[i][j])) mx = childs[i][j];
                }
            }
            hoge.push(mx);
        }
        // console.log(depth);
        // console.log(childs);
        // console.log(hoge);
        return hoge;
    }
    makeHash() {
        const _self = this;
        let str = "" + _self.turnPlayer;
        for (let i = 0; i < 14; i++) {
            str += ("," + _self.board[i]);
        }
        return str;
    }
};

class View{
    constructor () {
        const _self = this;
        _self.game = new Game();
        _self.history = [];
        _self.evalTime = 1000;
        _self.evalOpo = false;
        _self.evalYou = true;

        for (let i = 1; i <= 6; i++) {
            $(`#put${i}`).on('click', function(){_self.put(i)});
        }
        for (let i = 8; i <= 13; i++) {
            $(`#put${i}`).on('click', function(){_self.put(i)});
        }
        $("#radio1a").on('click', function(){_self.game.setFirstPlayer(2);_self.reset();});
        $("#radio1b").on('click', function(){_self.game.setFirstPlayer(1);_self.reset();});

        $("#radio2a").on('click', function(){_self.evalTime = 1000;});
        $("#radio2b").on('click', function(){_self.evalTime = 3000;});
        $("#radio2c").on('click', function(){_self.evalTime = 5000;});
        $("#radio2d").on('click', function(){_self.evalTime = 999999;});

        $("#radio3a").on('click', function(){_self.evalOpo = false;});
        $("#radio3b").on('click', function(){_self.evalOpo = true;});

        $("#radio4a").on('click', function(){_self.evalYou = false;});
        $("#radio4b").on('click', function(){_self.evalYou = true;});

        $("#resetBtn").on('click', function(){_self.reset()});
        $("#backBtn").on('click', function(){_self.back()});
        _self.reset();
    }
    show () {
        const _self = this;
        let _game = _self.game;
        for (let i = 0; i < 14; i++) {
            $(`#cell${i}`).text(_game.board[i]);
        }
        for (let i = 1; i <= 6; i++) {
            $(`#put${i}`).hide();
            $(`#face${i}`).hide();
        }
        for (let i = 8; i <= 13; i++) {
            $(`#put${i}`).hide();
            $(`#face${i}`).hide();
        }
        if (_game.winner === 0) {
            if (_game.turnPlayer === 2) $("#tebanText").text("あなたの手番です");
            else $("#tebanText").text("相手の手番です");
        } else {
            if (_game.winner === 3) $("#tebanText").text("引き分けです");
            else if (_game.winner === 2) $("#tebanText").text("あなたの勝ちです");
            else $("#tebanText").text("相手の勝ちです");
        }
        for (let i = 1; i <= 6; i++) {
            if (_game.turnPlayer !== 1) break;
            if (_game.winner !== 0) break;
            if (_game.board[i] === 0) continue;
            $(`#put${i}`).show();
        }
        for (let i = 8; i <= 13; i++) {
            if (_game.turnPlayer !== 2) break;
            if (_game.winner !== 0) break;
            if (_game.board[i] === 0) continue;
            $(`#put${i}`).show();
        }
        if (_game.winner === 0 && _game.turnPlayer === 2 && _self.evalYou) {
            if (_self.evalTime < 9999) _self.eval();
            else _self.eval2();
        }
        if (_game.winner === 0 && _game.turnPlayer === 1 && _self.evalOpo) {
            if (_self.evalTime < 9999) _self.eval();
            else _self.eval2();
        }
        // console.log(_game.evalDfs(_game.turnPlayer));
    }
    reset () {
        const _self = this;
        const _game = _self.game;
        _game.reset();
        _self.show();
    }
    back () {
        const _self = this;
        if (_self.history.length > 0) {
            _self.game = _self.history.pop();
            _self.show();
        }
    }
    put (num) {
        const _self = this;
        const _game = _self.game;
        if (_game.canPut(num)) {
            _self.history.push(new Game(_game));
            _game.put(num);
            _self.show();
        }

    }

    // 乱択
    eval () {
        const _self = this;
        const _game = _self.game;
        const results = [-999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999];
        let renderStep = 0;
        function render() {
            renderStep++;
            if (renderStep === 7) {
                $("#pbar").width("100%");
                // console.log(results);
                let mxIdx = 0;
                for (let i = 0; i < 14; i++) {
                    if (results[mxIdx] < results[i]) {
                        mxIdx = i;
                    }
                    $(`#face${i}`).hide();
                }
                $(`#face${mxIdx}`).show();        
                return;
            }
            let num = renderStep + 0;
            if (_game.turnPlayer === 2) num = 14 - num;
            $("#pbar").width(`${100 * (renderStep - 1) / 6}%`);
            if (_game.canPut(num)) { 
                function dfs (node) {
                    for (let i = 0; i < 14; i++) {
                        if (!node.canPut(i)) continue;
                        const simu2 = new Game(node);
                        simu2.put(i);
                        if (simu2.winner === 0 && simu2.turnPlayer === _game.turnPlayer) {
                            dfs(simu2);
                        } else {
                            let score = simu2.eval(_game.turnPlayer, _self.evalTime);
                            if (results[num] < score) results[num] = score;
                        }
                    }
                }
                function dfs2 (node) {
                    
                }
                const simu = new Game(_game);
                simu.put(num);
                if (simu.winner === 0 && simu.turnPlayer === _game.turnPlayer) {
                    dfs(simu);
                } else {
                    results[num] = simu.eval(_game.turnPlayer, _self.evalTime);
                }
            }
            window.requestAnimationFrame(render);
        }
        $("#pbar").width(`5%`);
        window.requestAnimationFrame(render);        
    }


    eval2 () {
        const _self = this;
        const _game = _self.game;
        $("#pbar").width(`5%`);
        window.requestAnimationFrame(function(){
            const results = _game.evalDfs(_game.turnPlayer);
            let mxIdx = 0;
            for (let i = 0; i < 14; i++) {
                if (results[mxIdx] < results[i]) {
                    mxIdx = i;
                }
                $(`#face${i}`).hide();
            }
            $(`#face${mxIdx}`).show();
            $(`#face${mxIdx}`).html(`<br>${parseInt(results[mxIdx])}%`);
            $("#pbar").width(`100%`);
        });
    }
};