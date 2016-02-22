class Square {
    node: HTMLElement;
    piece: Piece;
    toRemove: Square[] = [];
    constructor(public board: Board, public color: string, public row: number, public column: number, piece?: string) {
        this.node = document.createElement("div");
        this.node.className = "square " + this.color;
        if ((this.row + this.column) % 2 == 1) {
            this.piece = new Piece(piece ? piece : "hidden");
            this.node.appendChild(this.piece.node);
            this.node.onclick = () => {
                if (this.node.classList.contains("highlighted")) {
                    this.board.moveTo(this);
                } else {
                    this.board.showMoves(this);
                }
            };
        }
    }
    is(color: string) {
        return this.piece.color === color;
    }
    otherPlayer() {
        if (this.is("hidden")) {
            return "hidden";
        }
        return this.is("red") ? "black" : "red";
    }
    setPiece(color: string) {
        this.piece.node.classList.remove("red");
        this.piece.node.classList.remove("black");
        this.piece.node.classList.remove("hidden");
        this.piece.color = color;
        this.piece.node.classList.add(color);
    }
}

class Piece {
    node: HTMLElement;
    constructor(public color: string) {
        this.node = document.createElement("div");
        this.node.className = "piece " + this.color;
    }
}

class Board {
    currentPlayer = "red";
    squares: Square[][] = [];
    length = 8;
    moving: Square;
    jumpPieces: Square[] = [];
    constructor(public node: HTMLElement) {
        for (var i = 0; i < this.length; i++) {
            var row: Square[] = [];
            for (var j = 0; j < this.length; j++) {
                var squareColor = (i + j) % 2 == 0 ? "red" : "black";
                var pieceColor = "hidden";
                if ((i + j) % 2 == 1) {
                    if (i < 3) {
                        pieceColor = "black";
                    } else if (i >= 5) {
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
    showMoves(square: Square) {
        if (! square.is(this.currentPlayer) || (this.moving && this.moving !== square)) {
            return;
        }
        if (this.moving === square) {
            this.clearMoves();
            return;
        }
        var canPlay = this.checkJumps(square);
        if (! canPlay) {
            canPlay = this.checkMoves(square);
            // no other piece can jump
            this.squares.forEach((row) => {
                row.filter(square => square.piece && square.is(this.currentPlayer)).forEach((square) => {
                    if (this.checkJumps(square)) {
                        canPlay = false;
                    }
                });
            });
        }
        if (canPlay) {
            this.moving = square;
            document.getElementById("moving").textContent = square.row + " " + square.column;
        } else {
            this.moving = null;
            this.clearMoves();
            document.getElementById("moving").textContent = "none";
        }
    }
    checkMoves(square: Square) {
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
    }
    checkJumps(square: Square) {
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
    }
    clearMoves() {
        this.squares.forEach((row) => {
            row.forEach((square) => {
                square.toRemove = [];
                square.node.classList.remove("highlighted");
            });
        });
        this.moving = null;
        document.getElementById("moving").textContent = "none";
    }
    highlight(square: Square) {
        square.node.classList.add("highlighted");
    }
    moveTo(square: Square) {
        square.setPiece(this.moving.piece.color);
        this.moving.setPiece("hidden");
        square.toRemove.forEach((square) => {
            square.setPiece("hidden");
        });
        this.clearMoves();
        this.currentPlayer = square.otherPlayer();
        document.getElementById("current-player").textContent = this.currentPlayer;
    }
}

new Board(document.getElementById("board"));
