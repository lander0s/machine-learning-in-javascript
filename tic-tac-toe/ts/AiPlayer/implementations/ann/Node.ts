import { BoardBuilder } from './BoardBuilder'

export class Node {
    public crossWeight  : number;
    public circleWeight : number;
    public cellIndex    : number;
    public cellValue    : number;
    public parentNode   : Node;
    public children     : Node[];

    constructor() {
        this.crossWeight = 0;
        this.circleWeight = 0;
        this.cellIndex = -1;
        this.cellValue = 0;
        this.parentNode = null;
        this.children = [];
    }

    public getBoard( bb : BoardBuilder) : void {
        if(this.parentNode != null) {
            this.parentNode.getBoard(bb);
        }
        if(this.cellIndex >= 0) {
            bb.setCellValue(this.cellIndex, this.cellValue);
        }
    }

    public getBestMoveFor(player:number) : number {
        let best = this.children[0];
        this.children.forEach((node:Node)=>{
            if(player == 1) {
                if(best.crossWeight < node.crossWeight) {
                    best = node;
                }
            } else {
                if(best.circleWeight < node.circleWeight) {
                    best = node;
                }
            }
        });
        return best.cellIndex;
    }
}