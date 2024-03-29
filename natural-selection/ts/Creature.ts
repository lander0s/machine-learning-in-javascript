import { Genome } from './Genome'
import { SimulatorConfig } from './Config'
import { Bush } from './Bush';
import { Simulator } from './Simulator';
import { Vec2d } from './Vec2d';
import { Object } from './Object'

export class Creature extends Object {

    private AVG_CREATURE_ENERGY_CAPACITY    : number = 5000;
    private mTargetObject                   : Object;
    private mGenome                         : Genome;
    private mAmountOfEnergy                 : number;
    private mMaxAmountOfEnergy              : number;
    private mMinEnergyPercentage            : number = 0.10;
    private mNewBornEnergyPercentage        : number = 0.25;
    private mOrientation                    : number;
    private mFovAngle                       : number;
    private mFovDistance                    : number;
    private mSimulator                      : Simulator;

    constructor(simulator : Simulator, initialPosition : Vec2d) {
        super(initialPosition);
        this.mSimulator = simulator;
        this.mGenome = new Genome();
        this.mTargetObject = new Object(initialPosition);
        this.mMaxAmountOfEnergy = this.mGenome.getSize() * this.AVG_CREATURE_ENERGY_CAPACITY;
        this.mAmountOfEnergy = this.mMaxAmountOfEnergy * this.mNewBornEnergyPercentage;
        this.mOrientation = -90 * Math.PI / 180;
        this.mFovAngle = this.mGenome.getFovFactor() * 2 * Math.PI;
        this.mFovDistance = Math.sqrt(SimulatorConfig.creatureViewArea / this.mGenome.getFovFactor() * Math.PI);
    }

    public isSameSpecies(creature : Creature) : boolean {
        return this.mGenome.distanceTo(creature.mGenome) < SimulatorConfig.speciesMaxDistance;
    }

    public static fromParents(daddy : Creature, mummy : Creature) : Creature {
        daddy.mAmountOfEnergy -= daddy.mMaxAmountOfEnergy * daddy.mNewBornEnergyPercentage;
        mummy.mAmountOfEnergy -= mummy.mMaxAmountOfEnergy * mummy.mNewBornEnergyPercentage;
        let genomeC = new Genome();
        genomeC.crossOver(daddy.mGenome, mummy.mGenome);
        genomeC.mutate();
        let creature = new Creature(daddy.mSimulator, mummy.mPosition);
        creature.mGenome = genomeC;
        return creature;
    }

    public update() : void {
        if(this.isDead()) {
            return;
        }
        if(this.hasArrivedAtTargetPos()) {
            this.checkForFoodToConsume();
            this.checkForSomeoneToFuck();
            this.findNewTargetPosition();
        } else {
            this.moveTowardsTargetPosition();
        }
        this.mAmountOfEnergy -= this.mMaxAmountOfEnergy * 0.001;
    }

    public hasArrivedAtTargetPos() : boolean {
        return this.mPosition.distance(this.mTargetObject.getPosition()) < (this.getSize() / 2);
    }

    public moveTowardsTargetPosition() : void {
        let toTargetVec = this.mTargetObject.getPosition().subtract(this.mPosition);
        let step = toTargetVec.normalize()
            .scale(this.mGenome.getSpeed())
            .clampLength(toTargetVec.length());
        this.mPosition = this.mPosition.add(step);
        this.mOrientation = toTargetVec.direction();
    }

    public findNewTargetPosition() : void {
        if(this.canFuck()) {
            let visibleMates = this.getVisibleViableMates();
            if(visibleMates.length > 0) {
                this.mTargetObject = visibleMates[0];
            }
            else {
                this.generateRandomTargetPosition();
            }
        }
        else {
            let visibleBushes = this.getVisibleBushesWithFruit();
            if(visibleBushes.length > 0) {
                this.mTargetObject = visibleBushes[0];
            }
            else {
                this.generateRandomTargetPosition();
            }
        }
    }

    public generateRandomTargetPosition() : void {
        let stepSizeInMts = 10;
        let randomVec = Vec2d.randomVectorWithLength(stepSizeInMts);
        this.mTargetObject = new Object(this.mPosition.add(randomVec));
    }

    public checkForSomeoneToFuck() : any {
        if(this.mTargetObject instanceof Creature) {
            if(this.canFuck() && this.mTargetObject.canFuck()) {
                console.log("fucking");
                console.log(this.mTargetObject);
                let newborn = Creature.fromParents(this, this.mTargetObject);

            }
        }
    }

    public canFuck() {
        if(!this.isDead() && this.getEnergy() > (this.mNewBornEnergyPercentage + this.mMinEnergyPercentage)) {
            return true;
        }
        return false;
    }

    public getVisibleViableMates() : Creature[] {
        return this.getVisibleMates().filter((mate) => mate != this && mate.canFuck());
    }

    public getVisibleMates() : Creature[] {
        return this.mSimulator.getVisibleCreaturesForCreature(this).sort((a, b) => {
            //maybe better sort by energy?
            let distanceToA = this.mPosition.subtract(a.getPosition()).lengthSQ();
            let distanceToB = this.mPosition.subtract(b.getPosition()).lengthSQ();
            return distanceToA > distanceToB ? 1  : distanceToA < distanceToB ? -1  : 0;
        });
    }

    public checkForFoodToConsume() : void {
        if(this.mTargetObject instanceof Bush) {
            if(this.mTargetObject.consumeFruit()) {
                this.mAmountOfEnergy += this.mTargetObject.getFruitsEnergyValue();;
            }
        }
        // else if(this.mTargetObject instanceof Creature) {

        // }
    }

    public getVisibleBushesWithFruit() : Bush[] {
        return this.getVisibleBushes().filter((bush) => bush.getFruitCount() > 0);
    }

    public getVisibleBushes() : Bush[] {
        return this.mSimulator.getVisibleBushesForCreature(this).sort((a, b) => {
            let distanceToA = this.mPosition.subtract(a.getPosition()).lengthSQ();
            let distanceToB = this.mPosition.subtract(b.getPosition()).lengthSQ();
            return distanceToA > distanceToB ? 1  : distanceToA < distanceToB ? -1  : 0;
        });
    }

    public getPosition() : Vec2d {
        return this.mPosition;
    }

    public getSize() : number {
        return this.mGenome.getSize();
    }

    public getEnergy() : number {
        return this.mAmountOfEnergy / (this.mMaxAmountOfEnergy);
    }

    public isDead() : boolean {
        return this.mAmountOfEnergy <= 0;
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
}