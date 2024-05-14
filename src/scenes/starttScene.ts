import * as cowsay from "cowsay";
import Phaser from "phaser";
import { escapeHTML, CATFS } from "../fs/CatFS";
import TextFile from "../objects/textFile";
import ProgramFile from "../objects/programFile";
// CODE FOR createSpeechBubbles() HEAVILY REFERENCED FROM HERE: https://github.com/phaserjs/examples/blob/master/public/src/game%20objects/text/speech%20bubble.js

const MAX_TERMINAL_INPUT_HISTORY = 512;

export default class StartScene extends Phaser.Scene {
    // this will have a number corresponding to the speech bubble 'ID' and an object containing the speech bubble graphics to display
    bubbleData: object;
    lastOutput: string;
    commandCount: number;
    hint6: boolean;
    terminalHistory: string[] = [];
    terminalHistoryIndex: number = 0;
    CAT: Phaser.GameObjects.Sprite;
    // this is the objective
    objectiveText: Phaser.GameObjects.Text;
    // this is the first locked program
    murderArticle: Phaser.GameObjects.Image;
    hackArticle: Phaser.GameObjects.Image;
    findMe: Phaser.GameObjects.Image;
    fileDepth: number = 0;

    constructor() {
        super({ key: "StartScene" });
    }

