import Phaser from "phaser";
import FpsText from "../objects/fpsText";

export default class EndScene extends Phaser.Scene {
    fpsText: FpsText;

    constructor() {
        super({ key: "EndScene" });
    }

    create() {
        this.add.image(650, 350, "end");
        //input
        this.input.on(
            "pointerdown",
            (
                pointer: Phaser.Input.Pointer, // we don't use the pointer param but if we don't include it it returns a pointer manager instead ugh
                objectsClicked: Phaser.GameObjects.Sprite[],
            ) => {
            },
        );
    }

    update() {
        //this.fpsText.update();
    }
}
