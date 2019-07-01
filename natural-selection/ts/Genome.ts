

export class Genome {
    public mSpeed : number;
    public mSize  : number;

    constructor() {
        this.mSpeed = Math.random();
        this.mSize = 1.0;
    }

    public crossOver(daddy:Genome, mum:Genome) {

    }

    public mutate() {

    }

    public distanceTo(genome : Genome) : number {
        return Math.abs(this.mSpeed - genome.mSpeed);
    }
}