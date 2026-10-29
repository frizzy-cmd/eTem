var timerId = null;
var currentStep = 0;
var isRunning = false;

var audioCtx = null;

//sounds
function playBeep(freq, type, duration) {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = type || 'square';
        osc.frequency.value = freq || 800;
        gain.gain.value = 0.05;
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        setTimeout(function() {
            osc.stop();
        }, duration || 100);
    } catch(e) {
        //audio error ignroed
    }
}

var logs = [
    { t: 0, msg: "[INIT] Initializing eTem HSM interface", pct: 0 },
    { t: 1, msg: "[INIT] Establishing SSL/TLS tunnel to PKI driver", pct: 5 },
    { t: 2, msg: "[HSM] Checking entropy pool status.. OK (4096 bits available)", pct: 12 },
    { t: 3, msg: "[CRYPT] Doing some BS", pct: 20 },
    { t: 5, msg: "[RSA] Generating 4096-bit prime candidate (p)", pct: 33 },
    { t: 7, msg: "[RSA] Running Miller-Rabin primality test 1/20", pct: 45 },
    { t: 8, msg: "[WARN] Low BS detected in hardware entropy! Recalculating prime (q)...", pct: 55 },
    { t: 10, msg: "[RSA] Tooting my own horn", pct: 68 },
    { t: 12, msg: "[RSA] Doing some BS", pct: 82 },
    { t: 13, msg: "[VERIFY] Verifying", pct: 92 },
    { t: 14, msg: "[SUCCESS] Key pair finalized & validated by HSM", pct: 98 },
    { t: 15, msg: "[DONE] Generated success", pct: 100 }
];

function startGenProcess() {
    if (isRunning) return;
    
    isRunning = true;
    currentStep = 0;
    
    var btn = document.getElementById("genBtn");
    btn.disabled = true;
    btn.style.opacity = "0.6";

    var term = document.getElementById("termLog");
    term.innerText = "-- Starting generation --\n";
    
    updateProgress(0);
    playBeep(440, 'sine', 150);

    var seconds = 0;
    
    timerId = setInterval(function() {
        seconds++;

        for (var i = 0; i < logs.length; i++) {
            if (logs[i].t === seconds) {
                appendLog(logs[i].msg);
                updateProgress(logs[i].pct);
                playBeep(600 + (logs[i].pct * 4), 'square', 60);
            }
        }

        if (seconds >= 15) {
            clearInterval(timerId);
            isRunning = false;
            btn.disabled = false;
            btn.style.opacity = "1";
            
            //done
            playBeep(880, 'triangle', 200);
            setTimeout(function() { playBeep(1200, 'triangle', 300); }, 220);
            
            showModal();
        }
    }, 1000);
}

function appendLog(msg) {
    var term = document.getElementById("termLog");
    term.innerText += msg + "\n";
    term.scrollTop = term.scrollHeight;
}

function updateProgress(pct) {
    document.getElementById("percentText").innerText = pct + "%";
    document.getElementById("pFill").style.width = pct + "%";
}

function clearConsole() {
    if (isRunning) return;
    document.getElementById("termLog").innerText = "-- Cleared --\n";
    updateProgress(0);
}

function showModal() {
    document.getElementById("keyModal").style.display = "block";
}

function closeKeyModal() {
    document.getElementById("keyModal").style.display = "none";
}

function copyKeyToClipboard() {
    var copyText = document.getElementById("keyArea");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    
    navigator.clipboard.writeText(copyText.value).then(function() {
        alert("Copyed");
    }).catch(function() {
        // fb
        document.execCommand("copy");
        alert("Copy done");
    });
}

function downloadKeyFile() {
    var text = document.getElementById("keyArea").value;
    var blob = new Blob([text], { type: "text/plain" });
    var anchor = document.createElement("a");
    anchor.download = "key.pem";
    anchor.href = window.URL.createObjectURL(blob);
    anchor.target = "_blank";
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}