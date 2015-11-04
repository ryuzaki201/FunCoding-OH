// require jquery

// namespace FunCoding
FunCoding = (function() {

    var STEP_SPEED = 500;

    // OOP helper
    function extendUtil(baseCls, childCls) {
        childCls.prototype = Object.create(baseCls.prototype);
        childCls.prototype.baseClass = baseCls;
        childCls.prototype.constructor = childCls;
    }

    // class AnimationQueue
    var AnimationQueue = (function() {
        function AnimationQueue(getEmptyAnimation) {
            this.queue = [];
        }

        AnimationQueue.prototype.start = function(getEmptyAnimation) {
            this.running = true;

            getEmptyAnimation = getEmptyAnimation ||
                function() {
                    return function(finish) {
                        requestAnimationFrame(finish);
                    };
                }

            var thiz = this;
            function work() {
                if(!thiz.running) return;
                (thiz.queue.shift() || getEmptyAnimation())(work);
            }
            work();

            return this;
        }

        AnimationQueue.prototype.add = function(anim) {
            if(anim) this.queue.push(anim);
            return this;
        }

        AnimationQueue.prototype.clear = function() {
            this.queue.splice(0, this.queue.length);
            return this;
        }

        AnimationQueue.prototype.stop = function() {
            this.running = false;
            return this;
        }

        AnimationQueue.prototype.running = false;

        return AnimationQueue;
    })();

    // class GameObject
    var GameObject = (function() {
        function GameObject(arr, x, y, w, h) {
            this.node = $('<div>');
            if(arr) {
                if(arr.constructor !== Array) arr = [arr];
                for(v in arr) this.node.append(arr[v]);
            }
            this.x = x || 0;
            this.y = y || 0;
            if(w && h) {
                this.w = w;
                this.h = h;
                this.overflow = false;
            }
        }

        Object.defineProperties(GameObject.prototype, {
            'x': {
                set: function(x) { 
                    //this.node.css('left', x + 'px'); 
                    var isoX = parseInt(this.node.css('left')) - 400 || 0;
                    var isoY = parseInt(this.node.css('top')) || 0;
                    var cartX = x - 12.5;
                    var cartY = (2 * isoY - isoX) / 2;
                    var newIsoX = cartX - cartY;
                    var newIsoY = (cartX + cartY) / 2;
                    this.node.css('left', (newIsoX + 400) + 'px');
                    this.node.css('top', newIsoY + 'px');

                },
                get: function() { 
                    //return parseInt(this.node.css('left'));
                    var isoX = parseInt(this.node.css('left')) - 400;
                    var isoY = parseInt(this.node.css('top'));
                    return (2 * isoY + isoX) / 2; 
                } 
            },

            'y': {
                set: function(y) { 
                    //this.node.css('top', y + 'px'); 
                    var isoX = parseInt(this.node.css('left')) - 400 || 0;
                    var isoY = parseInt(this.node.css('top')) || 0;
                    var cartX = (2 * isoY + isoX) / 2;
                    var cartY = y + 12.5;
                    var newIsoX = cartX - cartY;
                    var newIsoY = (cartX + cartY) / 2;
                    this.node.css('left', (newIsoX + 400) + 'px');
                    this.node.css('top', newIsoY + 'px');
                },
                get: function() { 
                    //return parseInt(this.node.css('top'));
                    var isoX = parseInt(this.node.css('left')) - 400;
                    var isoY = parseInt(this.node.css('top'));
                    return (2 * isoY - isoX) / 2; 
                } 
            },

            'w': {
                set: function(w) { this.node.css('width', (w * 2) + 'px'); },
                get: function() { return parseInt(this.node.css('width')) / 2; } },

            'h': {
                set: function(h) { this.node.css('height', h + 'px'); },
                get: function() { return parseInt(this.node.css('height')); } },

            'overflow': {
                set: function(overflow) { this.node.css('overflow', overflow?'normal':'hidden'); },
                get: function() { return this.node.css('overflow') == 'normal'; } },
        });

        GameObject.prototype.addTo = function(node) {
            this.node.appendTo(node);
            return this;
        }

        GameObject.prototype.remove = function() {
            this.node.remove();
            return this;
        }

        GameObject.prototype.show = function() {
            this.node.show();
            return this;
        }

        GameObject.prototype.hide = function() {
            this.node.hide();
            return this;
        }

        GameObject.prototype.setPosition = function(x, y, time, cb) {
            if(time) {
                var isoX = x - y;
                var isoY = (x + y) / 2;
                this.node.animate({
                    left: isoX + 400,
                    top:  isoY,
                }, time, cb);
            } else {
                this.node.x = x;
                this.node.y = y;
            }

            return this;
        }

        return GameObject;
    })();

    // class DirectionalObject extend GameObject
    var DirectionalObject = (function() {
        function DirectionalObject(dNodes, d) {
            d = d || 0;
            this.dNodes = dNodes;
            this.baseClass.call(this, this.dNodes);
            this.d = d;
        }

        extendUtil(GameObject, DirectionalObject);

        DirectionalObject.UP = 0;
        DirectionalObject.LEFT = 1;
        DirectionalObject.DOWN = 2;
        DirectionalObject.RIGHT = 3;
        DirectionalObject.leftOf = function(x) { return x == 3 ? 0 : x + 1; }
        DirectionalObject.rightOf = function(x) { return x == 0 ? 3 : x - 1; }
        DirectionalObject.dd = [
            {x:0,  y:-1},
            {x:-1, y:0},
            {x:0,  y:+1},
            {x:+1, y:0},
        ];

        DirectionalObject.prototype._d = 0;

        Object.defineProperties(GameObject.prototype, {
            'd': {
                set: function(d) {
                    this._d = d;
                    for(v in this.dNodes) {
                        if(v == this._d) this.dNodes[v].show();
                        else             this.dNodes[v].hide();
                    }
                },
                get: function() { return this._d; } },
        });

        return DirectionalObject;
    })();

    function includeScript(src) {
        var script = document.createElement('script');
        script.type = "text/javascript"
        script.src = src;
        var head = document.getElementsByTagName('head')[0];
        head.appendChild(script);
    }

    function randomTag() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for(var i = 0; i < 12; ++i) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }

    function uniqueTag(list) {
        var tmp;
        do {
            tmp = randomTag();
        } while(list[tmp]);
        return tmp;
    }


    // -----------------------------------------------------------//

    var dd = DirectionalObject.dd;

    var Item = (function() {
        function Item(obj, name, tag, takeAnimCb, useCb) {
            this.obj = obj;
            this.name = name;
            this.tag = tag;
            this.takeAnimCb = takeAnimCb;
            this.useCb = useCb;
        }

        Item.prototype.take = function(retVal) {
            var thiz = this;

            thiz.taken = true;
            if(retVal) {
                retVal[0] = true;
                retVal[1] = thiz.tag;
            }
            return sequence([
                delay(STEP_SPEED/2),
                function(finish) {
                    thiz.obj.remove();
                    finish();
                },
                delay(STEP_SPEED/2),
                thiz.takeAnimCb,
            ]);
        }

        Item.prototype.use = function(retVal) {
            if(this.taken && this.useCb) return this.useCb(retVal);
        }

        Item.prototype.taken = false;

        return Item;
    })();

    var KunciKuning = (function() {
        function KunciKuning(r, c, root, tag, takeAnimCb, useCb) {
            this.baseClass.call(this,
                new GameObject(
                    $('<image src="asset/img/kunci.png" style="top:5px;left:5px;width:40px"/>'),
                    (c * 50), (r * 50)
                ).addTo(root),
                "Kunci Kuning", tag, takeAnimCb, useCb
            )

        }

        extendUtil(Item, KunciKuning);

        return KunciKuning;
    })();

    var KunciBiru = (function() {
        function KunciBiru(r, c, root, tag, takeAnimCb, useCb) {
            this.baseClass.call(this,
                new GameObject(
                    $('<image src="asset/img/kunci2.png" style="top:5px;left:5px;width:40px"/>'),
                    (c * 50), (r * 50)
                ).addTo(root),
                "Kunci Biru", tag, takeAnimCb, useCb
            )

        }

        extendUtil(Item, KunciBiru);

        return KunciBiru;
    })();

    var KunciMerah = (function() {
        function KunciMerah(r, c, root, tag, takeAnimCb, useCb) {
            this.baseClass.call(this,
                new GameObject(
                    $('<image src="asset/img/kunci3.png" style="top:5px;left:5px;width:40px"/>'),
                    (c * 50), (r * 50)
                ).addTo(root),
                "Kunci Merah", tag, takeAnimCb, useCb
            )

        }

        extendUtil(Item, KunciMerah);

        return KunciMerah;
    })();

    var ExclamationMark = (function() {
        function ExclamationMark(r, c, root, takeAnimCb, useCb) {
            this.baseClass.call(this,
                new GameObject(
                    $('<image src="asset/img/point.png" style="top:0px;left:0px;width:50px"/>'),
                    (c * 50), (r * 50)
                ).addTo(root),
                undefined, undefined, takeAnimCb, useCb
            )

        }

        extendUtil(Item, ExclamationMark);

        return ExclamationMark;
    })();

    var Motor = (function() {
        function Motor(r, c, root, takeAnimCb, useCb) {
            this.baseClass.call(this,
                new GameObject(
                    $('<img src="asset/img/Motor.png" style="left:5px;width:40px;">'),
                    (c * 50), (r * 50)
                ).addTo(root),
                undefined, undefined, takeAnimCb, useCb
            );

        }

        extendUtil(Item, Motor);

        return Motor;
    })();

    var LampuMerah = (function() {
        function LampuMerah(r, c, root, total, split, start, changeCb) {
            this.r = r;
            this.c = c;
            this.redFace = $('<svg height="50" width="50"><circle cx="25" cy="25" r="7" fill="red"/></svg>');
            this.greenFace = $('<svg height="50" width="50"><circle cx="25" cy="25" r="7" fill="green"/></svg>').hide();
                this.obj = new FunCoding.GameObject(
                [this.redFace, this.greenFace],
                (c * 50), (r * 50)
            ).addTo(root);
            this.total = total;
            this.split = split;
            this.counter = start;
            this.changeCb = changeCb;
            if(this.counter >= this.split) {
                this.setGreen();
                this.changeCb(this.r, this.c, true);
            } else {
                this.changeCb(this.r, this.c, false);
            }
        }

        LampuMerah.prototype.update = function() {
            var thiz = this;
            thiz.counter++;
            if(thiz.counter == thiz.total) {
                thiz.counter = 0;
                thiz.changeCb(thiz.r, thiz.c, false);
                return function(finish) {
                    setTimeout(function() {
                        thiz.setRed();
                        finish();
                    }, STEP_SPEED)
                }
            } else if(thiz.counter == thiz.split) {
                thiz.changeCb(thiz.r, thiz.c, true);
                return function(finish) {
                    setTimeout(function() {
                        thiz.setGreen();
                        finish();
                    }, STEP_SPEED)
                }
            }
        }

        LampuMerah.prototype.setRed = function() {
            this.redFace.show();
            this.greenFace.hide();
        }

        LampuMerah.prototype.setGreen = function() {
            this.redFace.hide();
            this.greenFace.show();
        }

        return LampuMerah;
    })();

    var Player = (function() {
        function Player(obj, r, c, d) {
            this.obj = obj;
            this.r = r;
            this.c = c;
            this.d = d;
            this.freeze = false;
            this.setObjPos();
            this.setObjDir();
        }

        Player.prototype.setObjPos = function(r, c) {
            if(r == undefined) r = this.r;
            if(c == undefined) c = this.c;
            this.obj.y = r * 50;
            this.obj.x = c * 50;
            return this;
        }

        Player.prototype.setObjDir = function(d) {
            if(d == undefined) d = this.d;
            this.obj.d = d;
            return this;
        }

        Player.prototype.majuAnim = function() {
            var thiz = this;
            var r = thiz.r, c = thiz.c, d = thiz.d;
            return function(finish) {
                thiz.setObjPos(r, c).setObjDir(d).obj.setPosition(
                    thiz.obj.x + (dd[d].x * 50),
                    thiz.obj.y + (dd[d].y * 50),
                    STEP_SPEED, finish);
            };
        }

        Player.prototype.diam = function(retVal) {
            if(this.freeze) return;
            if(retVal) retVal[0] = true;
            return function(finish) {
                setTimeout(finish, STEP_SPEED);
            }
        }

        Player.prototype.maju = function(checker, retVal) {
            if(this.freeze) return;

            var thiz = this;
            var br = thiz.r, bc = thiz.c;

            thiz.r += dd[thiz.d].y;
            thiz.c += dd[thiz.d].x;

            if(retVal) {
                retVal[1] = thiz.r;
                retVal[2] = thiz.c;
            }

            thiz.freeze = !checker();
            if(this.freeze) {
                if(retVal) retVal[0] = false;
                thiz.r -= dd[thiz.d].y;
                thiz.c -= dd[thiz.d].x;
            } else if(retVal) retVal[0] = true;

            var r = thiz.r, c = thiz.c, d = thiz.d;
            if(this.freeze) {
                return sequence([
                    function(finish) {
                        thiz.setObjPos(br, bc).obj.setPosition(
                            thiz.obj.x + (dd[d].x * 33),
                            thiz.obj.y + (dd[d].y * 33),
                            STEP_SPEED/2, finish
                        );
                    },
                    function(finish) {
                        thiz.obj.setPosition(
                            thiz.obj.x - (dd[d].x * 33),
                            thiz.obj.y - (dd[d].y * 33),
                            STEP_SPEED/2, finish
                        );
                    },
                    function(finish) {
                        thiz.setObjPos(r, c);
                        finish();
                    }
                ]);
            } else {
                return sequence([
                    function(finish) {
                        thiz.setObjPos(br, bc);
                        thiz.obj.setPosition(
                            thiz.obj.x + (dd[d].x * 50),
                            thiz.obj.y + (dd[d].y * 50),
                            STEP_SPEED, finish
                        );
                    },
                    function(finish) {
                        thiz.setObjPos(r, c);
                        finish();
                    }
                ]);
            }
        }

        Player.prototype.belok = function(kanan, retVal) {
            if(this.freeze) return;
            if(retVal) retVal[0] = true;

            var thiz = this;
            thiz.d = kanan ?
                     DirectionalObject.rightOf(thiz.d) :
                     DirectionalObject.leftOf(thiz.d);

            var r = thiz.r, c = thiz.c, d = thiz.d;
            return sequence([
                delay(STEP_SPEED/2),
                function(finish) {
                    thiz.setObjDir(d);
                    finish();
                },
                delay(STEP_SPEED/2),
            ]);
        }

        Player.getNormalFace = function() {
            return [
                $('<img style="height:50px;left:12px;top:-20px;" src="asset/img/Orang_up.png"/>'),
                $('<img style="height:50px;left:12px;top:-20px;" src="asset/img/Orang_left.png"/>'),
                $('<img style="height:50px;left:12px;top:-20px;" src="asset/img/Orang_down.png"/>'),
                $('<img style="height:50px;left:12px;top:-20px;" src="asset/img/Orang_right.png"/>'),
            ];
        }

        Player.getBikerFace = function() {
            return [
                $('<img style="height:50px;left:12px;top:-20px;" src="asset/img/Motor_up.png"/>'),
                $('<img style="height:50px;left:12px;top:-20px;" src="asset/img/Motor_left.png"/>'),
                $('<img style="height:50px;left:12px;top:-20px;" src="asset/img/Motor_down.png"/>'),
                $('<img style="height:50px;left:12px;top:-20px;" src="asset/img/Motor_right.png"/>'),
            ];
        }

        return Player;
    })();

    var Controller = (function() {
        function Controller(player, items, moves, updater) {
            this.player = player;
            this.items = items || {};
            this.moves = moves || {};
            this.updater = updater || function() {};
        }

        Controller.prototype.diam = function(retVal) {
            var thiz = this;
            var tmp = [];
            if(!thiz.player.freeze) {
                tmp.push(thiz.player.diam(retVal));
            }
            tmp.push(thiz.updater());
            return paraller(tmp);
        }

        Controller.prototype.maju = function(checker, retVal) {
            var thiz = this;
            var tmp = [];
            if(!thiz.player.freeze) {
                var majuNormal = thiz.player.maju(checker, retVal);
                var majuCb = thiz.moves[[thiz.player.r, thiz.player.c].join()];
                if(majuCb && !thiz.player.freeze) {
                    tmp.push(sequence([majuNormal, majuCb(retVal)]));
                } else {
                    tmp.push(majuNormal);
                }
            }
            tmp.push(thiz.updater());
            return paraller(tmp);
        }

        Controller.prototype.belok = function(kanan, retVal) {
            var thiz = this;
            var tmp = [];
            if(!thiz.player.freeze) {
                tmp.push(thiz.player.belok(kanan, retVal));
            }
            tmp.push(thiz.updater());
            return paraller(tmp);

        }

        Controller.prototype.ambil = function(retVal) {
            var thiz = this;
            if(thiz.player.freeze) return thiz.updater();

            return paraller([
                thiz.player.diam(),
                (function() {
                    var key = [thiz.player.r, thiz.player.c].join();
                    var item = thiz.items[key];
                    if(item) {
                        delete thiz.items[key];
                        return item.take(retVal);
                    } else {
                        return delay(STEP_SPEED);
                    }
                })(),
                thiz.updater(),
            ]);
        }

        Controller.prototype.gunakan = function(tag, retVal) {
            var thiz = this;
            if(thiz.player.freeze) return thiz.updater();

            return paraller([
                thiz.player.diam(),
                (function() {
                    var item = thiz.items[tag];
                    if(item) {
                        var tmp = item.use(retVal);
                        if(tmp) return tmp;
                    }

                    return delay(STEP_SPEED);
                })(),
                thiz.updater(),
            ]);
        }

        return Controller;
    })();

    function paraller(arr) {
        arr = arr.filter(function(x) { return x; });
        var counter = arr.length;
        return function(finish) {
            function tryFinish() {
                counter--;
                if(counter == 0) finish();
            }
            arr.forEach(function(x) {
                x(tryFinish);
            })
        }
    }

    function sequence(arr) {
        arr = arr.filter(function(x) { return x; });
        return function(finish) {
            function work() {
                var tmp = arr.shift();
                if(tmp) {
                    tmp(work);
                } else {
                    finish();
                }
            }
            work();
        }
    }

    function delay(t) {
        return function(finish) {
            setTimeout(finish, t);
        }
    }

    function registerAPI(window, controller, queue, checker, checkerBisaMaju, addStatus, alert) {
        window.diam = function() {
            if(controller.player.freeze) return;
            var tmp = [];
            queue.add(sequence([
                controller.diam(tmp),
                function(finish) {
                    if(tmp[0]) addStatus("Diam");
                    finish();
                }
            ]));
        }

        window.maju = function() {
            if(controller.player.freeze) return;
            var tmp = []
            queue.add(sequence([
                controller.maju(checker, tmp),
                function(finish) {
                    if(tmp[0]) {
                        addStatus([
                            'Maju ke baris ', tmp[1] + 1, ', kolom ', tmp[2] + 1
                        ].join(''));
                    } else {
                        addStatus([
                            'Tidak bisa ke baris ', tmp[1] + 1, ', kolom ', tmp[2] + 1,
                             '<br><strong>Gagal</strong>'
                         ].join(''));
                        alert('Oops, tidak bisa maju');
                    }
                    finish();
                },
            ]));
        }

        window.belokKanan = function() {
            if(controller.player.freeze) return;
            var tmp = [];
            queue.add(sequence([
                controller.belok(true, tmp),
                function(finish) {
                    if(tmp[0]) addStatus("Belok Kanan");
                    finish();
                }
            ]));
        }

        window.belokKiri = function() {
            if(controller.player.freeze) return;
            var tmp = [];
            queue.add(sequence([
                controller.belok(false, tmp),
                function(finish) {
                    if(tmp[0]) addStatus("Belok Kiri");
                    finish();
                }
            ]));
        }

        Object.defineProperty(window, 'bisaMaju', {
            get: function() {
                return !controller.player.freeze && checkerBisaMaju();
            }
        });
    }


    return {
        get STEP_SPEED() {
            return STEP_SPEED;
        },
        set STEP_SPEED(x) {
            STEP_SPEED = x;
        },
        AnimationQueue: AnimationQueue,
        GameObject: GameObject,
        DirectionalObject: DirectionalObject,
        includeScript: includeScript,
        randomTag: randomTag,
        uniqueTag: uniqueTag,
        Item: Item,
        KunciKuning: KunciKuning,
        KunciBiru: KunciBiru,
        KunciMerah: KunciMerah,
        ExclamationMark: ExclamationMark,
        LampuMerah: LampuMerah,
        Player: Player,
        Motor: Motor,
        Controller: Controller,
        paraller: paraller,
        sequence: sequence,
        delay: delay,
        registerAPI: registerAPI,
    };
})();

