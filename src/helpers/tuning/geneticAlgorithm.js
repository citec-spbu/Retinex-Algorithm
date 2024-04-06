
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