import { createShader, createProgram, initSliderHandlers, options } from './utils.js';
export let gl;
import {tune} from './helpers/tuning/tune.js';
import {calculateFit} from './helpers/tuning/calculateFit.js';
import {card, mainPhoto,restPhotos} from './upload.js';
let image;
let program;
let positionLocation;
let imageTexture;
let positionBuffer;
let contrastLocation
let retinexScaleLocation
let sigmaLocation
let canvas = document.getElementById('canvas');
const msDisplay = document.querySelector('#ms');

const positions = new Float32Array([
    -1, -1,
    1, -1,
    -1,  1,
    -1,  1,
    1, -1,
    1,  1,
]);

async function loadShaderSource(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load shader source from ${url}`);
    }
    return await response.text();
}
export async function init(src) {
    gl = canvas.getContext("webgl");
    if (!gl) {
        console.error("WebGL not supported");
        return;
    }

    const vertexShaderSource = await loadShaderSource('webgl/vertexShader.glsl');
    const fragmentShaderSource = await loadShaderSource('webgl/fragmentShader.glsl');

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    program = createProgram(gl, vertexShader, fragmentShader);

    positionLocation = gl.getAttribLocation(program, "a_position");

    imageTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");
    const textureWidth = 360;
    const textureHeight = 236;    
    gl.uniform2f(textureSizeLocation, textureWidth, textureHeight);

    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);


    contrastLocation = gl.getUniformLocation(program, "u_contrast");
    retinexScaleLocation = gl.getUniformLocation(program, "u_retinex_scale");
    sigmaLocation = gl.getUniformLocation(program, "u_sigma");

    loadImage(src);
}

function loadImage(url) {
    image = new Image();
    image.crossOrigin = '';
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, imageTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        canvas.height = image.height;
        canvas.width = image.width;
        draw();
        
    };
    image.src = url
}





function draw(contrast = 0.3, retinexScale = 0.62, sigma = 1, isConfiguring = false) {
    const startTime = performance.now();

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.uniform1f(contrastLocation, contrast);
    gl.uniform1f(retinexScaleLocation, retinexScale);
    gl.uniform1f(sigmaLocation, sigma);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    let fit;
    if (isConfiguring) fit = calculateFit(gl);

    const endTime = performance.now();
    const executionTime = endTime - startTime;
    msDisplay.innerHTML = `Execution time: ${Math.floor(executionTime)} milliseconds`

    return fit;
}
function configure(){
   tune(draw);
}

export async function renderImageArray(){
    mainPhoto.classList.remove('noneDisplay');
    restPhotos.classList.remove('noneDisplay');
    card.classList.add('noneDisplay');

    const response = await fetch('fileNames.json')
    const files = await response.json();

    for (let fileName of files){
        await init("/our485/low/"+fileName)
        console.log("/our485/low/"+fileName);
   
    }
}

document.getElementById("configure").onclick= configure;
document.getElementById("video").onclick= renderImageArray;

window.onload = () => {
    init();
    initSliderHandlers(draw);
};
