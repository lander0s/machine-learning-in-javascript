import { Genome } from './Genome'
import { SimulatorConfig } from './Config'
import { Bush } from './Bush';
import { Simulator } from './Simulator';
import { Vec2d } from './Vec2d';

export class Creature {

    private mPosition       : Vec2d;
    private mTargetPosition : Vec2d;
    private mGenome         : Genome;
    private mEnergy         : number;
    private mOrientation    : number;
    private mFovAngle       : number;
    private mFovDistance    : number;
    private mSimulator      : Simulator;

    constructor(simulator : Simulator) {
        this.mSimulator = simulator;
        this.mGenome = new Genome();
        this.mTargetPosition = new Vec2d(0,0);
        this.mPosition = new Vec2d(0,0);
        this.mEnergy = 1;
        this.mOrientation = -90 * Math.PI / 180;
        this.mFovAngle = this.mGenome.getFovFactor() * 2 *  Math.PI;
        this.mFovDistance = Math.sqrt(SimulatorConfig.creatureViewArea / this.mGenome.getFovFactor() * Math.PI);
    }

    public isSameSpecies(creature : Creature) : boolean {
        return this.mGenome.distanceTo(creature.mGenome) < SimulatorConfig.speciesMaxDistance;
    }

    public static fromParents(daddy : Creature, mum : Creature) : Creature {
        let genomeC = new Genome();
        genomeC.crossOver(daddy.mGenome, mum.mGenome);
        genomeC.mutate();
        let creature = new Creature(daddy.mSimulator);
        creature.mGenome = genomeC;
        return creature;
    }

    public update() : void {
        if(this.isDead()) {
            return;
        }
        if(this.hasArrivedAtTargetPos()) {
            this.findNewTargetPosition();
        } else {
            this.moveTowardsTargetPosition();
        }
        this.mEnergy -= 0.001;
    }

    public moveTowardsTargetPosition() : void {
        let toTargetVec = this.mTargetPosition.subtract(this.mPosition);
        let step = toTargetVec.normalize()
            .scale(this.mGenome.getSpeed())
            .clampLength(toTargetVec.length());
            this.mPosition = this.mPosition.add(step);
        this.mOrientation = toTargetVec.direction();
    }

    public findNewTargetPosition() : void {
        return this.generateRandomTargetPosition();
    }

    public generateRandomTargetPosition() : void {
        let stepSizeInMts = 10;
        let randomVec = Vec2d.randomVectorWithLength(stepSizeInMts);
        this.mTargetPosition = this.mPosition.add(randomVec);
    }

    public hasArrivedAtTargetPos() : boolean {
        return this.mPosition.distance(this.mTargetPosition) < 0.01
    }

    public getPosition() : Vec2d {
        return this.mPosition;
    }

    public getSize() : number {
        return this.mGenome.getSize();
    }

    public isDead() : boolean {
        return this.mEnergy <= 0;
    }

    public getOrientation() : number {
        return this.mOrientation;
    }

    public getFOVAngle() : number {
        return this.mFovAngle;
    }

    public getFOVDistance() : number {
        return this.mFovDistance;
    }

    public getVisibleBushes() : Bush[] {
        return this.mSimulator.getBushesInCircularSector(
            this.mPosition,
            this.mOrientation,
            this.mFovDistance,
            this.mFovAngle
        ).sort( (a, b) => {
            let distanceToA = this.mPosition.subtract(a.getPosition()).lengthSQ();
            let distanceToB = this.mPosition.subtract(b.getPosition()).lengthSQ();
            return distanceToA > distanceToB ? 1 : distanceToA < distanceToB ? -1 : 0;
        });
    }
}