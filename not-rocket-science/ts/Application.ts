import { Simulator } from './Simulator'
import { Renderer } from './Renderer'
import { Learner } from './Learner'

export class Application {

    private simulator : Simulator;
    private renderer  : Renderer;
    private learner   : Learner;

    constructor() {
        this.simulator = new Simulator();
        this.renderer = new Renderer('#render-surface', this.simulator);
        this.learner = new Learner(this.simulator);
    }

    public init() {
        this.renderer.init();
        this.simulator.init();
        this.learner.init();
        let rocket = this.simulator.addRocket();
        rocket.setDesiredThrusterIntensityFactor(0.0);
        rocket.setDesiredThrusterAngleFactor(0.5);
        setTimeout( ()=>{
            rocket.setDesiredThrusterIntensityFactor(1.0);
        }, 1500);
    }

    public update() {
        this.simulator.update();
        this.learner.update();
        this.renderer.draw();
    }
}