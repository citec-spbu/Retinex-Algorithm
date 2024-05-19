export function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}


export function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}
const options = {
    contrast : 70,
    // retinexScale:0.62,
    sigma1:15,
    sigma2:40,
    sigma3:80
}

export function initSliderHandlers(draw){
    

    const contrastInput = document.getElementById('contrast-range');
    const contrastOutput = document.getElementById('contrast-output');

    // const scaleInput = document.getElementById('retinex-scale-range');
    // const scaleOutput = document.getElementById('retinex-scale-output');

    const sigma1Input = document.getElementById('sigma1-range');
    const sigma1Output = document.getElementById('sigma1-range-output');
    const sigma2Input = document.getElementById('sigma2-range');
    const sigma2Output = document.getElementById('sigma2-range-output');
    const sigma3Input = document.getElementById('sigma3-range');
    const sigma3Output = document.getElementById('sigma3-range-output');
    
    contrastInput.addEventListener('input', function() {
        contrastOutput.textContent = contrastInput.value;
        options.contrast = contrastInput.value;
        draw(options.contrast,options.retinexScale,options.sigma);
        
    });
    // scaleInput.addEventListener('input', function() {
    //     scaleOutput.textContent = scaleInput.value;
    //     options.retinexScale = scaleInput.value;
    //     draw(options.contrast,options.retinexScale,options.sigma);
        
    // });
    sigma1Input.addEventListener('input', function() {
        sigma1Output.textContent = sigma1Input.value;
        options.sigma1 = sigma1Input.value;
        draw(options.contrast,options.sigma1,options.sigma2,options.sigma3);
        
    });
    sigma2Input.addEventListener('input', function() {
        sigma2Output.textContent = sigma2Input.value;
        options.sigma2 = sigma2Input.value;
        draw(options.contrast,options.sigma1,options.sigma2,options.sigma3);
        
    });
    sigma3Input.addEventListener('input', function() {
        sigma3Output.textContent = sigma3Input.value;
        options.sigma3 = sigma3Input.value;
        draw(options.contrast,options.sigma1,options.sigma2,options.sigma3);
        
    });
    
}
