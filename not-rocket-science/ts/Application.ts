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
        this.simulator.addRocket();
    }

    public update() {
        this.simulator.update();
        this.renderer.draw();
    }
}