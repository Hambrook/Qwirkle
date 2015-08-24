var
    $currentTile,
    Board = new Board(),
    Tiles = new TileList();
    App   = new App();
    Debug = new Debug();

/**
 * APP
 *
 * Handle general application stuff
 */
function App() {
    var self = this;

    self.ProcessQueue = function(data) {
        if (data.tiles) {
            Tiles.AddTiles(data.tiles);
        }
        if (data.playerTiles) {
            Board.AddPlayerTiles(playerTilesFromServer);
        }
    }
}

/**
 * BOARD
 *
 * Handle coordinate conversions and potentially more
 */
function Board() {
    var self = this;

    self.board;

    self.init = function() {
        self.board = $("#board")
            .css({
                height: config.board_size,
                width: config.board_size,
                left: -1 * config.board_size / 2 - config.tile_size * 1.5 + $(window).width()  / 2,
                top:  -1 * config.board_size / 2 - config.tile_size * 1.5 + $(window).height() / 2
            })
            .on("mousemove", function(event) {
                Board.Hover(event, $currentTile);
            });
            $("#table").draggable();
    }

    self.Hover = function(e, tile) {
        //if ($(e.toElement).hasClass("tile")) { return; }
        if (!$currentTile) { return; }
        if ($(e.toElement).attr("id") == "hover-tile") { return; }

        var
            x       = Board.CoordScreenToTileCornerX(e.clientX),
            y       = Board.CoordScreenToTileCornerY(e.clientY),
            tileX   = Board.CoordScreenToTileX(e.clientX),
            tileY   = Board.CoordScreenToTileY(e.clientY),
            tmpTile = $currentTile;

        tmpTile.x = tileX;
        tmpTile.y = tileY;

        $("#debug-coords").html(
            "Offset: "+e.offsetX+", "+e.offsetY+
            "<br />Client: "+e.clientX+", "+e.clientY+
            "<br />Coords: "+tileX+", "+tileY+
            "<br />Tile Corner: "+x+", "+y
        );

        Tiles.hoverTile
            .toggleClass("hidden", !Tiles.Add(
                Tiles.CreateTile($currentTile, tileX, tileY),
                Tiles.VALIDATEONLY))
            .css({
                left: x,
                top: y
            });
    }

    self.AddTile = function(tile, mode) {
        Tiles.Add(tile, mode);
    }

    self.SetActiveTile = function($tile, toggle) {
        if (!$tile) {
            $("#player-tiles .tile").removeClass("active");
            return;
        }

        $tile = $($tile);

		var tile = $tile.data();
		tile.element = $tile;

        tile.element
            .siblings()
                .removeClass("active");
        if (toggle) {
            tile.element.toggleClass("active");
        } else {
            tile.element.addClass("active");
        }
        if (tile.element.hasClass("active")) {
            Board.SetHoverTile(tile);
            //Debug.Log("SET ACTIVE TILE");
            //Debug.Log(tile);
            $currentTile = tile;
        } else {
            Board.SetHoverTile ();
            $currentTile = false;
        }
    }

    self.SetHoverTile = function(tile) {
        if (!tile || !tile.element) {
            Tiles.hoverTile
                .addClass("hidden")
                .removeClass("active");
            return;
        }
        Tiles.hoverTile
            .attr("class", tile.element.attr("class"))
            .addClass("active")
            .addClass("hidden");
    }

    self.CoordScreenToTileX = function(x) {
        var pos = self.board.offset();
        return Math.ceil((x - pos.left - (config.board_size / 2)) / config.tile_size) /* + 1 - 1 */;
    }
    self.CoordScreenToTileY = function(y) {
        var pos = self.board.offset();
        return Math.ceil((y - pos.top - (config.board_size / 2)) / config.tile_size) /* + 1 - 1 */;
    }
    self.CoordScreenToTileCornerX = function(x) {
        return (self.CoordScreenToTileX(x) - 1) * config.tile_size + config.board_size / 2;
    }
    self.CoordScreenToTileCornerY = function(y) {
        return (self.CoordScreenToTileY(y) - 1) * config.tile_size + config.board_size / 2;
    }
    self.CoordTileToBoard = function(v) {
        return ((v - 1) * config.tile_size) + (config.board_size / 2);
    }

    self.AddPlayerTiles = function(tilesToLoad) {
        if (tilesToLoad.length === 0) { return; }

        setTimeout(
            function(){

                for (var i in tilesToLoad) {
                    var $tile = Tiles.CreateTile(tilesToLoad[i]);
                    //todo: change this to Tiles.Add ?

                    if ($tile) {
                        $("#player-tiles").append($tile.element);
                    } else {
                        //Debug.Log("INVALID");
                        //Debug.Log(tilesToLoad[i]);
                    }
                    delete tilesToLoad[i];

                    self.AddPlayerTiles(tilesToLoad);

                    return;
                }
            },
            100
        );
    }

    self.init();
}

