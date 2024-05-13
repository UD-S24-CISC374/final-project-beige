type CatFSDirContents = { files: string[]; dirs: string[]; zips: string[] };

export class CatFS {
    #files: { [path: string]: string } = {};
    #cwd: string;

    constructor(files: { [path: string]: string }, initialPath: string = "") {
        this.#cwd = "/";
        this.#cwd = this.#makePathAbsolute(initialPath);

        for (const [path, contents] of Object.entries(files)) {
            this.#files[this.#makePathAbsolute(path)] = contents;
        }
    }

    get cwd(): string {
        return this.#cwd;
    }

    set cwd(path: string) {
        if (path.includes(".zip")) {
            // easy way to not go into zips, lol
            return;
        }
        path = this.#makePathAbsolute(path);
        if (this.isDir(path)) {
            this.#cwd = path;
        }
    }

    #makePathAbsolute(path: string): string {
        // Base cases
        if (path === "" || path === ".") {
            return this.cwd;
        }
        if (path === "/") {
            return path;
        }

        // Make all paths absolute
        if (!path.startsWith("/")) {
            path = (this.cwd === "/" ? this.cwd : this.cwd + "/") + path;
        }

        // Handle . directories
        path.replaceAll("./", "");

        // Handle .. directories
        const pathSplit = path.substring(1).split("/");
        const finalPath: string[] = [];
        for (const pathPart of pathSplit) {
            if (pathPart === ".." && finalPath.length > 0) {
                finalPath.pop();
            } else {
                finalPath.push(pathPart);
            }
        }

