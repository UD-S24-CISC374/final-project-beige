import Phaser from "phaser";
import FpsText from "../objects/fpsText";

export default class EndScene extends Phaser.Scene {
    fpsText: FpsText;

    constructor() {
        super({ key: "EndScene" });
    }

    create() {
        let black = this.add.image(650, 350, "trueEnd");
        black.scale = 2;
        black.setTint(0x000000);
        this.add.image(650, 350, "trueEnd");
        //input
    }

    update() {
        //this.fpsText.update();
    }
}
