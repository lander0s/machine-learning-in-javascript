import { Simulator } from './Simulator'
import { Genome } from './Genome'
import { LearnerConfig } from './Config'

export class Learner {

    private simulator : Simulator;
    private genomes   : Array<Genome>
    private currentGeneration : number;

    constructor(simulator:Simulator) {
        this.simulator = simulator;
        this.genomes = [];
        this.currentGeneration = 0;
    }

    public init() {
        this.genomes = [];
        for(let i = 0; i < LearnerConfig.generationSize; i++) {
            let rocket = this.simulator.addRocket();
            let genomeId = `${this.currentGeneration}.${i}`;
            let genome = new Genome(this.currentGeneration, genomeId, rocket);
            genome.createNeuralNetworkFromScratch();
            this.genomes.push(genome);
        }
    }

    public update() : void {
        let genomesThatFinished = 0;
        this.genomes.forEach( (genome) => {
            genome.update();
            if(genome.didFinish()) {
                genomesThatFinished++;
            }
        });

        if(genomesThatFinished == this.genomes.length) {
            this.createNextGeneration();
        }
    }

    private createNextGeneration() {
        let firstPlace = this.getAndRemoveBestCandidate();
        let secondPlace = this.getAndRemoveBestCandidate();
        this.currentGeneration++;
        this.genomes = [firstPlace, secondPlace];
        for(let i = 2; i < LearnerConfig.generationSize; i++) {
            let rocket = this.simulator.addRocket();
            let genomeId = `${this.currentGeneration}.${i}`;
            let genome = new Genome(this.currentGeneration, genomeId, rocket);
            genome.fromParents(firstPlace, secondPlace);
            this.genomes.push(genome);
        }
    }

    private getAndRemoveBestCandidate() : Genome {
        let bestCandidateIndex = 0;
        let bestCandidate = this.genomes[bestCandidateIndex];

        for(let i = 0; i < this.genomes.length; i++) {
            let crtGenome = this.genomes[i];
            if(bestCandidate.getFitness() < crtGenome.getFitness()) {
                bestCandidateIndex = i;
                bestCandidate = crtGenome;
            }
        }
        this.genomes.splice(bestCandidateIndex, 1);
        return bestCandidate;
    }
}