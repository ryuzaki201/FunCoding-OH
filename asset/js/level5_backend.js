// require jquery
// require funcoding

// init
$(function() {
    var root = $('#game-root');
    var status = $('#game-status');

    function addStatus(what) {
        status.append('<div>' + what + '</div>');
        status.scrollTop(status.prop('scrollHeight'));
    }

    var endpoint = { sr: 0, sc: 7, sd: FunCoding.DirectionalObject.DOWN, er: 3, ec: 1 };

    var obstacle = [
        [1,1,0,0,0,1,1,0],
        [1,1,0,0,0,1,1,0],
        [0,0,0,0,0,1,1,0],
        [9,0,0,0,0,1,1,0],
        [0,0,0,0,0,0,0,0],
        [1,1,1,0,0,0,0,0],
        [1,1,1,0,0,0,0,0],
        [1,1,1,0,0,0,0,0],
    ];

    function checkPosition(r, c) {
        return (0 <= r && r < 8 && 0 <= c && c < 8 && obstacle[r][c] == 0);
    }

    // static image
    (function() {
        new FunCoding.GameObject(
            $('<image style="width:800px;height:400px" src="asset/img/Lantai_Rumah 8x8.png"/>'),
            -187.5, 187.5
        ).addTo(root);

        for(r in obstacle) for(c in obstacle[r]) {
            if(obstacle[r][c] == 1) {
                new FunCoding.GameObject(
                    $('<image style="top:8px;width:60px;left:-5px;" src="asset/img/table.png"/>'),
                    (c * 50), (r * 50)
                ).addTo(root);
            }
            if(obstacle[r][c] == 9) {
                new FunCoding.GameObject(
                    $('<image src="asset/img/Mother.png" style="height:50px;left:12px;top:-20px;"/>'),
                    (c * 50), (r * 50)
                ).addTo(root);
            }
        }

        new FunCoding.GameObject(
            $('<img src="asset/img/Mat.png" style="width:50px;left:8px;top:8px;"/>'),
            (7 * 50), (0 * 50)
        ).addTo(root)
    })();


    var items = {};

    var mamaPoint = (function(r, c) {
        var ret = items[[r,c].join()] =
            new FunCoding.ExclamationMark(r, c, root,
                function(finish) {
                    finish();
                    player.d = FunCoding.DirectionalObject.LEFT;
                    player.setObjDir();
                    addStatus([
                        'Belanja diserahkan ke mama <br>',
                        '<strong>Selamat! Kamu telah menyelesaikan tugas kamu hari ini</strong>'
                    ].join(''));
                    alert('Selamat! Kamu telah menyelesaikan tugas kamu hari ini');
                }
            );

        var oldTake = ret.take
        ret.take = function(retVal) {
            player.freeze = true;
            return oldTake.call(this, retVal);
        }

        return ret;
    })(endpoint.er, endpoint.ec);

    var player = new FunCoding.Player(
        new FunCoding.DirectionalObject(FunCoding.Player.getNormalFace()).addTo(root),
        endpoint.sr, endpoint.sc, endpoint.sd
    );

    addStatus([
        '<strong>Game Mulai. Silahkan buka folder <i>solusi</i> dan <i>edit</i> File <i>level5_solusi.js</i></strong><br>',
        'Berada di baris ', player.r + 1, ', kolom ', player.c + 1 ,
        ', menghadap ', ["utara", "barat", "selatan", "timur"][player.d]
    ].join(''));

    var controller = new FunCoding.Controller(player, items);
    var queue = new FunCoding.AnimationQueue().start();
    FunCoding.registerAPI(
        window,
        controller,
        queue,
        function() {
            return checkPosition(player.r, player.c);
        },
        function() {
            var dd = FunCoding.DirectionalObject.dd;
            return !player.freeze && checkPosition(player.r + dd[player.d].y, player.c + dd[player.d].x);
        },
        addStatus,
        alert
    );

    window.bicara = function() {
        if(player.freeze) return;
        var tmp = [];
        queue.add(FunCoding.sequence([
            controller.ambil(tmp),
            function(finish) {
                if(!tmp[0]) addStatus('Ooops, Tidak bisa');
                finish();
            }
        ]));
    }

    FunCoding.includeScript('solusi/level5_solusi.js');
});
