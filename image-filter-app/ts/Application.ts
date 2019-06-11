import { DragImageElement } from "./DragImageElement"

export class Application {

    private exampleDragImage : DragImageElement;
    private filterDragImage : DragImageElement;
    private challengeDragImage : DragImageElement;

    main() {
        this.exampleDragImage = new DragImageElement('#example-image', 'original image goes here');
        this.filterDragImage = new DragImageElement('#example-image-with-filter', 'filtered image goes here');
        this.challengeDragImage = new DragImageElement('#challenge-image', 'a complete different image goes here');
    }
}