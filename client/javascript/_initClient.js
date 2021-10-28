
"use strict"

// =====================================================================
// Initiallize client scripts
// =====================================================================
const scripts = [
   
   // Classes
   "classes/FloatingMessage.js",
   "classes/GameBar.js",
   "classes/Tile.js",
   
   // Scripts
   "client_GameHandler.js",
   "client_PlayerHandler.js",
   "client_Map.js",
];

const instantiate = (scriptName) => {
   const newScript = document.createElement("script");
   newScript.type = "text/javascript";
   newScript.src = `/client/javascript/${scriptName}`;
   document.body.appendChild(newScript);
}

window.addEventListener("load", () => {
   scripts.forEach(item => instantiate(item));
});