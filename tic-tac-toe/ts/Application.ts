import { Renderer } from './Renderer'
import { TicTacToe } from './TicTacToe'
import { AiPlayer } from './AiPlayer/AiPlayer'
import { RandomAiPlayer } from './AiPlayer/implementations/random/RandomAiPlayer'
import { DecisionTreePlayer } from './AiPlayer/implementations/decisionTree/DecisionTreePlayer';

export class Application {
    private renderer : Renderer;
    private game     : TicTacToe;
    private aiPlayer : AiPlayer;

    public main() : void {
        this.aiPlayer = null;
        this.game = new TicTacToe();
        this.renderer = new Renderer(this.game);
        this.renderer.onCellClicked((x:number, y:number)=> this.onCellClicked(x,y));
        this.renderer.draw();
        document.querySelector('#opponent-selector').addEventListener('change', (e) => this.onOpponentSelected(e));
    }

    public onCellClicked(x:number, y:number) : void {
        if(!this.game.isFinished() && this.game.getPlayersTurn() == TicTacToe.Players.X_Player) {
            if(this.game.makePlay(x, y)) {
                this.renderer.draw();
                if(!this.game.isFinished()) {
                    let board = this.game.getBoard();
                    this.aiPlayer.play(board, (x : number, y : number) => {
                        this.game.makePlay(x, y);
                        this.renderer.draw();
                    });
                }
            }
        }
    }

    public onOpponentSelected(e : any) : void {
        if(e.srcElement.value == 'random') {
            this.aiPlayer = new RandomAiPlayer();
        }
        else if(e.srcElement.value == 'tree') {
            this.aiPlayer = new DecisionTreePlayer();
        }
        else if(e.srcElement.value == 'ann') {
            console.error('ann not yet implemented');
        }
        
        this.aiPlayer.train();
    }
}