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

    var endpoint = { r: 7, c: 6, d: FunCoding.DirectionalObject.UP};

    var obstacle = [
        [9,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,1,0,2,0,3,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,4,0,5,0,6,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];

    function checkPosition(r, c) {
        return (0 <= r && r < 8 && 0 <= c && c < 8 && obstacle[r][c] == 0);
    }

    // static image
    (function() {
        new FunCoding.GameObject(
            $('<image style="width:800px;height:400px" src="asset/img/supermarket-lantai 8x8.png"/>'),
            -187.5, 187.5
        ).addTo(root);

        for(r in obstacle) for(c in obstacle[r]) {
            if(obstacle[r][c] == 1) {
                new FunCoding.GameObject(
                    [
                        $('<image style="top:8px;width:60px;left:-5px;" src="asset/img/table.png"/>'),
                        $('<image style="left:5px;width:40px" src="asset/img/supermarket-apel.png" />')
                    ],
                    (c * 50), (r * 50)
                ).addTo(root);
            }

            else if(obstacle[r][c] == 2) {
                new FunCoding.GameObject(
                    [
                        $('<image style="top:8px;width:60px;left:-5px;" src="asset/img/table.png"/>'),
                        $('<image style="left:5px;width:40px" src="asset/img/supermarket-gula.png" />')
                    ],
                    (c * 50), (r * 50)
                ).addTo(root);
            }

            else if(obstacle[r][c] == 3) {
                new FunCoding.GameObject(
                    [
                        $('<image style="top:8px;width:60px;left:-5px;" src="asset/img/table.png"/>'),
                        $('<image style="top:5px;left:5px;width:40px" src="asset/img/supermarket-keju.png" />')
                    ],
                    (c * 50), (r * 50)
                ).addTo(root);
            }

            else if(obstacle[r][c] == 4) {
                new FunCoding.GameObject(
                    [
                        $('<image style="top:8px;width:60px;left:-5px;" src="asset/img/table.png"/>'),
                        $('<image style="top:5px;left:5px;width:40px" src="asset/img/supermarket-margarin.png" />')
                    ],
                    (c * 50), (r * 50)
                ).addTo(root);
            }

            else if(obstacle[r][c] == 5) {
                new FunCoding.GameObject(
                    [
                        $('<image style="top:8px;width:60px;left:-5px;" src="asset/img/table.png"/>'),
                        $('<image style="left:5px;width:40px" src="asset/img/supermarket-telor.png" />')
                    ],
                    (c * 50), (r * 50)
                ).addTo(root);
            }

            else if(obstacle[r][c] == 6) {
                new FunCoding.GameObject(
                    [
                        $('<image style="top:8px;width:60px;left:-5px;" src="asset/img/table.png"/>'),
                        $('<image style="left:5px;width:40px" src="asset/img/supermarket-terong.png" />')
                    ],
                    (c * 50), (r * 50)
                ).addTo(root);
            }

            else if(obstacle[r][c] == 9) {
                new FunCoding.GameObject(
                    $('<image src="asset/img/supermarket-kasir.png" style="height:40px;"/>'),
                    (c * 50), (r * 50)
                ).addTo(root);
            }
        }

        new FunCoding.GameObject(
            $('<img src="asset/img/Mat.png" style="width:50px;left:5px;top:12px;"/>'),
            (endpoint.c * 50), (endpoint.r * 50)
        ).addTo(root)
    })();


    var items = {};

    var apelPoint = (function(r, c) {
        var obj = items[[r,c].join()] =
            new FunCoding.ExclamationMark(r, c, root,
                function(finish) {
                    addStatus('Mengambil Apel');
                    finish();
                }
            );
        obj.r = r;
        obj.c = c;
        return obj;
    })(3, 1);

    var gulaPoint = (function(r, c) {
        var obj = items[[r,c].join()] =
            new FunCoding.ExclamationMark(r, c, root,
                function(finish) {
                    addStatus('Mengambil Gula');
                    finish();
                }
            );
        obj.r = r;
        obj.c = c;
        return obj;
    })(3, 3);

    var telorPoint = (function(r, c) {
        var obj = items[[r,c].join()] =
            new FunCoding.ExclamationMark(r, c, root,
                function(finish) {
                    addStatus('Mengambil Telor');
                    finish();
                }
            );
        obj.r = r;
        obj.c = c;
        return obj;
    })(6, 3);

    var terongPoint = (function(r, c) {
        var obj = items[[r,c].join()] =
            new FunCoding.ExclamationMark(r, c, root,
                function(finish) {
                    addStatus('Mengambil Terong');
                    finish();
                }
            );
        obj.r = r;
        obj.c = c;
        return obj;
    })(6, 5);

    function clearPoint(obj) {
        items[[obj.r, obj.c].join(',')];
        return function(finish) {
            obj.obj.remove()
            finish();
        }
    }

    var kasirPoint = (function(r, c) {
        var obj = items[[r,c].join()] =
            new FunCoding.ExclamationMark(r, c, root,
                function(finish) {
                    addStatus('Belanjaan telah dibayar');
                    alert('Belanjaan telah dibayar');
                    finish();
                }
            );
        var oldTake = obj.take;
        obj.take = function(retVal) {
            return FunCoding.paraller([
                oldTake.call(obj, retVal),
                clearPoint(apelPoint),
                clearPoint(gulaPoint),
                clearPoint(telorPoint),
                clearPoint(terongPoint),
            ]);
        }
        return obj;
    })(1, 0);

    var exitPoint = (function(r, c) {
        var obj = items[[r,c].join()] =
            new FunCoding.ExclamationMark(r, c, root);
        var oldTake = obj.take;
        obj.take = function(retVal) {
            if(retVal) retVal[0] = true;

            if(apelPoint.taken && gulaPoint.taken && telorPoint.taken && terongPoint.taken) {
                player.freeze = true;
                return FunCoding.paraller([
                    oldTake.call(obj, retVal),
                    FunCoding.sequence([
                        (function(){
                            player.d = FunCoding.DirectionalObject.DOWN;
                            player.setObjDir();
                            return player.majuAnim();
                        })(),
                        function(finish) {
                            finish();
                            addStatus([
                                'Keluar <br>',
                                '<strong>Game Selesai, silahakan ke level selanjutnya</strong>'
                            ].join(''));
                            window.location = "level4.html";
                            // alert('Game Selesai, silahkan lanjut ke level selanjutnya');
                        }
                    ])
                ]);
            } else {
                return function(finish) {
                    addStatus("Belum semua belanjaan dibeli");
                    alert("Belum semua belanjaan dibeli");
                    finish();
                }
            }
        }
        return obj;
    })(endpoint.r, endpoint.c);

    var player = new FunCoding.Player(
        new FunCoding.DirectionalObject(FunCoding.Player.getNormalFace()).addTo(root),
        endpoint.r, endpoint.c, endpoint.d
    );

    addStatus([
        '<strong>Game Mulai. Silahkan buka folder <i>solusi</i> dan <i>edit</i> File <i>level3_solusi.js</i></strong><br>',
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

    window.bayar = function() {
        window.ambil();
    }

    window.keluar = function() {
        window.ambil();
    }

    FunCoding.includeScript('solusi/level3_solusi.js');
});
