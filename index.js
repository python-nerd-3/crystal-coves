let canvas = document.querySelector("#GAME")
let ctx = canvas.getContext("2d")
let length = 100000
let ores = ["HEY SOMETING BRONK"]
let moves = []
let oreNames = ["stone"]
let allOreNames = []
let allOres = []
let lastFavicon = "stone"
let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
if (isSafari) {
    alert("WARNING: This game is very glitchy on mobile.")
}

// QoL functions

function select(array) {
    let randint = Math.floor(Math.random() * array.length)
    return array[randint]
}

function capitalizeFirstLetter(val) {
    return val.charAt(0).toUpperCase() + val.slice(1);
}


// generation

function generateOre(x, y) {
    let cont = true
    for (i of genOres) {
        if (i.x == x && i.y == y || y <= 75) {
            cont = false
            break;
        }
    }
    if (cont) {
        genOres.push(new OreDisplay(select(ores), x, y));
    }
}

function addOre(type, amt) {
    let discovered = false;
    eval(`${type}Amt += ${amt}`)
    eval(`document.querySelector("#${type}-counter").innerHTML = ${type}Amt`)
    eval(`if (${type}Amt === 1) {discovered = true}`)
    if (discovered) {
        if (type !== "stone" && type !== "voidElement") {
            oreNames.push(type)
        }
        if (type !== "voidElement") {
            document.querySelector(`#tx-${type}`).removeAttribute("hidden");
        }
    }
}

// event handling

function click(event) {
    let generate = false;
    let targetBlock = null;
    for (i of genOres) {
        if (event.pageX >= i.x + 10 && event.pageX <= i.x + 35 && event.pageY >= i.y + 10 && event.pageY <= i.y + 35) {
            generate = true;
            genOres.splice(genOres.indexOf(i), 1)
            targetBlock = i;
            break;
        }
    }
    if (generate) {
        ctx.clearRect(targetBlock.x, targetBlock.y, 25, 25)
        genOres.push(new OreDisplay(voidElement, targetBlock.x, targetBlock.y))
        generateOre(targetBlock.x, targetBlock.y - 25)
        generateOre(targetBlock.x, targetBlock.y + 25)
        generateOre(targetBlock.x - 25, targetBlock.y)
        generateOre(targetBlock.x + 25, targetBlock.y)
        addOre(targetBlock.type, 1)
    }
}

// misc functions

function changeFavicon() {
    selectedOre = lastFavicon
    while (lastFavicon === selectedOre) {
        if (oreNames.length == 1) {
            selectedOre = "stone"
            break;
        }
        selectedOre = select(oreNames)
    }
    document.querySelector("#favicon-link").setAttribute("href", `assets/${selectedOre}.png`)
    lastFavicon = selectedOre
}

function showInfo(name) {
    let toDisplay = name
    let oreFound = allOres.find(x => x.name == name);
    if (oreFound.display) {
        toDisplay = oreFound.display
    }
    document.querySelector("#oreInfo").innerHTML = `Name: ${capitalizeFirstLetter(toDisplay)}, Rarity: 1 in ${oreFound.rarity}`
}

// saving

function generateSave() {
    let string = ""
    let currentAmt = 0
    let ind = 0
    for (i of allOreNames) {
        ind += 1
        currentAmt = eval(`${i}Amt * 7`)
        string += `${currentAmt}`
        if (ind !== allOreNames.length) {
            string += "/"
        }
    }
    string = btoa(string)
    document.cookie = `save=${string}; SameSite=Strict; Expires=Tues, 1 Jan 2030 12:00:00 UTC`
}

function loadSave(code) {
    clearMine();
    let array = atob(code);
    let index = 0;
    let currentOre = null;
    array = array.split("/");
    for (i of array) {
        currentOre = allOreNames[index];
        if (i % 7 !== 0) {
            window.location = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
        eval(`${currentOre}Amt = ${i / 7}`)
        if (eval(`${currentOre}Amt`) > 0) {
            document.querySelector(`#tx-${currentOre}`).removeAttribute("hidden")
            document.querySelector(`#${currentOre}-counter`).innerHTML = eval(`${currentOre}Amt`)
            if (currentOre != "voidElement") {
                oreNames.push(currentOre)
            }
        } else {
            document.querySelector(`#tx-${currentOre}`).setAttribute("hidden", "")
            document.querySelector(`#${currentOre}-counter`).innerHTML = ""
        }
        index += 1
    }
}

// classes

class Ore {
    constructor(name, rarity, display = "") {
        this.name = name;
        this.texture = document.querySelector(`#tx-${name}`);
        this.rarity = rarity;
        this.display = display;
        if (name != "stone" && name != "voidElement") {
            this.append();
        } else if (name != "voidElement") {
            ores = new Array(length).fill(this);
        }
        eval(`window.${name}Amt = 0`)
        allOreNames.push(name)
        allOres.push(this)
    }

    append() {
        let amt = ores.length / this.rarity
        let index = length - amt
        length -= amt
        let items = new Array(Math.floor(amt)).fill(this)
        ores.splice(index, amt, ...items)
    }
}

class OreDisplay {
    constructor(parent, x, y) {
        this.type = parent.name;
        this.texture = parent.texture;
        this.x = x;
        this.y = y;
        ctx.beginPath();
        ctx.drawImage(this.texture, x, y, 25, 25);
    }
}

// setup

let stone = new Ore("stone", 1);
let voidElement = new Ore("voidElement", 1);
let copper = new Ore("copper", 15);
let coal = new Ore("coal", 25);
let iron = new Ore("iron", 40)
let lead = new Ore("lead", 65);
let gold = new Ore("gold", 300);
let relic = new Ore("relic", 500, "Bronze Relic");
let emerald = new Ore("emerald", 750);
let diamond = new Ore("diamond", 1000);
let painite = new Ore("painite", 1500);
let vyvyxyn = new Ore("vyvyxyn", 3000);
// ALL ORES NEWER THAN VYVYXYN GO BELOW IN INCREASINGLY NEW ORDER
let crystal1 = new Ore("crystalresonance", 25000, "Crystal of Resonance")
let crysor = new Ore("crysor", 5000)
let amethyst = new Ore("amethyst", 125)

function clearMine() {
    ctx.clearRect(0, 100, 1600, 800)
    window.genOres = []
    for (i of Array(64).keys()) {
        genOres.push(new OreDisplay(stone, i * 25, 100))
    }
}
ctx.beginPath();
ctx.fillRect(0, 0, 1600, 100);

if (document.cookie) {
    loadSave(document.cookie.substring(5));
}

setInterval(changeFavicon, 5000);
setInterval(generateSave, 20000);
setTimeout(clearMine, 200);


window.onbeforeunload = function(){
    generateSave();
}

canvas.addEventListener("mousedown", click)


