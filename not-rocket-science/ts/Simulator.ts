
import { Rocket } from './Rocket'
import { SimulatorConfig } from './Config'
declare var p2 : any;
//import * as p2 from "./p2"

const COLLISION_GROUP_GROUND =  Math.pow(2,0);
const COLLISION_GROUP_ROCKET =  Math.pow(2,1);

export class Simulator {

    private world   : p2.World;
    private rockets : Array<Rocket>;
    private ground  : p2.Body;

    constructor() {
    }

    public init() {
        this.world = new p2.World();
        let planeShape = new p2.Plane();
        planeShape.collisionMask = COLLISION_GROUP_ROCKET;
        planeShape.collisionGroup = COLLISION_GROUP_GROUND;
        this.ground = new p2.Body();
        this.ground.addShape(planeShape);
        this.world.addBody(this.ground);
        this.rockets = [];
    }

    public addRocket() : Rocket {
        let rocketShape = new p2.Box({width: SimulatorConfig.rocketSize[0], height: SimulatorConfig.rocketSize[1]});
        let rocketBody = new p2.Body({mass:1, position: SimulatorConfig.rocketSpawnPoint });
        rocketBody.addShape(rocketShape);
        rocketShape.collisionMask = COLLISION_GROUP_GROUND;
        rocketShape.collisionGroup = COLLISION_GROUP_ROCKET;
        this.world.addBody(rocketBody);

        let rocket = new Rocket(rocketBody);
        this.rockets.push(rocket);
        this.applyRandomImpulse(rocket);
        return rocket;
    }

    public getAllRockets() {
        return this.rockets;
    }

    public update() : void {
        let elapsedSeconds = 1/60;
        this.rockets.forEach( (rocket) => {
            rocket.update(elapsedSeconds);
            // apply corresponding force
            let effectiveAngle = rocket.getThrusterAngle() + (Math.PI/2);
            let forceX = rocket.getThrusterIntensity() * Math.cos(effectiveAngle);
            let forceY = rocket.getThrusterIntensity() * Math.sin(effectiveAngle);
            let posX = 0;
            let posY = -SimulatorConfig.rocketSize[1] / 2;
            rocket.getPhysicsObject().applyForceLocal([forceX, forceY], [posX, posY]);
        });

        this.world.step(elapsedSeconds);
    }

    public applyRandomImpulse(rocket:Rocket) : void {
        let forceX = (Math.random() * 2 - 1) * 20;
        let forceY = (Math.random() * 2 - 1) * 20;
        let posX = (Math.random() * 2 + 1) * SimulatorConfig.rocketSize[0];
        let posY = 0;
        rocket.getPhysicsObject().applyImpulseLocal([forceX, forceY],[posX, posY]);
    }
}