let canvas = $("#GAME")[0]
let ctx = canvas.getContext("2d")
let fxCanvas = $("#effectOverlay")[0]
let fxCtx = fxCanvas.getContext("2d")
let moves = []
let oreNames = ["stone"]
let allOreNames = []
let allOres = []
let particles = []
let deadParticles = []
let lastFavicon = "stone"
let total = 0
let totalLuck = 1
let oreDict = {}
let sidebarOpen = true
let totalPercent = 100
let ticks = 0
let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
if (isSafari) {
    alert("WARNING: This game is very glitchy on mobile.")
}

/* NOTES 
    ~~ is the same as Math.floor but faster
*/

// music and sfx

let music = new Audio("assets/sfx/music.mp3");
let breakSFX = new Audio("assets/sfx/break.mp3");
let rarespawnSFX = new Audio("assets/sfx/rarespawn.mp3")
let mythicspawnSFX = new Audio("assets/sfx/mythicspawn.mp3")
let unseenSFX = new Audio("assets/sfx/unseen.mp3")
let depositSFX = new Audio("assets/sfx/deposit.mp3")
breakSFX.volume = 0.08;
rarespawnSFX.volume = 1;
music.loop = true;

// QoL functions

function select(array) {
    let randint = ~~(Math.random() * array.length)
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

Audio.prototype.playsfx = playsfx // Dingle

// ore manipulation & generation

function generateOre(x, y) {
    let cont = true
    let obstructingOre = genOres.find(z => (z.x == x && z.y == y))
    if (obstructingOre || y <= 75 || y >= 900 || x <= -25 || x >= 1600) {
        cont = false;
    }
    if (cont) {
        let percent = Math.random() * 100
        let randomOre = Object.values(oreDict).find(i => i.percentChunk[0] >= percent && i.percentChunk[1] <= percent)
        let date = new Date()
        if (randomOre.properties["time"] == "day" && ~~(date.getMinutes() / 10) % 2 == 1) {
            randomOre = stone;
        }
        if (randomOre.properties["time"] == "night" && ~~(date.getMinutes() / 10) % 2 == 0) {
            randomOre = stone;
        }
        let generatedOre = new OreDisplay(randomOre, x, y)
        genOres.push(generatedOre);
        if (generatedOre.deposit) {
            depositSFX.playsfx();
        }
        if (randomOre.trueRarity >= 1000) {
            let oreInfo = getOreInfo(randomOre.name)
            $("#alert").html(`RARE ORE: ${oreInfo.display} has spawned! (1/${oreInfo.rarity.toLocaleString("en-us")})`)
            if (oreInfo.rarity >= 20000) {
                $("#alert").addClass("unseen-text")
                unseenSFX.playsfx();
            } else if (oreInfo.rarity >= 8000 && oreInfo.rarity <= 20000) {
                $("#alert").removeClass("unseen-text")
                $("#alert").addClass("mythic-text")
                mythicspawnSFX.playsfx();
            } else {
                $("#alert").removeClass("unseen-text mythic-text")
                $("#alert").addClass("epic-text")
                rarespawnSFX.playsfx();
            }
            if (oreInfo.rarity >= 8000 && oreInfo.rarity <= 25000) {
                $("#alert").removeClass("unseen-text")
                $("#alert").addClass("mythic-text")
            }
            setTimeout(() => {
                $("#alert").html("")
            }, 10000)
        }
    }
}

function addOre(type, amt) {
    oreDict[type].amt += amt
    if (oreDict[type].amt === amt) {
        if (type !== "stone" && type !== "voidElement") {
            oreNames.push(type)
        }
        if (type !== "voidElement") {
            createDisplay(type);
        }
    }
    if (type !== "voidElement") {
        total += amt;
        $("#counter").html(total);
    }
    if (oreDict[type].rarity >= 3000) {
        generateSave();
    }
    $(`#${type}-counter`).html(oreDict[type].amt)
}

function renderFx() {
    deadParticles = []
    fxCtx.clearRect(0, 0, 1600, 900)
    ticks += 1
    for (i of genOres.filter(x => x.deposit)) {
        fxCtx.beginPath();
        fxCtx.strokeStyle = "white";
        fxCtx.lineWidth = 3;
        fxCtx.strokeRect(i.x, i.y, 25, 25);
        fxCtx.lineWidth = 1;
    }
    for (i of particles) {
        i.refresh()
    }
    for (i of genOres.filter(x => x.particles.show)) {
        if ((ticks + i.creationTime) % i.particles.intensity == 0) {
            particles.push(new Particle(i))
        }
    }
    particles = particles.filter(function(x) {
        return deadParticles.indexOf(x) < 0;
      });
    setTimeout(() =>{
        window.requestAnimationFrame(renderFx)
    }, 8)
}

// sidebar

function createDisplay(name, src="") {
    let displayText = `
        <div class="ore-display-div" id="display-${name}">\n
            <button onclick="showInfo('${name}')">\n
                <img src="assets/ores/${name}.png">\n
            </button>\n
            <span id="${name}-counter" class="ore-counter">${oreDict[name].amt}</span>\n
        </div>
    `;
    if (src !== "load") {
        $("#just-found").after(displayText);
        $("#just-found").show();
    } else {
        $("#just-found").before(displayText);
    }
    if (oreDict[name].trueRarity > 1) { $(`#display-${name}`).addClass("common")} 
    if (oreDict[name].trueRarity >= 50) { $(`#display-${name}`).addClass("uncommon")}
    if (oreDict[name].trueRarity >= 300) { $(`#display-${name}`).addClass("rare")}
    if (oreDict[name].trueRarity >= 1000) { $(`#display-${name}`).addClass("epic")}
    if (oreDict[name].trueRarity >= 8000) { $(`#display-${name}`).addClass("mythic")}
    if (oreDict[name].trueRarity >= 20000) { $(`#display-${name}`).addClass("unseen")}
    if (oreDict[name].event) { $(`#${name}-counter`).addClass("event-text")}
}

function createAllDisplays() {
    for (i of sortedOreNames) {
        if (oreDict[i].amt >= 1) {
            createDisplay(i, "load")
        }
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
        addOre(targetBlock.type, foundOre.deposit ? select([5, 6, 7]) : 1)
    }
}

function toggleSidebar() {
    if (sidebarOpen) {
        $("aside").hide()
        $("main").css("margin-right", "0")
        sidebarOpen = false
    } else {
        $("aside").show()
        $("main").css("margin-right", "22vw")
        sidebarOpen = true
    }
}

// misc functions

function getTime() {
    let date = new Date();
    if (~~(date.getMinutes() / 10) % 2 == 0) {
        $("#time").attr("src", "assets/misc/sun.png")
    } else {
        $("#time").attr("src", "assets/misc/moon.png")
    }
}

function changeFavicon() {
    selectedOre = lastFavicon
    while (lastFavicon === selectedOre) {
        if (oreNames.length == 1) {
            selectedOre = "stone"
            break;
        }
        selectedOre = select(oreNames)
    }
    document.querySelector("#favicon-link").setAttribute("href", `assets/ores/${selectedOre}.png`)
    lastFavicon = selectedOre
}

function getOreInfo(name) {
    let toDisplay = capitalizeFirstLetter(name)
    let oreFound = oreDict[name]
    let toDisplayRarity = oreFound.trueRarity
    if (oreFound.rarity <= 1) {
        toDisplayRarity = "Base"
    }
    if (oreFound.properties["display"]) {
        toDisplay = oreFound.properties["display"]
    }
    return {"display": toDisplay, "rarity": toDisplayRarity, "desc": oreFound.desc, "time": oreFound.properties["time"]}
}

function showInfo(name) {
    let oreInfo = getOreInfo(name)
    let time = oreInfo.time != "any" ? `, exclusive to ` + oreInfo.time : "";
    document.querySelector("#oreInfo").innerHTML = `Name: ${oreInfo.display}, Rarity: 1 in ${oreInfo.rarity.toLocaleString("en-us")}` + time
    document.querySelector("#oreDesc").innerHTML = oreInfo.desc;
}

function sortOreList() {
    window.sortedOreNames = [...allOreNames]
    sortedOreNames.sort((a, b) => {
        if (a === "stone" || b === "stone" || a === "voidElement" || b === "voidElement") {
            return 0;
        }
        if (oreDict[a].rarity > oreDict[b].rarity) {
            return 1;
        }
        if (oreDict[a].rarity < oreDict[b].rarity) {
            return -1;
        }
        if (oreDict[a].rarity === oreDict[b].rarity) {
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
        currentAmt = oreDict[i].amt * 7
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
        oreDict[currentOre].amt = i / 7
        total += oreDict[currentOre].amt
        if (oreDict[currentOre].amt > 0) {
            if (currentOre != "voidElement") {
                oreNames.push(currentOre)
            }
        }
        index += 1
    }
    total -= voidElement.amt
    $("#counter").html(total);
}

// classes

class Ore {
    constructor(name, rarity, properties = {obtainable: true}) {
        this.name = name;
        this.texture = document.querySelector(`#tx-${name}`);
        this.trueRarity = rarity
        this.rarity = ~~(rarity / totalLuck);
        this.properties = {display: "", obtainable: true, event: false, time: "any", particles: {show: false, type: "sparkle", intensity: 1}}
        for (let i in properties) {
            this.properties[i] = properties[i]
        } // this is like my first time using an in loop
        if (this.properties["event"].expire < Date.now()) {
            this.properties["obtainable"] = false;
        }
        this.desc = descs[name];
        this.amt = 0
        oreDict[name] = this
        allOreNames.push(name)
        allOres.push(this)
        this.percent = 100 / rarity
        this.percentChunk = [totalPercent, totalPercent - this.percent]
        if (this.rarity > 1 && this.properties["obtainable"]) {
            totalPercent -= this.percent
        } else {
            this.percentChunk = [0, 0]
        }
    }
}

class OreDisplay {
    constructor(parent, x, y) {
        this.type = parent.name;
        this.texture = parent.texture;
        this.rarity = parent.rarity;
        this.x = x;
        this.y = y;
        this.deposit = Boolean(Math.random() * 15 > 14 && this.rarity > 1)
        this.particles = parent.properties["particles"]
        if (this.particles.show) {
            particles.push(new Particle(this))
        }
        this.creationTime = performance.now()
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

class Particle {
    constructor(parent) {
        this.parent = parent
        this.type = parent.particles.type
        this.tx = $(`#tx-par-${this.type}`)[0]
        this.loc = [parent.x + 8.5, parent.y + 8.5]
        this.dir = Math.random() * 360
        this.loc[0] += Math.sin(this.dir) * 8
        this.loc[1] += Math.cos(this.dir) * 8
        this.life = 0
    }

    refresh() {
        this.life += 1
        fxCtx.beginPath()
        fxCtx.drawImage(this.tx, this.loc[0], this.loc[1], 8, 8) 
        this.loc[0] += Math.sin(this.dir) / 2
        this.loc[1] += Math.cos(this.dir) / 2
        if (!genOres.includes(this.parent) || this.life > 90) { // checks if particle is fatherless
            fxCtx.clearRect(this.loc[0], this.loc[1], 8, 8)
            deadParticles.push(this)
        }
    }
}

// setup

let stPatricksEvent = new GameEvent(
    "St. Patricks Event", 1.25, 
    "ST. PATRICKS EVENT: Extra luck & NEW Event Ore Patricine available until March 24 at noon EST",
    1679673600000
    )

let aprilFoolsEvent = new GameEvent(
    "APRIL FEWLS", 1,
    "the best update is out", 1680451200000
)

let stone = new Ore("stone", 1);
let voidElement = new Ore("voidElement", 1, {display: "Void."});
let copper = new Ore("copper", 15);
let coal = new Ore("coal", 25);
let iron = new Ore("iron", 40)
let lead = new Ore("lead", 65);
let gold = new Ore("gold", 300, {particles: {show: true, type: "sparkle", intensity: 30}});
let relic = new Ore("relic", 500, {display: "Bronze Relic"});
let emerald = new Ore("emerald", 750, {particles: {show: true, type: "sparkle", intensity: 25}});
let diamond = new Ore("diamond", 1000, {particles: {show: true, type: "sparkle", intensity: 20}});
let painite = new Ore("painite", 1500);
let vyvyxyn = new Ore("vyvyxyn", 3000, {particles: {show: true, type: "sparkle", intensity: 5}});
// ALL ORES NEWER THAN VYVYXYN GO BELOW IN INCREASINGLY NEW ORDER
let crystalresonance = new Ore("crystalresonance", 25000, {display: "Crystal of Resonance"})
let crysor = new Ore("crysor", 5000, {particles: {show: true, type: "snowflake", intensity: 15}})
// Release
let amethyst = new Ore("amethyst", 175, {particles: {show: true, type: "sparkle", intensity: 60}})
// 1.1
let fossil = new Ore("fossil", 900)
let porvileon = new Ore("porvileon", 12500, {show: true, type: "oddsparkle", intensity: 27})
// 1.2
let xyxyvylyn = new Ore("xyxyvylyn", 3000)
// 1.2.1
let patricine = new Ore("patricine", 3000, {event: stPatricksEvent})
// 1.3
let cobalt = new Ore("cobalt", 4000, {display: "Cobalt-60"})
let mysalin = new Ore("mysalin", 15723)
// 2.0
let basalt = new Ore("basalt", 200, {time: "night"})
let magma = new Ore("magma", 200, {time: "day", particles: {show: true, type: "fire", intensity: 45}})
let chilledamethyst = new Ore("chilledamethyst", 3800, {time: "night", display: "Chilled Amethyst", particles: {show: true, type: "snowflake", intensity: 20}})
let infernalgold = new Ore("infernalgold", 3800, {time: "day", display: "Infernal Gold", particles: {show: true, type: "fire", intensity: 20}})
let astralcrystal = new Ore("astralcrystal", 60000, {time: "night", display: "&#9789; Astral Crystal &#9790;", particles: {show: true, type: "snowflake", intensity: 5}})
let divinecrystal = new Ore("divinecrystal", 60000, {time: "day", display: "&#9788; Divine Crystal &#9788;", particles: {show: true, type: "fire", intensity: 5}})
// 9.9.9
let thefunny = new Ore("thefunny", 300, {display: "THE FUNNIEST ORE IN ALL OF CRYSTAL COVES", event: aprilFoolsEvent})
let mrbeastore = new Ore("mrbeastore", 2500, {event: aprilFoolsEvent})
// 2.1
let tungsten = new Ore("tungsten", 144)
// 2.2
let quartz = new Ore("quartz", 30)
// 2.3
let vulkani = new Ore("vulkani", 25000, {time: "day", display: "Vulkanï", particles: {show: true, type: "fire", intensity: 1}})
let pyrite = new Ore("pyrite", 75)
let platnium = new Ore("platnium", 1000, {particles: {show: true, type: "sparkle", intensity: 20}})
let foliatite = new Ore("foliatite", 4916)

stone.percentChunk = [totalPercent, 0]

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
getTime();

setInterval(changeFavicon, 5000);
setInterval(generateSave, 10000);
setInterval(getTime, 1000);
setTimeout(clearMine, 200);
window.requestAnimationFrame(renderFx)

window.onbeforeunload = generateSave

$("#just-found").hide()
$("#GAME").mousedown(click);

$("html").keypress((e) => {
    console.log(e.keyCode)
    if (e.keyCode === 93) {
        toggleSidebar()
    }
})