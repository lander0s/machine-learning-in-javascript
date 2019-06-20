
export class Application {

    public main() {
        for(let i = 1; i <= 9; i++) {
            document.querySelector(`#cell${i}`)
                .addEventListener('click', () => this.onCellClicked(i));
        }
    }

    public onCellClicked(cellNo:number) {
        console.log(`cell ${cellNo} clicked`);
    }
}