import { Genome } from './Genome'
import { SimulatorConfig } from './Config'
import { Bush } from './Bush';
import { Simulator } from './Simulator';

export class Creature {

    private mPosition       : number[];
    private mTargetPosition : number[];
    private mGenome         : Genome;
    private mEnergy         : number;
    private mOrientation    : number;
    private mFovAngle       : number;
    private mFovDistance    : number;
    private mSimulator      : Simulator;

    constructor(simulator : Simulator) {
        this.mSimulator = simulator;
        this.mGenome = new Genome();
        this.mTargetPosition = [0,0];
        this.mPosition = [0,0];
        this.mEnergy = 1;
        this.mOrientation = 0;
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
        let dirVec = [
            this.mTargetPosition[0] - this.mPosition[0],
            this.mTargetPosition[1] - this.mPosition[1]
        ];
        let len = Math.sqrt(dirVec[0] * dirVec[0] + dirVec[1] * dirVec[1]);
        let normalizedDirVec = [dirVec[0]/len, dirVec[1]/len];
        let step = [
            normalizedDirVec[0] * this.mGenome.getSpeed(),
            normalizedDirVec[1] * this.mGenome.getSpeed(),
        ];
        let stepLength = Math.sqrt(step[0] * step[0] + step[1] * step[1]);
        if(stepLength > len) {
            this.mPosition[0] = this.mTargetPosition[0];
            this.mPosition[1] = this.mTargetPosition[1];
        } else {
            this.mPosition[0] += step[0];
            this.mPosition[1] += step[1];
        }
        this.mOrientation = Math.atan(dirVec[1]/dirVec[0]);
        if(dirVec[0] < 0) {
            this.mOrientation -= Math.PI;
        }
        console.log(this.mOrientation / Math.PI * 180);
    }

    public findNewTargetPosition() : void {
        return this.generateRandomTargetPosition();
    }

    public generateRandomTargetPosition() : void {
        let angle = Math.random() * (Math.PI * 2);
        let stepSizeInMts = 10;
        let x = Math.cos(angle) * stepSizeInMts;
        let y = Math.sin(angle) * stepSizeInMts;
        this.mTargetPosition[0] = this.mPosition[0] + x;
        this.mTargetPosition[1] = this.mPosition[1] + y;
    }

    public hasArrivedAtTargetPos() : boolean {
        return this.mPosition[0] === this.mTargetPosition[0] &&
        this.mPosition[1] === this.mTargetPosition[1];
    }

    public getPosition() : number[] {
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

    public getVisibleFood() : Bush[] {
        return this.mSimulator.getBushesInCircularSector(
            this.getPosition()[0],
            this.getPosition()[1],
            this.mFovDistance,
            this.mOrientation,
            this.mFovAngle
        );
    }
}