let wifiSSID = "Wi-Fi SSID";
let wifiPass = "";
let bulbIP = "0.0.0.0";

document.addEventListener("DOMContentLoaded", async ()=>{
    await getState();
    document.getElementById("wifi-ssid").value = wifiSSID;
    document.getElementById("bulb-ip").value = bulbIP;

    window.setInterval(getState, 1000);

    document.querySelector("form").addEventListener("submit", formSubmit);
});

function formSubmit(e) {
    e.preventDefault();
    setSettings(e);
    return false;
}

async function setSettings(e) {
    e.preventDefault();
    wifiSSID = document.getElementById("wifi-ssid").value;
    wifiPass = document.getElementById("wifi-pass").value;
    bulbIP = document.getElementById("bulb-ip").value;
    if(wifiSSID === "" || wifiPass === "" || bulbIP === "") {
        alert("Please input a value!");
        return;
    }

    const response = await fetch("/api/wifisettings", {
        method: "POST",
        mode: "same-origin",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({wifiSSID, wifiPass, bulbIP})
    });
    const json = await response.json();
    if(json.error) {
        alert("Error updating settings: " + json.msg);
    }
    
    await getState();
    document.getElementById("wifi-ssid").value = wifiSSID;
    document.getElementById("bulb-ip").value = bulbIP;
}

async function getState() {
    const response = await fetch("/api/wifistatus");
    const json = await response.json();

    wifiSSID = json.wifiSSID;
    bulbIP = json.bulbIP;
}