// ==========================================
// FLAME OS - SCRIPT PRINCIPAL COMPLET
// ==========================================

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.querySelectorAll('.clock-display').forEach(el => el.innerText = hours + ":" + minutes);
}
setInterval(updateClock, 1000); 
updateClock();

let currentVolume = 50, isScreenOff = false, longPressTimer = null;

// Bază de date cu numele aplicațiilor pentru Notch
const appNames = {
    'app-store': 'App Store',
    'app-settings': 'Setări',
    'app-calculator': 'Calculator',
    'app-nora': 'Nora AI',
    'app-camera': 'Cameră',
    'app-meteo': 'Meteo',
    'app-flappy': 'Flappy Bird',
    'app-minecraft': 'Craft 2D'
};

// 🔓 Deblocare
function unlockPhone() {
    const lock = document.getElementById('lock-screen');
    if(lock) {
        lock.style.transform = "translateY(-100%)";
        lock.style.opacity = "0";
        setTimeout(() => lock.style.pointerEvents = "none", 400);
    }
}

// 🏠 SWIPE SUS PENTRU HOME
let swipeStartY = 0;
function startSwipe(e) { swipeStartY = e.touches ? e.touches[0].clientY : e.clientY; }
function endSwipe(e) {
    let swipeEndY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    let distance = swipeStartY - swipeEndY;
    if (distance > 20 || distance === 0) goHome();
}

function goHome() {
    stopFlappyGame();
    stopCamera();
    
    const homeScreen = document.getElementById('home-screen');
    if(homeScreen) homeScreen.style.filter = "blur(0px)";

    document.querySelectorAll('.app-window').forEach(win => {
        win.classList.remove('open');
        const video = win.querySelector('video');
        if(video && video.id !== 'camera-feed') video.pause();
    });
}

// 📱 DESCHIDERE APLICAȚII + NOTCH ANIMATION
function openApp(id, element) {
    if(isScreenOff) return;
    const app = document.getElementById(id);
    
    if(app) {
        if (element) {
            const rect = element.getBoundingClientRect();
            const phoneRect = document.getElementById('phone-screen').getBoundingClientRect();
            const originX = rect.left - phoneRect.left + (rect.width / 2);
            const originY = rect.top - phoneRect.top + (rect.height / 2);
            app.style.transformOrigin = `${originX}px ${originY}px`;
        } else {
            app.style.transformOrigin = "center center";
        }

        app.classList.add('open');
        
        const homeScreen = document.getElementById('home-screen');
        if(homeScreen) {
            homeScreen.style.transition = "filter 0.4s ease";
            homeScreen.style.filter = "blur(10px)";
        }
        
        // Când se deschide, Notch-ul te anunță
        triggerNotchNotification(`Deschis: ${appNames[id] || 'Aplicație'}`);

        if(id === 'app-flappy') initFlappyGame();
        if(id === 'app-minecraft') initMinecraftGame();
        if(id === 'app-camera') startCamera();
    }
}

// ⏳ LOCK SCREEN WALLPAPER 
function startWallpaperTimer(e) {
    if(isScreenOff) return;
    longPressTimer = setTimeout(() => { changeWallpaper(); }, 3000);
}
function cancelWallpaperTimer() { if(longPressTimer) clearTimeout(longPressTimer); }
function changeWallpaper() {
    const wallImages = ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000', 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1000'];
    document.getElementById('lock-screen').style.backgroundImage = `url('${wallImages[Math.floor(Math.random() * wallImages.length)]}')`;
    triggerNotchNotification("🎨 Fundal Schimbat!");
}

// ⚙️ SETĂRI & ROTIRE 3D
function changeBrightness(val) { document.getElementById('phone-screen').style.filter = `brightness(${val}%)`; }
function changeNotchColor(color) { document.getElementById('circular-notch').style.backgroundColor = color; }
function toggleDarkMode(dark) { document.getElementById('phone-screen').style.background = dark ? "#222" : "#fff"; }