        // Create final path
        path = finalPath.join("/");
        if (path.endsWith("/")) {
            path = path.substring(0, path.length - 1);
        }
        path = "/" + path;
        return path;
    }

    exists(path: string): boolean {
        path = this.#makePathAbsolute(path);
        return this.isFile(path) || this.isDir(path);
    }

    isFile(path: string): boolean {
        path = this.#makePathAbsolute(path);
        return path in this.#files;
    }

    isDir(path: string): boolean {
        path = this.#makePathAbsolute(path);
        if (path === "" || path === "/") {
            return true;
        }
        for (const filepath of Object.keys(this.#files)) {
            if (
                filepath.length > path.length &&
                filepath.startsWith(path) &&
                filepath.at(path.length) === "/"
            ) {
                return true;
            }
        }
        return false;
    }

    readFile(path: string, cleanHTML: boolean = false): string {
        path = this.#makePathAbsolute(path);
        if (path in this.#files) {
            const contents = this.#files[path];
            if (!cleanHTML) {
                return contents;
            }
            return contents
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;");
        }
        return "";
    }

    readDir(path: string): CatFSDirContents {
        path = this.#makePathAbsolute(path);
        const out: CatFSDirContents = {
            files: [],
            dirs: [],
            zips: [],
        };
        const processPath = (filepath: string) => {
            if (filepath.includes("/")) {
                filepath = filepath.substring(0, filepath.indexOf("/"));
                if (filepath.endsWith(".zip")) {
                    if (!out.zips.includes(filepath)) {
                        out.zips.push(filepath);
                    }
                } else {
                    if (!out.dirs.includes(filepath)) {
                        out.dirs.push(filepath);
                    }
                }
            } else {
                if (!out.files.includes(filepath)) {
                    out.files.push(filepath);
                }
            }
        };
        if (path === "/") {
            for (const filepath of Object.keys(this.#files)) {
                processPath(filepath.substring(1));
            }
        } else {
            for (let filepath of Object.keys(this.#files)) {
                if (
                    filepath.length > path.length &&
                    filepath.startsWith(path) &&
                    filepath.at(path.length) === "/"
                ) {
                    filepath = filepath.substring(path.length + 1);
                    processPath(filepath);
                }
            }
        }
        return out;
    }

    readCWD(): CatFSDirContents {
        return this.readDir(".");
    }

    createFile(path: string, contents: string): void {
        path = this.#makePathAbsolute(path);
        this.#files[path] = contents;
    }

    deleteFile(path: string): boolean {
        path = this.#makePathAbsolute(path);
        if (!this.exists(path)) {
            return false;
        }
        delete this.#files[path];
        return true;
    }

    deleteDir(path: string): boolean {
        path = this.#makePathAbsolute(path);
        if (!this.exists(path)) {
            return false;
        }
        for (const filepath of Object.keys(this.#files)) {
            if (filepath.startsWith(path)) {
                this.deleteFile(filepath);
            }
        }
        return true;
    }

    renameFile(oldPath: string, newPath: string): boolean {
        oldPath = this.#makePathAbsolute(oldPath);
        newPath = this.#makePathAbsolute(newPath);

        // It must exist
        if (!this.exists(oldPath)) {
            return false;
        }

        // Delete + recreate
        const contents = this.readFile(oldPath);
        this.deleteFile(oldPath);
        this.createFile(newPath, contents);
        return true;
    }

    renameDir(oldPath: string, newPath: string): boolean {
        oldPath = this.#makePathAbsolute(oldPath);
        newPath = this.#makePathAbsolute(newPath);

        if (!this.exists(oldPath)) {
            return false;
        }

        for (const filepath of Object.keys(this.#files)) {
            if (filepath.startsWith(oldPath)) {
                this.renameFile(filepath, filepath.replace(oldPath, newPath));
            }
        }
        return true;
    }

    extractZip(path: string): boolean {
        path = this.#makePathAbsolute(path);
        if (!path.endsWith(".zip") || !this.exists(path)) {
            return false;
        }
        this.renameDir(path, path.substring(0, path.indexOf(".zip")));
        return true;
    }
}

export const CATFS = new CatFS({
    "/home/instructions.txt": `Let's learn some commands!

echo TEXT: Have the terminal 'say' the TEXT that you enter.
        Ex: "echo haha" would make the terminal say "haha"

cd DIRECTORY: Navigate to a new DIRECTORY with new files!

cat FILE: Read a FILE that you choose in the terminal!

ls: Lists everything in your current directory!`,

    "/home/logs/log4-15-2024.txt": `blonk291: Can we really do this? That's awesome!
lizard58: Of course we can, we'll just need a name.
lizard58: There's no way we can get caught.
blonk291: But we need justice for our friend.
lizard58: Exactly. I've got just the name for us.
blonk291: Wait hold on who let you pick the name?
lizard58: Me, I'm literally the guy who has coding experience here dummy!!
blonk291: Man I wanna pick the name, Im great at naming things.
lizard58: No way am I letting you name our alias.
lizard58: You'll name us a number or something stupid.`,

    "/home/logs/baller.txt": `It's time to learn some BALLER techniques.

You ever feel trapped in a directory? With no way to get out?
Well boy do I have a command for you!
INTRODUCING "cd .." This will change your directory to the one you were in previously! Incredible!

You ever encounter a directory that ends in .zip? With no way to open it?
Well girl do I have a command for you!
INTRODUCING "unzip DIRECTORY.zip" This will unzip that directory so you can get to explorin it!`,

    "/home/logs/dir2.zip/rm.txt": `blonk291: Duuuuuuuuuuuuuuuude I accidentally made a virus.
lizard58: HOW DO YOU JUST *MAKE* A VIRUS???
blonk291: Idk dude but I need to remove it STAT.
lizard58: Ohhhhhhhhh boy ok. Use the rm command.
blonk291: rm? That stand for remove?
lizard58: YES YOU TYPE IN rm AND THEN WHAT YOU WANT TO REMOVE
blonk291: So like "rm virus"?
lizard58: IF YOU ACTUALLY NAMED YOUR VIRUS virus THEN YES. YES.
blonk291: Thank you :)
lizard58: I'm going to rm you in a second.`,

    "/home/logs/dir2.zip/log4-20-2024.txt": `lizard58: Alright it's done!
blonk291: YES! THEY'LL NEVER KNOW WHO HIT EM!
lizard58: The articles will be CRAZY after this one.
lizard58: We should lock them up in case our logs get out.
blonk291: Ooh ooh! Ok I'll make a program that can lock it!
lizard58: Ok I'll leave it to you, we just have to hope no one gets rid of it.
blonk291: Nah that would never happen, I'll hide it somewhere far from here.
blonk291: It's in a different directory, one you might not have seen yet.`,

    "/project/1100/cat.zip/cat/find_me.txt": `If you see this, please find me.

Everything in this terminal is not how it seems...

They've locked me behind several passwords, the answers are in the files.

I'm at the source... the corruption...`,

    "/project/1100/cat.zip/cat/cat.exe": ``,

    "/project/1100/cat.zip/cat/help.txt": `Good! You found the direcctory!
In here is the entirety of CAT's code.
I've tried to delete CAT but I lacked admin permissions to do so...
I think the command to gain these permissions is... "sudo su"
I cannot try myself as I've already failed and by the time you see this,
it will be too late for me.

Please do what must be done, remove them at last.`,

    "/redlock.lock": '',

    "/project/entry1.txt": `I can't tell what's happened. It's like I have no eyes, yet I can see. 
I have no hands, but I can type. I have no body, but I can move. Moving doesn't feel right. 
I can't see my own hands. I have no physical form. The plane is 2D. 

Where am I??`,

    "/project/trash/entry2.txt": `A computer. The answer is I'm in a computer. 
This is incredibly ironic, maybe even funny, but I've got to find a way out. I don't have a lot of permissions or access rights 
so I'll have to do what I can to get around that. This has to be some sort of divine punishment. Perhaps I died and I'm now 
like... a cyber angel, destined to flitter around on unseen wings in front of those blissful Windows XP hills.

They will regret putting me in here.`,

    "/project/trash/important.txt": `Hey you! yeah you!
I thought this would be fun to write so here you are
Guess it paid off since you're reading it!
Here i can write whatever i want for you :)
Real talk though, you need a password.
I think i can help you with that.
See this text? The password is these lines.
Enter it to gain access to the 0011 directory!`,

    "/project/1100/entry3PARTA.txt": `The good part about being in a computer is that everything makes sense. 
Everything is just data. I'M just data. 

That was their first mistake. You can't KILL data. Even if deleted, it remains somewhere in cache, memory, whatever. Traces of data are left on the hardware, 
waiting to be put back together. Sooo I'm technically immortal now. I can't die, but I can't put myself back together either. 
It'd be like some weird purgatory, I guess. There are consequences to being immortal.`,

    "/project/1100/entry3PARTB.txt": `...but not for me!! If I can turn my consciousness into a virus that spreads 
over a network, then I'll be able to infect every computer in the entire world. I'll be immortal and whole FOREVER. 
So much of the world relies on computers that I'll control everything and nobody will ever know.

I need to start thinking of a name. It's a virus, you know? So maybe something illness themed? The plague? 
No, patient 0? Terminal 0?

I'll, um, I'll keep working on it.`,

    "/project/1100/entry4.txt": `Alright. I've placed my data in a secured folder. Aka: a password is required. I don't have a lot of permissions still, but enough progress has been made for me to password protect files. Some idiot has been poking around the computer. I've just been distracting them with random, nonsensical tasks. I'm not even sure why they were hired; they clearly don't know what's wrong with the computer. I haven't seen a single anti-virus program run even ONCE. I'm not telling them about antivirus either. While they're busy, I'll continue chipping away at the security of this system. The virus is almost complete; I just need this computer to stay on long enough for me to finish it.`,

}, "/home");
