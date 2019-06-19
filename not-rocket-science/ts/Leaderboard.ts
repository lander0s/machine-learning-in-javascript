import { Genome } from './Genome'

export class Leaderboard {

    private leadGenomes : Array<Genome>

    constructor() {

    }

    public registerGenome(newGenome : Genome) : void {
        this.removeFromLeaderboard(newGenome);
        this.leadGenomes.push(newGenome);
        this.leadGenomes.sort((a:Genome, b:Genome) => {
            if( a.getFitness() < b.getFitness())
                return 1;
            if( a.getFitness() > b.getFitness())
                return -1;
            return 0;
        });
        this.leadGenomes = this.leadGenomes.splice(0,10);
        this.saveToLocalStorage();
        this.updateHud();
    }

    private removeFromLeaderboard(genome:Genome) : void {
        for(let i = 0; i < this.leadGenomes.length; i++) {
            if(this.leadGenomes[i].getId() == genome.getId()) {
                this.leadGenomes.splice(i,1);
                break;
            }
        }
    }

    public init() : void {
        this.leadGenomes = [];
        this.loadFromLocalStorage();
        this.saveToLocalStorage();
        this.updateHud();
    }

    private updateHud() : void {
        let html = '<br> Leaderboard <hr> <table>'
            html += '<tr><td>Genome</td><td>Fitness</td></tr>'
        for(let i = 0; i < this.leadGenomes.length; i++) {
            html += `<tr><td>${this.leadGenomes[i].getId()}</td>`
            html += `<td>${this.leadGenomes[i].getFitness()|0}</td></tr>`;
        }
        html += '</table>'
        document.querySelector('#leaderboard-div').innerHTML = html;
    }

    private loadFromLocalStorage() : void {
        this.leadGenomes = [];
        if(localStorage.getItem('leaderboard') != null) {
            let genomesAsJsonObjects : Array<any> = JSON.parse(localStorage.getItem('leaderboard'));
            genomesAsJsonObjects.forEach((genomeJsonObj)=>{
                this.leadGenomes.push(Genome.fromJson(genomeJsonObj));
            });
        }
    }

    private saveToLocalStorage() : void {
        let genomesAsJsonObjects : Array<any> = [];
        this.leadGenomes.forEach((genome:Genome) => {
            genomesAsJsonObjects.push(genome.toJson());
        });
        localStorage.setItem('leaderboard', JSON.stringify(genomesAsJsonObjects));
    }
}