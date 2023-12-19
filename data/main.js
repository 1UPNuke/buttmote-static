let remoteEnabled = false;
let bufferMinutes = 0;


document.addEventListener("DOMContentLoaded", async ()=>{
    await getState();
    document.getElementById("buffer-minutes").value = bufferMinutes.toFixed(2);
    document.getElementById("remote-enabled").checked = remoteEnabled;

    window.setInterval(getState, 1000);

    document.getElementById("remote-enabled").addEventListener("change", setSettings);
    document.getElementById("buffer-minutes").addEventListener("change", setSettings);
});

async function setSettings(e) {
    e.preventDefault();
    remoteEnabled = document.getElementById("remote-enabled").checked;
    let bufferInputValue = document.getElementById("buffer-minutes").value;
    if(isNaN(bufferInputValue) || bufferInputValue === "") {
        alert("Please input a number!");
        return;
    }
    bufferMinutes = +document.getElementById("buffer-minutes").value;

    const response = await fetch("/api/settings", {
        method: "POST",
        mode: "same-origin",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({remoteEnabled, bufferMinutes})
    });
    const json = await response.json();
    if(json.error) {
        alert("Error updating settings: " + json.msg);
    }
    
    await getState();
    document.getElementById("buffer-minutes").value = bufferMinutes.toFixed(2);;
    document.getElementById("remote-enabled").checked = remoteEnabled;
}

async function getState() {
    const response = await fetch("/api/status");
    const json = await response.json();

    const sitting = json.sitting;
    const minutesSat = json.minutesSat;
    const minutesStood = json.minutesStood;

    remoteEnabled = json.remoteEnabled;
    bufferMinutes = json.bufferMinutes;

    const bufferReached = minutesStood >= bufferMinutes;

    updateOverlay(sitting, bufferReached);
    updateBulb(sitting, bufferReached);
    updateCouch(sitting);
    updatePerson(sitting );
}

function updateOverlay(sitting, bufferReached) {
    const overlay = document.getElementById("overlay");

    if(sitting) {
        overlay.style.opacity = 0.7;
    } else if (bufferReached) {
        overlay.style.opacity = 0;
    } else {
        overlay.style.opacity = 0.3;
    }
}

function updateBulb(sitting, bufferReached) {
    const bulb = document.getElementById("bulb");
    const bulbOn = document.getElementById("bulb-on");
    const bulbOff = document.getElementById("bulb-off");

    //Restart animations if bulb updates
    if(bulb.classList.contains("hidden") != sitting) {
        bulb.classList.add("pulse");
        window.setTimeout(()=>bulb.classList.remove("pulse"), 900);
    }

    bulbOn.classList.toggle("hidden", sitting);
    bulbOff.classList.toggle("hidden", !sitting);
    bulb.style.opacity = sitting || bufferReached ? 1 : 0.5;
} 

function updateCouch(sitting) {
    const couch = document.getElementById("couch");
    couch.style.animationName = sitting ? "catch" : "launch";
}

function updatePerson(sitting) {
    const person = document.getElementById("person");
    person.style.animationName = sitting ? "fall" : "walk";
}
