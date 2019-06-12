
import { RawImage } from "./RawImage"
declare var synaptic : any;

export class ImageFilterLearner {

    private network      : any;
    private learningRate : number;

    constructor() {
        this.network = new synaptic.Architect.Perceptron(3,3,3);
        this.learningRate = 0.5;
    }

    public train(original:RawImage, filtered:RawImage) : void {
        for(let y = 0; y < original.height; y++) {
            for(let x = 0; x < original.width; x++) {
                let pixelIndex = y * original.width + x;

                this.network.activate([
                    original.pixels[pixelIndex].r / 255.0,
                    original.pixels[pixelIndex].g / 255.0,
                    original.pixels[pixelIndex].b / 255.0,
                ]);

                this.network.propagate( this.learningRate, [
                    filtered.pixels[pixelIndex].r / 255.0,
                    filtered.pixels[pixelIndex].g / 255.0,
                    filtered.pixels[pixelIndex].b / 255.0,
                ]);
            }
        }
    }

    public applyFilter(image : RawImage) : RawImage {
        let newImage : RawImage = new RawImage();
        newImage.copyFrom(image);
        for(let i = 0; i < newImage.pixels.length; i++) {

            let output = this.network.activate([
                image.pixels[i].r / 255.0,
                image.pixels[i].g / 255.0,
                image.pixels[i].b / 255.0,
            ]);

            newImage.pixels[i].r = output[0] * 255|0;
            newImage.pixels[i].g = output[1] * 255|0;
            newImage.pixels[i].b = output[2] * 255|0;
        }
        return newImage;
    }
}