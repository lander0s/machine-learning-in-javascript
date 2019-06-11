import { DragImageElement } from "./DragImageElement"

export class Application {

    private dragImage1 : DragImageElement;
    private dragImage2 : DragImageElement;

    main() {
        this.dragImage1 = new DragImageElement("#example-image","drag an image here");
        this.dragImage2 = new DragImageElement("#example-image-with-filter","drag an image here");
    }
}