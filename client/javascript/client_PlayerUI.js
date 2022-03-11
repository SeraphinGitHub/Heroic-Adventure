
"use strict"

// =====================================================================
// Pane Toggling
// =====================================================================
const togglePane = (button, panel, state, sideStr, hiddenButton) => {

   button.addEventListener("click", () => {
      
      // NavBar Button
      if(!state) {
         panel.classList.add("visible");
         panel.classList.add(`toggle-panel-${sideStr}`);
         button.classList.add(`hide-${sideStr}-nav-button`);
      }

      else {
         panel.classList.remove("visible");
         panel.classList.remove(`toggle-panel-${sideStr}`);
         if(hiddenButton) hiddenButton.classList.remove(`hide-${sideStr}-nav-button`);
      }
   });
}

const toggleBottomPane = (button, panel, state, sideStr, glowPanel) => {

   button.addEventListener("click", () => {
      
      if(!state) {
         state = true;
         
         if(sideStr === "chat") {
            panel.classList.add("toggle-chat");
            if(isGeneralChat) glowPanel.classList.add("glow-purple");
            if(isPrivateChat) glowPanel.classList.add("glow-orange");
         }

         if(sideStr === "bag") panel.classList.add("toggle-bag");
      }

      else {
         state = false;
         
         if(sideStr === "chat") {
            panel.classList.remove("toggle-chat");
            glowPanel.classList.remove("glow-purple");
            glowPanel.classList.remove("glow-orange");
         }

         if(sideStr === "bag") panel.classList.remove("toggle-bag");
      }
   });
}


// =====================================================================
// Panels & Buttons HTML Elements
// =====================================================================
const panels = {
   inventory: document.querySelector(".player-inventory"),
   map: document.querySelector(".player-map"),
   social: document.querySelector(".player-social"),
   stats: document.querySelector(".player-stats"),
   score: document.querySelector(".player-score"),
   controls: document.querySelector(".player-controls"),
}

const buttons = {
   showInventory: document.querySelector(".show-player-inventory"),
   hideInventory: document.querySelector(".hide-player-inventory"),
   showMap: document.querySelector(".show-player-map"),
   hideMap: document.querySelector(".hide-player-map"),
   showSocial: document.querySelector(".show-player-social"),
   hideSocial: document.querySelector(".hide-player-social"),

   showStats: document.querySelector(".show-player-stats"),
   hideStats: document.querySelector(".hide-player-stats"),
   showScore: document.querySelector(".show-player-score"),
   hideScore: document.querySelector(".hide-player-score"),
   showControls: document.querySelector(".show-player-controls"),
   hideControls: document.querySelector(".hide-player-controls"),
}


// =====================================================================
// Player Inventory Pane
// =====================================================================
const playerInventory = (socket) => {

   const playerName = document.querySelector(".player-name");
   
   socket.on("playerInventory", (data) => {
      playerName.textContent = data.name;
   });

   // Toggle Score panel & hide others panels
   togglePane(buttons.showInventory, panels.inventory, false, "left");
   togglePane(buttons.showInventory, panels.map, true, "left", buttons.showMap);
   togglePane(buttons.showInventory, panels.social, true, "left", buttons.showSocial);

   // Hied Score button & toggle others buttons
   togglePane(buttons.hideInventory, panels.inventory, true, "left", buttons.showInventory);
   togglePane(buttons.hideInventory, panels.map, true, "left");
   togglePane(buttons.hideInventory, panels.social, true, "left");
}


// =====================================================================
// Player Map Pane
// =====================================================================
const playerMap = () => {

   // Toggle Map panel & hide others panels
   togglePane(buttons.showMap, panels.inventory, true, "left", buttons.showInventory);
   togglePane(buttons.showMap, panels.map, false, "left");
   togglePane(buttons.showMap, panels.social, true, "left", buttons.showSocial);

   // Hied Map button & toggle others buttons
   togglePane(buttons.hideMap, panels.inventory, true, "left");
   togglePane(buttons.hideMap, panels.map, true, "left", buttons.showMap);
   togglePane(buttons.hideMap, panels.social, true, "left");
}


// =====================================================================
// Player Social Pane
// =====================================================================
const playerSocial = () => {

   // Toggle Social panel & hide others panels
   togglePane(buttons.showSocial, panels.inventory, true, "left", buttons.showInventory);
   togglePane(buttons.showSocial, panels.map, true, "left", buttons.showMap);
   togglePane(buttons.showSocial, panels.social, false, "left");

   // Hied Social button & toggle others buttons
   togglePane(buttons.hideSocial, panels.inventory, true, "left");
   togglePane(buttons.hideSocial, panels.map, true, "left");
   togglePane(buttons.hideSocial, panels.social, true, "left", buttons.showSocial);
}


