import { Rocket } from "./Rocket";
import { SimulatorConfig } from "./Config";
declare var synaptic : any;

export class Genome {
    private generation : number;
    private network    : any;
    private uuid       : string;
    private rocket     : Rocket;

    constructor(generation:number, uuid:string, rocket:Rocket) {
        this.generation = 0;
        this.network = null;
        this.rocket = null;
        this.generation = generation;
        this.uuid = uuid;
        this.rocket = rocket;
    }

    public update() : void {

        let angularVelocityClamp  = 30;
        let heightClamp = 100;

        let isRotatingClockWise = this.rocket.getAngularVelocity() < 0;
        let isTiltedToRight = this.rocket.getAngle() < 0;
        let absAngularVelocity = Math.min(Math.abs(this.rocket.getAngularVelocity()), angularVelocityClamp);
        let absAngle = Math.abs(this.rocket.getAngle());
        let heightFactor = Math.min(this.rocket.getPosition()[1] / heightClamp, 1.0);

        let input = [
            isRotatingClockWise ? 1.0 : 0.0,
            isTiltedToRight ? 1.0 : 0.0,
            absAngularVelocity / angularVelocityClamp,
            absAngle /  Math.PI,
            heightFactor
        ];
        let output = this.network.activate(input);
        this.rocket.setDesiredThrusterAngleFactor(output[0]);
        this.rocket.setDesiredThrusterIntensityFactor(output[1]);
    }

    public didFinish() : boolean {
        return this.rocket.isDead() && this.rocket.getSecondsSinceDeath() >= SimulatorConfig.secondsToRemoveDeadRockets;
    }

    public createNeuralNetworkFromScratch() {
        this.network = new synaptic.Architect.Perceptron(5, 4, 2);
    }

    public fromParents(daddy:Genome, mum:Genome) : void {
        let daddyNetworkJsonObj = JSON.parse(JSON.stringify(daddy.network.toJSON()));
        let mumNetworkJsonObj = JSON.parse(JSON.stringify(mum.network.toJSON()));

        let childNetworkJsonObj = this.crossOver(daddyNetworkJsonObj, mumNetworkJsonObj);
        var mutatedNetworkJsonObj =  this.mutate(childNetworkJsonObj);
        this.network = synaptic.Network.fromJSON(mutatedNetworkJsonObj);
    }

    public getFitness() : number {
        return this.rocket.getScore();
    }

    public getGeneration() : number {
        return this.generation;
    }

    public getUUID() : string {
        return this.uuid;
    }

    private crossOver(daddyNetworkJsonObj:any, mumNetworkJsonObj:any) : any {
        let randomCut = (Math.random() * daddyNetworkJsonObj.neurons.length)|0;
        for(let i = randomCut; i < daddyNetworkJsonObj.neurons.length; i++) {
            //swap bias
            let aux = daddyNetworkJsonObj.neurons[i].bias;
            daddyNetworkJsonObj.neurons[i].bias = mumNetworkJsonObj.neurons[i].bias;
            mumNetworkJsonObj.neurons[i].bias = aux;
        }

        if(Math.random() > 0.5) {
            return daddyNetworkJsonObj;
        } else {
            return mumNetworkJsonObj;
        }
    }

    private mutate(networkJsonObj : any) : any {
       for(let i = 0; i < networkJsonObj.neurons.length; i++) {
           if(Math.random() > 0.5) {
               networkJsonObj.neurons[i].bias +=
                   networkJsonObj.neurons[i].bias * (Math.random() - 0.5) * 3 + (Math.random() - 0.5);
           }
       }

        for(let i = 0; i < networkJsonObj.connections.length; i++) {
            if(Math.random() > 0.5) {
                networkJsonObj.connections[i].weight +=
                networkJsonObj.connections[i].weight * (Math.random() - 0.5) * 3 + (Math.random() - 0.5);
            }
        }
        return networkJsonObj;
    }

    public toJson() : any {
        return this.network.toJSON();
    }

}