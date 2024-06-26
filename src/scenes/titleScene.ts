import Phaser from "phaser";
import FpsText from "../objects/fpsText";

export default class TitleScene extends Phaser.Scene {
    fpsText: FpsText;

    constructor() {
        super({ key: "TitleScene" });
    }

    create() {
        this.add.image(650, 350, "title");
        //input
        this.input.on(
            "pointerdown",
            (
                pointer: Phaser.Input.Pointer, // we don't use the pointer param but if we don't include it it returns a pointer manager instead ugh
                objectsClicked: Phaser.GameObjects.Sprite[],
            ) => {
                console.log(objectsClicked);
                console.log(pointer);
                this.scene.stop();
                // swap to new scene
                this.scene.start("StartScene");
            },
        );
    }

    update() {
        //this.fpsText.update();
    }
}
