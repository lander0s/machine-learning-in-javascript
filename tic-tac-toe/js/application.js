var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("TicTacToe", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var GameContext = (function () {
        function GameContext() {
        }
        GameContext.prototype.copyFrom = function (gameContext) {
            this.state = gameContext.state;
            this.board = gameContext.board.slice();
            this.plays = gameContext.plays.slice();
            this.movementsCount = gameContext.movementsCount;
            this.winnerCondIdx = gameContext.winnerCondIdx;
        };
        return GameContext;
    }());
    var TicTacToe = (function () {
        function TicTacToe() {
            this.winningConditions = [
                [0, 1, 2],
                [3, 4, 5],
                [6, 7, 8],
                [0, 3, 6],
                [1, 4, 7],
                [2, 5, 8],
                [0, 4, 8],
                [2, 4, 6],
            ];
            this.ctxStack = [];
            this.restart();
        }
        TicTacToe.prototype.restart = function () {
            this.ctx = new GameContext();
            this.ctx.state = TicTacToe.State.Playing;
            this.ctx.movementsCount = 0;
            this.ctx.board = [];
            this.ctx.plays = [];
            this.ctx.winnerCondIdx = -1;
            for (var i = 0; i < 9; i++) {
                this.ctx.board.push(TicTacToe.Players.None);
            }
        };
        TicTacToe.prototype.getBoard = function () {
            return this.ctx.board;
        };
        TicTacToe.prototype.getHash = function () {
            return TicTacToe.getHash(this.ctx.board);
        };
        TicTacToe.getHash = function (board) {
            var hash = '';
            for (var i = 0; i < 9; i++) {
                hash += board[i].toString();
            }
            return hash;
        };
        TicTacToe.prototype.getPlaysOrder = function () {
            return this.ctx.plays;
        };
        TicTacToe.prototype.getState = function () {
            return this.ctx.state;
        };
        TicTacToe.prototype.isFinished = function () {
            return this.ctx.state != TicTacToe.State.Playing;
        };
        TicTacToe.prototype.makePlay = function (cellIndex) {
            if (this.isFinished()) {
                return;
            }
            var currentPlayer = this.getPlayersTurn();
            if (this.ctx.board[cellIndex] != TicTacToe.Players.None) {
                return false;
            }
            this.ctx.board[cellIndex] = currentPlayer;
            this.ctx.movementsCount++;
            this.ctx.plays.push(cellIndex);
            this.evaluateBoard();
            return true;
        };
        TicTacToe.prototype.getPlayersTurn = function () {
            if (this.ctx.movementsCount % 2 == 0) {
                return TicTacToe.Players.X_Player;
            }
            else {
                return TicTacToe.Players.O_Player;
            }
        };
        TicTacToe.prototype.evaluateBoard = function () {
            if (this.ctx.movementsCount < 5) {
                return;
            }
            for (var i = 0; i < this.winningConditions.length; i++) {
                var condition = this.winningConditions[i];
                if (this.ctx.board[condition[0]] != TicTacToe.Players.None &&
                    this.ctx.board[condition[0]] == this.ctx.board[condition[1]] &&
                    this.ctx.board[condition[0]] == this.ctx.board[condition[2]]) {
                    if (this.ctx.board[condition[0]] == TicTacToe.Players.O_Player) {
                        this.ctx.state = TicTacToe.State.O_Won;
                    }
                    else {
                        this.ctx.state = TicTacToe.State.X_Won;
                    }
                    this.ctx.winnerCondIdx = i;
                    return;
                }
            }
            if (this.ctx.movementsCount == 9) {
                this.ctx.state = TicTacToe.State.Draw;
            }
        };
        TicTacToe.prototype.getWinningConditionIndex = function () {
            return this.ctx.winnerCondIdx;
        };
        TicTacToe.prototype.save = function () {
            var newCtx = new GameContext();
            newCtx.copyFrom(this.ctx);
            this.ctxStack.push(this.ctx);
            this.ctx = newCtx;
        };
        TicTacToe.prototype.restore = function () {
            this.ctx = this.ctxStack.pop();
        };
        return TicTacToe;
    }());
    exports.TicTacToe = TicTacToe;
    (function (TicTacToe) {
        var State;
        (function (State) {
            State[State["Playing"] = 0] = "Playing";
            State[State["Draw"] = 1] = "Draw";
            State[State["X_Won"] = 2] = "X_Won";
            State[State["O_Won"] = 3] = "O_Won";
        })(State = TicTacToe.State || (TicTacToe.State = {}));
        var Players;
        (function (Players) {
            Players[Players["None"] = 0] = "None";
            Players[Players["X_Player"] = 1] = "X_Player";
            Players[Players["O_Player"] = 2] = "O_Player";
        })(Players = TicTacToe.Players || (TicTacToe.Players = {}));
    })(TicTacToe = exports.TicTacToe || (exports.TicTacToe = {}));
    exports.TicTacToe = TicTacToe;
});
define("Renderer", ["require", "exports", "TicTacToe"], function (require, exports, TicTacToe_1) {
    "use strict";
    exports.__esModule = true;
    var Renderer = (function () {
        function Renderer(game) {
            var _this = this;
            this.game = game;
            this.cellClickedCallback = function () { };
            this.size = 300;
            this.margin = 10;
            this.svgDoc = SVG('drawing').size(this.size, this.size);
            this.gridLineStyle = { width: 10, color: '#619196', linecap: 'butt' };
            this.circleLineStyle = { width: 10, color: '#14bdac', linecap: 'butt' };
            this.crossLineStyle = { width: 10, color: '#555', linecap: 'butt' };
            this.winnerLineStyle = { width: 10, color: '#38908f', linecap: 'butt' };
            var cellSize = (this.size / 3) | 0;
            var halfCellSize = cellSize / 2;
            var sizeMinusMargin = this.size - this.margin;
            this.svgDoc.on('click', function (e) {
                var x = (e.offsetX / cellSize) | 0;
                var y = (e.offsetY / cellSize) | 0;
                var cellIndex = y * 3 + x;
                _this.cellClickedCallback(cellIndex);
            });
            this.winningLinesParams = [
                [this.margin, cellSize * 0 + halfCellSize, sizeMinusMargin, cellSize * 0 + halfCellSize],
                [this.margin, cellSize * 1 + halfCellSize, sizeMinusMargin, cellSize * 1 + halfCellSize],
                [this.margin, cellSize * 2 + halfCellSize, sizeMinusMargin, cellSize * 2 + halfCellSize],
                [cellSize * 0 + halfCellSize, this.margin, cellSize * 0 + halfCellSize, sizeMinusMargin],
                [cellSize * 1 + halfCellSize, this.margin, cellSize * 1 + halfCellSize, sizeMinusMargin],
                [cellSize * 2 + halfCellSize, this.margin, cellSize * 2 + halfCellSize, sizeMinusMargin],
                [this.margin, this.margin, sizeMinusMargin, sizeMinusMargin],
                [sizeMinusMargin, this.margin, this.margin, sizeMinusMargin],
            ];
        }
        Renderer.prototype.draw = function () {
            var cellSize = (this.size / 3) | 0;
            this.svgDoc.clear();
            this.svgDoc.line(this.margin, cellSize, this.size - this.margin, cellSize).stroke(this.gridLineStyle);
            this.svgDoc.line(this.margin, cellSize * 2, this.size - this.margin, cellSize * 2).stroke(this.gridLineStyle);
            this.svgDoc.line(cellSize, this.margin, cellSize, this.size - this.margin).stroke(this.gridLineStyle);
            this.svgDoc.line(cellSize * 2, this.margin, cellSize * 2, this.size - this.margin).stroke(this.gridLineStyle);
            var board = this.game.getBoard();
            for (var i = 0; i < board.length; i++) {
                var y = (i / 3) | 0;
                var x = (i % 3) | 0;
                if (board[i] == TicTacToe_1.TicTacToe.Players.O_Player) {
                    this.drawCircle(x, y);
                }
                else if (board[i] == TicTacToe_1.TicTacToe.Players.X_Player) {
                    this.drawCross(x, y);
                }
            }
            var winnerLineIdx = this.game.getWinningConditionIndex();
            if (winnerLineIdx >= 0) {
                this.drawWinnerLine(this.winningLinesParams[winnerLineIdx][0], this.winningLinesParams[winnerLineIdx][1], this.winningLinesParams[winnerLineIdx][2], this.winningLinesParams[winnerLineIdx][3]);
            }
        };
        Renderer.prototype.drawCircle = function (x, y) {
            var cellSize = (this.size / 3) | 0;
            var halfCellSize = cellSize / 2;
            var cellSizeOffset = cellSize / 4;
            this.svgDoc.circle(halfCellSize)
                .move(x * cellSize + cellSizeOffset, y * cellSize + cellSizeOffset)
                .fill('none')
                .stroke(this.circleLineStyle);
        };
        Renderer.prototype.drawCross = function (x, y) {
            var cellSize = (this.size / 3) | 0;
            var halfCellSize = cellSize / 2;
            var cellSizeOffset = cellSize / 4;
            this.svgDoc.line(0, 0, halfCellSize, halfCellSize)
                .move(x * cellSize + cellSizeOffset, y * cellSize + cellSizeOffset)
                .stroke(this.crossLineStyle);
            this.svgDoc.line(halfCellSize, 0, 0, halfCellSize)
                .move(x * cellSize + cellSizeOffset, y * cellSize + cellSizeOffset)
                .stroke(this.crossLineStyle);
        };
        Renderer.prototype.drawWinnerLine = function (x1, y1, x2, y2) {
            this.svgDoc.line(x1, y1, x1, y1).stroke(this.winnerLineStyle)
                .animate({ ease: '<', duration: '0.3s' }).plot(x1, y1, x2, y2);
        };
        Renderer.prototype.onCellClicked = function (callback) {
            this.cellClickedCallback = callback;
        };
        return Renderer;
    }());
    exports.Renderer = Renderer;
});
define("AiPlayer/AiPlayer", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var AiPlayer = (function () {
        function AiPlayer() {
        }
        return AiPlayer;
    }());
    exports.AiPlayer = AiPlayer;
});
define("AiPlayer/implementations/random/RandomAiPlayer", ["require", "exports", "AiPlayer/AiPlayer", "TicTacToe"], function (require, exports, AiPlayer_1, TicTacToe_2) {
    "use strict";
    exports.__esModule = true;
    var RandomAiPlayer = (function (_super) {
        __extends(RandomAiPlayer, _super);
        function RandomAiPlayer() {
            return _super.call(this) || this;
        }
        RandomAiPlayer.prototype.train = function () {
        };
        RandomAiPlayer.prototype.play = function (board, turn, callback) {
            var emptyCellsIndices = [];
            for (var i = 0; i < 9; i++) {
                if (board[i] == TicTacToe_2.TicTacToe.Players.None) {
                    emptyCellsIndices.push(i);
                }
            }
            var cellRange = 1.0 / emptyCellsIndices.length;
            var selectedIdx = (Math.random() / cellRange) | 0;
            callback(emptyCellsIndices[selectedIdx]);
        };
        return RandomAiPlayer;
    }(AiPlayer_1.AiPlayer));
    exports.RandomAiPlayer = RandomAiPlayer;
});
define("AiPlayer/implementations/decisionTree/Node", ["require", "exports", "TicTacToe"], function (require, exports, TicTacToe_3) {
    "use strict";
    exports.__esModule = true;
    var Node = (function () {
        function Node(board) {
            this.board = board.slice();
            this.weight = 0;
            this.parents = [];
            this.children = [];
            this.winner = TicTacToe_3.TicTacToe.Players.None;
        }
        Node.prototype.addChild = function (node) {
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i].getHash() == node.getHash()) {
                    return false;
                }
            }
            this.children.push(node);
            return true;
        };
        Node.prototype.addParent = function (node) {
            for (var i = 0; i < this.parents.length; i++) {
                if (this.parents[i].getHash() == node.getHash()) {
                    return false;
                }
            }
            this.parents.push(node);
        };
        Node.prototype.getBoard = function () {
            return this.board;
        };
        Node.prototype.getHash = function () {
            return TicTacToe_3.TicTacToe.getHash(this.board);
        };
        Node.prototype.getBestMoveFor = function (player) {
            var best = this.children[0];
            for (var i = 0; i < this.children.length; i++) {
                var node = this.children[i];
                if (player == TicTacToe_3.TicTacToe.Players.X_Player) {
                    if (best.weight < node.weight) {
                        best = node;
                    }
                }
                else {
                    if (best.weight > node.weight) {
                        best = node;
                    }
                }
            }
            return best;
        };
        Node.prototype.propagateWin = function (player, value) {
            if (value === void 0) { value = 1; }
            if (player == TicTacToe_3.TicTacToe.Players.X_Player) {
                this.weight += value;
            }
            else {
                this.weight -= value;
            }
            this.parents.forEach(function (parentNode) {
                parentNode.propagateWin(player, value);
            });
        };
        return Node;
    }());
    exports.Node = Node;
});
define("AiPlayer/implementations/decisionTree/DecisionTree", ["require", "exports", "AiPlayer/implementations/decisionTree/Node", "TicTacToe"], function (require, exports, Node_1, TicTacToe_4) {
    "use strict";
    exports.__esModule = true;
    var DecisionTree = (function () {
        function DecisionTree() {
            this.hashTable = {};
            this.permutations = [];
        }
        DecisionTree.prototype.getNodes = function () {
            return this.hashTable;
        };
        DecisionTree.prototype.build = function () {
            this.initializeRootNode();
            this.permutations = this.generatePermutations([0, 1, 2, 3, 4, 5, 6, 7, 8]);
            for (var i = this.permutations.length - 1; i >= 0; i--) {
                var crtPermutation = this.permutations[i];
                var game = new TicTacToe_4.TicTacToe();
                for (var j = 0; j < crtPermutation.length; j++) {
                    var boardHashBeforeMove = game.getHash();
                    game.makePlay(crtPermutation[j]);
                    var boardHashAfterMove = game.getHash();
                    if (this.hashTable[boardHashAfterMove] == undefined) {
                        this.hashTable[boardHashAfterMove] = new Node_1.Node(game.getBoard());
                    }
                    this.hashTable[boardHashBeforeMove].addChild(this.hashTable[boardHashAfterMove]);
                    this.hashTable[boardHashAfterMove].addParent(this.hashTable[boardHashBeforeMove]);
                    if (game.isFinished()) {
                        if (game.getState() == TicTacToe_4.TicTacToe.State.X_Won) {
                            this.hashTable[boardHashAfterMove].winner = TicTacToe_4.TicTacToe.Players.X_Player;
                        }
                        else if (game.getState() == TicTacToe_4.TicTacToe.State.O_Won) {
                            this.hashTable[boardHashAfterMove].winner = TicTacToe_4.TicTacToe.Players.O_Player;
                        }
                        break;
                    }
                }
            }
            for (var hash in this.hashTable) {
                var node = this.hashTable[hash];
                if (node.winner != TicTacToe_4.TicTacToe.Players.None) {
                    var steps = 0;
                    for (var i = 0; i < 9; i++) {
                        if (node.board[i] != TicTacToe_4.TicTacToe.Players.None) {
                            steps++;
                        }
                    }
                    node.propagateWin(node.winner, 1);
                }
            }
            console.log(this.hashTable['000000000']);
        };
        DecisionTree.prototype.initializeRootNode = function () {
            this.hashTable = {};
            var rootNode = new Node_1.Node([0, 0, 0, 0, 0, 0, 0, 0, 0]);
            this.hashTable[rootNode.getHash()] = rootNode;
        };
        DecisionTree.prototype.generatePermutations = function (collection) {
            var ret = [];
            for (var i = 0; i < collection.length; i = i + 1) {
                var rest = this.generatePermutations(collection.slice(0, i).concat(collection.slice(i + 1)));
                if (!rest.length) {
                    ret.push([collection[i]]);
                }
                else {
                    for (var j = 0; j < rest.length; j = j + 1) {
                        ret.push([collection[i]].concat(rest[j]));
                    }
                }
            }
            return ret;
        };
        return DecisionTree;
    }());
    exports.DecisionTree = DecisionTree;
});
define("AiPlayer/implementations/decisionTree/DecisionTreePlayer", ["require", "exports", "AiPlayer/AiPlayer", "AiPlayer/implementations/decisionTree/DecisionTree"], function (require, exports, AiPlayer_2, DecisionTree_1) {
    "use strict";
    exports.__esModule = true;
    var DecisionTreePlayer = (function (_super) {
        __extends(DecisionTreePlayer, _super);
        function DecisionTreePlayer() {
            var _this = _super.call(this) || this;
            _this.decisionTree = new DecisionTree_1.DecisionTree();
            return _this;
        }
        DecisionTreePlayer.prototype.train = function () {
            this.decisionTree.build();
        };
        DecisionTreePlayer.prototype.play = function (board, turn, callback) {
            var boardState = this.decisionTree.getNodes()[this.getBoardHash(board)].getBestMoveFor(turn).getBoard();
            var selectedIdx = 0;
            for (var i = 0; i < 9; i++) {
                if (boardState[i] != board[i]) {
                    selectedIdx = i;
                    break;
                }
            }
            callback(selectedIdx);
        };
        DecisionTreePlayer.prototype.getBoardHash = function (board) {
            var hash = '';
            for (var i = 0; i < 9; i++) {
                hash += board[i].toString();
            }
            return hash;
        };
        return DecisionTreePlayer;
    }(AiPlayer_2.AiPlayer));
    exports.DecisionTreePlayer = DecisionTreePlayer;
});
define("Application", ["require", "exports", "Renderer", "TicTacToe", "AiPlayer/implementations/random/RandomAiPlayer", "AiPlayer/implementations/decisionTree/DecisionTreePlayer"], function (require, exports, Renderer_1, TicTacToe_5, RandomAiPlayer_1, DecisionTreePlayer_1) {
    "use strict";
    exports.__esModule = true;
    var Application = (function () {
        function Application() {
        }
        Application.prototype.main = function () {
            var _this = this;
            this.cpuPlayer = TicTacToe_5.TicTacToe.Players.X_Player;
            this.humanPlayer = TicTacToe_5.TicTacToe.Players.O_Player;
            this.aiPlayer = null;
            this.game = new TicTacToe_5.TicTacToe();
            this.renderer = new Renderer_1.Renderer(this.game);
            this.renderer.onCellClicked(function (cellIndex) { return _this.onCellClicked(cellIndex); });
            this.renderer.draw();
            document.querySelector('#opponent-selector').addEventListener('change', function (e) { return _this.onOpponentSelected(e); });
            document.querySelector('#player-selector').addEventListener('change', function (e) { return _this.onPlayerSelected(e); });
            document.querySelector('#restart-button').addEventListener('click', function () { return _this.restartGame(); });
        };
        Application.prototype.onCellClicked = function (cellIndex) {
            var _this = this;
            if (this.aiPlayer != null) {
                if (!this.game.isFinished() && this.game.getPlayersTurn() == this.humanPlayer) {
                    if (this.game.makePlay(cellIndex)) {
                        this.renderer.draw();
                        if (!this.game.isFinished()) {
                            var board = this.game.getBoard();
                            this.aiPlayer.play(board, this.cpuPlayer, function (cellIndex) {
                                _this.game.makePlay(cellIndex);
                                _this.renderer.draw();
                            });
                        }
                    }
                }
            }
        };
        Application.prototype.restartGame = function () {
            var _this = this;
            this.game.restart();
            this.renderer.draw();
            if (this.cpuPlayer == TicTacToe_5.TicTacToe.Players.X_Player && this.aiPlayer != null) {
                this.aiPlayer.play(this.game.getBoard(), TicTacToe_5.TicTacToe.Players.X_Player, function (cellIndex) {
                    _this.game.makePlay(cellIndex);
                    _this.renderer.draw();
                });
            }
        };
        Application.prototype.onPlayerSelected = function (e) {
            if (e.srcElement.value == 'X') {
                this.humanPlayer = TicTacToe_5.TicTacToe.Players.X_Player;
                this.cpuPlayer = TicTacToe_5.TicTacToe.Players.O_Player;
            }
            else {
                this.humanPlayer = TicTacToe_5.TicTacToe.Players.O_Player;
                this.cpuPlayer = TicTacToe_5.TicTacToe.Players.X_Player;
            }
            this.restartGame();
        };
        Application.prototype.onOpponentSelected = function (e) {
            var _this = this;
            if (e.srcElement.value == 'random') {
                this.aiPlayer = new RandomAiPlayer_1.RandomAiPlayer();
            }
            else if (e.srcElement.value == 'tree') {
                this.aiPlayer = new DecisionTreePlayer_1.DecisionTreePlayer();
            }
            this.showTrainingMessage();
            setTimeout(function () {
                _this.aiPlayer.train();
                _this.hideTrainingMessage();
                var board = _this.game.getBoard();
                _this.restartGame();
            }, 500);
        };
        Application.prototype.showTrainingMessage = function () {
            var message = document.querySelector('#training-message');
            message.style.zIndex = 1;
            message.style.opacity = 1;
        };
        Application.prototype.hideTrainingMessage = function () {
            var message = document.querySelector('#training-message');
            message.style.zIndex = -1;
            message.style.opacity = 0;
        };
        Application.prototype.save = function () {
            this.game.save();
        };
        Application.prototype.restore = function () {
            this.game.restore();
            this.renderer.draw();
        };
        return Application;
    }());
    exports.Application = Application;
});
