import { SimulatorConfig } from "./Config";

export class Rocket {
    private score                     : number;
    private thrusterAngle             : number;
    private desiredThrusterAngle      : number;
    private thrusterIntensity         : number;
    private desiredThrusterIntensity  : number;
    private fuelTankReserve           : number;
    private body                      : p2.Body;
    private isAlive                   : boolean;
    private deathTimestamp            : number;
    
    constructor(body:p2.Body) {
        this.isAlive = true;
        this.score = 0;
        this.body = body;
        this.thrusterAngle = 0;
        this.desiredThrusterAngle = 0;
        this.thrusterIntensity = 0;
        this.desiredThrusterIntensity = 0;
        this.fuelTankReserve = SimulatorConfig.fuelTankCapacity;
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

    private updateScore() {
        if(this.isAlive) {
            if(this.getFuelTankReservePercentage() > 0) {
                if(this.body.velocity[1] < 0) {
                    this.score += (Math.cos(this.getAngle()) * 2) - 1.0;
                    let vel = 5.0;
                    this.score += (vel - Math.abs(this.getAngularVelocity())) / vel;
                }
            }
            if(this.score < -50) {
                this.markAsDead();
            } 
        }       
    }

    public judgeLanding() : void {
        let spinWeight = 1600;
        let spinRatio = 600;
        let spinScore = spinWeight - Math.abs(this.body.angularVelocity) * spinRatio;

        let angularWeight = 800;
        let angularRatio = 2000;
        let angularScore = angularWeight - Math.abs(this.body.angle) * angularRatio;

        let speedWeight = 400;
        let speedRatio = 10;
        let speed = Math.sqrt(
            this.body.velocity[0] * this.body.velocity[0] +
            this.body.velocity[1] * this.body.velocity[1]);
        let speedScore = speedWeight - speed * speedRatio;

        //this.score += spinScore + angularScore + speedScore;
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
        factor = this.thrusterAngleFilter(factor);
        let halfFreedomInRadians = (SimulatorConfig.thrusterFreedomInDegrees * Math.PI / 180.0) / 2.0;
        let min = -halfFreedomInRadians;
        let max = halfFreedomInRadians;
        this.desiredThrusterAngle = min + factor * (max - min);
    }

    private thrusterAngleFilter(f : number) : number {
        return (1)/(1 + (Math.pow(100000,0.5 - f)) );
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
}
