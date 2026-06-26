// Ceas
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.querySelectorAll('.clock-display').forEach(el => el.innerText = hours + ":" + minutes);
}
setInterval(updateClock, 1000); 
updateClock();

let currentVolume = 50, isScreenOff = false;

// Funcție pentru deschis/închis aplicații
function goHome() {
    stopFlappyGame();
    document.querySelectorAll('.app-window').forEach(win => win.classList.remove('open'));
}

function openApp(id) {
    if(isScreenOff) return;
    const app = document.getElementById(id);
    if(app) {
        app.classList.add('open');
        if(id === 'app-flappy') initFlappyGame();
        if(id === 'app-minecraft') initMinecraftGame();
    }
}

// Store Engine
const installedApps = {};
function installAppEngine(id, name, emoji) {
    const btn = document.getElementById('btn-' + id);
    if (!btn || installedApps[id]) { 
        if(installedApps[id]) openDynamicApp(name, emoji); 
        return; 
    }
    btn.innerText = "Instalare...";
    triggerIslandNotification(`📥 Descărcare ${name}`);
    setTimeout(() => {
        btn.innerText = "DESCHIDE"; btn.classList.add('installed'); installedApps[id] = true;
        triggerIslandNotification(`✅ Gata de rulare!`);
        const grid = document.getElementById('main-apps-grid');
        const newIcon = document.createElement('div');
        newIcon.className = "app-icon";
        newIcon.setAttribute("onclick", `openDynamicApp('${name}', '${emoji}')`);
        newIcon.innerHTML = `<div class="icon-box" style="background:#222;">${emoji}</div><span>${name}</span>`;
        grid.appendChild(newIcon);
    }, 1200);
}

function openDynamicApp(name, emoji) {
    const win = document.getElementById('app-dynamic');
    document.getElementById('dynamic-title').innerText = name;
    document.getElementById('dynamic-content').innerHTML = `<span style="font-size:50px;">${emoji}</span><h3>${name} pornit!</h3>`;
    win.classList.add('open');
}

// Hardware Controls
function pressPower() { 
    isScreenOff = !isScreenOff; 
    document.getElementById('screen-blackout').classList.toggle('blackout', isScreenOff); 
    if(!isScreenOff) goHome(); 
}

function pressVolume(dir) { 
    currentVolume = dir === 'up' ? Math.min(currentVolume + 10, 100) : Math.max(currentVolume - 10, 0); 
    const hud = document.getElementById('volume-hud'); 
    const lvl = document.getElementById('volume-level'); 
    if(lvl) lvl.style.height = currentVolume + '%'; 
    if(hud) { hud.style.opacity = '1'; setTimeout(() => hud.style.opacity = '0', 800); } 
}

function triggerIslandNotification(text) { 
    const island = document.getElementById('island'); 
    const islandText = document.getElementById('island-text'); 
    if(island && islandText) { 
        islandText.innerText = text; island.style.width = "140px"; islandText.style.opacity = "1"; 
        setTimeout(() => { island.style.width = "75px"; islandText.style.opacity = "0"; }, 1800); 
    } 
}

function toggleDarkMode(dark) { 
    document.getElementById('phone-screen').style.filter = dark ? "brightness(0.9)" : "brightness(1.1)"; 
}

// Calculator
let calcVal = "0";
function calcInput(v) { if(calcVal === "0") calcVal = ""; calcVal += v; document.getElementById('calc-screen').innerText = calcVal; }
function calcClear() { calcVal = "0"; document.getElementById('calc-screen').innerText = "0"; }
function calcEval() { try { calcVal = eval(calcVal).toString(); } catch(e) { calcVal = "Eroare"; } document.getElementById('calc-screen').innerText = calcVal; }

// Nora AI
function sendNoraMessage() {
    const inp = document.getElementById('nora-text-input'); 
    const box = document.getElementById('nora-chat-box');
    if(!inp || inp.value.trim() === "") return;
    let uDiv = document.createElement('div'); uDiv.className = 'msg-user'; uDiv.innerText = inp.value; box.appendChild(uDiv); inp.value = "";
    setTimeout(() => { 
        let bDiv = document.createElement('div'); bDiv.className = 'msg-bot'; bDiv.innerText = "🤖 Analizez solicitarea în sistem..."; box.appendChild(bDiv); box.scrollTop = box.scrollHeight; 
    }, 400);
}

