let canvas = $("#GAME")[0]
let ctx = canvas.getContext("2d")
let length = 100000
let ores = ["HEY SOMETING BRONK"]
let moves = []
let oreNames = ["stone"]
let allOreNames = []
let allOres = []
let lastFavicon = "stone"
let total = 0
let totalLuck = 1
let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
if (isSafari) {
    alert("WARNING: This game is very glitchy on mobile.")
}

// music and sfx

let music = new Audio("assets/sfx/music.mp3");
let breakSFX = new Audio("assets/sfx/break.mp3");
let rarespawnSFX = new Audio("assets/sfx/rarespawn.mp3")
breakSFX.volume = 0.08;
rarespawnSFX.volume = 1;
music.loop = true;

// QoL functions

function select(array) {
    let randint = Math.floor(Math.random() * array.length)
    return array[randint]
}

function capitalizeFirstLetter(val) {
    return val.charAt(0).toUpperCase() + val.slice(1);
}

function playsfx() {
    if (this.paused) {
        this.play()
    } else {
        this.currentTime = 0;
    }
}

Audio.prototype.playsfx = playsfx // appending to prototype normal dont work for some reason

// ore manipulation & generation

function generateOre(x, y) {
    let cont = true
    let obstructingOre = genOres.find(z => (z.x == x && z.y == y))
    if (obstructingOre || y <= 75 || y >= 900 || x <= -25 || x >= 1600) {
        cont = false;
    }
    if (cont) {
        let randomOre = select(ores)
        genOres.push(new OreDisplay(randomOre, x, y));
        if (randomOre.rarity * totalLuck > 998) {
            rarespawnSFX.playsfx();
            let oreInfo = getOreInfo(randomOre.name)
            $("#alert").html(`RARE SPAWN: ${oreInfo.display} has spawned! (1/${oreInfo.rarity})`)
            if (oreInfo.rarity * totalLuck > 9998) {
                $("#alert").addClass("unseen-text")
                $("#alert").removeClass("epic-text")
            } else {
                $("#alert").addClass("epic-text")
                $("#alert").removeClass("unseen-text")
            }
            setTimeout(() => {
                $("#alert").html("")
            }, 10000)
        }
    }
}

function addOre(type, amt) {
    let discovered = false;
    eval(`${type}Amt += ${amt}`)
    eval(`if (${type}Amt === 1) {discovered = true}`)
    if (discovered) {
        if (type !== "stone" && type !== "voidElement") {
            oreNames.push(type)
        }
        if (type !== "voidElement") {
            createDisplay(type);
        }
    }
    if (type !== "voidElement") {
        total += 1;
        $("#counter").html(total);
    }
    eval(`document.querySelector("#${type}-counter").innerHTML = ${type}Amt`)
}

function createDisplay(name, src="") {
    let displayText = `
        <div class="ore-display-div" id="display-${name}">\n
            <button onclick="showInfo('${name}')">\n
                <img src="assets/${name}.png">\n
            </button>\n
            <span id="${name}-counter">${eval(`${name}Amt`)}</span>\n
        </div>
    `;
    if (src !== "load") {
        $("#just-found").after(displayText);
    } else {
        $("#just-found").before(displayText);
    }
    console.log("${}")
    eval(`if (${name}.rarity > 1) {$("#display-${name}").addClass("common")}`)
    eval(`if (${name}.rarity * totalLuck > 48) {$("#display-${name}").addClass("uncommon")}`)
    eval(`if (${name}.rarity * totalLuck > 298) {$("#display-${name}").addClass("rare")}`)
    eval(`if (${name}.rarity * totalLuck > 998) {$("#display-${name}").addClass("epic")}`)
    eval(`if (${name}.rarity * totalLuck > 9998) {$("#display-${name}").addClass("unseen")}`)
    eval(`if (${name}.properties["event"]) {$("#${name}-counter").addClass("event-text")}`)
}

function createAllDisplays() {
    for (i of sortedOreNames) {
        eval(`if (${i}Amt >= 1) {createDisplay(i, "load")}`);
    }
    $("#display-voidElement").remove();
}

// event handling

