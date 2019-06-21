import { TicTacToe }  from './TicTacToe'
declare var SVG :any;

export class Renderer {

    private game                : TicTacToe;
    private svgDoc              : any;
    private cellClickedCallback : Function;
    private size                : number;
    private margin              : number;
    private gridLineStyle       : any;
    private playerLineStyle     : any;
    private winnerLineStyle     : any;
    private winningLinesParams  : number[][];

    constructor(game:TicTacToe) {
        this.game = game;
        this.cellClickedCallback = () => {};
        this.size = 300;
        this.margin = 10;
        this.svgDoc = SVG('drawing').size(this.size, this.size);
        this.gridLineStyle = { width: 10, color: '#619196', linecap: 'round' };
        this.playerLineStyle = { width: 10, color: '#555', linecap: 'round' };
        this.winnerLineStyle = { width: 10, color: '#38908f', linecap: 'round' };
        this.svgDoc.on('click', (e:any)=>{
            let x = (e.offsetX / 100)|0;
            let y = (e.offsetY / 100)|0;
            this.cellClickedCallback(x, y);
        });

        let cellSize = (this.size / 3)|0;
        let halfCellSize = cellSize / 2;
        let sizeMinusMargin = this.size - this.margin;

        this.winningLinesParams = [
            [ this.margin, cellSize * 0 + halfCellSize, sizeMinusMargin, cellSize * 0 + halfCellSize],
            [ this.margin, cellSize * 1 + halfCellSize, sizeMinusMargin, cellSize * 1 + halfCellSize],
            [ this.margin, cellSize * 2 + halfCellSize, sizeMinusMargin, cellSize * 2 + halfCellSize],
            [ cellSize * 0 + halfCellSize, this.margin, cellSize * 0 + halfCellSize, sizeMinusMargin],
            [ cellSize * 1 + halfCellSize, this.margin, cellSize * 1 + halfCellSize, sizeMinusMargin],
            [ cellSize * 2 + halfCellSize, this.margin, cellSize * 2 + halfCellSize, sizeMinusMargin],
            [ this.margin, this.margin, sizeMinusMargin, sizeMinusMargin ],
            [ sizeMinusMargin, this.margin, this.margin, sizeMinusMargin ],
        ];
    }

    public draw() : void {
        this.svgDoc.clear();
        this.svgDoc.line(this.margin, 100, this.size-this.margin, 100).stroke(this.gridLineStyle);
        this.svgDoc.line(this.margin, 200, this.size-this.margin, 200).stroke(this.gridLineStyle);
        this.svgDoc.line(100, this.margin, 100, this.size-this.margin ).stroke(this.gridLineStyle);
        this.svgDoc.line(200, this.margin, 200, this.size-this.margin ).stroke(this.gridLineStyle);

        let board = this.game.getBoard();
        for(let i = 0; i < board.length; i++) {
            let y =  (i / 3)|0;
            let x =  (i % 3)|0;
            if(board[i] == TicTacToe.Players.O_Player) {
                this.drawCircle(x,y);
            }
            else if(board[i] == TicTacToe.Players.X_Player) {
                this.drawCross(x,y);
            }
        }

        let winnerLineIdx = this.game.getWinningConditionIndex();
        if(winnerLineIdx >= 0) {
            this.drawWinnerLine(
                this.winningLinesParams[winnerLineIdx][0],
                this.winningLinesParams[winnerLineIdx][1],
                this.winningLinesParams[winnerLineIdx][2],
                this.winningLinesParams[winnerLineIdx][3]
            );
        }
    }

    private drawCircle(x:number, y:number) {
        let cellSize = (this.size / 3)|0;
        let halfCellSize = cellSize / 2;
        let cellSizeOffset = cellSize/4;
        this.svgDoc.circle(halfCellSize)
            .move(x *  cellSize + cellSizeOffset, y * cellSize + cellSizeOffset)
            .fill('none')
            .stroke(this.playerLineStyle);
    }

    private drawCross(x:number, y:number) {
        let cellSize = (this.size / 3)|0;
        let halfCellSize = cellSize / 2;
        let cellSizeOffset = cellSize/4;
        this.svgDoc.line(0,0, halfCellSize, halfCellSize)
            .move(x *  cellSize + cellSizeOffset, y * cellSize + cellSizeOffset)
            .stroke(this.playerLineStyle);
        this.svgDoc.line(halfCellSize,0, 0, halfCellSize)
            .move(x *  cellSize + cellSizeOffset, y * cellSize + cellSizeOffset)
            .stroke(this.playerLineStyle);
    }

    private drawWinnerLine(x1 : number, y1 : number, x2 : number, y2 : number) : void {
        this.svgDoc.line(x1, y1, x1, y1).stroke(this.winnerLineStyle)
        .animate({ ease: '<', duration: '0.3s' }).plot(x1, y1, x2, y2);
    }

    public onCellClicked(callback:Function) : void {
        this.cellClickedCallback = callback;
    }
}