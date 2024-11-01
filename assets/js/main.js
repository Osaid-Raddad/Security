let originalImageData;
let outputCanvas = document.querySelector(".result");
let outputContext = outputCanvas.getContext("2d");
let bitCount;

function selectImage() {
    document.querySelector(".imageInput").click();
}

document.querySelector(".imageInput").addEventListener("change", function (e) {
    let file = e.target.files[0];
    if (!file) {
        alert("Please select a BMP image.");
        return;
    }

    if (file.type !== "image/bmp") {
        alert("Please select a BMP image.");
        return;
    }

    let displayCanvas = document.querySelector(".cover");
    let displayContext = displayCanvas.getContext("2d");
    let img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = function () {
        displayCanvas.width = img.width;
        displayCanvas.height = img.height;
        displayContext.drawImage(img, 0, 0);
        originalImageData = displayContext.getImageData(0, 0, img.width, img.height);

        outputCanvas.width = img.width;
        outputCanvas.height = img.height;
        outputContext.putImageData(originalImageData, 0, 0);
    };
});


function textToBinary(text) {
    let binary = "";
    for (let i = 0; i < text.length; i++) {
        let binChar = text.charCodeAt(i).toString(2);
        binary += binChar.padStart(8, "0");
    }
    return binary;
}

function binaryToText(binary) {
    let text = "";
    for (let i = 0; i < binary.length; i += 8) {
        let byte = binary.slice(i, i + 8);
        text += String.fromCharCode(parseInt(byte, 2));
    }
    return text;
}



function hideText() {
    if (!originalImageData) {
        alert("Please select an image first.");
        return;
    }

    let text = document.querySelector(".secretText").value;
    if (!text) {
        alert("Please enter the text to hide.");
        return;
    }

    bitCount = parseInt(document.querySelector(".LSB-Mode").value);
    let binaryText = textToBinary(text) + "00000000";
    let data = new Uint8ClampedArray(originalImageData.data);
    let binaryIndex = 0;

    for (let i = 0; i < data.length; i += 4) {
        if (binaryIndex >= binaryText.length) break;

        for (let j = 0; j < 3; j++) { // Only RGB 
            if (binaryIndex >= binaryText.length) break;
            data[i + j] = (data[i + j] & ~((1 << bitCount) - 1)) | parseInt(binaryText.slice(binaryIndex, binaryIndex + bitCount), 2);
            binaryIndex += bitCount;
        }
    }

    let resultImageData = new ImageData(data, originalImageData.width, originalImageData.height);
    outputContext.putImageData(resultImageData, 0, 0);
}

function restoreText() {
    if (!originalImageData) {
        alert("Please hide the text in an image first.");
        return;
    }

    bitCount = parseInt(document.querySelector(".LSB-Mode").value);
    let data = outputContext.getImageData(0, 0, outputCanvas.width, outputCanvas.height).data;
    let binaryText = "";

    for (let i = 0; i < data.length; i += 4) {
        for (let j = 0; j < 3; j++) {
            binaryText += (data[i + j] & ((1 << bitCount) - 1)).toString(2).padStart(bitCount, "0");
        }
    }

    let extractedText = binaryToText(binaryText).split("\x00")[0];
    document.querySelector(".restoredText").value = extractedText;
}


function saveImage() {
    let link = document.createElement("a");
    link.download = "result.bmp";
    link.href = outputCanvas.toDataURL("image/bmp");
    link.click();
}
