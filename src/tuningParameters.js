

 export function AB(imageData) {
    let brightnessSum = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
        brightnessSum += (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    }
    return brightnessSum / (imageData.width * imageData.height);
}


export function AC(imageData, averageBrightness) {
    let contrastSum = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
        const pixelBrightness = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
        contrastSum += Math.abs(pixelBrightness - averageBrightness);
    }
    return contrastSum / (imageData.width * imageData.height);
}


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
export function calculateFit(gl){

    const pixelData = new Uint8Array(canvas.width * canvas.height * 4); 

    gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixelData);
    
    const imageData = new ImageData(new Uint8ClampedArray(pixelData), canvas.width, canvas.height);

    const ab = AB(imageData);
    const ac = AC(imageData,ab);
    const en = En(imageData);
    const def = DEF(imageData);
    const cci = CCI(imageData);
    const fit = (cci**4)*(ab*en*ac*def)**0.25
    return fit;

}


function generatePopulation(populationSize) {
    let population = [];
    for (let i = 0; i < populationSize; i++) {
        let scale = Math.random() * 10; 
        let sigma = Math.random() * 10;
        population.push({ scale: scale, sigma: sigma });
    }
    return population;
}

function calculateFitness(draw,population) {
    for (let individual of population) {
        individual.fitness = draw(0.3,individual.scale, individual.sigma);
    }
}

function selectParents(population, tournamentSize) {
    let parents = [];
    for (let i = 0; i < population.length; i++) {
        let tournament = [];
        for (let j = 0; j < tournamentSize; j++) {
            tournament.push(population[Math.floor(Math.random() * population.length)]);
        }
        tournament.sort((a, b) => b.fitness - a.fitness);
        parents.push(tournament[0]);
    }
    return parents;
}

function crossover(parent1, parent2, crossoverRate) {
    if (Math.random() < crossoverRate) {
        let scale = Math.random() < 0.5 ? parent1.scale : parent2.scale;
        let sigma = Math.random() < 0.5 ? parent1.sigma : parent2.sigma;
        return { scale: scale, sigma: sigma };
    } else {
        return Math.random() < 0.5 ? parent1 : parent2;
    }
}

function mutate(individual, mutationRate) {
    if (Math.random() < mutationRate) {
        individual.scale += (Math.random() - 0.5) * 0.1; 
        individual.sigma += (Math.random() - 0.5) * 0.1; 
    }
}

// Генетический алгоритм
export function geneticAlgorithm(draw,populationSize, tournamentSize, crossoverRate, mutationRate, generations) {
    let population = generatePopulation(populationSize);
    for (let i = 0; i < generations; i++) {
        calculateFitness(draw,population);
        let parents = selectParents(population, tournamentSize);
        let newPopulation = [];
        for (let j = 0; j < populationSize; j += 2) {
            let offspring1 = crossover(parents[j], parents[j + 1], crossoverRate);
            let offspring2 = crossover(parents[j + 1], parents[j], crossoverRate);
            mutate(offspring1, mutationRate);
            mutate(offspring2, mutationRate);
            newPopulation.push(offspring1);
            newPopulation.push(offspring2);
        }
        population = newPopulation;
    }
    population.sort((a, b) => b.fitness - a.fitness);
    let {sigma, scale} = population[0]; 
    if (sigma>1.5) sigma = 1.5;
    if (scale>1.5) scale = 1.5;
    return {sigma, scale};
}
export function tune(draw){
    let {scale,sigma} = geneticAlgorithm(draw,10, 3, 1, 0.1, 20);
    const scaleInput = document.getElementById('retinex-scale-range');
    const scaleOutput = document.getElementById('retinex-scale-output');
    scaleOutput.innerText = scale.toFixed(1);
    scaleInput.value = scale.toFixed(1);
    const sigmaInput = document.getElementById('sigma-range');
    const sigmaOutput = document.getElementById('sigma-range-output');
    sigmaInput.value = sigma.toFixed(1);
    sigmaOutput.innerText = sigma.toFixed(1);;
    const fit = draw(0.3,scale,sigma);
    console.log("Fit: " + fit);
}