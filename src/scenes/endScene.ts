import Phaser from "phaser";
import FpsText from "../objects/fpsText";

export default class EndScene extends Phaser.Scene {
    fpsText: FpsText;

    constructor() {
        super({ key: "EndScene" });
    }

    create() {
        this.add.image(650, 350, "trueEnd");
        //input
    }

    update() {
        //this.fpsText.update();
    }
}
