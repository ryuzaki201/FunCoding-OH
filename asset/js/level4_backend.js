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


    var endpoint = { sr: 5, sc: 7, sd: FunCoding.DirectionalObject.LEFT, er: 6, ec: 0 };

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
            (endpoint.ec * 50), (endpoint.er * 50)
        ).addTo(root);

    })();

    var motorImg = new FunCoding.GameObject(
        $('<img src="asset/img/Motor.png" style="left:5px;width:40px;">'),
        (0 * 50), (0 * 50)
    ).addTo(root).hide();

    var items = {};

    var motorPoint = (function(r, c){
        var tmp = new FunCoding.ExclamationMark(r, c, root, function(finish){
            addStatus('Turun dari motor');
            motorImg.show();
            finish();
        });
        var oldTake = tmp.take;
        tmp.take = function(retVal) {
            return FunCoding.paraller([
                oldTake.call(tmp),
                player.setMode(0),
            ]);
            return ;
        }
        return items[[r,c].join()] = tmp;
    })(0, 0);

    var rumahPoint = (function(r, c) {
        var tmp = new FunCoding.ExclamationMark(r, c, root);
        var oldTake = tmp.take;
        tmp.take = function(retVal) {
            return FunCoding.sequence([
                oldTake.call(tmp),
                (function(){
                    player.freeze = true;
                    if(retVal) retVal[0] = true;
                    player.d = FunCoding.DirectionalObject.LEFT;
                    player.setObjDir();
                    return player.majuAnim();
                })(),
                function(finish) {
                    finish();
                    addStatus([
                        'Masuk rumah <br>',
                        '<strong>Game Selesai, silahakan ke level selanjutnya</strong>'
                    ].join(''));
                    window.location = "level5.html";
                    // alert('Game Selesai, silahkan lanjut ke level selanjutnya');
                },
            ]);
        }
        return items[[r,c].join()] = tmp;
    })(endpoint.er, endpoint.ec);

    var moves = {};

    var lampuMerah = new FunCoding.LampuMerah(5, 6, root, 10, 7, Math.floor(Math.random() * 10), function(r, c, what) {
        obstacle[1][r][c] = what ? 0 : 1;
    });

    var lampuMerah2 = new FunCoding.LampuMerah(5, 2, root, 10, 7, Math.floor(Math.random() * 10), function(r, c, what) {
        obstacle[1][r][c] = what ? 0 : 1;
    });

    var player = new FunCoding.Player(
        new FunCoding.DirectionalObject(FunCoding.Player.getBikerFace()).addTo(root),
        endpoint.sr, endpoint.sc, endpoint.sd
    );
    player.normalFace = new FunCoding.DirectionalObject(
        FunCoding.Player.getNormalFace()
    ).addTo(root).hide();
    player.bikerFace = player.obj;
    player.mode = 1;
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
        '<strong>Game Mulai. Silahkan buka folder <i>solusi</i> dan <i>edit</i> File <i>level4_solusi.js</i></strong><br>',
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

    window.turunMotor = function() {
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

    window.masukRumah = function() {
        window.turunMotor();
    }

    FunCoding.includeScript('solusi/level4_solusi.js');

    queue.start(updater);
});
