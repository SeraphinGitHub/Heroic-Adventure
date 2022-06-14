
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
// Init Floating Text & Fluidity
// =====================================================================
const initTextAndFluidity = (socket) => {
   
   const mainTexSize = 42;

   // ========== Fame ==========
   socket.on("fameEvent", (eventPack) => {
      ctx.fixedUI.clearRect(0, 0, viewport.width, viewport.height);

      FAME_DrawBar(eventPack);
      FAME_DrawCount(eventPack);
   });

   socket.on("getFame", (playerPos, serverFame) => {
      
      this.toggleFloatingText(
         playerPos,
         {
            x: 0,
            y: 180,
            size: mainTexSize *1.2,
            color: "darkviolet",
            value: `+${serverFame.fameCost} Fame`,
         }
      );
      
      this.baseFluidity({
         stateStr: "getFame",

         x: this.fame.x,
         y: this.fame.y,
         width: this.fame.width,
         height: this.fame.height,
         off_W: this.fame_OffW,
         scale_X: this.fameScale_X,
         
         baseStat: serverFame.baseFame,
         stat: serverFame.fameValue,
         calcStat: serverFame.fameCost,
         statFluidValue: 0,

         isFameReseted: false,
         fame: serverFame.fame,
         fameCount: serverFame.fameCount,
         fluidSpeed: serverFame.fluidSpeed,
      });
   });
   
   socket.on("looseFame", (playerPos, serverFame) => {

      this.toggleFloatingText(
         playerPos,
         {
            x: 0,
            y: 180,
            size: mainTexSize *1.2,
            color: "red",
            value: `-${serverFame.fameCost} Fame`,
         }
      );

      this.baseFluidity({
         stateStr: "looseFame",

         x: this.fame.x,
         y: this.fame.y,
         width: this.fame.width,
         height: this.fame.height,
         off_W: this.fame_OffW,
         scale_X: this.fameScale_X,
         
         baseStat: serverFame.baseFame,
         stat: serverFame.fameValue,
         calcStat: serverFame.fameCost,
         statFluidValue: serverFame.fameCost,
         
         isFameReseted: false,
         fame: serverFame.fame,
         fameCount: serverFame.fameCount,
         fluidSpeed: serverFame.fluidSpeed,
      });
   });


   // ========== Mana ==========
   socket.on("looseMana", (serverMana) => {

      this.baseFluidity({
         stateStr: "looseMana",

         x: this.HUD.x,
         y: this.HUD.y,
         width: this.HUD.width,
         height: this.HUD.height,
         scale_X: this.HUD_scale_X,
         scale_Y: this.HUD_scale_Y,
         
         off_X: this.manaOffset.x,
         off_Y: this.manaOffset.y,
         off_W: this.manaOffset.width,
         off_H: this.manaOffset.height,

         baseStat: serverMana.baseMana,
         stat: serverMana.mana,
         calcStat: serverMana.calcManaCost,
         statFluidValue: serverMana.calcManaCost,
         fluidSpeed: serverMana.fluidSpeed,
      });
   });


   // ========== Health ==========
   socket.on("getHeal", (playerPos, serverHealing) => {

      this.toggleFloatingText(
         playerPos,
         {
            x: -5,
            y: -75,
            size: mainTexSize,
            color: "lime",
            value: `+${serverHealing.calcHealing}`,
         }
      );

      this.baseFluidity({
         stateStr: "getHealth",

         x: this.HUD.x,
         y: this.HUD.y,
         width: this.HUD.width,
         height: this.HUD.height,
         scale_X: this.HUD_scale_X,
         scale_Y: this.HUD_scale_Y,
         
         off_X: this.healthOffset.x,
         off_Y: this.healthOffset.y,
         off_W: this.healthOffset.width,
         off_H: this.healthOffset.height,

         baseStat: serverHealing.baseHealth,
         stat: serverHealing.health,
         calcStat: serverHealing.calcHealing,
         statFluidValue: serverHealing.calcHealing,
         fluidSpeed: serverHealing.fluidSpeed,
      });
   });

   socket.on("giveDamage", (playerPos, calcDamage) => {

      this.toggleFloatingText(
         playerPos,
         {
            x: -5,
            y: -100,
            size: mainTexSize,
            color: "yellow",
            value: `-${calcDamage}`,
         }
      );
   });

   socket.on("getDamage", (playerPos, serverDamage) => {

      this.toggleFloatingText(
         playerPos,
         {
            x: -5,
            y: -85,
            size: mainTexSize,
            color: "red",
            value: `-${serverDamage.calcDamage}`,
         }
      );

      this.baseFluidity({
         stateStr: "looseHealth",

         x: this.HUD.x,
         y: this.HUD.y,
         width: this.HUD.width,
         height: this.HUD.height,
         scale_X: this.HUD_scale_X,
         scale_Y: this.HUD_scale_Y,
         
         off_X: this.healthOffset.x,
         off_Y: this.healthOffset.y,
         off_W: this.healthOffset.width,
         off_H: this.healthOffset.height,

         baseStat: serverDamage.baseHealth,
         stat: serverDamage.health,
         calcStat: serverDamage.calcDamage,
         statFluidValue: serverDamage.calcDamage,
         fluidSpeed: serverDamage.fluidSpeed,
      });
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
   // initTextAndFluidity(socket);
   FAME_DrawFrame();
   HUD_DrawFrame();   

   // Client UI ==> Panels
   deathScreen(socket);

   // Controls Events
   onKeyboardInput(socket);
   onMouseInput(socket);
}