
export class RocketHandle {
    private rocket : Rocket;
    public onSimulationFinished : Function;

    constructor(rocket:Rocket) {
        this.rocket = rocket;
        this.rocket.handle = this;
        this.onSimulationFinished = () => { };
    }

    public getRocketAngle() : number {
        return this.rocket.body.angle;
    }

    public getRocketPosition() : Array<number> {
        return this.rocket.body.position;
    }

    public getTurbineAngle() : number {
        return this.rocket.turbineAngle;
    }

    public getTurbineIntesity() : number {
        return this.rocket.turbineIntensity;
    }

    public getScore() : number {
        return this.rocket.score;
    }

    public setDesiredTurbineAngle(angle:number) : void {
        this.rocket.desiredTurbineAngle = angle;
    }

    public setDesiredTurbineIntensity(intesity:number) : void {
        this.rocket.desiredTurbineIntensity = intesity;
    }
}

export class Rocket {
    public score                   : number;
    public turbineAngle            : number;
    public desiredTurbineAngle     : number;
    public turbineIntensity        : number;
    public desiredTurbineIntensity : number;
    public body                    : p2.Body;
    public handle                  : RocketHandle;
    
    constructor(body:p2.Body) {
        this.score = 0;
        this.body = body;
        this.turbineAngle = 0;
        this.desiredTurbineAngle = 0;
        this.turbineIntensity = 0;
        this.desiredTurbineIntensity = 0;
        this.handle = null;
    }
}
