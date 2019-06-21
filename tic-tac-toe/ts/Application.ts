import { Renderer } from './Renderer'
import { TicTacToe } from './TicTacToe'

export class Application {
    private renderer : Renderer;
    private game     : TicTacToe;

    public main() {
        this.game = new TicTacToe();
        this.renderer = new Renderer(this.game);
        this.renderer.onCellClicked((x:number, y:number)=> this.onCellClicked(x,y));
        this.renderer.draw();
    }

    public onCellClicked(x:number, y:number) {
        if(!this.game.isFinished()) {
            this.game.makePlay(x, y);
            this.renderer.draw();
        }
    }
}