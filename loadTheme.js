let selectedTheme = JSON.parse(atob(document.cookie.substring(5))).theme || "navy"
let bodyStyle = document.querySelector("body").style

switch (selectedTheme) {
    case "navy":
        bodyStyle.setProperty("--bg-color", "#112")
        bodyStyle.setProperty("--sidebar-color", "#113")
        bodyStyle.setProperty("--accent-color", "#7f7f8f")
        bodyStyle.setProperty("--text-color", "#fff")
        break
    case "black":
        bodyStyle.setProperty("--bg-color", "#000")
        bodyStyle.setProperty("--sidebar-color", "#111")
        bodyStyle.setProperty("--accent-color", "#7f7f7f")
        bodyStyle.setProperty("--text-color", "#fff")
        break
    case "amethyst":
        bodyStyle.setProperty("--bg-color", "#203")
        bodyStyle.setProperty("--sidebar-color", "#304")
        bodyStyle.setProperty("--accent-color", "#96c")
        bodyStyle.setProperty("--text-color", "#fff")
        break
    case "hacker":
        bodyStyle.setProperty("--bg-color", "#000")
        bodyStyle.setProperty("--sidebar-color", "#111")
        bodyStyle.setProperty("--accent-color", "#0f0")
        bodyStyle.setProperty("--text-color", "#0f0")
        break
    case "pain":
        bodyStyle.setProperty("--bg-color", "#fff")
        bodyStyle.setProperty("--sidebar-color", "#fff")
        bodyStyle.setProperty("--accent-color", "#fff")
        bodyStyle.setProperty("--text-color", "#000")
        break
}

// i know this is extremely redundant ill change it later