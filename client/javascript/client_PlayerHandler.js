
"use strict"

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
      if(insideViewport) {
   
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
   if(event.which === 1 && insideViewport) {
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
   const deathPaper = document.querySelector(".death-screen .paper-pane");
   const deathMessage = document.querySelector(".death-message");
   const respawnTimer = document.querySelector(".respawn-timer");
   
   socket.on("playerDeath", (player) => {
      
      let textValue = "You died !";
      let timerValue = `Respawn in ${player.respawnTimer} sec`;
   
      if(player.deathCounts === 3) textValue = "You died again !";
      if(player.deathCounts === 6) textValue = "Wasted !";
      if(player.deathCounts === 9) textValue = "You died like a bitch !";
      
      deathScreen.classList.add("visible");
      deathScreen.classList.add("deathScreen-popUp");
      deathPaper.classList.add("deathPaper-popUp");

      deathMessage.textContent = textValue;
      respawnTimer.textContent = timerValue;
   });
   
   socket.on("playerRespawn", () => {
      deathScreen.classList.remove("visible");
      deathScreen.classList.remove("deathScreen-popUp");
      deathPaper.classList.remove("deathPaper-popUp");
   });
}


// =====================================================================
// Client State ==> (Init Pack, Sync, Disconnect)
// =====================================================================
const clientState = (socket, playerID) => {
   
   // Set Enemies OnConnect
   socket.on("initEnemyPack", (initPack_MobList) => {

      initPack_MobList.forEach(enemy => initMobList[enemy.id] = new Enemy(cl_Enemy, enemy) );
   });

   // Set other players OnConnect
   socket.on("initPlayerPack", (initPack_PlayerList) => {
      
      clientID = playerID;
   
      for(let i in initPack_PlayerList) {
         let initPack = initPack_PlayerList[i];
         initPlayerList[initPack.id] = new Player(cl_Player, initPack);
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

   // Client UI ==> Fame, HUD
   // clientPlayer.drawHUD_Frame();
   clientPlayer.drawFame_Frame();
   clientPlayer.initMapSpecs(socket);
   clientPlayer.initTextAndFluidity(socket);

   // Client UI ==> Panels
   deathScreen(socket);

   // Controls Events
   onKeyboardInput(socket);
   onMouseInput(socket);
}