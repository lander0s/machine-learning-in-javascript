define("DragImageElement", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var DragImageElement = (function () {
        function DragImageElement(selector, text) {
            var _this = this;
            if (text === void 0) { text = 'Drag an image here or click for browsing'; }
            this.selector = selector;
            this.rootElem = document.querySelector(selector);
            this.rootElem.innerHTML = text;
            this.rootElem.className = 'drag-image-element';
            this.rootElem.addEventListener('mouseover', function (e) { return _this.onMouseOver(); });
            this.rootElem.addEventListener('mouseleave', function (e) { return _this.onMouseLeave(); });
            this.rootElem.addEventListener('click', function (e) { return _this.onClick(); });
            this.rootElem.addEventListener('dragover', function (e) { return e.preventDefault(); });
            this.rootElem.addEventListener('drop', function (e) { return _this.onDrop(e); });
            this.onload = function () { };
            this.resetInputFile();
        }
        DragImageElement.prototype.resetInputFile = function () {
            var _this = this;
            this.inputFile = document.createElement('input');
            this.inputFile.type = 'file';
            this.inputFile.addEventListener('change', function (e) { return _this.onImageSelected(e); });
        };
        DragImageElement.prototype.hideHintText = function () {
            this.rootElem.style.color = 'rgba(0,0,0,0)';
        };
        DragImageElement.prototype.onMouseOver = function () {
            this.rootElem.style.textDecoration = 'underline';
        };
        DragImageElement.prototype.onMouseLeave = function () {
            this.rootElem.style.textDecoration = 'none';
        };
        DragImageElement.prototype.onClick = function () {
            this.inputFile.click();
        };
        DragImageElement.prototype.onImageSelected = function (event) {
            var _this = this;
            var selectedFile = event.target.files[0];
            if (selectedFile.type.match('image.*')) {
                var reader = new FileReader();
                reader.readAsDataURL(selectedFile);
                reader.onload = function (loadedEvent) {
                    if (loadedEvent.target.readyState == FileReader.DONE) {
                        _this.onImageReadAsDataUrl(loadedEvent.target.result);
                    }
                };
            }
            else {
                console.error('The selected file is not an image');
            }
        };
        DragImageElement.prototype.onImageReadAsDataUrl = function (url) {
            var _this = this;
            this.rootElem.style.backgroundImage = "url(" + url + ")";
            this.rootElem.style.border = '5px solid gray';
            this.resetInputFile();
            this.hideHintText();
            var image = new Image();
            image.src = url;
            image.onload = function () { return _this.onload(image); };
        };
        DragImageElement.prototype.onDrop = function (event) {
            var _this = this;
            event.preventDefault();
            if (event.dataTransfer.items) {
                var item = event.dataTransfer.items[0];
                if (item.kind === 'file') {
                    var selectedFile = item.getAsFile();
                    var reader = new FileReader();
                    reader.readAsDataURL(selectedFile);
                    reader.onload = function (loadedEvent) {
                        if (loadedEvent.target.readyState == FileReader.DONE) {
                            _this.onImageReadAsDataUrl(loadedEvent.target.result);
                        }
                    };
                }
                else {
                    console.error('Selected item is not a file');
                }
            }
        };
        return DragImageElement;
    }());
    exports.DragImageElement = DragImageElement;
});
define("Application", ["require", "exports", "DragImageElement"], function (require, exports, DragImageElement_1) {
    "use strict";
    exports.__esModule = true;
    var Application = (function () {
        function Application() {
        }
        Application.prototype.main = function () {
            this.exampleDragImage = new DragImageElement_1.DragImageElement('#example-image', 'original image goes here');
            this.filterDragImage = new DragImageElement_1.DragImageElement('#example-image-with-filter', 'filtered image goes here');
            this.challengeDragImage = new DragImageElement_1.DragImageElement('#challenge-image', 'a complete different image goes here');
        };
        return Application;
    }());
    exports.Application = Application;
});
