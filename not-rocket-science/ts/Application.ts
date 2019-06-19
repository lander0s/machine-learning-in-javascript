import { Simulator } from './Simulator'
import { Renderer } from './Renderer'
import { Learner } from './Learner'
import { Leaderboard } from './Leaderboard'

export class Application {

    private simulator   : Simulator;
    private renderer    : Renderer;
    private learner     : Learner;
    private leaderboard : Leaderboard;

    constructor() {
        this.simulator = new Simulator();
        this.renderer = new Renderer('#render-surface', this.simulator);
        this.leaderboard =  new Leaderboard();
        this.learner = new Learner(this.simulator, this.leaderboard);
        document.querySelector('#reset-button').addEventListener('click', () => this.hardReset() );
    }

    public init() {
        this.leaderboard.init();
        this.renderer.init();
        this.simulator.init();
        this.learner.init();
    }

    public update() {
        this.simulator.update();
        this.learner.update();
        this.renderer.draw();
    }

    private hardReset() : void {
        this.simulator.removeAllRockets();
        this.learner.hardReset();
        this.leaderboard.hardReset();
    }
}