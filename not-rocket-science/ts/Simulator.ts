
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
        this.world.on('beginContact', (e:any) => this.onBeginContact(e));
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
        this.removeDeadRockets();
    }

    private applyRandomImpulse(rocket:Rocket) : void {
        let forceX = (Math.random() * 2 - 1) * 20;
        let forceY = (Math.random() * 2 - 1) * 20;
        let posX = (Math.random() * 2 + 1) * SimulatorConfig.rocketSize[0];
        let posY = 0;
        rocket.getPhysicsObject().applyImpulseLocal([forceX, forceY],[posX, posY]);
    }

    private onBeginContact(evt : any) : void {
        let theRocket = evt.bodyA.id == this.ground.id ? evt.bodyB : evt.bodyA;
        let rocket = this.getRocketById(theRocket.id);
        if(!rocket.isDead()) {
            rocket.markAsDead();
            rocket.judgeLanding();
        }
    }

    private getRocketById(id:number) : Rocket { 
        for(let i = 0; i < this.rockets.length; i++) {
            if(this.rockets[i].getPhysicsObject().id == id) {
                return this.rockets[i];
            }
        }
        console.error('attempt to access an unkown rocket');
        return null;
    }

    private removeDeadRockets() : void {
        for(let i = this.rockets.length -1; i >= 0; i--) {
            if(this.rockets[i].isDead() && this.rockets[i].getSecondsSinceDeath() >= SimulatorConfig.secondsToRemoveDeadRockets) {
                let rocket = this.rockets[i];
                this.world.removeBody(rocket.getPhysicsObject());
                this.rockets.splice(i,1);
            }
        }
    }
}