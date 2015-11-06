// require jquery
// require game

// init
$(function() {

    var root = $('#game-root');
    var status = $('#game-status');

    function addStatus(what) {
        status.append('<div>' + what + '</div>');
        status.scrollTop(status.prop('scrollHeight'));
    }


    var endpoint = { sr: 6, sc: 0, sd: FunCoding.DirectionalObject.RIGHT, er: 5, ec: 7 };

    var obstacle = [
        [
            [0,1,1,1,1,1,1,1],
            [0,0,1,1,1,1,1,1],
            [0,0,1,1,1,1,1,1],
            [0,0,1,1,1,1,1,1],
            [0,0,1,1,1,1,1,1],
            [0,0,1,1,1,1,1,1],
            [0,0,1,1,1,1,1,1],
            [0,0,1,1,1,1,1,1],
        ], [
            [0,0,0,1,1,1,0,1],
            [1,1,0,1,1,1,0,1],
            [1,1,0,1,1,1,0,1],
            [1,1,0,1,1,1,0,1],
            [1,1,0,1,1,1,0,1],
            [1,1,0,0,0,0,0,0],
            [1,1,0,1,1,1,0,1],
            [1,1,0,1,1,1,0,1],
        ]
    ];

    function checkPosition(mode, r, c) {
        return (0 <= r && r < 8 && 0 <= c && c < 8 && obstacle[mode][r][c] == 0);
    }

    // static object
    (function() {
        new FunCoding.GameObject(
            $('<image src="asset/img/jalanan.png" style="width:800px;height:400px"/>'),
            -187.5, 187.5
        ).addTo(root);

        new FunCoding.GameObject(
            $('<img src="asset/img/Mat.png" style="width:50px;left:-15px;top:5px;"/>'),
            (endpoint.sc * 50), (endpoint.sr * 50)
        ).addTo(root);

        new FunCoding.GameObject(
            $('<image src="asset/img/point.png" style="top:10px;left:10px;width:30px"/>'),
            (endpoint.ec * 50), (endpoint.er * 50)
        ).addTo(root)
    })();


    var items = {};

    var motor = (function(r, c) {
        var tmp =
            new FunCoding.Motor(r, c, root,
                function(finish) {
                    addStatus('Menaiki Motor');
                    alert('Menaiki Motor');
                    finish();
                }
            )
        tmp.r = r;
        tmp.c = c;
        return tmp;
    })(0, 0);

    var key = (function(r, c) {
        var tag = FunCoding.uniqueTag(items);
        return items[[r,c].join()] = items[tag] =
            new FunCoding.KunciMerah(r, c, root, tag,
                function(finish) {
                    addStatus('Kunci motor berhasil diambil');
                    alert('Kunci motor diambil');
                    finish();
                },
                function(retVal) {
                    if(player.r == motor.r && player.c == motor.c) {
                        if(retVal) retVal[0] = true;
                        return FunCoding.paraller([
                            motor.take(),
                            player.setMode(1)
                        ]);
                    }
                }
            )
    })(7, 1);

    var moves = {};

    moves[[endpoint.er, endpoint.ec].join()] = function(retVal) {
        player.freeze = true;
        if(retVal) retVal[0] = true;
        return FunCoding.sequence([
            player.majuAnim(),
            function(finish) {
                finish();
                addStatus([
                    'Menuju Supermarket <br>',
                    '<strong>Game Selesai, silahakan ke level selanjutnya</strong>'
                ].join(''));
                window.location = "level3.html";
                // alert('Game Selesai, silahkan lanjut ke level selanjutnya');
            },
        ]);
    }

    var lampuMerah = new FunCoding.LampuMerah(5, 6, root, 10, 7, Math.floor(Math.random() * 10), function(r, c, what) {
        obstacle[1][r][c] = what ? 0 : 1;
    });

    var lampuMerah2 = new FunCoding.LampuMerah(5, 2, root, 10, 7, Math.floor(Math.random() * 10), function(r, c, what) {
        obstacle[1][r][c] = what ? 0 : 1;
    });

    var player = new FunCoding.Player(
        new FunCoding.DirectionalObject(FunCoding.Player.getNormalFace()).addTo(root),
        endpoint.sr, endpoint.sc, endpoint.sd
    );
    player.normalFace = player.obj;
    player.bikerFace = new FunCoding.DirectionalObject(
        FunCoding.Player.getBikerFace()
    ).addTo(root).hide();
    player.mode = 0;
    player.setMode = function(mode) {
        var thiz = this;
        this.mode = mode;
        return function(finish) {
            setTimeout(function() {
                thiz.obj.hide();
                var x = thiz.obj.x;
                var y = thiz.obj.y;
                var d = thiz.obj.d;
                thiz.obj = mode == 1 ? thiz.bikerFace.show() : thiz.normalFace.show();
                thiz.obj.x = x;
                thiz.obj.y = y;
                thiz.obj.d = d;
                finish();
            }, FunCoding.STEP_SPEED);
        }
    }

    function updater() {
        return FunCoding.paraller([
            (player.r == lampuMerah.r && player.c == lampuMerah.c) ? null :lampuMerah.update(),
            (player.r == lampuMerah2.r && player.c == lampuMerah2.c) ? null :lampuMerah2.update(),
            FunCoding.delay(FunCoding.STEP_SPEED),
        ]);
    }


    addStatus([
        '<strong>Game Mulai. Silahkan buka folder <i>solusi</i> dan <i>edit</i> File <i>level2_solusi.js</i></strong><br>',
        'Berada di baris ', player.r + 1, ', kolom ', player.c + 1 ,
        ', menghadap ', ["utara", "barat", "selatan", "timur"][player.d]
    ].join(''));

    var controller = new FunCoding.Controller(player, items, moves, updater);
    var queue = new FunCoding.AnimationQueue();
    FunCoding.registerAPI(
        window,
        controller,
        queue,
        function() {
            return checkPosition(player.mode, player.r, player.c);
        },
        function() {
            var dd = FunCoding.DirectionalObject.dd;
            return !player.freeze && checkPosition(player.mode, player.r + dd[player.d].y, player.c + dd[player.d].x);
        },
        addStatus,
        alert
    );

    window.ambil = function() {
        if(player.freeze) return;
        var tmp = [];
        queue.add(FunCoding.sequence([
            controller.ambil(tmp),
            function(finish) {
                if(!tmp[0]) addStatus('Ooops, Tidak bisa');
                finish();
            }
        ]));
        return tmp[1];
    }

    window.gunakan = function(tag) {
        if(player.freeze) return;
        var tmp = [];
        queue.add(FunCoding.sequence([
            controller.gunakan(tag, tmp),
            function(finish) {
                if(!tmp[0]) addStatus('Ooops, Tidak bisa');
                finish();
            }
        ]));
        return tmp[0];
    }

    FunCoding.includeScript('solusi/level2_solusi.js');

    queue.start(updater);
});