function click(event) {
    if (music.paused) {
        music.play()
    }
    let targetBlock = null;
    let foundOre = genOres.find((z) => (event.pageX >= z.x + 10 && event.pageX <= z.x + 35 && event.pageY >= z.y + 10 && event.pageY <= z.y + 35)) 
    if (foundOre) {
        if (foundOre.type !== "voidElement") {
            breakSFX.playsfx();
        }
        genOres.splice(genOres.indexOf(foundOre), 1)
        targetBlock = foundOre;
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

function getOreInfo(name) {
    let toDisplay = capitalizeFirstLetter(name)
    let oreFound = allOres.find(x => x.name == name);
    let toDisplayRarity = oreFound.rarity.toLocaleString("en-US")
    if (oreFound.rarity <= 1) {
        toDisplayRarity = "Base"
    }

    if (oreFound.properties["display"]) {
        toDisplay = oreFound.properties["display"]
    }
    return {"display": toDisplay, "rarity": toDisplayRarity, "desc": oreFound.desc}
}

function showInfo(name) {
    let oreInfo = getOreInfo(name)
    document.querySelector("#oreInfo").innerHTML = `Name: ${oreInfo.display}, Rarity: 1 in ${oreInfo.rarity}`
    document.querySelector("#oreDesc").innerHTML = oreInfo.desc;
}

function sortOreList() {
    window.sortedOreNames = [...allOreNames]
    sortedOreNames.sort((a, b) => {
        if (a === "stone" || b === "stone" || a === "voidElement" || b === "voidElement") {
            return 0;
        }
        if (eval(`${a}.rarity`) > eval(`${b}.rarity`)) {
            return 1;
        }
        if (eval(`${a}.rarity`) < eval(`${b}.rarity`)) {
            return -1;
        }
        if (eval(`${a}.rarity`) === eval(`${b}.rarity`)) {
            return 0;
        }
    })
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
        total += eval(`${currentOre}Amt`)
        if (eval(`${currentOre}Amt`) > 0) {
            if (currentOre != "voidElement") {
                oreNames.push(currentOre)
            }
        }
        index += 1
    }
    total -= voidElementAmt
    $("#counter").html(total);
}

// classes

class Ore {
    constructor(name, rarity, properties = {obtainable: true}) {
        this.name = name;
        this.texture = document.querySelector(`#tx-${name}`);
        this.rarity = Math.floor(rarity / totalLuck);
        this.properties = {display: "", obtainable: true, event: false}
        for (let i in properties) {
            this.properties[i] = properties[i]
        } // this is like my first time using an in loop
        this.desc = descs[name];
        if (name != "stone" && name != "voidElement" && this.properties["obtainable"]) {
            this.append();
        } else if (name == "stone") {
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
        this.rarity = parent.rarity;
        this.x = x;
        this.y = y;
        ctx.beginPath();
        ctx.drawImage(this.texture, x, y, 25, 25);
    }
}

class GameEvent {
    constructor(name, luck, string, expire) {
        this.name = name;
        this.luck = luck;
        this.string = string
        this.expire = expire
        if (Date.now() < expire) {
            $("#events").append(string)
            totalLuck += luck - 1
        }
    }
}

// setup

let stPatricksEvent = new GameEvent(
    "St. Patricks Event", 1.25, 
    "ST. PATRICKS EVENT: Extra luck & NEW Event Ore Patricine available until March 24 at noon EST",
    1679673600000
    )

let stone = new Ore("stone", 1);
let voidElement = new Ore("voidElement", 1, {display: "Void."});
let copper = new Ore("copper", 15);
let coal = new Ore("coal", 25);
let iron = new Ore("iron", 40)
let lead = new Ore("lead", 65);
let gold = new Ore("gold", 300);
let relic = new Ore("relic", 500, {display: "Bronze Relic"});
let emerald = new Ore("emerald", 750);
let diamond = new Ore("diamond", 1000);
let painite = new Ore("painite", 1500);
let vyvyxyn = new Ore("vyvyxyn", 3000);
// ALL ORES NEWER THAN VYVYXYN GO BELOW IN INCREASINGLY NEW ORDER
let crystalresonance = new Ore("crystalresonance", 25000, {display: "Crystal of Resonance"})
let crysor = new Ore("crysor", 5000)
// Release
let amethyst = new Ore("amethyst", 175)
// 1.1
let fossil = new Ore("fossil", 900)
let porvileon = new Ore("porvileon", 12500)
// 1.2
let xyxyvylyn = new Ore("xyxyvylyn", 3000)
// 1.2.1
let patricine = new Ore("patricine", 3000, {obtainable: true, event: true})
// 1.3
let cobalt = new Ore("cobalt", 4000, {display: "Cobalt-60"})
let mysalin = new Ore("mysalin", 15000)


sortOreList();

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

createAllDisplays();

setInterval(changeFavicon, 5000);
setInterval(generateSave, 20000);
setTimeout(clearMine, 200);


window.onbeforeunload = function(){
    generateSave();
}

$("#GAME").mousedown(click);