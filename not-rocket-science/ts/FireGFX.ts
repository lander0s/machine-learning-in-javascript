

export class FireGFX {

    private canvas  : HTMLCanvasElement;
    private context : CanvasRenderingContext2D;
    private time    : number;
    private texture : HTMLImageElement;

    constructor(canvas : HTMLCanvasElement, context : CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.context = context;
        this.texture = new Image();
        this.texture.src =  './res/fire-gfx-texture.png';
        this.time = 0;
    }

    public draw(factor: number, size: Array<number>) {

        let copies = 18;
        for (let i = 0; i < copies; i++) {
            let degreeOffset = (this.time + i * 20) * Math.PI / 180;
            let scale = (Math.cos(degreeOffset) + 4) * 0.5;
            this.context.save();
            this.context.globalAlpha *= 0.1;
            this.context.scale( 5, scale);
            this.context.scale(factor, factor);
            this.context.rotate((Math.random() - 0.5) * 0.1 );
            this.context.drawImage(this.texture, -size[0] / 2, -size[1] * 0.95, size[0], size[1]);
            this.context.restore();
        }
    }

    public update() : void {
        this.time += 5;
    }
}