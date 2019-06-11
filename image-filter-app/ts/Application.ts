import { DragImageElement } from "./DragImageElement"

export class Application {

    private dragImage1 : DragImageElement;
    private dragImage2 : DragImageElement;

    main() {
        this.dragImage1 = new DragImageElement('#example-image', 'original image goes here');
        this.dragImage2 = new DragImageElement('#example-image-with-filter', 'filtered image goes here');
    }
}