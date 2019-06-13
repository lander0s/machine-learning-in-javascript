import { Simulator } from './Simulator'
import { Renderer } from './Renderer'

export class Application {

    private simulator : Simulator;
    private renderer  : Renderer;

    constructor() {
        this.simulator = new Simulator();
        this.renderer = new Renderer('#render-surface', this.simulator);
    }

    public init() {
        this.renderer.init();
        this.simulator.init();
        let handle = this.simulator.addRocket();
        handle.setDesiredThrusterIntensityFactor(0.0);
        handle.setDesiredThrusterAngleFactor(0.5);
        setTimeout( ()=>{
            handle.setDesiredThrusterIntensityFactor(1.0);
        }, 1500);
    }

    public update() {
        this.simulator.update();
        this.renderer.draw();
    }
}