// Joc: Flappy Bird
let fCanvas = document.getElementById('flappyCanvas'), fCtx = fCanvas?fCanvas.getContext('2d'):null, fInterval, bY=100, bV=0;
if(fCanvas) { 
    fCanvas.addEventListener('mousedown', () => bV = -3); 
    fCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); bV = -3; }, { passive: false }); 
}
function initFlappyGame() { 
    bY=100; bV=0; clearInterval(fInterval); 
    fInterval = setInterval(() => { 
        bV+=0.15; bY+=bV; 
        if(fCtx){ 
            fCtx.fillStyle="#70c5ce"; fCtx.fillRect(0,0,210,220); 
            fCtx.fillStyle="#ffcc00"; fCtx.beginPath(); fCtx.arc(40,bY,7,0,Math.PI*2); fCtx.fill(); 
            if(bY>210||bY<0) bY=100; 
        } 
    }, 1000/60); 
}
function stopFlappyGame() { clearInterval(fInterval); }

// Joc: Craft 2D
const mcRows = 10;
const mcCols = 10;
const mcBlockSize = 20;
let mcSelectedBlock = 1;
let mcGrid = [];
const mcColors = { 0: "#87CEEB", 1: "#4cd964", 2: "#8b5a2b", 3: "#737373", 5: "#115c1b" };
let mcCanvas = document.getElementById('minecraftCanvas');
let mcCtx = mcCanvas ? mcCanvas.getContext('2d') : null;

function initMinecraftGame() {
    mcGrid = [];
    for(let r = 0; r < mcRows; r++) {
        mcGrid[r] = [];
        for(let c = 0; c < mcCols; c++) {
            mcGrid[r][c] = (r > 6) ? 2 : 0;
        }
    }
    if (mcRows >= 10) {
        mcGrid[mcRows-9][2] = 5; mcGrid[mcRows-9][3] = 5; mcGrid[mcRows-10][2] = 5;
    }
    drawMinecraft();
}

function drawMinecraft() {
    if(!mcCtx) return;
    for(let r = 0; r < mcRows; r++) {
        for(let c = 0; c < mcCols; c++) {
            mcCtx.fillStyle = mcColors[mcGrid[r][c]] || "#fff";
            mcCtx.fillRect(c * mcBlockSize, r * mcBlockSize, mcBlockSize, mcBlockSize);
            mcCtx.strokeStyle = "rgba(0,0,0,0.06)";
            mcCtx.strokeRect(c * mcBlockSize, r * mcBlockSize, mcBlockSize, mcBlockSize);
        }
    }
}

function handleMinecraftClick(e) {
    if(!mcCanvas) return;
    e.preventDefault();
    const rect = mcCanvas.getBoundingClientRect();
    let clientX = e.clientX || (e.touches && e.touches[0].clientX);
    let clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    if(y < mcRows * mcBlockSize) {
        let c = Math.floor(x / mcBlockSize);
        let r = Math.floor(y / mcBlockSize);
        if(r >= 0 && r < mcRows && c >= 0 && c < mcCols) {
            mcGrid[r][c] = mcGrid[r][c] === 0 ? mcSelectedBlock : 0;
            drawMinecraft();
        }
    }
}

function changeMinecraftBlock(blockId) {
    mcSelectedBlock = blockId;
    triggerIslandNotification(`Bloc setat: Tip ${blockId} 🧱`);
}

// 9. EXPORT GLOBAL
window.openApp = openApp;
window.goHome = goHome;
window.pressPower = pressPower;
window.pressVolume = pressVolume;
window.handleMinecraftClick = handleMinecraftClick;
window.changeMinecraftBlock = changeMinecraftBlock;
window.triggerIslandNotification = triggerIslandNotification;
window.installAppEngine = installAppEngine;
window.openDynamicApp = openDynamicApp;
window.toggleDarkMode = toggleDarkMode;
window.calcInput = calcInput;
window.calcClear = calcClear;
window.calcEval = calcEval;
window.sendNoraMessage = sendNoraMessage;