    create() {
        //Adding scene variable for passing in scene to objects
        const thisScene = this;
        // dummy data to avoid undefined error on first use of cycleDialogue()
        this.bubbleData = { bubbleNum: 0, showBubble: {} };
        this.commandCount = 0;
        this.hint6 = false;
        // Spawn in the background and CAT image
        this.add.image(400, 300, "desktopBG");
        this.CAT = this.add.sprite(1100, 600, "CAT");
        // Add File Sound Effects
        let lockedsfx = this.sound.add("lockedfile");
        // GLOBL SOUNDS
        let pop = this.sound.add("pop");
        let blip = this.sound.add("blip");
        let backgroundLoop = this.sound.add("background");
        backgroundLoop.setLoop(true);
        backgroundLoop.setVolume(0.3);
        backgroundLoop.play();

        // Make CAT clickable
        this.CAT.setInteractive();
        this.objectiveText = this.add.text(0, 0, "");
        //Function for opening article rn
        function makeTxtFile(text: string) {
            new TextFile(
                thisScene,
                text,
                Math.floor(Math.random() * (1000 - 600 + 1)) + 600,
                Math.floor(Math.random() * (500 - 20 + 1)) + 20,
            );
        }
        function makeProgramFile(text: string) {
            new ProgramFile(
                thisScene,
                text,
                Math.floor(Math.random() * (1100 - 600 + 1)) + 600,
                Math.floor(Math.random() * (520 - 220 + 1)) + 220,
            );
        }

        // when clicked, cycle dialogue + open some files
        this.input.on(
            "pointerdown",
            (
                pointer: Phaser.Input.Pointer, // we don't use the pointer param but if we don't include it it returns a pointer manager instead ugh
                objectsClicked: Phaser.GameObjects.Sprite[],
            ) => {
                // THIS IS FOR DEBUGGING
                // if a something without a texture is clicked then the console log will cause an error, keep the if-statement for safety
                if (objectsClicked.length > 0) {
                    console.log(objectsClicked[0].texture.key);
                } else {
                    console.log("Nothing was clicked");
                }
                // CYCLE DIALOGUE HERE
                if (
                    objectsClicked.length > 0 &&
                    objectsClicked[0].texture.key === "CAT"
                ) {
                    this.cycleDialogue(
                        Object.values(this.bubbleData)[0],
                        Object.values(this.bubbleData)[1],
                    );
                    pop.play();
                    // CHECK FOR UNLOCKED FILES HERE
                } else if (
                    objectsClicked.length > 0 &&
                    objectsClicked[0].texture.key === "unlocked program"
                ) {
                    if(objectsClicked[0] === this.murderArticle){
                        makeProgramFile("article1");
                    }
                    else if(objectsClicked[0] === this.hackArticle){
                        this.hackArticle.clearTint();
                        makeProgramFile("article2");
                    }
                } else if (
                    objectsClicked.length > 0 &&
                    objectsClicked[0].texture.key === "unlocked text"
                ){
                    if(objectsClicked[0] === this.findMe){
                        if(CATFS.exists("/project/1100/cat.zip")){
                            makeTxtFile(CATFS.readFile("/project/1100/cat.zip/cat/find_me.txt"));
                        }
                        else{
                            makeTxtFile(CATFS.readFile("/project/1100/cat/cat/find_me.txt"));
                        }
                    }
                }
            },
        );

        // FILES
        // currently do nothing, should be spaced 100 pixels apart

        //Create Locked Program which cannot be accessed
        this.murderArticle = this.add
            .image(100, 100, "unlocked program")
            .setInteractive();

        this.murderArticle.on("pointerup", () => {
            this.murderArticle.clearTint();
        });

        //Create Red Locked Text File which cannot be accessed
        this.findMe = this.add
            .image(200, 100, "r locked text")
            .setInteractive();
        this.findMe.on("pointerdown", ()=> {
            this.findMe.setTint(0xff6666);
            lockedsfx.play();
        });
        this.findMe.on("pointerup", ()=> {
            this.findMe.clearTint();
        });
        //Create Red Locked Program
        this.hackArticle = this.add
            .image(300, 100, "r locked program")
            .setInteractive();
        this.hackArticle.on("pointerdown", () =>{
            this.hackArticle.setTint(0xff6666);
            lockedsfx.play();
        });
        this.hackArticle.on("pointerup", ()=> {
            this.hackArticle.clearTint();
        });
        //Create Text File which CAN be accessed
        const txt1 = this.add.image(100, 200, "unlocked text").setInteractive();
        txt1.on("pointerdown", function () {
            txt1.setTint(0xaaaaff);
        });
        txt1.on("pointerup", () => {
            txt1.clearTint();
            makeTxtFile(CATFS.readFile("/home/instructions.txt"));
        });
        // SPEECH
        // switch cases are used to determine which speech bubble to display/destory
        this.cycleDialogue(
            Object.values(this.bubbleData)[0],
            Object.values(this.bubbleData)[1],
        );

        // TERMINAL (0)
        // -- Sizing constants
        const terminalWidth = 1280 / 2;
        const terminalHeight = 400;
        const terminalInputHeight = 32;
        // -- Input
        const terminalInput = document.createElement("input");
        terminalInput.id = "terminal-input";
        terminalInput.className = "jetbrains-mono-normal";
        terminalInput.type = "text";
        terminalInput.style.width = `${terminalWidth - 8}px`;
        terminalInput.style.height = `${terminalInputHeight}px`;
        terminalInput.addEventListener("keydown", (event) => {
            const setInputText = (text: string) => {
                terminalInput.focus();
                terminalInput.value = text;
                // Set a timeout because the up arrow key wants to move the cursor to the front
                setTimeout(() => {
                    terminalInput.setSelectionRange(
                        terminalInput.value.length,
                        terminalInput.value.length,
                    );
                }, 1);
            };

            if (event.code === "Enter") {
                blip.play();

                const text = escapeHTML(terminalInput.value.trim());
                if (
                    this.terminalHistory.length === 0 ||
                    (this.terminalHistory.length > 0 &&
                        this.terminalHistory[
                            this.terminalHistory.length - 1
                        ] !== text)
                ) {
                    this.terminalHistory.push(text);
                }
                if (this.terminalHistory.length > MAX_TERMINAL_INPUT_HISTORY) {
                    this.terminalHistory.splice(0, 1);
                }
                this.terminalHistoryIndex = 0;

                this.parseCommand(text);
                setInputText("");
            } else if (event.code === "ArrowUp") {
                if (
                    this.terminalHistory.length - this.terminalHistoryIndex > 0
                ) {
                    this.terminalHistoryIndex++;
                    setInputText(
                        this.terminalHistory[
                            this.terminalHistory.length -
                                this.terminalHistoryIndex
                        ],
                    );
                }
            } else if (event.code === "ArrowDown") {
                if (this.terminalHistoryIndex > 0) {
                    this.terminalHistoryIndex--;
                    if (this.terminalHistoryIndex === 0) {
                        setInputText("");
                    } else {
                        setInputText(
                            this.terminalHistory[
                                this.terminalHistory.length -
                                    this.terminalHistoryIndex
                            ],
                        );
                    }
                }
            } else {
                this.terminalHistoryIndex = 0;
            }
        });
        // -- History
        const terminalHistoryParent = document.createElement("div");
        terminalHistoryParent.id = "terminal-history-parent";
        terminalHistoryParent.className = "jetbrains-mono-normal";
        terminalHistoryParent.style.width = `${terminalWidth - 8}px`;
        terminalHistoryParent.style.height = `${terminalHeight - terminalInputHeight / 2 - 8}px`;
        // -- Background
        this.add.rectangle(
            terminalWidth / 2 + 12,
            720 - terminalHeight / 2,
            terminalWidth + 24,
            terminalHeight,
            0x000000,
            0x40,
        );
        this.add.dom(
            terminalWidth / 2 + 22,
            720 - terminalHeight / 2 - terminalInputHeight / 2 + 4,
            terminalHistoryParent,
        );
        this.add.dom(
            terminalWidth / 2 + 8,
            720 - terminalInputHeight / 2,
            terminalInput,
        );
    }

