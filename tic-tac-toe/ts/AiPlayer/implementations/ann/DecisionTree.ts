import { Node } from './Node'

export class DecisionTree {

    private hashTable : Node[];

    constructor() {
        this.hashTable = [];
    }

    public build() : void {

    }

    public getNodes() : Node[] {
        return this.hashTable;
    }
}