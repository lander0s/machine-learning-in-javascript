
import { Rocket, RocketHandle } from './Rocket'
import { SimulatorConfig } from './Config';
declare var p2 : any;
//import * as p2 from "./p2"

export class Simulator {

    private world   : p2.World;
    private rockets : Array<Rocket>;
    private ground  : p2.Body;

    constructor() {
    }

    public init() {
        this.world = new p2.World();
        let planeShape = new p2.Plane();
        this.ground = new p2.Body();
        this.ground.addShape(planeShape);
        this.world.addBody(this.ground);
        this.rockets = [];
    }

    public addRocket() : RocketHandle {
        let rocketShape = new p2.Box({width: SimulatorConfig.rocketSize[0], height: SimulatorConfig.rocketSize[1]});
        let rocketBody = new p2.Body({mass:1, position: SimulatorConfig.rocketSpawnPoint });
        rocketBody.addShape(rocketShape);
        this.world.addBody(rocketBody);

        let rocket = new Rocket(rocketBody);
        this.rockets.push(rocket);

        let handle = new RocketHandle(rocket);
        return handle;
    }

    public getAllRockets() {
        return this.rockets;
    }

    public update() : void {
        this.world.step(1/60);
    }
}