export const WebGLContext = {
    gl: null,
    image: null,
    program: null,
    imageTexture: null,
    positionBuffer: null,
    positionLocation: null,
    contrastLocation: null,
    retinexScaleLocation: null,
    sigmaLocation: null,
    canvas: document.getElementById('canvas'),
    msDisplay: document.querySelector('#ms'),
    positions: new Float32Array([
        -1, -1,
        1, -1,
        -1,  1,
        -1,  1,
        1, -1,
        1,  1,
    ])
}
