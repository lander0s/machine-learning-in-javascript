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
    private finishSimulationCallbacks : Array<Function>;
    
    constructor(body:p2.Body) {
        this.isAlive = true;
        this.score = 0;
        this.body = body;
        this.thrusterAngle = 0;
        this.desiredThrusterAngle = 0;
        this.thrusterIntensity = 0;
        this.desiredThrusterIntensity = 0;
        this.finishSimulationCallbacks = [];
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
    }

    public setScore(value: number) : void {
        this.score = value;
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

    public getAngleFactor() : number {
        let angle = this.getAngle();
        let min = -Math.PI;
        let max = Math.PI;
        return ((angle - min) / (max - min));
    }

    public getAngularVelocityFactor() : number {
        let angularVelocity = this.body.angularVelocity;
        let min = -30;
        let max = 30;

        // clamp angular velocity 
        if(angularVelocity < min) {
            angularVelocity = min;
        } else if(angularVelocity > max) {
            angularVelocity = max;
        }

        return ((angularVelocity - min) / (max - min));
    }

    public getThrusterAngle() :number {
        let angle = this.thrusterAngle;
        let normalized = Math.atan2(Math.sin(angle), Math.cos(angle));
        return normalized;
    }

    public getThrusterAngleFactor() : number {
        let halfFreedomInRadians = (SimulatorConfig.thrusterFreedomInDegrees * Math.PI / 180.0) / 2.0;
        let angle = this.getThrusterAngle();
        let min = -halfFreedomInRadians;
        let max = halfFreedomInRadians;
        return ((angle - min) / (max - min));
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

    public notifySimulationFinished() : void {
        this.finishSimulationCallbacks.forEach( (callback) => callback() );
    }

    public on(eventType:string, callback:Function) : void {
        switch(eventType) {
            case 'finishSimulation' : {
                this.finishSimulationCallbacks.push(callback);
                break;
            }
            default: {
                console.error('unknown event type');
                break;
            }
        }
    }    
}