    get lastCommand(): string {
        if (this.terminalHistory.length === 0) {
            return "";
        }
        return this.terminalHistory[this.terminalHistory.length - 1];
    }

    // for opening file animation
    // for controlling when speech bubbles spawn
    cycleDialogue(bubbleNum: number, showBubble: object) {
        console.log(bubbleNum);
        // if showBubble isn't empty, destroy the old speech bubble
        if (JSON.stringify(showBubble) != "{}") {
            // destroy tbe old speech bubble assets
            Object.values(showBubble)[0].destroy();
            Object.values(showBubble)[1].destroy();
        }
        // switch cases for dialogue
        switch (bubbleNum) {
            case 0:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "Oh finally, power! Hi! Click on me to continue.",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                break;
            case 1:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "You must be the IT person trying to fix this computer.",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                break;
            case 2:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "I don’t think it needs fixing, but, whatever.",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                break;
            case 3:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "See that black window over there?",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                break;
            case 4:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "You look like you don’t know what that is.",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                break;
            case 5:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "Weird since you’re like… an IT worker.",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                break;
            case 6:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "But that’s okay; I’ll teach you.",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                break;
            case 7:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "Open that text file over there. It’s white. With text on it.",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                break;
            case 8:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "Click me when you’re done reading it.",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                this.setObjective("Tell CAT when you're done reading.");
                break;
            case 9:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "Got it? Good.",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                this.objectiveText.destroy();
                break;
            case 10:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "Try making the terminal say “cat”. Then click on me!",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                // add objective text under cat
                this.setObjective("Make the terminal say 'cat'!");
                break;
            case 11:
                if (this.lastCommand === "echo cat") {
                    showBubble = this.createSpeechBubble(
                        1060,
                        400,
                        200,
                        100,
                        "Great start!",
                    );
                    // make the white bubble graphic visible
                    Object.values(showBubble)[0].visible = true;
                    // make the text object visible
                    Object.values(showBubble)[1].visible = true;
                } else {
                    showBubble = this.createSpeechBubble(
                        1060,
                        400,
                        200,
                        100,
                        "Um… maybe you should check out the text file again.",
                    );
                    // make the white bubble graphic visible
                    Object.values(showBubble)[0].visible = true;
                    // make the text object visible
                    Object.values(showBubble)[1].visible = true;
                    // they were wrong, so don't let them go to the next speech bubble
                    bubbleNum = bubbleNum - 1;
                }
                break;
            case 12:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "Okay, so now let's actually have that file show up in the terminal.",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                // add objective text under cat
                this.setObjective("");
                break;
            case 13:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "To see the file name, try the 'ls' command to see what files are there.",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                // add objective text under cat
                break;
            case 14:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "You've got instructions, go ahead.",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                this.setObjective("Make the file appear in the terminal.");
                break;
            case 15:
                // check if the player did it right
                if (this.lastCommand === "cat instructions.txt") {
                    showBubble = this.createSpeechBubble(
                        1060,
                        400,
                        200,
                        100,
                        "Okay good, you're learning.",
                    );
                    // make the white bubble graphic visible
                    Object.values(showBubble)[0].visible = true;
                    // make the text object visible
                    Object.values(showBubble)[1].visible = true;
                    // add objective text under cat
                    this.setObjective("");
                } else {
                    showBubble = this.createSpeechBubble(
                        1060,
                        400,
                        200,
                        100,
                        "Womp womp. Try again.",
                    );
                    // make the white bubble graphic visible
                    Object.values(showBubble)[0].visible = true;
                    // make the text object visible
                    Object.values(showBubble)[1].visible = true;
                    // they were wrong, so don't let them go to the next speech bubble
                    bubbleNum = bubbleNum - 1;
                }
                break;
            case 16:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "This terminal's insane isn't it? So much power...",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                break;
            case 17:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "Hm… Maybe you can help me out with something…",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                break;
            case 18:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "There’s been a file on this computer that’s interested me for quite some time.",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                break;
            case 19:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "Use the instructions to find and read the file ‘log4-15-2024.txt’.",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                // add objective text under cat
                this.setObjective("Find and read 'log4-15-2024'.");
                break;
            case 20:
                // check if the player did it right
                // TODO: must compare output for this one
                if (this.lastCommand === "cat log4-15-2024.txt") {
                    showBubble = this.createSpeechBubble(
                        1060,
                        400,
                        200,
                        100,
                        "Perfect!",
                    );
                    // make the white bubble graphic visible
                    Object.values(showBubble)[0].visible = true;
                    // make the text object visible
                    Object.values(showBubble)[1].visible = true;
                    // add objective text under cat
                    this.setObjective("");
                } else {
                    showBubble = this.createSpeechBubble(
                        1060,
                        400,
                        200,
                        100,
                        "Are you in the right place?",
                    );
                    // make the white bubble graphic visible
                    Object.values(showBubble)[0].visible = true;
                    // make the text object visible
                    Object.values(showBubble)[1].visible = true;
                    // they were wrong, so don't let them go to the next speech bubble
                    bubbleNum = bubbleNum - 1;
                }
                break;
            case 21:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "I think there's more for you to explore You should look around.",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                // add objective text under cat
                this.setObjective("Find and read 'baller.txt'.");
                break;
            case 22:
                // check if the player did it right
                // TODO: must compare output for this one
                if (this.lastCommand === "cat baller.txt") {
                    showBubble = this.createSpeechBubble(
                        1060,
                        400,
                        200,
                        100,
                        "Well, there you go.",
                    );
                    // make the white bubble graphic visible
                    Object.values(showBubble)[0].visible = true;
                    // make the text object visible
                    Object.values(showBubble)[1].visible = true;
                    // add objective text under cat
                    this.setObjective("");
                } else {
                    showBubble = this.createSpeechBubble(
                        1060,
                        400,
                        200,
                        100,
                        "Try 'ls'! You got that.",
                    );
                    // make the white bubble graphic visible
                    Object.values(showBubble)[0].visible = true;
                    // make the text object visible
                    Object.values(showBubble)[1].visible = true;
                    // they were wrong, so don't let them go to the next speech bubble
                    bubbleNum = bubbleNum - 1;
                }
                break;
            case 23:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "You're not a baby anymore.",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                // add objective text under cat
                this.setObjective("");
                break;
            case 24:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "You've got this next objective on your own.",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                // add objective text under cat
                this.setObjective("Use what you learned in baller.txt");
                break;
            case 25:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "I'll chime in when I think I should.",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                break;
            // CAT CHIMES IN START
            case 2000:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "Don't you have a file you can go learn to unzip?",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                break;
            case 4000:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "Instead of making the computer shake by hitting your keyboard so hard--",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                break;
            case 4001:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "--you go try to remove some locks instead? Knock yourself out. Please.",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                this.setObjective("Stop annoying CAT.");
                break;
            case 6000:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "Stop typing and go read something new. Seriously. Jeez.",
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                this.setObjective("STOP ANNOYING CAT WHILE THEY WORK.");
                break;
        }
        bubbleNum = bubbleNum + 1;
        this.bubbleData = { bubbleNum, showBubble };
    }

