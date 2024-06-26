 /**
 * Calculates the average brightness of an image.
 *
 * @param {ImageData} imageData - The image data to calculate the brightness for.
 * @returns {number} - The average brightness of the image.
 */
 export function AB(imageData) {
    let brightnessSum = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
        brightnessSum += (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    }
    return brightnessSum / (imageData.width * imageData.height);
}


/**
 * Calculates the average contrast of an image.
 *
 * @param {ImageData} imageData - The image data to calculate the contrast for.
 * @param {number} averageBrightness - The average brightness of the image.
 * @returns {number} - The contrast of the image.
 */
export function AC(imageData, averageBrightness) {
    let contrastSum = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
        const pixelBrightness = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
        contrastSum += Math.abs(pixelBrightness - averageBrightness);
    }
    return contrastSum / (imageData.width * imageData.height);
}


/**
 * Calculates the entropy of an image's brightness distribution.
 *
 * @param {ImageData} imageData - The image data to calculate the entropy for.
 * @returns {number} - The entropy of the image.
 */
export function En(imageData) {
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < imageData.data.length; i += 4) {
        const brightness = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
        histogram[Math.round(brightness)]++;
    }
    let entropy = 0;
    const totalPixels = imageData.width * imageData.height;
    for (let i = 0; i < histogram.length; i++) {
        const probability = histogram[i] / totalPixels;
        if (probability > 0) {
            entropy -= probability * Math.log2(probability);
        }
    }
    return entropy;
}
/**
 * Calculates the variance of the gradient magnitude of an image.
 *
 * @param {ImageData} imageData - The image data to calculate the variance for.
 * @returns {number} - The variance of the gradient magnitude of the image.
 */
export function DEF(imageData) {
    const sobelKernelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];
    const sobelKernelY = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ];

    /**
     * Convolves the image data with a given kernel.
     *
     * @param {ImageData} imageData - The image data to convolve.
     * @param {Array<Array<number>>} kernel - The kernel to convolve with.
     * @returns {Float32Array} - The convolved image data.
     */
    function convolve(imageData, kernel) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const result = new Float32Array(width * height);

        const halfKernelSize = Math.floor(kernel.length / 2);
        for (let y = halfKernelSize; y < height - halfKernelSize; y++) {
            for (let x = halfKernelSize; x < width - halfKernelSize; x++) {
                let sum = 0;
                for (let ky = 0; ky < kernel.length; ky++) {
                    for (let kx = 0; kx < kernel.length; kx++) {
                        const pixelIndex = ((y + ky - halfKernelSize) * width + (x + kx - halfKernelSize)) << 2;
                        const pixelValue = data[pixelIndex];
                        const kernelValue = kernel[ky][kx];
                        sum += pixelValue * kernelValue;
                    }
                }
                result[y * width + x] = sum;
            }
        }
        return result;
    }

    const gradientX = convolve(imageData, sobelKernelX);
    const gradientY = convolve(imageData, sobelKernelY);

    const squaredMagnitude = new Float32Array(imageData.width * imageData.height);
    for (let i = 0; i < squaredMagnitude.length; i++) {
        squaredMagnitude[i] = gradientX[i] * gradientX[i] + gradientY[i] * gradientY[i];
    }

    let sum = 0;
    for (let i = 0; i < squaredMagnitude.length; i++) {
        sum += squaredMagnitude[i];
    }
    const mean = sum / squaredMagnitude.length;
    let variance = 0;
    for (let i = 0; i < squaredMagnitude.length; i++) {
        variance += (squaredMagnitude[i] - mean) * (squaredMagnitude[i] - mean);
    }
    return variance / squaredMagnitude.length;
}
/**
 * Calculates the colorfulness of an image.
 *
 * @param {ImageData} imageData - The image data to calculate the colorfulness for.
 * @returns {number} - The colorfulness of the image.
 */
export function CCI(imageData) {
    let colorfulnessSum = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const maxRGB = Math.max(r, g, b);
        const minRGB = Math.min(r, g, b);
        const delta = (maxRGB - minRGB) / 255.0;
        colorfulnessSum += delta;
    }
    return colorfulnessSum / (imageData.width * imageData.height);
}
/**
 * Calculates the fitness function for genetic algorithm.
 *
 * @param {WebGLRenderingContext} gl - The WebGL rendering context.
 * @returns {number} - The fitness of the image.
 */

/**
 * Calculates the fitness function for genetic algorithm.
 *
 * @param {WebGLRenderingContext} gl - The WebGL rendering context.
 * @returns {number} - The fitness of the image.
 */
export function calculateFit(gl){

    const pixelData = new Uint8Array(canvas.width * canvas.height * 4); 

    gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixelData);
    
    const imageData = new ImageData(new Uint8ClampedArray(pixelData), canvas.width, canvas.height);

    const ab = AB(imageData);
    const ac = AC(imageData,ab);
    const en = En(imageData);
    const def = DEF(imageData);
    const cci = CCI(imageData);
    const fit = (cci**4)*(ab*en*ac*def)**0.25 // fit formula
    return fit;

}