/**
 * TILELIST
 *
 * Store and validate the tiles
 */
function TileList() {
    var self = this;

    self.VALIDATEONLY = 1;
    self.PENDING = 2;

    self.tiles = {};
    self.tilesPending = {};
    self.tileCount = 0;
    self.hoverTile,
    self.lastCoord,
    self.lastResult;

    self.init = function() {
        self.hoverTile = $("#hover-tile");
        $("#player-tiles")
            .sortable({
                distance: 5,
                scroll: false,
                start: function(event, ui) {
                    Board.SetActiveTile(event.toElement);
                },
                stop: function(event, ui) {
                    Debug.enabled = true;
                    Tiles.Add(
                        Tiles.CreateTile(
                            event.toElement,
                            Board.CoordScreenToTileX(event.clientX),
                            Board.CoordScreenToTileY(event.clientY)
                        ),
                        Tiles.PENDING
                    );
                    Board.SetActiveTile();
                },
                sort: function(event, ui) {
                    $("#debug-drag-coords").html(event.clientX+","+event.clientY);
                    Board.Hover(event, $(event.toElement));
                }
            })
            .disableSelection()
            .on("click", ".tile", function(){
                Board.SetActiveTile(this, true);
            });

        self.hoverTile
            .on("click", function(event){
                Debug.enabled = true;
                Board.SetActiveTile();
                Tiles.Add(
                    Tiles.CreateTile(
                        {
                            id: 0,
                            icon: $currentTile.icon,
                            colour: $currentTile.colour,
                            x: Board.CoordScreenToTileX(event.clientX),
                            y: Board.CoordScreenToTileY(event.clientY),
                        }
                    ),
                    Tiles.PENDING
                );
            });
    }

    self.Add = function(tile, mode) {
        if (!tile) {
            //Debug.Log("TILES.ADD > !tile");
            return;
        }

        var coords = tile.x+","+tile.y;

        if (!self.ValidateTile(tile, mode)) {
            Board.SetHoverTile(false);
            return false;
        }

        if (mode == self.VALIDATEONLY) {
            Board.SetHoverTile(tile);
            return true;
        }

		Debug.Log("ADDED TILE ("+tile.x+","+tile.y+")");
        tile.element
            .css({
                left: ((tile.x - 1) * config.tile_size) + (config.board_size / 2),
                top:  ((tile.y - 1) * config.tile_size) + (config.board_size / 2)
            })
            .appendTo($("#tiles"))
            .off("click");

        if (mode == self.PENDING) {
            tile.element.addClass("pending");
            Debug.Log("ADDING PENDING TILE");
            Debug.Log(tile);
            self.tilesPending[coords] = tile;
            Debug.Log(self.tilesPending[coords]);
        } else {
            self.tiles[coords] = tile;
        }
        self.tileCount++;

        return true;
    };

    self.AddTiles = function(tilesToLoad) {
        if (tilesToLoad.length === 0) { return; }

        setTimeout(
            function(){

                for (var i in tilesToLoad) {
                    var tile = self.CreateTile(tilesToLoad[i]);

                    if (!(tile && self.Add(tile))) {
                        //Debug.Log("INVALID");
                        //Debug.Log(tilesToLoad[i]);
                    }
                    delete tilesToLoad[i];

                    self.AddTiles(tilesToLoad);

                    return;
                }
            },
            100
        );
    };

    self.CreateTile = function(data, x, y) {
        // Quick hack to turn an html element into a data object if needed
        if (!data.icon || !data.colour) {
            data = $(data).data();
        }
        if (!data.icon || !data.colour) { return false; }

		if (x) { data.x = x; }
		if (x) { data.y = y; }

		if (typeof data.x == "undefined") { data.x = false; }
		if (typeof data.y == "undefined") { data.y = false; }

		if (data.x == "-0") { data.x = 0; }
		if (data.y == "-0") { data.y = 0; }

        //var tile = $("<li/>")
        data.element = $('<li data-id="'+data.id+'" data-icon="'+data.icon+'" data-colour="'+data.colour+'" data-x="'+data.x+'" data-y="'+data.y+'" />')
            .addClass("tile")
            .addClass("icon-"+data.icon)
            .addClass("colour-"+data.colour)
            .addClass(config.tiles[data.icon])
            // add data.id
            .data("icon", data.icon)
            .data("colour", data.colour)
            .data("x", data.x)
            .data("y", data.y);
        return data;
    }

    self.Get = function(x, y, pending) {
        if (typeof x == "undefined" || typeof y == "undefined") {
            return [];
        }

        var coords = x+","+y;
        //Debug.Log("FIND: "+coords);
        if (self.tiles[coords] && pending !== "force") {
            //Debug.Log("FOUND (main)");
            return self.tiles[coords];
        }
        if (self.tilesPending[coords] && (pending == "force" || pending == "allow")) {
            //Debug.Log("FOUND (pending)");
            return self.tilesPending[coords];
        }
        //Debug.Log("NOT FOUND");
        return false;
    }

    self.ValidateTile = function(tile, mode) {
        Debug.Log("VALIDATE TILE");
        Debug.Log(tile);
        var
            coords = tile.x+","+tile.y,
            axis;
        Debug.Log(coords);

        self.lastCoords = coords;

        // Ensure we're not overwriting a tile
        if (self.tiles[coords]) {
            // Already exists
            //Debug.Log("Tile Exists");
            self.lastResult = false;
            Debug.Log("TILE ALREADY EXISTS");
            return false;
        }

        // Ensure we're next to an existing tile
        var pending = (self.GetTilePendingCount() > 0) ? "force" : "allow";
        //Debug.Log(pending);
        //Debug.Log(self.GetTilePendingCount());
        if (
            self.tileCount > 0 &&
            !self.Get(tile.x+1, tile.y, pending) &&
            !self.Get(tile.x, tile.y+1, pending) &&
            !self.Get(tile.x-1, tile.y, pending) &&
            !self.Get(tile.x, tile.y-1, pending)
        ) {
            Debug.Log("Needs a pending neighbour");
            self.lastResult = false;
            return false;
        }

        // Ensure it's connected to the other pending tiles
        if (mode == Tiles.PENDING || mode == Tiles.VALIDATEONLY) {



            if (self.GetTilePendingCount() > 1) {
                var
                    axisX = {},
                    axisY = {};

                for (var k in self.tilesPending) {
                    axisX["t"+self.tilesPending[k].x] = k;
                    axisY["t"+self.tilesPending[k].y] = k;
                }

                if (Object.keys(axisX).length == 1) {
                    axis = "y"
                } else {
                    axis = "x";
                }
            }

            //Debug.Log(self.tilesPending);
            if (axis == "x" && !(self.Get(tile.x+1, tile.y, "force") || self.Get(tile.x-1, tile.y, "force"))) {
                Debug.Log("Error: Tile must be next to another pending tile on the X axis");
                //Debug.enabled = false;
                self.lastResult = false;
                return false;
            } else if (axis == "y" && !(self.Get(tile.x, tile.y+1, "force") || self.Get(tile.x, tile.y-1, "force"))) {
                Debug.Log("Error: Tile must be next to another pending tile on the Y axis");
                //Debug.enabled = false;
                self.lastResult = false;
                return false;
            }
        }

        // Get both rows and ensure this tile is allowed
        //Debug.Log("TILE: ");
        //Debug.Log(tile);
        var axisX = self.GetRow(tile.x, tile.y, false, tile);
        if (!self.ValidateRow(axisX)) {
            //Debug.Log("Validate axis X failed");
            //Debug.Log(axisX);
            //Debug.Log(tile);
            //Debug.enabled = false;
            self.lastResult = false;
            return false;
        }
        var axisY = self.GetRow(tile.x, tile.y, true, tile);
        if (!self.ValidateRow(axisY)) {
            //Debug.Log("Validate axis Y failed");
            //Debug.Log(axisY);
            //Debug.enabled = false;
            self.lastResult = false;
            return false;
        }

        self.lastResult = false;
        return true;
    }

    self.ValidateRow = function(row) {
        var
            icons   = {},
            colours = {},
            length  = row.length;
//Debug.Log("===== VALIDATE ROW =====");
//Debug.Log(row);

        row.forEach(function(data) {
            icons[data.icon] = data;
            colours[data.colour] = data;
        });

        if (
            (Object.keys(icons).length   == 1 && Object.keys(colours).length == length) ||
            (Object.keys(colours).length == 1 && Object.keys(icons).length   == length)
        ) {
            return row.length;
        }

        return false;
    }

    self.GetRow = function(x, y, vertical, tile) {
        var
            tiles = [],
            current,
            debug = [],
            modX  = 0,
            modY  = 0;

		if (typeof x == "undefined" || typeof y == "undefined") {
			return [];
		}

		if (tile) {
			tiles.push(tile);
		}
		//Debug.Log("GET ROW ("+vertical+")");
		//Debug.Log(tiles);

        // Rotate the coordinates of we're going vertical
        if (vertical) {
            modY = 1;
        } else {
            modX = 1;
        }

        currentX = x;
        currentY = y;
        while (data = self.Get((currentX-=modX), (currentY-=modY), "allow")) {
        	//Debug.Log("PREPEND TILE ("+currentX+","+currentY+")");
            tiles.unshift(data);
            var text = data.icon+"."+data.colour;
            if (data.element.hasClass("pending")) {
                text += "p";
            }
            debug.push(text);
        }
        currentX = x;
        currentY = y;
        while (data = self.Get((currentX+=modX), (currentY+=modY), "allow")) {
			//Debug.Log("APPEND TILE ("+currentX+","+currentY+")");
            tiles.push(data);
            var text = data.icon+"."+data.colour;
            if (data.element.hasClass("pending")) {
                text += "p";
            }
            debug.push(text);
            //Debug.Log(text);
        }
        if (vertical) {
            $("#row-y").text("Row Y: "+debug.join(" | "));
        } else {
            $("#row-x").text("Row X: "+debug.join(" | "));
        }
        return tiles;
    }

    self.GetTileCount = function() {
        return Object.keys(self.tiles).length;
    }

    self.GetTilePendingCount = function() {
        return Object.keys(self.tilesPending).length;
    }

    self.init();
}


