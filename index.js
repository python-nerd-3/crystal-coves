let canvas = document.querySelector("#GAME")
let ctx = canvas.getContext("2d")
let length = 20000
let ores = ["HEY SOMETING BRONK"]
let moves = []
let oreNames = ["stone"]
let allOreNames = []
let allOres = []
let lastFavicon = "stone"

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
            console.log(targetBlock)
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
    let oreFound = allOres.find(x => x.name == name);
    console.log(name)
    document.querySelector("#oreInfo").innerHTML = `Name: ${capitalizeFirstLetter(name)}, Rarity: 1 in ${oreFound.rarity}`
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
    document.querySelector("#save-loc").innerHTML = string
}

function loadSave(code) {
    let array = atob(code)
    array = array.split("/")
    console.log(array)
}

// classes

class Ore {
    constructor(name, rarity) {
        this.name = name;
        this.texture = document.querySelector(`#tx-${name}`);
        this.rarity = rarity;
        if (name != "stone" && name != "voidElement") {
            this.append();
        } else if (name != "voidElement") {
            ores = new Array(length).fill(this);
        } else {
            console.log(this.texture)
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
let relic = new Ore("relic", 650);
let emerald = new Ore("emerald", 750);
let diamond = new Ore("diamond", 1000);
let painite = new Ore("painite", 1500);
let vyvyxyn = new Ore("vyvyxyn", 3000);

function clearMine() {
    ctx.clearRect(0, 100, 1600, 800)
    window.genOres = []
    for (i of Array(64).keys()) {
        genOres.push(new OreDisplay(stone, i * 25, 100))
    }
}
clearMine();
ctx.beginPath();
ctx.fillRect(0, 0, 1600, 100);

setInterval(changeFavicon, 5000);

canvas.addEventListener("mousedown", click)


