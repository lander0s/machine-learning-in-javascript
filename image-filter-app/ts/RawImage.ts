
import { Pixel } from "./Pixel"

export class RawImage {

    public width  : number;
    public height : number;
    public pixels : Array<Pixel>
    private canvas  : HTMLCanvasElement;
    private context : CanvasRenderingContext2D;

    constructor() {
        this.pixels = [];
        this.width  = 0;
        this.height = 0;
        this.canvas = document.createElement('canvas');
        this.updateCanvasContext();
    }

    private updateCanvasContext() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext('2d');
    }

    public copyFrom(image : RawImage) {
        this.width = image.width;
        this.height = image.height;
        this.pixels = [];
        for(let i : number = 0; i < image.pixels.length; i++) {
            let pixel = {... image.pixels[i]};
            this.pixels.push(pixel);
        }
        this.updateCanvasContext();
    }

    public fromImage(image: HTMLImageElement) {
        this.width = image.width;
        this.height = image.height;
        this.updateCanvasContext();
        this.context.drawImage(image, 0, 0, this.width, this.height);
        let imageData = this.context.getImageData(0, 0, this.width, this.height);
        this.pixels = [];
        for(let j : number = 0; j < this.height; j++) {
            for(let i : number = 0; i < this.width; i++) {
                let rgba : Array<number> = [];
                let pixelIndex = (j * this.width + i) * 4;
                rgba[0] = imageData.data[pixelIndex + 0];
                rgba[1] = imageData.data[pixelIndex + 1];
                rgba[2] = imageData.data[pixelIndex + 2];
                rgba[3] = imageData.data[pixelIndex + 3];
                let pixel = new Pixel(rgba);
                this.pixels.push(pixel);
            }
        }
    }

    public invertColors() {
        for(let i: number = 0; i < this.pixels.length; i++) {
            this.pixels[i].r = 255 - this.pixels[i].r;
            this.pixels[i].g = 255 - this.pixels[i].g;
            this.pixels[i].b = 255 - this.pixels[i].b;
        }
    }

    public toDataUrl() {
        let imageData = this.context.getImageData(0, 0, this.width, this.height);
        for(let i : number = 0; i < this.pixels.length; i++) {
            let pixelOffset = i * 4;
            imageData.data[pixelOffset + 0] = this.pixels[i].r;
            imageData.data[pixelOffset + 1] = this.pixels[i].g;
            imageData.data[pixelOffset + 2] = this.pixels[i].b;
            imageData.data[pixelOffset + 3] = this.pixels[i].a;
        }
        this.context.putImageData(imageData, 0, 0);
        return this.canvas.toDataURL();
    }
}