// =====================================================================
// Player Stats Pane
// =====================================================================
const playerStats = (socket) => {
      
   // Player Stats
   const health = document.querySelector(".health-value");
   const mana = document.querySelector(".mana-value");
   const regenMana = document.querySelector(".mana-regen-value");
   const energy = document.querySelector(".energy-value");
   const regenEnergy = document.querySelector(".energy-regen-value");
   const attackSpeed = document.querySelector(".attackSpeed-value");
   const damage = document.querySelector(".damage-value");
   const walkSpeed = document.querySelector(".walkSpeed-value");
   const runSpeed = document.querySelector(".runSpeed-value");

   socket.on("playerStats", (data) => {

      // Set DOM text content
      health.textContent = data.health;
      mana.textContent = data.mana;
      regenMana.textContent = `${data.regenMana} /s`;
      energy.textContent = data.energy;
      regenEnergy.textContent = `${data.regenEnergy} /s`;
      attackSpeed.textContent = `${data.attackSpeed} s`;
      damage.textContent = `${data.minDamage} - ${data.maxDamage}`;
      walkSpeed.textContent = `${data.walkSpeed} %`;
      runSpeed.textContent = `${data.runSpeed} %`;
   });

   // Toggle Stats panel & hide others panels
   togglePane(buttons.showStats, panels.stats, false, "right");
   togglePane(buttons.showStats, panels.score, true, "right", buttons.showScore);
   togglePane(buttons.showStats, panels.controls, true, "right", buttons.showControls);

   // Hied Stats button & toggle others buttons
   togglePane(buttons.hideStats, panels.stats, true, "right", buttons.showStats);
   togglePane(buttons.hideStats, panels.score, true, "right");
   togglePane(buttons.hideStats, panels.controls, true, "right");
}


// =====================================================================
// Player Score Pane
// =====================================================================
const playerScore = (socket) => {

   // Player score
   const kills = document.querySelector(".kills-value");
   const playersKills = document.querySelector(".players-kills-value");
   const mobsKills = document.querySelector(".mobs-kills-value");
   const died = document.querySelector(".died-value");
   const fame = document.querySelector(".fame-value");
   const fameCount = document.querySelector(".fame-count-value");

   socket.on("playerScore", (data) => {
      
      // Set DOM text content
      kills.textContent = data.kills;
      playersKills.textContent = data.playersKills;
      mobsKills.textContent =  data.mobsKills;
      died.textContent =  data.died;
      fame.textContent =  data.fame;
      fameCount.textContent =  data.fameCount;
   });

   // Toggle Score panel & hide others panels
   togglePane(buttons.showScore, panels.stats, true, "right", buttons.showStats);
   togglePane(buttons.showScore, panels.score, false, "right");
   togglePane(buttons.showScore, panels.controls, true, "right", buttons.showControls);

   // Hied Score button & toggle others buttons
   togglePane(buttons.hideScore, panels.stats, true, "right");
   togglePane(buttons.hideScore, panels.score, true, "right", buttons.showScore);
   togglePane(buttons.hideScore, panels.controls, true, "right");
}


// =====================================================================
// Player Controls Pane
// =====================================================================
const playerControls = () => {

   // Toggle Controls panel & hide others panels
   togglePane(buttons.showControls, panels.stats, true, "right", buttons.showStats);
   togglePane(buttons.showControls, panels.score, true, "right", buttons.showScore);
   togglePane(buttons.showControls, panels.controls, false, "right");

   // Hied Controls button & toggle others buttons
   togglePane(buttons.hideControls, panels.stats, true, "right");
   togglePane(buttons.hideControls, panels.score, true, "right");
   togglePane(buttons.hideControls, panels.controls, true, "right", buttons.showControls);
}


// =====================================================================
// Player Chat Pane
// =====================================================================
const playerChat = () => {

   const chatPane = document.querySelector(".player-chat");
   const chatButton = document.querySelector(".chat-plate");
   const chatGlowing = document.querySelector(".chat-glowing");
   toggleBottomPane(chatButton, chatPane, false, "chat", chatGlowing);
}


// =====================================================================
// Player Bags Pane
// =====================================================================
const playerBags = () => {

   const leftBagPane = document.querySelector(".player-bag-left");
   const rightBagPane = document.querySelector(".player-bag-right");
   const leftBagButton = document.querySelector(".left-bag-plate");
   const rightBagButton = document.querySelector(".right-bag-plate");
   
   toggleBottomPane(leftBagButton, leftBagPane, false, "bag");
   toggleBottomPane(rightBagButton, rightBagPane, false, "bag");
}


// =====================================================================
// Game UI Handler ==> Socket Listening
// =====================================================================
const handleGameUI = (socket) => {

   playerInventory(socket);
   playerMap();
   playerSocial();

   playerStats(socket);
   playerScore(socket);
   playerControls();

   playerChat();
   playerBags();
}