let is3DMode = false;
function toggle3DMode(active) {
    is3DMode = active;
    const phone = document.getElementById('phone-device');
    if(!is3DMode) {
        phone.style.transform = `rotateX(0deg) rotateY(0deg)`;
        document.removeEventListener('mousemove', rotatePhone);
        document.removeEventListener('touchmove', rotatePhone);
    } else {
        document.addEventListener('mousemove', rotatePhone);
        document.addEventListener('touchmove', rotatePhone, {passive: false});
        triggerNotchNotification("🧊 Mod 3D Activat!");
    }
}
function rotatePhone(e) {
    if(!is3DMode) return;
    let clientX = e.clientX || (e.touches && e.touches[0].clientX);
    let clientY = e.clientY || (e.touches && e.touches[0].clientY);
    let x = (window.innerWidth / 2 - clientX) / 10;
    let y = (window.innerHeight / 2 - clientY) / 10;
    document.getElementById('phone-device').style.transform = `rotateX(${y}deg) rotateY(${-x}deg)`;
}

// 🎬 APP STORE & APLICAȚII DINAMICE
const installedApps = {};
function installAppEngine(id, name, emoji) {
    const btn = document.getElementById('btn-' + id);
    if (!btn || installedApps[id]) { if(installedApps[id]) openDynamicApp(name, emoji, null); return; }
    btn.innerText = "Instalare..."; triggerNotchNotification(`📥 Se descarcă...`);
    setTimeout(() => {
        btn.innerText = "DESCHIDE"; btn.classList.add('installed'); installedApps[id] = true;
        const grid = document.getElementById('main-apps-grid');
        const newIcon = document.createElement('div'); newIcon.className = "app-icon"; 
        newIcon.setAttribute("onclick", `openDynamicApp('${name}', '${emoji}', this)`);
        newIcon.innerHTML = `<div class="icon-box" style="background:linear-gradient(135deg, #000, #333);">${emoji}</div><span>${name}</span>`;
        grid.appendChild(newIcon);
    }, 1200);
}

function openDynamicApp(name, emoji, element) {
    const win = document.getElementById('app-dynamic'); 
    document.getElementById('dynamic-title').innerText = name;
    
    if (element) {
        const rect = element.getBoundingClientRect();
        const phoneRect = document.getElementById('phone-screen').getBoundingClientRect();
        const originX = rect.left - phoneRect.left + (rect.width / 2);
        const originY = rect.top - phoneRect.top + (rect.height / 2);
        win.style.transformOrigin = `${originX}px ${originY}px`;
    } else {
        win.style.transformOrigin = "center center";
    }

    if(name === 'TikTok 2D') {
        document.getElementById('dynamic-content').innerHTML = `<div style="background:#000; width:100%; height:290px; border-radius:14px; position:relative; overflow:hidden;"><video id="tk-player" src="12310.mp4" autoplay loop playsinline style="width:100%; height:100%; object-fit:cover;"></video></div>`;
    } else { 
        document.getElementById('dynamic-content').innerHTML = `<div style="text-align:center; padding:20px;"><h3>${name} pornit!</h3></div>`; 
    }
    
    win.classList.add('open');
    document.getElementById('home-screen').style.filter = "blur(10px)";
    triggerNotchNotification(`Deschis: ${name}`);
}

// 🔘 BUTOANE HARDWARE & NOTCH NOTIFICATION
function pressPower() { 
    isScreenOff = !isScreenOff; document.getElementById('screen-blackout').classList.toggle('blackout', isScreenOff); 
    if(!isScreenOff) { const lock = document.getElementById('lock-screen'); if(lock) { lock.style.transform = "translateY(0)"; lock.style.opacity = "1"; lock.style.pointerEvents = "auto"; } goHome(); } 
}
function pressVolume(dir) { 
    currentVolume = dir === 'up' ? Math.min(currentVolume + 10, 100) : Math.max(currentVolume - 10, 0); 
    const hud = document.getElementById('volume-hud'), lvl = document.getElementById('volume-level'); 
    if(lvl) lvl.style.height = currentVolume + '%'; 
    if(hud) { hud.style.opacity = '1'; setTimeout(() => hud.style.opacity = '0', 800); } 
}

// ANIMAȚIA NOTCH-ULUI CIRCULAR
function triggerNotchNotification(text) { 
    const notch = document.getElementById('circular-notch');
    const notchText = document.getElementById('notch-text'); 
    if(notch && notchText) { 
        notchText.innerText = text; 
        notch.style.width = "140px"; // Se lățește din cerc într-o formă ovală
        notchText.style.opacity = "1"; 
        setTimeout(() => { 
            notch.style.width = "20px"; // Revine la cerc mic
            notchText.style.opacity = "0"; 
        }, 2000); 
    } 
}

