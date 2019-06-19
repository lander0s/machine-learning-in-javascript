import { Simulator } from './Simulator'
import { Genome } from './Genome'
import { LearnerConfig } from './Config'
import { Leaderboard } from './Leaderboard'

export class Learner {

    private simulator : Simulator;
    private genomes   : Array<Genome>
    private currentGeneration : number;
    private topFitness : number;
    private leaderboard : Leaderboard;

    constructor(simulator:Simulator, leaderboard: Leaderboard) {
        this.simulator = simulator;
        this.genomes = [];
        this.currentGeneration = 0;
        this.leaderboard = leaderboard;
    }

    public init() {
        this.genomes = [];
        for(let i = 0; i < LearnerConfig.generationSize; i++) {
            let rocket = this.simulator.addRocket();
            let genomeId = `${this.currentGeneration}.${i}`;
            let genome = new Genome(this.currentGeneration, genomeId);
            genome.init(rocket);
            this.genomes.push(genome);
        }
        this.topFitness = -99999;
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
            this.genomes.forEach((genome) =>{
                this.leaderboard.registerGenome(genome);
            });
            this.saveGenerationResult();
            this.createNextGeneration();
        }
    }

    private createNextGeneration() {
        let bestCandidates = this.selectBestCandidates();
        let firstPlace = bestCandidates[0];
        let secondPlace = bestCandidates[1];
        firstPlace.init(this.simulator.addRocket());
        secondPlace.init(this.simulator.addRocket());
        this.currentGeneration++;
        this.genomes = [firstPlace, secondPlace];
        for(let i = 2; i < LearnerConfig.generationSize; i++) {
            let rocket = this.simulator.addRocket();
            let genomeId = `${this.currentGeneration}.${i}`;
            let genome = new Genome(this.currentGeneration, genomeId);
            genome.init(rocket, firstPlace, secondPlace);
            this.genomes.push(genome);
        }
        if(this.topFitness < firstPlace.getFitness()) {
            this.topFitness = firstPlace.getFitness();
            document.querySelector('#top-fitness-label').innerHTML = `Top Fitness : <b>${this.topFitness|0}</b>`;
        }
        document.querySelector('#generation-label').innerHTML = `Generation : <b>${this.currentGeneration}</b>`;
    }

    private selectBestCandidates() : Array<Genome> {
        let firstPlace : Genome = null;
        let secondPlace : Genome = null;
        this.genomes.forEach((crtGenome) => {
            if(firstPlace == null || firstPlace.getFitness() < crtGenome.getFitness()) {
                firstPlace = crtGenome;
            }
        });

        this.genomes.forEach((crtGenome) => {
            if(firstPlace != crtGenome ) {
                if(secondPlace == null || secondPlace.getFitness() < crtGenome.getFitness())
                    secondPlace = crtGenome;
            }
        });
        return [firstPlace, secondPlace];
    }

    private saveGenerationResult() : void {
        let bestCandidates = this.selectBestCandidates();
        let save = {
            firstPlace : bestCandidates[0].toJson(),
            secondPlace : bestCandidates[1].toJson(),
            currentGeneration : this.currentGeneration,
            topFitness : this.topFitness,
        }
        localStorage.setItem('learner-save', JSON.stringify(save));
    }
}