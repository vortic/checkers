var Square = (function () {
    function Square(board, color, row, column, piece) {
        var _this = this;
        this.board = board;
        this.color = color;
        this.row = row;
        this.column = column;
        this.toRemove = [];
        this.node = document.createElement("div");
        this.node.className = "square " + this.color;
        if ((this.row + this.column) % 2 == 1) {
            this.piece = new Piece(piece ? piece : "hidden");
            this.node.appendChild(this.piece.node);
            this.node.onclick = function () {
                if (_this.node.classList.contains("highlighted")) {
                    _this.board.moveTo(_this);
                }
                else {
                    _this.board.showMoves(_this);
                }
            };
        }
    }
    Square.prototype.is = function (color) {
        return this.piece.color === color;
    };
    Square.prototype.otherPlayer = function () {
        if (this.is("hidden")) {
            return "hidden";
        }
        return this.is("red") ? "black" : "red";
    };
    Square.prototype.setPiece = function (color) {
        this.piece.node.classList.remove("red");
        this.piece.node.classList.remove("black");
        this.piece.node.classList.remove("hidden");
        this.piece.color = color;
        this.piece.node.classList.add(color);
    };
    return Square;
})();
var Piece = (function () {
    function Piece(color) {
        this.color = color;
        this.node = document.createElement("div");
        this.node.className = "piece " + this.color;
    }
    return Piece;
})();
var Board = (function () {
    function Board(node) {
        this.node = node;
        this.currentPlayer = "red";
        this.squares = [];
        this.length = 8;
        this.jumpPieces = [];
        for (var i = 0; i < this.length; i++) {
            var row = [];
            for (var j = 0; j < this.length; j++) {
                var squareColor = (i + j) % 2 == 0 ? "red" : "black";
                var pieceColor = "hidden";
                if ((i + j) % 2 == 1) {
                    if (i < 3) {
                        pieceColor = "black";
                    }
                    else if (i >= 5) {
                        pieceColor = "red";
                    }
                }
                var square = new Square(this, squareColor, i, j, pieceColor);
                this.node.appendChild(square.node);
                row.push(square);
            }
            this.squares.push(row);
        }
        document.getElementById("current-player").textContent = this.currentPlayer;
        document.getElementById("moving").textContent = "none";
    }
    Board.prototype.showMoves = function (square) {
        var _this = this;
        if (!square.is(this.currentPlayer) || (this.moving && this.moving !== square)) {
            return;
        }
        if (this.moving === square) {
            this.clearMoves();
            return;
        }
        var canPlay = this.checkJumps(square);
        if (!canPlay) {
            canPlay = this.checkMoves(square);
            // no other piece can jump
            this.squares.forEach(function (row) {
                row.filter(function (square) { return square.piece && square.is(_this.currentPlayer); }).forEach(function (square) {
                    if (_this.checkJumps(square)) {
                        canPlay = false;
                    }
                });
            });
        }
        if (canPlay) {
            this.moving = square;
            document.getElementById("moving").textContent = square.row + " " + square.column;
        }
        else {
            this.moving = null;
            this.clearMoves();
            document.getElementById("moving").textContent = "none";
        }
    };
    Board.prototype.checkMoves = function (square) {
        var canMove = false;
        var nextRow = this.squares[square.row + (this.currentPlayer === "red" ? -1 : 1)];
        if (nextRow) {
            var left = nextRow[square.column - 1];
            var right = nextRow[square.column + 1];
            if (left && left.is("hidden")) {
                this.highlight(left);
                canMove = true;
            }
            if (right && right.is("hidden")) {
                this.highlight(right);
                canMove = true;
            }
        }
        return canMove;
    };
    Board.prototype.checkJumps = function (square) {
        var canJump = false;
        var nextRow = this.squares[square.row + (this.currentPlayer === "red" ? -1 : 1)];
        var nextNextRow = this.squares[square.row + (this.currentPlayer === "red" ? -2 : 2)];
        if (nextRow && nextNextRow) {
            var left = nextRow[square.column - 1];
            var nextLeft = nextNextRow[square.column - 2];
            var right = nextRow[square.column + 1];
            var nextRight = nextNextRow[square.column + 2];
            if (left && left.otherPlayer() === this.currentPlayer && nextLeft && nextLeft.is("hidden")) {
                this.highlight(nextLeft);
                nextLeft.toRemove = square.toRemove.concat(left);
                if (this.checkJumps(nextLeft)) {
                    nextLeft.node.classList.remove("highlighted");
                }
                canJump = true;
            }
            if (right && right.otherPlayer() === this.currentPlayer && nextRight && nextRight.is("hidden")) {
                this.highlight(nextRight);
                nextRight.toRemove = square.toRemove.concat(right);
                if (this.checkJumps(nextRight)) {
                    nextRight.node.classList.remove("highlighted");
                }
                canJump = true;
            }
        }
        return canJump;
    };
    Board.prototype.clearMoves = function () {
        this.squares.forEach(function (row) {
            row.forEach(function (square) {
                square.toRemove = [];
                square.node.classList.remove("highlighted");
            });
        });
        this.moving = null;
        document.getElementById("moving").textContent = "none";
    };
    Board.prototype.highlight = function (square) {
        square.node.classList.add("highlighted");
    };
    Board.prototype.moveTo = function (square) {
        square.setPiece(this.moving.piece.color);
        this.moving.setPiece("hidden");
        square.toRemove.forEach(function (square) {
            square.setPiece("hidden");
        });
        this.clearMoves();
        this.currentPlayer = square.otherPlayer();
        document.getElementById("current-player").textContent = this.currentPlayer;
    };
    return Board;
})();
new Board(document.getElementById("board"));
