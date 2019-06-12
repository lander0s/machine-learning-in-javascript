
export class Pixel {

    public r : number;
    public g : number;
    public b : number;
    public a : number;

    constructor(rgba : Array<number>) {
        this.r = rgba[0];
        this.g = rgba[1];
        this.b = rgba[2];
        this.a = rgba[3];
    }
}