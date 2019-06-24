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
        if(this.aiPlayer == null) {
            return;
        }

        if(!this.game.isFinished() && this.game.getPlayersTurn() == TicTacToe.Players.O_Player) {
            if(this.game.makePlay(x, y)) {
                this.renderer.draw();
                if(!this.game.isFinished()) {
                    let board = this.game.getBoard();
                    this.aiPlayer.play(board, TicTacToe.Players.X_Player, (x : number, y : number) => {
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
        
        this.showTrainingMessage();
        setTimeout(() => {
            this.aiPlayer.train();
            this.hideTrainingMessage();
            let board = this.game.getBoard();
            this.aiPlayer.play(board, TicTacToe.Players.X_Player, (x : number, y : number) => {
                this.game.makePlay(x, y);
                this.renderer.draw();
            });
        },500);
    }

    public showTrainingMessage() : void {
        let message : any = document.querySelector('#training-message');
        message.style.zIndex =  1;
        message.style.opacity = 1;
    }

    public hideTrainingMessage() : void {
        let message : any = document.querySelector('#training-message');
        message.style.zIndex = -1;
        message.style.opacity = 0;
    }
}