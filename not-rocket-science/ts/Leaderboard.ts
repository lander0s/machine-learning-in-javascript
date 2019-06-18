import { Genome } from './Genome'

export class Leaderboard {

    private leadGenomes : Array<any>

    constructor() {

    }

    public registerGenome(newGenome : Genome) : void {
        if(this.leadGenomes.length == 0) {
            this.leadGenomes.push({
                id : newGenome.getUUID(),
                fitness : newGenome.getFitness(),
                jsonObj : newGenome.toJson()
            });
        } else {
            this.removeIfExists(newGenome);
            for(let i = 0; i < this.leadGenomes.length; i++) {
                if(this.leadGenomes[i].fitness < newGenome.getFitness()) {
                    this.leadGenomes.splice(i,0, {
                        id : newGenome.getUUID(),
                        fitness : newGenome.getFitness(),
                        jsonObj : newGenome.toJson()
                    });
                    break;
                }
            }
            this.leadGenomes = this.leadGenomes.slice(0,10);
        }
        this.saveToLocalStorage();
        this.updateHud();
    }

    private removeIfExists(genome:Genome) {
        for(let i = 0; i < this.leadGenomes.length; i++) {
            if(genome.getUUID() == this.leadGenomes[i].id) {
                this.leadGenomes.splice(i,1);
                return;
            }
        }
    }

    public init() : void {
        this.leadGenomes = [];
        this.loadFromLocalStorage();
        this.saveToLocalStorage();
    }

    private updateHud() : void {
        let html = '<br> Leaderboard <hr> <table>'
            html += '<tr><td>Genome</td><td>Fitness</td></tr>'
        for(let i = 0; i < this.leadGenomes.length; i++) {
            html += `<tr><td>${this.leadGenomes[i].id}</td>`
            html += `<td>${this.leadGenomes[i].fitness|0}</td></tr>`;
        }
        html += '</table>'
        document.querySelector('#leaderboard-div').innerHTML = html;
    }

    private loadFromLocalStorage() : void {
        if(localStorage.getItem('leaderboard') != null) {
            this.leadGenomes = JSON.parse(localStorage.getItem('leaderboard'));
        } else {
            this.leadGenomes = [];
        }
    }

    private saveToLocalStorage() : void {
        localStorage.setItem('leaderboard', JSON.stringify(this.leadGenomes));
    }
}