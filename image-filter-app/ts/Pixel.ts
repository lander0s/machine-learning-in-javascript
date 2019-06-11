
export class Pixel {

    public r : Number;
    public g : Number;
    public b : Number;
    public a : Number;

    constructor(rgba : Array<number>) {
        this.r = rgba[0];
        this.g = rgba[1];
        this.b = rgba[2];
        this.a = rgba[3];
    }
}