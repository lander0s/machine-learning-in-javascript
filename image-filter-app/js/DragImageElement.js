

class DragImageElement {

    constructor(selector, text) {
        text = text || 'Drag an image here or click for browsing';
        this.selector = selector;
        this.rootElem = document.querySelector(selector);
        this.rootElem.innerText = text;
        this.rootElem.className = 'drag-image-element';
        this.rootElem.addEventListener('mouseover', (e) => this.onMouseOver(e) );
        this.rootElem.addEventListener('mouseleave', (e) => this.onMouseLeave(e) );
        this.rootElem.addEventListener('click', (e) => this.onClick(e) );
        this.rootElem.addEventListener('dragover', (e) => e.preventDefault() );
        this.rootElem.addEventListener('drop', (e) => this.onDrop(e) );
        this.onload = (image) => { };
        this.resetInputFile();
    }

    resetInputFile() {
        this.inputFile = document.createElement('input');
        this.inputFile.type = 'file';
        this.inputFile.addEventListener('change', (e) => this.onImageSelected(e) );
    }

    hideHintText() {
        this.rootElem.style.color = 'rgba(0,0,0,0)';
    }

    setOnLoadListener(callback) {
        this.onload = callback;
    }

    onMouseOver() {
        this.rootElem.style.textDecoration = 'underline';
    }

    onMouseLeave() {
        this.rootElem.style.textDecoration = 'none';
    }

    onClick() {
        this.inputFile.click();
    }

    onImageSelected(event) {
        let selectedFile = event.target.files[0];
        if(selectedFile.type.match('image.*')) {
            let reader = new FileReader();
            reader.readAsDataURL(selectedFile);
            reader.onload = (loadedEvent) => {
                if(loadedEvent.target.readyState == FileReader.DONE) {
                    this.onImageReadAsDataUrl(loadedEvent.target.result);
                }
            };
        } else {
            console.error('The selected file is not an image');
        }
    }

    onImageReadAsDataUrl(url) {
        this.rootElem.style.backgroundImage = `url(${url})`;
        this.rootElem.style.border = '5px solid gray';
        this.resetInputFile();
        this.hideHintText();
        var image = new Image();
        image.src = url;
        image.onload = () => this.onload(image);
    }

    onDrop(event) {
        event.preventDefault();
        if(event.dataTransfer.items) {
            let item = event.dataTransfer.items[0];
            if(item.kind === 'file' ) {
                let selectedFile = item.getAsFile();
                let reader = new FileReader();
                reader.readAsDataURL(selectedFile);
                reader.onload = (loadedEvent) => {
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