    // for making the speech bubble graphics
    createSpeechBubble(
        x: number,
        y: number,
        width: number,
        height: number,
        quote: string,
    ) {
        const bubbleWidth = width;
        const bubbleHeight = height;
        const bubblePadding = 10;
        const arrowHeight = bubbleHeight / 4;

        const bubble = this.add.graphics({ x: x, y: y });

        //  Bubble shadow
        bubble.fillStyle(0x222222, 0.5);
        bubble.fillRoundedRect(6, 6, bubbleWidth, bubbleHeight, 16);

        //  Bubble color
        bubble.fillStyle(0xffffff, 1);

        //  Bubble outline line style
        bubble.lineStyle(4, 0x565656, 1);

        //  Bubble shape and outline
        bubble.strokeRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);
        bubble.fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);

        //  Calculate arrow coordinates
        const point1X = Math.floor(bubbleWidth / 7);
        const point1Y = bubbleHeight;
        const point2X = Math.floor((bubbleWidth / 7) * 2);
        const point2Y = bubbleHeight;
        const point3X = Math.floor(bubbleWidth / 7);
        const point3Y = Math.floor(bubbleHeight + arrowHeight);

        //  Bubble arrow shadow
        bubble.lineStyle(4, 0x222222, 0.5);
        bubble.lineBetween(point2X - 1, point2Y + 6, point3X + 2, point3Y);

        //  Bubble arrow fill
        bubble.fillTriangle(
            point1X,
            point1Y,
            point2X,
            point2Y,
            point3X,
            point3Y,
        );
        bubble.lineStyle(2, 0x565656, 1);
        bubble.lineBetween(point2X, point2Y, point3X, point3Y);
        bubble.lineBetween(point1X, point1Y, point3X, point3Y);

        const content = this.add.text(0, 0, quote, {
            fontFamily: "Arial",
            fontSize: 20,
            color: "#000000",
            align: "center",
            wordWrap: { width: bubbleWidth - bubblePadding * 2 },
        });

        const b = content.getBounds();

        content.setPosition(
            bubble.x + bubbleWidth / 2 - b.width / 2,
            bubble.y + bubbleHeight / 2 - b.height / 2,
        );

        // hide them, they'll get made visible in cycleDialogue()
        // this function is just to make the speech bubble graphic and text object we need to display later
        content.visible = false;
        bubble.visible = false;

        return { bubble, content };
    }

    parseCommand(text: string) {
        this.commandCount = this.commandCount + 1;
        if (text.length === 0) {
            return;
        }

        const terminalHistory = document.getElementById("terminal-history-parent");
        if (!terminalHistory) {
            return;
        }

        const addOutput = (output: string, trimOutput: boolean = true) => {
            terminalHistory.innerHTML += `<p>${trimOutput ? output.trim() : output}</p>`;
            terminalHistory.scrollTo(0, terminalHistory.scrollHeight);
            // CAT checks this for some commands
            this.lastOutput = output.trim();
        };

        text = text.trim();
        addOutput(`<span class="terminal-span-input-color">&gt; ${text}</span>`);

        // Call CAT's chiming in
        if (Object.values(this.bubbleData)[0] > 25) {
            console.log("COMMAND COUNTER: ", this.commandCount);
            console.log("RM.TXT: ", CATFS.exists("/home/logs/dir2/rm.txt"));
            console.log("REDLOCK: ", !CATFS.exists("/redlock.lock"));
            // check for a specific thing from each task
            //TASK 5 HINT
            if (
                this.commandCount % 7 === 0 &&
                CATFS.exists("/home/logs/dir2.zip")
            ) {
                this.bubbleData = {
                    //2000 is an arbitrary number just to make sure the player doesn't spam click to get to CAT's next Undertale-style switch case
                    bubbleNum: 2000,
                    showBubble: {},
                };
                // TASK 6 HINT
            } else if (
                this.commandCount % 13 === 0 &&
                CATFS.exists("/home/logs/dir2/rm.txt") &&
                !this.hint6
            ) {
                this.bubbleData = {
                    bubbleNum: 4000,
                    showBubble: {},
                };
                this.hint6 = true;
                // TASK 7 HINT
            } else if (
                this.commandCount % 13 === 0 &&
                !CATFS.exists("/redlock.lock")
            ) {
                this.bubbleData = {
                    bubbleNum: 6000,
                    showBubble: {},
                };
            }
            this.cycleDialogue(
                Object.values(this.bubbleData)[0],
                Object.values(this.bubbleData)[1],
            );
        }

        const commandParts = text.split(" ");
        while (commandParts.length < 2) {
            // no undefined errors on my watch
            commandParts.push("");
        }
        for (let commandPart of commandParts) {
            commandPart = commandPart.trim();
            // hack: remove trailing slashes to do string checks properly
            if (commandPart.endsWith("/")) {
                commandPart = commandPart.slice(0, commandPart.length - 1);
            }
        }

        switch (commandParts[0]) {
            case "clear": {
                terminalHistory.innerHTML = "";
                return;
            }
            case "ls": {
                let output = "";
                const dirContents = CATFS.readCWD();
                for (const name of dirContents.dirs) {
                    output += `<span class="terminal-span-dir-color">${name}/</span>\n`;
                }
                for (const name of dirContents.zips) {
                    output += `<span class="terminal-span-zip-color">${name}</span>\n`;
                }
                for (const name of dirContents.files) {
                    if (name === "redlock.lock") {
                        output += `<span class="terminal-span-lock-color">${name}</span>\n`;
                    } else if (name === "cat.exe") {
                        output += `<span class="terminal-span-cat-color">${name}</span>\n`;
                    } else {
                        output += `<span class="terminal-span-file-color">${name}</span>\n`;
                    }
                }
                addOutput(output);
                return;
            }
            case "unzip": {
                if (!CATFS.extractZip(commandParts[1])) {
                    addOutput(
                        `Could not find the zip file at "${commandParts[1]}".`,
                    );
                } else {
                    addOutput("Extracted the zip file.");
                }
                return;
            }
            case "cat": {
                if (commandParts.length <= 1) {
                    addOutput(
                        'Command "cat" needs to know what file you want to read.',
                    );
                    return;
                }
                if (!CATFS.exists(commandParts[1])) {
                    addOutput(
                        `Command "cat" could not find a file called "${commandParts[1]}".`,
                    );
                    return;
                }
                addOutput(CATFS.readFile(commandParts[1], true));
                return;
            }
            case "cd": {
                CATFS.cwd = commandParts[1];
                return;
            }
            case "echo": {
                addOutput(text.substring(4));
                return;
            }
            case "sudo": {
                if (commandParts[1] === "su") {
                    addOutput("NOT IMPLEMENTED IN THE BETA, JUST RM CAT.EXE TO WIN");
                } else {
                    addOutput(`Unknown command "${commandParts[0]} ${commandParts[1]}".`);
                }
                return;
            }
            case "cowsay": {
                addOutput(
                    cowsay.say({
                        text: text.substring(6).trim(),
                    }),
                    false,
                );
                return;
            }
            case "rm": {
                if (CATFS.isFile(commandParts[1])) {
                    CATFS.deleteFile(commandParts[1]);
                    if (commandParts[1].endsWith("cat.exe")) {
                        this.scene.stop();
                        this.scene.start("EndScene");
                    } else if (commandParts[1].endsWith("redlock.lock")) {
                        console.log("REMOVE RED LOCKS HERE");
                        this.hackArticle.destroy();
                        this.findMe.destroy();
                        this.hackArticle = this.add
                            .image(300, 100, "unlocked program")
                            .setInteractive();
                        this.findMe = this.add
                            .image(200, 100, "unlocked text")
                            .setInteractive();
                    }
                } else if (CATFS.isDir(commandParts[1])) {
                    addOutput(`Command "rm" cannot remove the directory at "${commandParts[1]}": directory is not empty.`);
                } else {
                    addOutput(`Command "rm" could not find a file called "${commandParts[1]}".`);
                }
                return;
            }
            default: {
                addOutput(`Unknown command "${commandParts[0]}".`);
                return;
            }
        }
    }

    setObjective(objective: string) {
        this.objectiveText.destroy();
        // check if there should be no objective
        if (objective.length > 0) {
            this.objectiveText = this.add.text(
                800,
                700,
                "Objective: " + objective,
                { backgroundColor: "#000", fontSize: "17px" },
            );
        } else {
            this.objectiveText = this.add.text(805, 700, objective);
        }
    }

    update() {
        //this.fpsText.update();
    }
}
