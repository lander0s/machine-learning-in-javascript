
export class Bush {
    private position    : number[];
    private fruitsCount : number;
    constructor(position:number[]) {
        this.position = position;
        this.fruitsCount = (Math.random() * 5) + 1;
    }

    public getPosition() : number[] {
        return this.position;
    }

    public update() : void {

    }

    public getFruitCount() : number {
        return this.fruitsCount;
    }
}