// 📸 CAMERĂ
let cameraStream = null;
async function startCamera() {
    try { cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); document.getElementById('camera-feed').srcObject = cameraStream; } 
    catch (err) { triggerNotchNotification("⚠️ Cameră indisponibilă"); }
}
function stopCamera() { if (cameraStream) { cameraStream.getTracks().forEach(track => track.stop()); cameraStream = null; } }

// 🤖 NORA AI - PRO VS FLASH
let noraMode = "Pro"; 
function setNoraMode(mode) {
    noraMode = mode;
    let box = document.getElementById('nora-chat-box');
    let bDiv = document.createElement('div'); bDiv.className = 'msg-bot'; 
    bDiv.innerText = `🤖 Sistem comutat pe: ${mode}.`; 
    box.appendChild(bDiv); box.scrollTop = box.scrollHeight;
}
function sendNoraMessage() {
    const inp = document.getElementById('nora-text-input'), box = document.getElementById('nora-chat-box');
    if(!inp || inp.value.trim() === "") return;
    let userText = inp.value;
    let lowerText = userText.toLowerCase();
    
    let uDiv = document.createElement('div'); uDiv.className = 'msg-user'; uDiv.innerText = userText; box.appendChild(uDiv); 
    inp.value = ""; box.scrollTop = box.scrollHeight;

    setTimeout(() => { 
        let botReply = "";
        if(lowerText.includes("upgrade flash pro")) {
            noraMode = "Flash Pro"; botReply = "👑 FLASH PRO ACTIVAT! Sunt la capacitate maximă!"; document.getElementById('circular-notch').style.backgroundColor = "gold";
        }
        else if (lowerText.includes("wallpaper neon")) {
            botReply = "Am setat un fundal Neon pe Lock Screen!"; document.getElementById('lock-screen').style.backgroundImage = "url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000')";
        }
        else if(noraMode === "Flash") {
            if(lowerText.includes("salut")) botReply = "Salut."; else if(lowerText.includes("cum te cheama")) botReply = "Nora Flash."; else if(lowerText.includes("ce poti face")) botReply = "Răspund repede și scurt."; else botReply = "Nu înțeleg.";
        } else {
            if(lowerText.includes("salut")) botReply = "Salutare! Sunt Nora, gata să procesez orice cerință."; else if(lowerText.includes("cum te cheama")) botReply = `Sunt Nora AI, rulez versiunea ${noraMode}.`; else if(lowerText.includes("ce poti face")) botReply = "Pot controla Flame OS și răspunde la întrebări inteligente."; else botReply = "Interesant, dar sunt concentrată pe funcțiile Flame OS momentan.";
        }
        let bDiv = document.createElement('div'); bDiv.className = 'msg-bot'; 
        bDiv.innerHTML = `<b>Nora [${noraMode}]:</b> ${botReply}`; 
        box.appendChild(bDiv); box.scrollTop = box.scrollHeight; 
    }, noraMode === "Flash" ? 300 : (noraMode === "Flash Pro" ? 50 : 800));
}

// 🧮 CALCULATOR
let calcVal = "0";
function calcInput(v) { if(calcVal === "0") calcVal = ""; calcVal += v; document.getElementById('calc-screen').innerText = calcVal; }
function calcClear() { calcVal = "0"; document.getElementById('calc-screen').innerText = "0"; }
function calcEval() { try { calcVal = eval(calcVal).toString(); } catch(e) { calcVal = "Eroare"; } document.getElementById('calc-screen').innerText = calcVal; }

// 🐦 JOC: FLAPPY BIRD
let fCanvas = document.getElementById('flappyCanvas'), fCtx = fCanvas?fCanvas.getContext('2d'):null, fInterval;
let bY=100, bV=0, pipes=[], fScore=0, frames=0;

if(fCanvas) { 
    fCanvas.addEventListener('mousedown', () => bV = -3.5); 
    fCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); bV = -3.5; }, { passive: false }); 
}

