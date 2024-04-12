import Phaser from "phaser";
export default class ProgramFile {
    image: Phaser.GameObjects.Image;
    button: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, file: string, x: number, y: number) {
        this.image = new Phaser.GameObjects.Image(scene, x, y, file);
        this.button = new Phaser.GameObjects.Image(
            scene,
            x + this.image.width / 2 - 42,
            y - this.image.height / 2,
            "x",
        );
        scene.add.existing(this.image).setInteractive({ draggable: true });
        scene.add.existing(this.button);
        this.button
            .setOrigin(0)
            .setInteractive()
            .on("pointerdown", () => {
                this.image.destroy();
                this.button.destroy();
            });
        this.image.on(
            "drag",
            (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
                this.image.x = dragX;
                this.image.y = dragY;
                this.button.x = dragX + this.image.width / 2 - 42;
                this.button.y = dragY - this.image.height / 2;
            },
        );
    }
}
