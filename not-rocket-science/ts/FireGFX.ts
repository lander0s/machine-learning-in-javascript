

export class FireGFX {

    private canvas  : HTMLCanvasElement;
    private context : CanvasRenderingContext2D;
    private time    : number;
    private texture : HTMLImageElement;

    constructor(canvas : HTMLCanvasElement, context : CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.context = context;
        this.texture = new Image();
        this.texture.src =  'https://webiconspng.com/wp-content/uploads/2017/09/Flame-PNG-Image-20197.png';
        this.time = 0;
    }

    public draw(factor:number) {
        for(var i = 0; i < 10; i++) {
            let size = Math.cos(i + this.time) + 5;
            this.context.save();
            this.context.globalAlpha = 0.2;
            this.context.scale(size / 4, size);
            this.context.scale(factor, factor);
            this.context.rotate(Math.cos(this.time + i*2) * 0.1);
            this.context.drawImage(this.texture, -25, -50, 50, 50);
            this.context.globalAlpha = 0.1;
            this.context.restore();
        }
    }

    public update() : void {
        this.time += (60/60);
    }
}