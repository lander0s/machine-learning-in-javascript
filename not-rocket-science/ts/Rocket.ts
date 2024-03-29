import { SimulatorConfig } from "./Config";
import { Genome } from './Genome'

export class Rocket {
    private score                     : number;
    private thrusterAngle             : number;
    private desiredThrusterAngle      : number;
    private thrusterIntensity         : number;
    private desiredThrusterIntensity  : number;
    private fuelTankReserve           : number;
    private body                      : p2.Body;
    private isAlive                   : boolean;
    private isLanded                  : boolean;
    private landingTimestamp          : number;
    private deathTimestamp            : number;
    private genome                    : Genome;
    
    constructor(body:p2.Body) {
        this.isAlive = true;
        this.isLanded = false;
        this.score = 0;
        this.body = body;
        this.thrusterAngle = 0;
        this.desiredThrusterAngle = 0;
        this.thrusterIntensity = 0;
        this.desiredThrusterIntensity = 0;
        this.fuelTankReserve = SimulatorConfig.fuelTankCapacity;
        this.genome = null;
    }

    public update(elapsedSeconds:number) : void {
        let thrusterRotationSpeed = 5;
        let thrusterIntensityAcc = 50;

        // update thrusters
        this.thrusterAngle = this.stepValue(
            this.desiredThrusterAngle,
            this.thrusterAngle,
            thrusterRotationSpeed,
            elapsedSeconds
        );

        this.thrusterIntensity = this.stepValue(
            this.desiredThrusterIntensity,
            this.thrusterIntensity ,
            thrusterIntensityAcc,
            elapsedSeconds
        );
        this.thrusterIntensity *= this.getEngineEfficiency();

        this.consumeFuel();
        this.updateScore();
    }

    private updateScore() : void {
        if(this.isAlive) {
            if(this.getFuelTankReservePercentage() > 0 || (this.getFuelTankReservePercentage() == 0 && this.isLanded)) {
                if (this.body.velocity[1] <= 0) {
                    let angularScore = 2.0 * Math.cos(this.getAngle()) - 1.0;
                    let deadlySpeed = 5.0;
                    let spinScore = 1.0 - Math.abs(this.getAngularVelocity()) / deadlySpeed;
                    this.score += spinScore + angularScore;
                }
            }
            if(this.score < -250) {
                this.score -= 9750;
                this.markAsDead();
            }

            if(this.isLanded) {
                let elapsedtime = new Date().getTime() - this.landingTimestamp;
                if(elapsedtime >= 3000) {
                    this.markAsDead();
                }
            }
        }
    }

    public judgeLanding() : void {
        let angularScore = 2.0 * Math.cos(this.getAngle()) - 1.0;
        let deadlySpeed = 5.0;
        let spinScore = 1.0 - Math.abs(this.getAngularVelocity()) / deadlySpeed;
        let linearSpeed = Math.sqrt(this.body.velocity[0] * this.body.velocity[0] + this.body.velocity[1] * this.body.velocity[1]);
        let speedScore = 1.0 - linearSpeed / (deadlySpeed * 2.0);
        this.score += 1000 * (spinScore + angularScore + speedScore);

        this.isLanded = true;
        this.landingTimestamp = new Date().getTime();
        if(speedScore < 0) {
            this.markAsDead();
        }
    }

    public getScore() : number {
        return this.score;
    }

    public getPhysicsObject() : p2.Body {
        return this.body;
    }

    public getAngle() : number {
        let angle = this.body.angle;
        let normalized = Math.atan2(Math.sin(angle), Math.cos(angle));
        return normalized;
    }

    public getAngularVelocity() : number {
        return this.body.angularVelocity;
    }

    public getThrusterAngle() :number {
        let angle = this.thrusterAngle;
        let normalized = Math.atan2(Math.sin(angle), Math.cos(angle));
        return normalized;
    }

    public getThrusterIntensity() : number {
        return this.thrusterIntensity;
    }

    public getThrusterIntensityFactor() : number {
        return this.thrusterIntensity / SimulatorConfig.thrusterMaxIntensity;
    }

    public getPosition() : Array<number> {
        return this.body.position;
    }

    public setDesiredThrusterIntensityFactor(factor:number) : void {
        let min = 0;
        let max = SimulatorConfig.thrusterMaxIntensity;
        this.desiredThrusterIntensity = min + factor * (max - min);
    }

    public setDesiredThrusterAngleFactor(factor:number) : void {
        let halfFreedomInRadians = (SimulatorConfig.thrusterFreedomInDegrees * Math.PI / 180.0) / 2.0;
        let min = -halfFreedomInRadians;
        let max = halfFreedomInRadians;
        this.desiredThrusterAngle = min + factor * (max - min);
    }
    
    public getFuelTankReservePercentage() : number {
        return this.fuelTankReserve / SimulatorConfig.fuelTankCapacity;
    }

    private consumeFuel() : boolean {
        let fuelConsumption = this.getThrusterIntensityFactor() * SimulatorConfig.fuelConsumptionRate;
        this.fuelTankReserve -= fuelConsumption;

        if (this.fuelTankReserve < 0)  {
            this.fuelTankReserve = 0;
            return false;
        }
        return true;
    }

    private getEngineEfficiency() : number {
        let influenceThreshold = 90; // Tank capacity where fuel efficiency is affected.
        let reductionRate = 0.025;

        let efficiencyReduction = 0;
        if (influenceThreshold >= this.fuelTankReserve)  {
            let influenceRatio = 1 - (influenceThreshold - this.fuelTankReserve) / influenceThreshold;
            efficiencyReduction = Math.max(reductionRate * Math.log(influenceRatio), -1);
        }

        return Math.min(1 + efficiencyReduction, 1);
    }

    public markAsDead() : void {
        if(this.isAlive) {
            this.isAlive = false;
            this.deathTimestamp = new Date().getTime();
        }
    }

    public isDead() : boolean {
        return !this.isAlive;
    }

    public hasLanded() : boolean {
        return this.isLanded;
    }

    public getSecondsSinceDeath() : number {
        return (new Date().getTime() - this.deathTimestamp) / 1000;
    }

    private stepValue(desiredValue : number, currentValue : number, speed : number, elapsedtime : number) : number {
        if(desiredValue < currentValue) {
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

    public getGenome() : Genome {
        return this.genome;
    }

    public setGenome(genome:Genome) : void {
        this.genome = genome;
    }
}
