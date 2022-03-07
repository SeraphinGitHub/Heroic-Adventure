
"use strict"


// =====================================================================
// Pane Toggling
// =====================================================================
const togglePane = (button, pane) => {
   
   let isVisible = false;
   button.addEventListener("click", () => {

      if(!isVisible) {
         isVisible = true;
         pane.classList.add("visible");
         pane.classList.add("toggle-nav-pane");
      }
      else {
         isVisible = false;
         pane.classList.remove("visible");
         pane.classList.remove("toggle-nav-pane");
      }
   });
}


// =====================================================================
// Player Stats Pane
// =====================================================================
const playerStats = (data) => {
   
   // const playerName = document.querySelector(".player-name");
   // playerName.textContent = data.name;
   
   // Player Stats
   const health = document.querySelector(".health-value");
   const mana = document.querySelector(".mana-value");
   const regenMana = document.querySelector(".mana-regen-value");
   const energy = document.querySelector(".energy-value");
   const regenEnergy = document.querySelector(".energy-regen-value");
   const GcD = document.querySelector(".GcD-value");
   const attackSpeed = document.querySelector(".attackSpeed-value");

   // Set DOM text content
   health.textContent = data.health;
   mana.textContent = data.mana;
   regenMana.textContent = `${data.regenMana} /s`;
   energy.textContent = data.energy;
   regenEnergy.textContent = `${data.regenEnergy} /s`;
   GcD.textContent = data.GcD;
   attackSpeed.textContent = `${data.attackSpeed} s`;

   // Toggle Stat Pane
   const toggleStats = document.querySelector(".toggle-player-stats");
   const statsPane = document.querySelector(".player-stats");

   togglePane(toggleStats, statsPane);
}


// =====================================================================
// Player Controls Pane
// =====================================================================
const playerControls = () => {

   const toggleControls = document.querySelector(".toggle-player-controls");
   const controlsPane = document.querySelector(".player-controls");
   
   togglePane(toggleControls, controlsPane);
}


// =====================================================================
// Player Score Pane
// =====================================================================
const playerScore = (data) => {
   const playerScore = document.querySelector(".player-score");

   // Player score
   const kills = playerScore.querySelector(".kills");
   const died = playerScore.querySelector(".died");
   const fame = playerScore.querySelector(".fame");
   const fameCount = playerScore.querySelector(".fame-count");

   // Set DOM text content
   kills.textContent = `Kills: ${data.kills}`;
   died.textContent = `Died: ${data.died}`;
   fame.textContent = `Fame: ${data.fame}`;
   fameCount.textContent = `F_Count: ${data.fameCount}`;
}


// =====================================================================
// Game UI Handler ==> Socket Listening
// =====================================================================
const handleGameUI = (socket) => {

   socket.on("playerStats", (data) => playerStats(data));
   socket.on("playerScore", (data) => playerScore(data));

   playerControls();
}


// =====================================================================
// Player Controls
// =====================================================================
const controls = {
   movements: {
      up: "z",
      down: "s",
      left: "q",
      right: "d",
      run: " ",
   },

   spells: {
      heal: "r",
   }
}


// =====================================================================
// Movements & Casting
// =====================================================================
let isCasting = false;

const playerCommand = (socket, event, ctrlObj, state) => {
   let pairsArray = Object.entries(ctrlObj);
   
   pairsArray.forEach(pair => {
      let key = pair[0];
      let value = pair[1];

      if(event.key === value) {
         socket.emit(key, state);

         if(ctrlObj === controls.spells && isCasting !== state) {
            isCasting = state;
            socket.emit("casting", state);
         }
      }
   });
}

const onKeyboardInput = (socket) => {

   window.addEventListener("keydown", (event) => {
      if(insideCanvas) {
   
         const state = true;
         playerCommand(socket, event, controls.movements, state);
         playerCommand(socket, event, controls.spells, state);
      }
   });
   
   window.addEventListener("keyup", (event) => {
      const state = false;
      playerCommand(socket, event, controls.movements, state);
      playerCommand(socket,event, controls.spells, state);
   });
}


// =====================================================================
// Attack
// =====================================================================
const playerAttackCommand = (socket, event, state) => {
   if(event.which === 1 && insideCanvas) {
      socket.emit("attack", state);
   }
}

const onMouseInput = (socket) => {

   window.addEventListener("mousedown", (event) => playerAttackCommand(socket, event, true));
   window.addEventListener("mouseup", (event) => playerAttackCommand(socket, event, false));
}


// =====================================================================
// Death Screen
// =====================================================================
const deathScreen = (socket) => {

   const deathScreen = document.querySelector(".death-screen");
   const deathMessage = document.querySelector(".death-message");
   const respawnTimer = document.querySelector(".respawn-timer");
   
   socket.on("playerDeath", (player) => {
      
      let textValue = "You died !";
      let timerValue = `Respawn in ${player.respawnTimer} sec`;
   
      if(player.deathCounts === 3) textValue = "You died again !";
      if(player.deathCounts === 6) textValue = "Wasted !";
      if(player.deathCounts === 9) textValue = "You died like a bitch !";
   
      deathScreen.style = "visibility: visible";
      deathMessage.textContent = textValue;
      respawnTimer.textContent = timerValue;
   });
   
   socket.on("playerRespawn", () => {
      deathScreen.style = "visibility: hidden";
   });
}


// =====================================================================
// Client State ==> (Init Pack, Sync, Disconnect)
// =====================================================================
const clientState = (socket, playerID) => {
   
   // Set Enemies OnConnect
   socket.on("initEnemyPack", (initPack_MobList) => {

      initPack_MobList.forEach(enemy => initMobList[enemy.id] = new Enemy(cl_EnemyObj, enemy) );
   });

   // Set other players OnConnect
   socket.on("initPlayerPack", (initPack_PlayerList) => {
      
      clientID = playerID;
   
      for(let i in initPack_PlayerList) {
         let initPlayer = initPack_PlayerList[i];
         initPlayerList[initPlayer.id] = new Player(cl_PlayerObj, initPlayer);
      }
   });

   // Sync players OnUpdate (Every Frame)
   socket.on("serverSync", (lightPack_PlayerList, lightPack_MobList) => {

      updatePlayerList = lightPack_PlayerList;
      updateMobList = lightPack_MobList;
   });
   
   // Remove players OnDisconnect
   socket.on("removePlayerPack", (loggedOutPlayer) => {
      
      if(loggedOutPlayer) delete initPlayerList[loggedOutPlayer.id];
   });
}


// =====================================================================
// Init Player
// =====================================================================
const initPlayer = (socket, playerID) => {
   
   // Init Pack, Sync, Disconnect
   clientState(socket, playerID);

   // Client UI, Stats, Controls
   clientPlayer.drawHUD_Frame();
   clientPlayer.drawFame_Frame();
   clientPlayer.initMapSpecs(socket);
   clientPlayer.initTextAndFluidity(socket);
   handleGameUI(socket);
   deathScreen(socket);
   onKeyboardInput(socket);
   onMouseInput(socket);

   // Client Sync
   clientUpdate();
}