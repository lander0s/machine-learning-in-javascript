

export class Genome {
    public mSpeed : number;
    public mSize  : number;

    constructor() {
        this.mSpeed = Math.random();
        this.mSize = Math.random() * 1 + 0.5;
    }

    public crossOver(daddy:Genome, mum:Genome) {

    }

    public mutate() {

    }

    public distanceTo(genome : Genome) : number {
        return Math.abs(this.mSpeed - genome.mSpeed);
    }
}