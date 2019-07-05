

export class Genome {
    private mSpeed : number;
    private mSize  : number;
    private mFov   : number;

    constructor() {
        this.mSpeed = 0.2;
        this.mSize = 0.5;
        this.mFov = 0.5;
        //this.mutate();
    }

    public crossOver(daddy:Genome, mum:Genome) {

    }

    public mutate() {
        this.mSpeed += (Math.random() - 0.5) * 0.1;
        this.mSize  += (Math.random() - 0.5) * 0.1;
        this.mFov   += (Math.random() - 0.5) * 0.1;

        this.mSpeed = this.clamp(this.mSpeed);
        this.mSize = this.clamp(this.mSize);
        this.mFov = this.clamp(this.mFov);
    }

    public clamp(val:number) : number {
        return Math.max(Math.min(val, 1.0), 0.0);
    }

    public distanceTo(genome : Genome) : number {
        return Math.abs(this.mSpeed - genome.mSpeed);
    }

    public getSpeed() : number {
        return this.mSpeed * 1;
    }

    public getSize() : number {
        return this.mSize * 5 + 0.1;
    }

    public getFovFactor() : number {
        return this.mFov;
    }
}