/**
 * COORD
 *
 * Not used yet, but potentially for converting pairs of coordinates around
 */
function Coord(x, y, type) {
    var self = this;

    self.x    = 0;        self.origX    = 0;
    self.y    = 0;        self.origY    = 0;
    self.type = "screen"; self.origType = "screen"; // client, tile, board
    self.board;

    self.init = function(x, y, type) {
        self.x = self.origX = x;
        self.y = self.origY = y;
        if (type) {
            self.type = self.origType = type;
        }
        self.board = $("#board");
    }

    self.ToTile = function() {
        // convert coordinates to Tile
        if (self.type == "tile") {
            return self;
        }

        var boardPosition = Board.board.position();
        if (self.type == "screen") {
            self.x = Math.ceil((self.x - boardPosition.left) / config.tile_size);
            self.y = Math.ceil((self.y - boardPosition.top) / config.tile_size);
        }
    }

    self.GetX = function() {
        return self.x;
    }
    self.GetY = function() {
        return self.y;
    }

    self.init(x, y, type);
}


function Debug() {
    var self = this;
    self.enabled = false;

	self.init = function() {
		// code here
	}

    self.Log = function(v) {
        if (!self.enabled) {
            return false;
        }
        console.log(v);
    }

    self.init();
}


/**
 * INITIAL LOAD
 */
(function(){

    App.ProcessQueue(updateQueueFromServer);
    //App.ProcessQueue(updateQueueFromServer2);

})();
