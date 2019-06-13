
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
        let elapsedSeconds = 1/60;
        let turbineRotationSpeed = 1;
        let turbineIntensityAcc = 1;

        this.rockets.forEach( (rocket) => {
            // update turbines
            rocket.turbineAngle = this.stepValue(
                rocket.desiredTurbineAngle,
                rocket.turbineAngle,
                turbineRotationSpeed,
                elapsedSeconds
            );

            // update turbines
            rocket.turbineIntensity = this.stepValue(
                rocket.desiredTurbineIntensity,
                rocket.turbineIntensity,
                turbineIntensityAcc,
                elapsedSeconds
            );

            // apply corresponding force
            let angleOffset = 90 * Math.PI / 180;
            let forceX = rocket.turbineIntensity * Math.cos(rocket.turbineAngle + angleOffset);
            let forceY = rocket.turbineIntensity * Math.sin(rocket.turbineAngle + angleOffset);
            let posX = 0;
            let posY = -SimulatorConfig.rocketSize[1] / 2;
            rocket.body.applyForceLocal([forceX, forceY], [posX, posY]);
        });

        this.world.step(elapsedSeconds);
    }

    private stepValue(desiredValue : number, currentValue : number, speed : number, elapsedtime : number) : number {
        if(desiredValue > currentValue) {
            let step = -speed * elapsedtime;
            if(currentValue + step < desiredValue)
                return desiredValue;
            return currentValue + step;
        }
        else {
            let step = speed * elapsedtime;
            if(currentValue + step > desiredValue)
                return desiredValue;
            return currentValue + step;
        }
    }
}