import { Rocket } from "./Rocket";
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
        let input = [
            /*this.rocket.getAngleFactor(),*/ 0.0,
            /*this.rocket.getAngularVelocityFactor()*/ 0.0,
            this.rocket.getPosition()[1] / 100,
        ];
        let output = this.network.activate(input);
        this.rocket.setDesiredThrusterAngleFactor(output[0]);
        this.rocket.setDesiredThrusterIntensityFactor(output[1]);
    }

    public didFinish() : boolean {
        return this.rocket.isDead() && this.rocket.getSecondsSinceDeath() >= 2;
    }

    public createNeuralNetworkFromScratch() {
        this.network = new synaptic.Architect.Perceptron(3, 4, 4, 2);
    }

    public fromParents(dady:Genome, mum:Genome) : void {
        let dadyNetworkJsonObj = JSON.parse(JSON.stringify(dady.network.toJSON()));
        let mumNetworkJsonObj = JSON.parse(JSON.stringify(mum.network.toJSON()));

        let childNetworkJsonObj = this.crossOver(dadyNetworkJsonObj, mumNetworkJsonObj);
        var mutatedNetworkJsonObj =  this.mutate(childNetworkJsonObj);
        this.network = synaptic.Network.fromJSON(mutatedNetworkJsonObj);
    }

    public setNetwork(network : any) : void {
        this.network = network;
    }

    public activate(input : Array<number>) : Array<number> {
        return this.network.activate(input);
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

    private crossOver(dadyNetworkJsonObj:any, mumNetworkJsonObj:any) : any {
        let randomCut = (Math.random() * dadyNetworkJsonObj.neurons.length)|0;
        for(let i = randomCut; i < dadyNetworkJsonObj.neurons.length; i++) {
            //swap bias
            let aux = dadyNetworkJsonObj.neurons[i].bias;
            dadyNetworkJsonObj.neurons[i].bias = mumNetworkJsonObj.neurons[i].bias;
            mumNetworkJsonObj.neurons[i].bias = aux;
        }

        if(Math.random() > 0.5) {
            return dadyNetworkJsonObj;
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

}