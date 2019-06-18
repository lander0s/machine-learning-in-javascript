import { Genome } from './Genome'

export class Leaderboard {

    private leadGenomes : Array<Genome>

    constructor() {

    }

    public registerGenome(newGenome : Genome) : void {
        if(this.leadGenomes.length == 0) {
            this.leadGenomes.push(newGenome);
        } else {
            for(let i = 0; i < this.leadGenomes.length; i++) {
                if(this.leadGenomes[i].getFitness() < newGenome.getFitness()) {
                    this.leadGenomes.splice(i,0, newGenome);
                    break;
                }
            }
            this.leadGenomes.splice(10, 1);
        }
        this.saveToLocalStorage();
        this.updateHud();
    }

    public init() : void {
        this.leadGenomes = [];
        this.loadFromLocalStorage();
    }

    private updateHud() : void {
        let html = '<br> Leaderboard <hr> <table>'
            html += '<tr><td>Genome</td><td>Fitness</td></tr>'
        for(let i = 0; i < this.leadGenomes.length; i++) {
            html += `<tr><td>${this.leadGenomes[i].getUUID()}</td>`
            html += `<td>${this.leadGenomes[i].getFitness()|0}</td></tr>`;
        }
        html += '</table>'
        document.querySelector('#leaderboard-div').innerHTML = html;
    }

    private loadFromLocalStorage() : void {

    }

    private saveToLocalStorage() : void {

    }
}