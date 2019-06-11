

export class DragImageElement {

    public  onload    : Function;
    private rootElem  : HTMLElement;
    private inputFile : HTMLInputElement;
    private selector  : string;

    constructor(selector:string, text:string = 'Drag an image here or click for browsing') {
        this.selector = selector;
        this.rootElem = document.querySelector(selector);
        this.rootElem.innerHTML = text;
        this.rootElem.className = 'drag-image-element';
        this.rootElem.addEventListener('mouseover', (e) => this.onMouseOver() );
        this.rootElem.addEventListener('mouseleave', (e) => this.onMouseLeave() );
        this.rootElem.addEventListener('click', (e) => this.onClick() );
        this.rootElem.addEventListener('dragover', (e) => e.preventDefault() );
        this.rootElem.addEventListener('drop', (e) => this.onDrop(e) );
        this.onload = () => { };
        this.resetInputFile();
    }

    private resetInputFile() {
        this.inputFile = document.createElement('input');
        this.inputFile.type = 'file';
        this.inputFile.addEventListener('change', (e) => this.onImageSelected(e) );
    }

    private hideHintText() {
        this.rootElem.style.color = 'rgba(0,0,0,0)';
    }

    private onMouseOver() {
        this.rootElem.style.textDecoration = 'underline';
    }

    private onMouseLeave() {
        this.rootElem.style.textDecoration = 'none';
    }

    private onClick() {
        this.inputFile.click();
    }

    private onImageSelected(event : any) {
        let selectedFile = event.target.files[0];
        if(selectedFile.type.match('image.*')) {
            let reader = new FileReader();
            reader.readAsDataURL(selectedFile);
            reader.onload = (loadedEvent : any) => {
                if(loadedEvent.target.readyState == FileReader.DONE) {
                    this.onImageReadAsDataUrl(loadedEvent.target.result);
                }
            };
        } else {
            console.error('The selected file is not an image');
        }
    }

    private onImageReadAsDataUrl(url : string) {
        this.rootElem.style.backgroundImage = `url(${url})`;
        this.rootElem.style.border = '5px solid gray';
        this.resetInputFile();
        this.hideHintText();
        var image = new Image();
        image.src = url;
        image.onload = () => this.onload(image);
    }

    private onDrop(event : any) {
        event.preventDefault();
        if(event.dataTransfer.items) {
            let item = event.dataTransfer.items[0];
            if(item.kind === 'file' ) {
                let selectedFile = item.getAsFile();
                let reader = new FileReader();
                reader.readAsDataURL(selectedFile);
                reader.onload = (loadedEvent : any) => {
                    if(loadedEvent.target.readyState == FileReader.DONE) {
                        this.onImageReadAsDataUrl(loadedEvent.target.result);
                    }
                };
            } else {
                console.error('Selected item is not a file');
            }
        }
    }
}