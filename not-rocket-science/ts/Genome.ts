

export class Genome {
    private fitness    : number;
    private generation : number;
    private network    : any;
    private uuid       : number;

    constructor() {
        this.fitness = 0;
        this.generation = 0;
        this.network = null;
        this.uuid = -1;
    }

    public fromParents(dady:Genome, mum:Genome, generation : number, uuid : number) : void {
        this.generation = generation;
        this.uuid = uuid;
        this.network = null; /* genetic stuff goes here */
    }

    public setNetwork(network : any) : void {
        this.network = network;
    }

    public activate(input : Array<number>) : Array<number> {
        return this.network.activate(input);
    }

    public setFitness(fitness:number) : void {
        this.fitness = fitness;
    }

    public getFitness() : number {
        return this.fitness;
    }

    public getGeneration() : number {
        return this.generation;
    }

    public getUUID() : number {
        return this.uuid;
    }
}