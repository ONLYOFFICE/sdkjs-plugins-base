/**
 *
 * (c) Copyright Ascensio System SIA 2020
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
var oImage = false;
var imageEditor = null;
var themeStyle = null;
var bNewVersion = false;

(function(window, undefined){

    window.Asc.plugin.onThemeChanged = function (theme) {

        var head  = document.getElementsByTagName('head')[0];
        var link  = document.createElement('link');
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.media = 'all';

        if(theme.type === "dark") {
            themeStyle = blackTheme;
            link.href = './style/black-theme.css';
        } else {
            themeStyle = whiteTheme;
            link.href = './style/white-theme.css';
        }
        head.appendChild(link);
    };

    var translationDone = false;
    var initializationDone = false;
    var language = null;

    window.Asc.plugin.onTranslate = function () {
        language = {
            'Grayscale': window.Asc.plugin.tr("Grayscale"),
            'Sepia': window.Asc.plugin.tr("Sepia"),
            'Blur': window.Asc.plugin.tr("Blur"),
            'Emboss': window.Asc.plugin.tr("Emboss"),
            'Invert': window.Asc.plugin.tr("Invert"),
            'Sepia2': window.Asc.plugin.tr("Sepia2"),
            'Sharpen': window.Asc.plugin.tr("Sharpen"),
            'Remove White': window.Asc.plugin.tr("Remove White"),
            'Threshold': window.Asc.plugin.tr("Threshold"),
            'Distance': window.Asc.plugin.tr("Distance"),
            'Gradient transparency': window.Asc.plugin.tr("Gradient transparency"),
            'Value': window.Asc.plugin.tr("Value"),
            'Brightness': window.Asc.plugin.tr("Brightness"),
            'Noise': window.Asc.plugin.tr("Noise"),
            'Pixelate': window.Asc.plugin.tr("Pixelate"),
            'Color Filter': window.Asc.plugin.tr("Color Filter"),
            'Tint': window.Asc.plugin.tr("Tint"),
            'Multiply': window.Asc.plugin.tr("Multiply"),
            'Blend': window.Asc.plugin.tr("Blend"),
            'Filter': window.Asc.plugin.tr("Filter"),
            'Mask': window.Asc.plugin.tr("Mask"),
            'Text': window.Asc.plugin.tr("Text"),
            'Icon': window.Asc.plugin.tr("Icon"),
            'Shape': window.Asc.plugin.tr("Shape"),
            'Draw': window.Asc.plugin.tr("Draw"),
            'Rotate': window.Asc.plugin.tr("Rotate"),
            'Flip': window.Asc.plugin.tr("Flip"),
            'Flip X': window.Asc.plugin.tr("Flip X"),
            'Flip Y': window.Asc.plugin.tr("Flip Y"),
            'Crop': window.Asc.plugin.tr("Crop"),
            'DeleteAll': window.Asc.plugin.tr("Delete all"),
            'Delete': window.Asc.plugin.tr("Delete"),
            'Reset': window.Asc.plugin.tr("Reset"),
            'Redo': window.Asc.plugin.tr("Redo"),
            'Undo': window.Asc.plugin.tr("Undo"),
            'Load Mask Image': window.Asc.plugin.tr("Load Mask Image"),
            'Apply': window.Asc.plugin.tr("Apply"),
            'Cancel': window.Asc.plugin.tr("Cancel"),
            'Bold': window.Asc.plugin.tr("Bold"),
            'Italic': window.Asc.plugin.tr("Italic"),
            'Underline': window.Asc.plugin.tr("Underline"),
            'Left': window.Asc.plugin.tr("Left"),
            'Center': window.Asc.plugin.tr("Center"),
            'Right': window.Asc.plugin.tr("Right"),
            'Color': window.Asc.plugin.tr("Color"),
            'Text size': window.Asc.plugin.tr("Text size"),
            'Arrow': window.Asc.plugin.tr("Arrow"),
            'Arrow-1': window.Asc.plugin.tr("Arrow")  + "-1",
            'Arrow-2': window.Asc.plugin.tr("Arrow")  + "-2",
            'Arrow-3': window.Asc.plugin.tr("Arrow") + "-3",
            'Star': window.Asc.plugin.tr("Star"),
            'Star-1': window.Asc.plugin.tr("Star-1"),
            'Star-2': window.Asc.plugin.tr("Star-2"),
            'Polygon': window.Asc.plugin.tr("Polygon"),
            'Location': window.Asc.plugin.tr("Location"),
            'Heart': window.Asc.plugin.tr("Heart"),
            'Bubble': window.Asc.plugin.tr("Bubble"),
            'Custom icon': window.Asc.plugin.tr("Custom icon"),
            'Rectangle': window.Asc.plugin.tr("Rectangle"),
            'Circle': window.Asc.plugin.tr("Circle"),
            'Triangle': window.Asc.plugin.tr("Triangle"),
            'Fill': window.Asc.plugin.tr("Fill"),
            'Stroke': window.Asc.plugin.tr("Stroke"),
            'Free': window.Asc.plugin.tr("Free"),
            'Straight': window.Asc.plugin.tr("Straight"),
            'Range': window.Asc.plugin.tr("Range"),
            'Custom': window.Asc.plugin.tr("Custom"),
            'Square': window.Asc.plugin.tr("Square"),
            'Resize': window.Asc.plugin.tr("Resize"),
            'Width': window.Asc.plugin.tr("Width"),
            'Height': window.Asc.plugin.tr("Height"),
            'Lock Aspect Ratio': window.Asc.plugin.tr("Lock Aspect Ratio"),
            'Hand': window.Asc.plugin.tr("Hand"),
            'History': window.Asc.plugin.tr("History")
        };

        CreateImageEditor();
        translationDone = true;
    };

    window.Asc.plugin.init = function (sHtml) {
        window.Asc.plugin.executeMethod('GetVersion', [], function(ver) {
            Version = ver;
            console.log(Version);
        });

        window.Asc.plugin.executeMethod("GetImageDataFromSelection", [], function(oResult) {
            if (oResult) {
                oImage = document.createElement("img");
                oImage.src = oResult.src;
                oImage.width = oResult.width;
                oImage.height = oResult.height;
                bNewVersion = true;
            } else {
                oImage = $(sHtml)[0];
                if (!oImage || !$(oImage).is('img')) {
                    oImage = $(sHtml).find('img')[0];
                }
                if (!oImage) {
                    oImage = document.createElement("img");
                    //white rect
                    oImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAIAAAD2HxkiAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAMrSURBVHhe7dMxAQAADMOg+TfdycgDHrgBKQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJISYhBCTEGISQkxCiEkIMQkhJiHEJITU9vSZzteUMFOrAAAAAElFTkSuQmCC';
                    oImage.width = 300;
                    oImage.height = 300;
                }
                bNewVersion = (oResult === null);
            }
            CreateImageEditor();
            initializationDone = true;
            var imageHeight = null;
            oImage.height > 500 ? imageHeight = 500 : imageHeight = oImage.height;
            window.Asc.plugin.resizeWindow(undefined, undefined, 870, imageHeight + 300, 0, 0);
        });       
    };

    window.Asc.plugin.button = function (id) {

        if (id == 0) {
            if (imageEditor.getDrawingMode() === 'CROPPER') {
                var imageData = imageEditor.crop(imageEditor.getCropzoneRect()).then(function () {
                        saveImage();
                    }
                );
            } else {
                saveImage();
            }
        } else {
            this.executeCommand("close", "");
        }
    };

    function CreateImageEditor() {

        if (initializationDone == true || translationDone == true) {
            imageEditor = new tui.ImageEditor('#tui-image-editor-container', {

                includeUI: {
                    loadImage: {
                        path: oImage.src,
                        name: 'Image'
                    },
                    theme: themeStyle,
                    initMenu: 'filter',
                    menuBarPosition: 'bottom',
                    locale: language
                },
                usageStatistics: false,
                cssMaxWidth: 700,
                cssMaxHeight: 500,
            });
            document.getElementsByClassName('tie-btn-zoomIn')[0].style.display = 'none';
            document.getElementsByClassName('tie-btn-zoomOut')[0].style.display = 'none';
            document.getElementsByClassName('tie-btn-hand')[0].style.display = 'none';
            document.getElementsByClassName('tie-btn-hand')[0].nextSibling.style.display = 'none';
        }
    }

    window.saveImage = function () {
        if (bNewVersion) {
            let sImageSrc = imageEditor.toDataURL();
            let editorDimension = imageEditor.getCanvasSize();
            let nWidth = editorDimension.width;
            let nHeight = editorDimension.height;
            let oImageData = {
                "src": sImageSrc,
                "width": nWidth,
                "height": nHeight
            };
            window.Asc.plugin.executeMethod ("PutImageDataToSelection", [oImageData]);
            window.Asc.plugin.executeCommand("close", "");
        } else {
            Asc.scope.dataURL = imageEditor.toDataURL();
            var editorDimension = imageEditor.getCanvasSize();
            Asc.scope.editorDimensionWidth = editorDimension.width;
            Asc.scope.editorDimensionHeight = editorDimension.height;
            var saveImage = createScript();
        }
    }

    window.createScript = function () {

        switch (window.Asc.plugin.info.editorType) {
            case 'word': {
                window.Asc.plugin.callCommand(function () {
                    var oDocument = Api.GetDocument();
                    var oParagraph, arrInsertResult = [], oImage;
                
                    var nEmuWidth = ((Asc.scope.editorDimensionWidth / 96) * 914400 + 0.5) >> 0;
                    var nEmuHeight = ((Asc.scope.editorDimensionHeight / 96) * 914400 + 0.5) >> 0;
                    oImage = Api.CreateImage(Asc.scope.dataURL, nEmuWidth, nEmuHeight);
                    var aSelectedImgs = oDocument.GetSelectedDrawings ? oDocument.GetSelectedDrawings() : [];
                    var oSourceImg = aSelectedImgs[0] ? aSelectedImgs[0] : null;
                    
                    // replace selected img by new img
                    if (oSourceImg)
                    {
                        oDocument.ReplaceDrawing(oSourceImg, oImage, true);
                    }
                    // support old version
                    else
                    {
                        oParagraph = Api.CreateParagraph();
                        arrInsertResult.push(oParagraph);
                        oParagraph.AddDrawing(oImage);
                        oDocument.InsertContent(arrInsertResult);
                    }
                }, true);
                break;

            }
            case 'cell': {
                window.Asc.plugin.callCommand(function () {
                    var oWorksheet = Api.GetActiveSheet();
                    var nEmuWidth = ((Asc.scope.editorDimensionWidth / 96) * 914400 + 0.5) >> 0;
                    var nEmuHeight = ((Asc.scope.editorDimensionHeight / 96) * 914400 + 0.5) >> 0;
                    oWorksheet.ReplaceCurrentImage(Asc.scope.dataURL, nEmuWidth, nEmuHeight);
                }, true);
                break;
            }
            case 'slide': {
                window.Asc.plugin.callCommand(function () {
                    var oPresentation = Api.GetPresentation();
                    var nEmuWidth = ((Asc.scope.editorDimensionWidth / 96) * 914400 + 0.5) >> 0;
                    var nEmuHeight = ((Asc.scope.editorDimensionHeight / 96) * 914400 + 0.5) >> 0;
                    oPresentation.ReplaceCurrentImage(Asc.scope.dataURL, nEmuWidth, nEmuHeight);
                }, true);
                break;
            }

        }
    };
    
})(window, undefined);
