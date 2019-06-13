
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

    public getThrusterAngle() : number {
        return this.rocket.thrusterAngle;
    }

    public getThrusterIntesity() : number {
        return this.rocket.thrusterIntensity;
    }

    public getScore() : number {
        return this.rocket.score;
    }

    public setDesiredThrusterAngle(angle:number) : void {
        this.rocket.desiredThrusterAngle = angle;
    }

    public setDesiredThrusterIntensity(intesity:number) : void {
        this.rocket.desiredThrusterIntensity = intesity;
    }
}

export class Rocket {
    public score                   : number;
    public thrusterAngle            : number;
    public desiredThrusterAngle     : number;
    public thrusterIntensity        : number;
    public desiredThrusterIntensity : number;
    public body                    : p2.Body;
    public handle                  : RocketHandle;
    
    constructor(body:p2.Body) {
        this.score = 0;
        this.body = body;
        this.thrusterAngle = 0;
        this.desiredThrusterAngle = 0;
        this.thrusterIntensity = 0;
        this.desiredThrusterIntensity = 0;
        this.handle = null;
    }
}
