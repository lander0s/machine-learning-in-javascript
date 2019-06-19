import { Genome } from './Genome'

export class Leaderboard {

    private leadGenomes : Array<any>

    constructor() {

    }

    public registerGenome(newGenome : Genome) : void {
        this.leadGenomes.push({
            id : newGenome.getUUID(),
            fitness : newGenome.getFitness(),
            jsonObj : newGenome.toJson()
        });
        this.leadGenomes.sort((a:any, b:any) => {
            if( a.fitness < b.fitness)
                return 1;
            if( a.fitness > b.fitness)
                return -1;
            return 0;
        });
        this.leadGenomes = this.leadGenomes.splice(0,10);
        this.saveToLocalStorage();
        this.updateHud();
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