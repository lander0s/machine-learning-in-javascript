import { DragImageElement } from "./DragImageElement"
import { RawImage } from "./RawImage"
import { ImageFilterLearner } from "./ImageFilterLearner"

enum ImageRol {
    Example,
    Filtered,
    Challenge
}

export class Application {

    private imageFilterLearner : ImageFilterLearner;
    private exampleDragImage   : DragImageElement;
    private filterDragImage    : DragImageElement;
    private challengeDragImage : DragImageElement;
    private exampleRawImage   : RawImage = null;
    private filterRawImage    : RawImage = null;
    private challengeRawImage : RawImage = null;

    public main() {
        this.imageFilterLearner = new ImageFilterLearner();
        this.exampleDragImage = new DragImageElement('#example-image', 'original image goes here');
        this.filterDragImage = new DragImageElement('#example-image-with-filter', 'filtered image goes here');
        this.challengeDragImage = new DragImageElement('#challenge-image', 'a complete different image goes here');

        this.exampleDragImage.onload = (args : HTMLImageElement) => this.onImageLoaded(args, ImageRol.Example);
        this.filterDragImage.onload = (args : HTMLImageElement) => this.onImageLoaded(args, ImageRol.Filtered);
        this.challengeDragImage.onload = (args : HTMLImageElement) => this.onImageLoaded(args, ImageRol.Challenge);
    }

    private onImageLoaded(img : HTMLImageElement, rol : ImageRol) {
        switch(rol) {
            case ImageRol.Example : {
                this.exampleRawImage = new RawImage();
                this.exampleRawImage.fromImage(img);
                break;
            }
            case ImageRol.Filtered : {
                this.filterRawImage = new RawImage();
                this.filterRawImage.fromImage(img);
                break;
            }
            case ImageRol.Challenge : {
                this.challengeRawImage = new RawImage();
                this.challengeRawImage.fromImage(img);
                break;
            }
        }

        if(this.isReady()) {
            this.imageFilterLearner.train(this.exampleRawImage, this.filterRawImage);
            let resultImage = this.imageFilterLearner.applyFilter(this.challengeRawImage);
            let imageAsUrl = resultImage.toDataUrl();
            let resultElem : HTMLElement = document.querySelector('#ann-result');
            resultElem.style.backgroundImage = `url(${imageAsUrl})`;
            resultElem.style.backgroundSize = '100% 100%';
            resultElem.className += " ann-revealed-result";
        }
    }

    private isReady() {
        return this.exampleRawImage 
            && this.filterRawImage
            && this.challengeRawImage;
    }
}