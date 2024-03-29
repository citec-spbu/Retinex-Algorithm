import { createShader, createProgram, initSliderHandlers, options } from './utils.js';
let gl;
let image;
let program;
let positionLocation;
let texCoordLocation;
let imageTexture;
async function loadShaderSource(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load shader source from ${url}`);
    }
    return await response.text();
}

export async function init(src) {
    const canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl");
    if (!gl) {
        console.error("WebGL not supported");
        return;
    }

    const vertexShaderSource = await loadShaderSource('vertexShader.glsl');
    const fragmentShaderSource = await loadShaderSource('fragmentShader.glsl');

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


    loadImage(src);
    initSliderHandlers(draw);
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
let lastFrameTime = performance.now();
let fpsCounter = 0;
const fpsDisplay = document.querySelector('#fps');
function draw(contrast = 0.5,retinexScale=0.62,sigma=5) {
    requestAnimationFrame(() => {
        draw(options.contrast,options.retinexScale,options.sigma);
    });

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    const contrastLocation = gl.getUniformLocation(program, "u_contrast");
    gl.uniform1f(contrastLocation, contrast);

    const retinexScaleLocation = gl.getUniformLocation(program, "u_retinex_scale");
    gl.uniform1f(retinexScaleLocation, retinexScale);

    const sigmaLocation = gl.getUniformLocation(program, "u_sigma");
    gl.uniform1f(sigmaLocation, sigma);
    
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        -1, -1,
        1, -1,
        -1,  1,
        -1,  1,
        1, -1,
        1,  1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Calculate FPS
    let currentTime = performance.now();
    let elapsed = currentTime - lastFrameTime;

    fpsCounter++;
    if (elapsed >= 1000) {
        const fps = fpsCounter * 1000 / elapsed;
        console.log(fps);
        fpsDisplay.innerText = fps.toFixed(1);
        fpsCounter = 0;
        lastFrameTime = currentTime;
    }




}

window.onload = init;
