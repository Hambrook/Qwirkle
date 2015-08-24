<?php

    $config = array();
    $config["tile_size"]    = 50;
    $config["tile_spacing"] = 1;
    $config["board_size"]   = $config["tile_size"] * 50;
    $config["tiles"]        = [
        1 => "fa fa-circle",
        2 => "fa fa-square",
        3 => "fa fa-plus",
        4 => "fa fa-star",
        5 => "fa fa-cog",
        6 => "fa fa-times"
    ];
    $config["json"] = json_encode($config);

    function q_config($key, $notFound=false) {
    	global $config;

    	if (!array_key_exists($key, $config)) { return $notFound; }

    	return $config[$key];
    }

?><html>

<head>
    <title>Board Sandbox</title>
    <meta name="viewport" content="width=800, initial-scale=1, maximum-scale=1">
    <link rel="stylesheet" href="<?php $this->assetURL("css/styles.css") ?>" />
    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
    <link href='http://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'>
</head>
<body>
    <main id="app" class="player-active">

        <?php /*
        include("table.php");
        include("ui.php");
        include("protection.php");
        include("debug.php");
        */ ?>

        <section id="table">
            <section id="board">
                <div id="hover-tile" class="tile"></div>
                <ul id="tiles"></ul>
            </section>
        </section>

        <section id="ui">
            <aside id="player-ui">
                <h2>Your tiles</h2>
                <ul id="player-tiles"></ul>
                <ul id="player-controls">
                    <li id="player-control-done" class="fa fa-check-circle"><span>Done</span></li>
                    <li id="player-control-trade" class="fa fa-recycle"><span>Trade</span></li>
                </ul>
            </aside>
            <aside id="player-list" class="active-players">
                <h2>Players</h2>
                <ul id="players">
                    <li data-player="">Player 1<span class="meta"></span><span class="score">10</span></li>
                    <li data-player="" class="active">Player 2<span class="meta"></span><span class="score">12</span></li>
                    <li data-player="">Player 3<span class="meta"></span><span class="score">14</span></li>
                </ul>
            </aside>





            <aside id="chat-wrap">
                <form id="form-chat" class="socket-form sf-input">
                    <h2>Chat</h2>
                    <div id="chat_wrap"><ul id="chat_history"></ul></div>
                    <input type="hidden" name="act" value="input" />
                    <input id="msg" name="text" type="text" autocomplete="off" data-socket-success="clear|focus" required />
                    <input style="display:none" type="submit" value="Send" />
                </form>
            </aside>





        </section>

        <section id="protection" class="hidden">
            <form>
                <h2>This game requires a password</h2>
                <h1>Game Name</h1>
                <section class="fields">
                    <div class="field password">
                        <label for="password">Password</label>
                        <input id="password" type="password" />
                    </div>
                </section>
                <ul class="form-controls">
                    <li class="submit"><input type="submit" value="Enter" /></li>
                </ul>
            </form>
        </section>

        <section id="debug">
            <strong>Board mouse coords</strong>
            <div id="debug-coords"></div>
            <strong>Board tile coods</strong>
            <div id="row-x"></div>
            <div id="row-y"></div>
            <strong>Drag coords</strong>
            <div id="debug-drag-coords"></div>
        </section>
    </main>

    <script type="text/javascript">
        var config = <?php echo $config["json"] ?>
    </script>

    <script type="text/javascript">
        var tilesFromServer = [
            {id: 1, icon: 1, colour: 1, x:  1, y:  1},
            {id: 2, icon: 5, colour: 1, x:  2, y:  1},
            {id: 3, icon: 4, colour: 1, x:  3, y:  1},
            {id: 4, icon: 4, colour: 2, x:  3, y:  2},
            {id: 5, icon: 1, colour: 3, x:  1, y:  0},
            {id: 6, icon: 1, colour: 2, x:  1, y: -1},
            {id: 7, icon: 3, colour: 3, x:  0, y:  0},
            {id: 8, icon: 2, colour: 3, x: -1, y:  0},
            {id: 9, icon: 4, colour: 3, x:  3, y:  0}
        ];
        var playerTilesFromServer = [
            {id: 10, icon: 6, colour: 1},
            {id: 11, icon: 2, colour: 6},
            {id: 12, icon: 3, colour: 1},
            {id: 13, icon: 5, colour: 1},
            {id: 14, icon: 2, colour: 1},
            {id: 15, icon: 4, colour: 3}
        ];
        var playersFromServer = [
            {id: 1, name: "Rick",  avatar: "http://gravatar.com/avatar/9208a22897cc15155f689ec2df14122c"},
            {id: 2, name: "Nicky", avatar: "http://gravatar.com/avatar/62e274a14dc276826447e3a202800d71"},
            {id: 3, name: "Carl",  avatar: "http://gravatar.com/avatar/62e274a14dc276826447e3a202800d71"}
        ];
        var chatFromServer = [
            {id: 8, timestamp: 1234567, player: 1, msg: "Hi, everyone!"},
            {id: 9, timestamp: 1234567, player: 2, msg: "Greetings"}
        ]

        var updateQueueFromServer = {
            tiles: tilesFromServer,
            playerTiles: playerTilesFromServer,
            players: playersFromServer,
            turn: 2,
            remainingTiles: 88
        }
        var updateQueueFromServer2 = {
            tiles: [
                {id: 16, icon: 3, colour: 1, x: 0, y: 1},
                {id: 17, icon: 4, colour: 3, x: 4, y: 2}
            ]
        }
    </script>

    <script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js"></script>
    <script src="<?php $this->app["site"]->assetURL("js/chat.js") ?>"></script>

    <script src="<?php $this->assetURL("js/main.js") ?>"></script>

    <script src="<?php $this->app["site"]->assetURL("js/socket.js") ?>"></script>
    <script type="text/javascript">
        var Socket = new Socket(<?php echo sprintf(
                '"%s", "%s", "%s", "%s"',
                $this->app["config"]["socketserver.host"],
                $this->app["config"]["socketserver.path"],
                $this->project["slug"],
                $this->instance
            ) ?>);
    </script>
</body>