function initFlappyGame() { 
    bY=100; bV=0; pipes=[]; fScore=0; frames=0; clearInterval(fInterval); 
    fInterval = setInterval(updateFlappy, 1000/60); 
}

function updateFlappy() {
    if(!fCtx) return;
    frames++; bV+=0.18; bY+=bV; 
    fCtx.fillStyle="#70c5ce"; fCtx.fillRect(0,0,210,220); 
    if(frames % 100 === 0) { let pipeY = Math.random() * 100 + 20; pipes.push({x: 210, y: pipeY}); }
    fCtx.fillStyle="#2ecc71"; 
    for(let i=0; i<pipes.length; i++) {
        let p = pipes[i]; p.x -= 1.5; 
        fCtx.fillRect(p.x, 0, 30, p.y); fCtx.fillRect(p.x, p.y + 70, 30, 220); 
        if(Math.floor(p.x) === 39) fScore++;
        if(40+7 > p.x && 40-7 < p.x+30 && (bY-7 < p.y || bY+7 > p.y+70)) { initFlappyGame(); return; }
    }
    pipes = pipes.filter(p => p.x > -30); 
    fCtx.fillStyle="#ffcc00"; fCtx.beginPath(); fCtx.arc(40,bY,7,0,Math.PI*2); fCtx.fill(); 
    fCtx.fillStyle="#fff"; fCtx.font="16px Arial"; fCtx.fillText(fScore, 100, 20);
    if(bY>220||bY<0) initFlappyGame(); 
}
function stopFlappyGame() { clearInterval(fInterval); }

// 🧱 JOC: CRAFT 2D
const mcRows = 10, mcCols = 10, mcBlockSize = 20; let mcSelectedBlock = 1, mcGrid = [], mcCanvas = document.getElementById('minecraftCanvas'), mcCtx = mcCanvas ? mcCanvas.getContext('2d') : null;
const mcColors = { 0: "#87CEEB", 1: "#4cd964", 2: "#8b5a2b", 3: "#737373" };
function initMinecraftGame() { mcGrid = []; for(let r=0; r<mcRows; r++) { mcGrid[r] = []; for(let c=0; c<mcCols; c++) { mcGrid[r][c] = (r > 6) ? 2 : 0; } } drawMinecraft(); }
function drawMinecraft() { if(!mcCtx) return; for(let r=0; r<mcRows; r++) { for(let c=0; c<mcCols; c++) { mcCtx.fillStyle = mcColors[mcGrid[r][c]] || "#fff"; mcCtx.fillRect(c*mcBlockSize, r*mcBlockSize, mcBlockSize, mcBlockSize); } } }
function handleMinecraftClick(e) { if(!mcCanvas) return; const rect = mcCanvas.getBoundingClientRect(); const x = (e.clientX || e.touches[0].clientX) - rect.left, y = (e.clientY || e.touches[0].clientY) - rect.top; let c = Math.floor(x/mcBlockSize), r = Math.floor(y/mcBlockSize); if(r>=0 && r<mcRows && c>=0 && c<mcCols) { mcGrid[r][c] = mcGrid[r][c] === 0 ? mcSelectedBlock : 0; drawMinecraft(); } }
function changeMinecraftBlock(id) { mcSelectedBlock = id; }

// 🌐 EXPORTĂRI GLOBALE
window.openApp = openApp; window.goHome = goHome; window.pressPower = pressPower; window.pressVolume = pressVolume; window.unlockPhone = unlockPhone; window.startWallpaperTimer = startWallpaperTimer; window.cancelWallpaperTimer = cancelWallpaperTimer; window.changeBrightness = changeBrightness; window.changeNotchColor = changeNotchColor; window.installAppEngine = installAppEngine; window.openDynamicApp = openDynamicApp; window.toggleDarkMode = toggleDarkMode; window.calcInput = calcInput; window.calcClear = calcClear; window.calcEval = calcEval; window.sendNoraMessage = sendNoraMessage; window.handleMinecraftClick = handleMinecraftClick; window.changeMinecraftBlock = changeMinecraftBlock; window.startCamera = startCamera; window.stopCamera = stopCamera; window.startSwipe = startSwipe; window.endSwipe = endSwipe; window.toggle3DMode = toggle3DMode; window.setNoraMode = setNoraMode; window.triggerNotchNotification = triggerNotchNotification;
  
