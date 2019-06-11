

class DragImageElement {

    constructor(selector, text) {
        text = text || 'Drag an image here or click for browsing';
        this.selector = selector;
        this.rootElem = document.querySelector(selector);
        this.label = document.createElement('label');
        this.label.innerText = text;
        this.rootElem.appendChild(this.label);
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

    removeLabel() {
        if(this.label != null) {
            this.rootElem.removeChild(this.label);
            this.label = null;
        }
    }

    setOnLoadListener(callback) {
        this.onload = callback;
    }

    onMouseOver() {
        if(this.label != null) {
            this.label.style.textDecoration = 'underline';
        }
    }

    onMouseLeave() {
        if(this.label != null) {
            this.label.style.textDecoration = 'none';
        }
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
        this.removeLabel();
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