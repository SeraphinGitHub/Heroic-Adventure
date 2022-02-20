
"use strict"

// =====================================================================
// Player
// =====================================================================
class Player extends Character {
   constructor(cl_PlayerObj, initPlayer) {
      
      super();

      // Init Server Player
      this.initPlayer = initPlayer;
      this.isClient = false;
      
      // Viewport
      this.detectViewport = initPlayer.detectViewport;
      this.viewSize = cl_PlayerObj.viewSize;
      this.viewport = cl_PlayerObj.viewport;
      this.centerVp = {
         x: this.viewSize.width/2 - this.viewport.width/2,
         y: this.viewSize.height/2 - this.viewport.height/2,
      };
     
      // Canvas
      this.ctxMap = cl_PlayerObj.ctxMap;
      this.ctxEnemies = cl_PlayerObj.ctxEnemies;
      this.ctxOtherPlay = cl_PlayerObj.ctxOtherPlay;
      this.ctxPlayer = cl_PlayerObj.ctxPlayer;
      this.ctxFixedBack = cl_PlayerObj.ctxFixedBack;
      this.ctxUI = cl_PlayerObj.ctxUI;
      this.ctxFixedFront = cl_PlayerObj.ctxFixedFront;

      // PNG Files
      this.mapTile_Img = cl_PlayerObj.mapTile_Img;
      this.gameUI_Img = cl_PlayerObj.gameUI_Img;
      this.player_Img = cl_PlayerObj.player_Img;

      // Map
      this.mapSpriteSize = cl_PlayerObj.mapSpecs.mapSpriteSize;
      this.cellSize = cl_PlayerObj.mapSpecs.cellSize;
      this.columns = cl_PlayerObj.mapSpecs.columns;
      this.rows = cl_PlayerObj.mapSpecs.rows;      
      this.mapScheme = cl_PlayerObj.mapSpecs.mapScheme;
      
      // Game UI ==> HUD
      this.HUD_scale_X = 1.2;
      this.HUD_scale_Y = 1;
      this.HUD = {
         x: this.viewSize.width/2 -400/2 * this.HUD_scale_X,
         y: this.viewSize.height -110 * this.HUD_scale_Y,
         width: 400 * this.HUD_scale_X,
         height: 100 * this.HUD_scale_Y,
      }
      this.minHealthRatio = 0.3; // Min Health before flash (%)
      this.flashingSpeed = 6;
      this.flashFrame = 0;

      // Game UI ==> Mini Bars
      this.barWidth = cl_PlayerObj.barWidth;
      this.barHeight = cl_PlayerObj.barHeight;
      this.barCoordArray = cl_PlayerObj.barCoordArray;

      // Game UI ==> Fame Bar
      this.fameScale_X = 1.25;
      this.fameScale_Y = 1;
      this.fame = {
         x: this.viewSize.width/2 -900/2 * this.fameScale_X,
         y: this.viewSize.height -805,
         width: 900 * this.fameScale_X,
         height: 53 * this.fameScale_Y,
      }
      this.fameCost = 0;
      this.getFameFluid = 0;
      this.looseFameFluid = 0;
      this.isGettingFame = false;
      this.isLoosingFame = false;

      // Player Sprites
      this.sprites = initPlayer.sprites;

      // Animation
      this.frameY = 0;
      this.frameToJump = 4;
      this.isAnimable = true;
      this.animState;
      this.animSpecs = initPlayer.animSpecs;
   }
   
   pos(serverPlayer) {
      
      if(this.isClient) return {
         x: this.viewSize.width/2,
         y: this.viewSize.height/2
      }

      else return {
         x: serverPlayer.x - this.viewport.x,
         y: serverPlayer.y - this.viewport.y
      }
   }

   initMapSpecs(socket) {
      
      socket.on("initMap", (data) => {
         this.mapSpriteSize = data.mapSpriteSize;
         this.cellSize = data.cellSize;
         this.columns = data.columns;
         this.rows = data.rows;
      });
   }
   
   // Camera
   scrollCam(serverPlayer) {

      this.viewport.scrollTo(serverPlayer.x, serverPlayer.y);
      
      // Viewport bounderies
      let vpLeftCol_Nbr = Math.floor(this.viewport.x / this.cellSize);
      let vpRightCol_Nbr = Math.ceil((this.viewport.x + this.viewport.width) / this.cellSize);
      let vpTopRow_Nbr = Math.floor(this.viewport.y / this.cellSize);
      let vpBottomRow_Nbr = Math.ceil((this.viewport.y + this.viewport.height) / this.cellSize);

      // Map bounderies ==> no repeat
      if(vpLeftCol_Nbr < 0) vpLeftCol_Nbr = 0;
      if(vpTopRow_Nbr < 0) vpTopRow_Nbr = 0;
      if(vpRightCol_Nbr > this.columns) vpRightCol_Nbr = this.columns;
      if(vpBottomRow_Nbr > this.rows) vpBottomRow_Nbr = this.rows;
      
      // ================ DEBUG ================
      // this.ctxPlayer.strokeStyle = "red";
      // this.ctxPlayer.strokeRect(this.centerVp.x, this.centerVp.y, this.viewport.width, this.viewport.height);
      // ================ DEBUG ================

      for(let x = vpLeftCol_Nbr; x < vpRightCol_Nbr; x++) {
         for(let y = vpTopRow_Nbr; y < vpBottomRow_Nbr; y++) {
            
            let tileIndex = y *this.columns +x;
            let tileToDraw = this.mapScheme[tileIndex];
            
            let tile_X = x *this.cellSize -this.viewport.x +this.centerVp.x;
            let tile_Y = y *this.cellSize -this.viewport.y +this.centerVp.y;
            
            this.ctxMap.drawImage(
               this.mapTile_Img,
               (tileToDraw -1) *this.mapSpriteSize, 0, this.mapSpriteSize, this.mapSpriteSize,
               tile_X, tile_Y, this.cellSize, this.cellSize
            );
         }
      }
   }
   
   // Floating Text
   toggleFloatingText(serverPlayer, textObj) {
      
      const newText = new FloatingText(
         this.ctxPlayer,
         this.pos(serverPlayer).x,
         this.pos(serverPlayer).y,
         textObj.x,
         textObj.y,
         textObj.size,
         textObj.color,
         textObj.value
      );
      
      this.floatTextArray.push(newText);
   }

   initFloatingText(socket) {
   
      const mainTexSize = 34;
   
      socket.on("getHeal", (serverPlayer) => {
   
         const text = {
            x: -5,
            y: -75,
            size: mainTexSize,
            color: "lime",
            value: `+${serverPlayer.calcHealing}`,
         }
         
         this.toggleFloatingText(serverPlayer, text);
      });
   
      socket.on("giveDamage", (playerPos, calcDamage) => {
   
         const text = {
            x: -5,
            y: -100,
            size: mainTexSize,
            color: "yellow",
            value: `-${calcDamage}`,
         }
         
         this.toggleFloatingText(playerPos, text);
      });
   
      socket.on("getDamage", (playerPos, calcDamage) => {
         const text = {
            x: -5,
            y: -85,
            size: mainTexSize,
            color: "red",
            value: `-${calcDamage}`,
         }
         
         this.toggleFloatingText(playerPos, text);
      });
      
      socket.on("getFame", (playerPos, serverfameCost) => {
         const text = {
            x: 0,
            y: 180,
            size: mainTexSize,
            color: "darkviolet",
            value: `+${serverfameCost} Fame`,
         }
         
         this.toggleFloatingText(playerPos, text);
         this.isGettingFame = true;
         this.fameCost = serverfameCost;
      });
      
      socket.on("looseFame", (playerPos, serverfameCost) => {
         const text = {
            x: 0,
            y: 180,
            size: mainTexSize,
            color: "red",
            value: `-${serverfameCost} Fame`,
         }
         
         this.toggleFloatingText(playerPos, text);
         this.isLoosingFame = true;
         this.fameCost = serverfameCost;
         this.looseFameFluid = serverfameCost;
      });
   }

   // Draw Fame
   drawFame_Frame() {

      // Background
      this.ctxFixedBack.drawImage(this.gameUI_Img,
         522, 477, 26, 48,
         this.fame.x + (32 * this.fameScale_X),
         this.fame.y + 19,
         this.fame.width - (65 * this.fameScale_X),
         this.fame.height - 27
      );

      // Fame Sprite
      this.ctxFixedFront.drawImage(this.gameUI_Img,
         6, 631, 2083, 105,
         this.fame.x,
         this.fame.y,
         this.fame.width,
         this.fame.height
      );
   }

   drawFame_Bar(serverPlayer) {

      let fameBarWidth = (serverPlayer.fameValue / this.initPlayer.baseFame) * (this.fame.width - (65 * this.fameScale_X));
   
      // Fame Bar
      this.ctxUI.drawImage(this.gameUI_Img,
         522, 529, 26, 48,
         this.fame.x + (32 * this.fameScale_X),
         this.fame.y + 19,
         fameBarWidth,
         this.fame.height - 27
      );
   }
   
   drawFame_Count(fameCount) {
   
      // Fame Count   
      this.ctxFixedFront.fillStyle = "darkviolet";
      this.ctxFixedFront.font = "30px Orbitron-ExtraBold";
      this.ctxFixedFront.fillText(fameCount, this.fame.x + this.fame.width -20, this.fame.y +70);
      this.ctxFixedFront.strokeText(fameCount, this.fame.x + this.fame.width -20, this.fame.y +70);
   }
   
   // ******************
   fameFluidity = (player, fameFluid, state, stateName) => {
   
      // if(state) {
   
      //    let origin_X;
      //    const fluidSpeed = 15;
   
      //    let fullBarWidth = fame.width - (65 *fameScale_X);
      //    let miniBarWidth = fameCost / player.baseFame * fullBarWidth;
      //    let calcWidth = (fameFluid / fameCost) * miniBarWidth;
         
      //    if(calcWidth <= 0) calcWidth = 0;
   
      //    if(stateName === "get") {
      //       fameFluid += fluidSpeed;
      //       origin_X = player.fameValue / player.baseFame * fullBarWidth;
   
      //       if(fameFluid >= fameCost) {
      //          fameFluid = 0;
      //          state = false;
      //       }
      //    }
   
      //    if(stateName === "loose") {
      //       fameFluid -= fluidSpeed;
      //       origin_X = player.fameValue / player.baseFame * fullBarWidth;
   
      //       if(fameFluid <= -fameCost) {
      //          fameFluid = 0;
      //          state = false;
      //       }
      //    }
   
      //    ctxUI.drawImage(
      //       gameUIimage,
      //       522, 529, 26, 48,
      //       origin_X,
      //       fame.y +19 +50,
      //       calcWidth,
      //       fame.height - 27
      //    );
      // }
   
      if(isGettingFame) {
      
         let fullBarWidth = fame.width - (83 *fameScale_X);
         let miniBarWidth = fameCost / player.baseFame * fullBarWidth;
         let fameBarWidth = player.fameValue / player.baseFame * fullBarWidth;
         let origin_X = fame.x + (41 *fameScale_X) + fameBarWidth;
   
         let calcWidth = (getFameFluid / fameCost) * miniBarWidth;
         if(calcWidth <= 0) calcWidth = 0;
   
         // Value Bar
         ctxUI.drawImage(
            gameUIimage,
            // 522, 529, 26, 48,
            552, 477, 26, 48,
            origin_X,
            fame.y +19 +20,
            calcWidth,
            fame.height - 27
         );
   
         const ratio = 3;
         getFameFluid += ratio;
         
         if(getFameFluid >= fameCost) {
            getFameFluid = fameCost;
            // getFameFluid = 0;
            // isGettingFame = false;
         }
      }
   
      if(isLoosingFame) {
   
         let fullBarWidth = fame.width - (83 *fameScale_X);
         let origin_X = player.fameValue / player.baseFame * fullBarWidth;
         let miniBarWidth = fameCost / player.baseFame * fullBarWidth;
   
         let calcWidth = (looseFameFluid / fameCost) * miniBarWidth;
         if(calcWidth <= 0) calcWidth = 0;
   
         // Value Bar
         ctxUI.drawImage(
            gameUIimage,
            522, 529, 26, 48,
            origin_X,
            fame.y +19 +30,
            calcWidth,
            fame.height - 27
         );
   
         const ratio = 15;
         looseFameFluid -= ratio;
         
         if(looseFameFluid <= -fameCost) {
            looseFameFluid = 0;
            isLoosingFame = false;
         }
      }
   }
   // ******************
   
   // Draw HUD
   drawHUD_Frame() {
      
      // Background
      this.ctxFixedBack.drawImage(this.gameUI_Img,
         5, 181, 729, 141,
         this.HUD.x + (15 * this.HUD_scale_X),     // Pos X
         this.HUD.y + (10 * this.HUD_scale_Y),     // Pos Y
         this.HUD.width - (30 * this.HUD_scale_X), // Width
         this.HUD.height - (20 * this.HUD_scale_Y) // Height
      );

      // HUD Sprite
      this.ctxFixedFront.drawImage(this.gameUI_Img,
         5, 4, 782, 173,
         this.HUD.x,
         this.HUD.y,
         this.HUD.width,
         this.HUD.height
      );
   }

   drawHUD_BaseBar(ratio, sx, sy, sw, sh, offX, offY, offW, offH) {

      this.ctxUI.drawImage(
         this.gameUI_Img,
         sx, sy, sw *ratio, sh,
         this.HUD.x + (offX * this.HUD_scale_X),                  // Pos X
         this.HUD.y + (offY * this.HUD_scale_Y),                  // Pos Y
         ( this.HUD.width - (offW * this.HUD_scale_X) ) *ratio,   // Width
         this.HUD.height/3 - (offH * this.HUD_scale_Y)            // Height
      );
   }

   drawHUD_Mana(serverPlayer) {
      
      let manaRatio = serverPlayer.mana / this.initPlayer.baseMana;
      
      // Still Castable Mana
      if(serverPlayer.mana >= this.initPlayer.healCost) {

         this.drawHUD_BaseBar(
            manaRatio,
            6, 528, 460, 47,
            82, 10, 165, 8
         );
      }
      
      // Low Mana
      else {
         this.drawHUD_BaseBar(
            manaRatio,
            5, 475, 461, 47,
            82, 10, 165, 8
         );
      }
   }

   drawHUD_Health(serverPlayer) {
      
      let healthRatio = serverPlayer.health / this.initPlayer.baseHealth;

      // if Health Over 30%
      if(serverPlayer.health > this.initPlayer.baseHealth * this.minHealthRatio) {

         // Normal Bar
         this.drawHUD_BaseBar(
            healthRatio,
            5, 327, 729, 45,
            15, 39, 30, 9
         );
      }

      // if Health Under 30%
      else {

         // Flashing Bar
         this.drawHUD_BaseBar(
            healthRatio,
            6, 424, 729, 45,
            15, 39, 30, 9
         );

         this.flashFrame++;

         if(this.flashFrame > this.flashingSpeed) {

            // Normal Bar
            this.drawHUD_BaseBar(
               healthRatio,
               5, 327, 729, 45,
               15, 39, 30, 9
            );
         }

         if(this.flashFrame > this.flashingSpeed *2) this.flashFrame = 0;
      }
   }

   drawHUD_Energy(serverPlayer) {
      
      let energyRatio = serverPlayer.energy / this.initPlayer.baseEnergy;

      // Yellow Bar
      this.drawHUD_BaseBar(
         energyRatio,
         6, 582, 460, 46,
         82, 65, 165, 8
      );
   }
   
   // Draw Mini Bars
   drawBars_Client(serverPlayer) {
      
      const clientPlayerBar = {
         ctx: this.ctxUI,
         x: this.viewSize.width/2 - this.barWidth/2,
         y: this.viewSize.height/2,
         width: this.barWidth,
         height: this.barHeight,
      }
      
      const attackBar = new GameBar(clientPlayerBar, 0, 65, this.initPlayer.GcD, serverPlayer.speedGcD);
      const attackCoord = this.barCoordArray[3];

      attackBar.draw(
         this.gameUI_Img,
         attackCoord.x,
         attackCoord.y,
         attackCoord.width,
         attackCoord.height
      );
   }

   drawBars_OtherPlayer(serverPlayer) {
      
      // Bar Value Array
      const barValueArray = [
         {
            name: "health",
            maxValue: this.initPlayer.baseHealth,
            value: serverPlayer.health,
         },

         {
            name: "mana",
            maxValue: this.initPlayer.baseMana,
            value: serverPlayer.mana,
         },

         {
            name: "energy",
            maxValue: this.initPlayer.baseEnergy,
            value: serverPlayer.energy,
         }
      ];

      const otherPlayerBar = {
         ctx: this.ctxEnemies,
         x: serverPlayer.x - this.viewport.x,
         y: serverPlayer.y - this.viewport.y,
         width: this.barWidth,
         height: this.barHeight,
      }
      
      let barGap = 0;
      let barOffset = 9;
      
      for(let i = 0; i < barValueArray.length; i++) {
         
         let index;
         let bar = barValueArray[i];
         if(serverPlayer.isDead) bar.value = 0;
         
         const gameBar = new GameBar(otherPlayerBar, -this.barWidth/2, -95 +barGap, bar.maxValue, bar.value);

         // Health Bar
         if(bar.name === "health") {
            index = 0;
            if(serverPlayer.health <= this.initPlayer.baseHealth * this.minHealthRatio) index = 3;
         }

         // Mana Bar
         if(bar.name === "mana") {
            index = 5;
            if(serverPlayer.mana < this.initPlayer.healCost) index = 6;
         }

         // Energy Bar
         if(bar.name === "energy") index = 1;
         
         // Draw Bar
         gameBar.draw(
            this.gameUI_Img,
            barCoordArray[index].x,
            barCoordArray[index].y,
            barCoordArray[index].width,
            barCoordArray[index].height
         );

         barGap += barOffset;
      };
   }

   // Draw Player, Shadow, Name
   drawShadow(ctx, serverPlayer) {
      
      ctx.fillStyle = "rgba(30, 30, 30, 0.6)";
      ctx.beginPath();
      ctx.ellipse(
         this.pos(serverPlayer).x,
         this.pos(serverPlayer).y + this.sprites.radius,
         this.sprites.radius * 0.8, this.sprites.radius * 0.4, 0, 0, Math.PI * 2
      );
      ctx.fill();
      ctx.closePath();
   }

   drawPlayer(ctx, serverPlayer) {
      
      ctx.drawImage(
         this.player_Img,

         // Source
         (serverPlayer.frameX + this.animState) * this.sprites.width,
         this.frameY * this.sprites.height,
         this.sprites.width,
         this.sprites.height,      
         
         // Destination
         this.pos(serverPlayer).x - this.sprites.width/2,
         this.pos(serverPlayer).y - this.sprites.height/2 - this.sprites.offsetY,
         this.sprites.height,
         this.sprites.width,
      );
   }

   drawName(ctx, serverPlayer) {
      
      let offsetY = 95;
      let namePos_X = this.pos(serverPlayer).x;
      let namePos_Y = this.pos(serverPlayer).y + offsetY;
      
      if(this.isClient) ctx.fillStyle = "lime";
      else ctx.fillStyle = "darkorange";

      ctx.textAlign = "center";
      ctx.font = "22px Orbitron-ExtraBold";
      ctx.fillText(this.initPlayer.name, namePos_X, namePos_Y);
      ctx.strokeText(this.initPlayer.name, namePos_X, namePos_Y);
   }

   // Animation
   animation(frame, index, spritesNumber) {
      
      if(frame % index === 0) {         
         if(this.frameY < spritesNumber -1) this.frameY++;

         else {
            this.frameY = 0;
            if(!this.isAnimable) this.isAnimable = true;
         }
      }
   }

   playerState(frame, serverPlayer) {

      switch(serverPlayer.state) {
         case "walk": {
            
            this.animState = this.frameToJump * 1;
            this.animation(
               frame,
               this.animSpecs.walk.index,
               this.animSpecs.walk.spritesNumber
            );
         }
         break;

         case "run": {

            this.animState = this.frameToJump * 2;
            this.animation(
               frame,
               this.animSpecs.run.index,
               this.animSpecs.run.spritesNumber
            );
         }
         break;

         case "attack": {
         
            if(this.isAnimable) {
               this.frameY = 0;
               this.isAnimable = false;
            }
            
            this.animState = this.frameToJump * 3;
            this.animation(
               frame,
               this.animSpecs.attack.index,
               this.animSpecs.attack.spritesNumber
            );
         }
         break;

         case "heal": {

            if(this.isAnimable) {
               this.frameY = 0;
               this.isAnimable = false;
            }

            this.animState = this.frameToJump * 4;
            this.animation(
               frame,
               this.animSpecs.heal.index,
               this.animSpecs.heal.spritesNumber
            );
         }
         break;
      
         case "died": {

            this.animState = this.frameToJump * 5;
            this.animation(
               frame,
               this.animSpecs.died.index,
               this.animSpecs.died.spritesNumber
            );
         }
         break;

         default: {

            this.animState = this.frameToJump * 0;
            this.animation(frame,
               this.animSpecs.idle.index,
               this.animSpecs.idle.spritesNumber
            );
         }
         break;
      }
   }

   // =====================================================================
   // Client Sync (Every frame)
   // =====================================================================
   render_ClientPlayer(serverPlayer, frame) {

      // Animation State
      this.playerState(frame, serverPlayer);

      // Camera 
      this.scrollCam(serverPlayer);

      // UI
      this.drawFame_Bar(serverPlayer);
      // this.fameFluidity(serverPlayer, getFameFluid, isGettingFame, "get");
      // this.fameFluidity(serverPlayer, looseFameFluid, isLoosingFame, "loose");
      this.drawHUD_Mana(serverPlayer);
      this.drawHUD_Health(serverPlayer);
      this.drawHUD_Energy(serverPlayer);
      
      // Mini Bars
      this.drawBars_Client(serverPlayer);
      
      // Player
      this.drawShadow(this.ctxPlayer, serverPlayer);
      this.drawPlayer(this.ctxPlayer, serverPlayer);

      // Player Name
      this.drawName(this.ctxPlayer, serverPlayer);

      // ******************************
      // this.DEBUG_GENERAL(serverPlayer);
      // this.DEBUG_DrawDetectViewport();
      // ******************************
   }


   // =====================================================================
   // Other Players Sync (Every frame)
   // =====================================================================
   render_OtherPlayer(serverPlayer, frame) {
      
      // Animation State
      this.playerState(frame, serverPlayer);

      // Mini Bars
      this.drawBars_OtherPlayer(serverPlayer);

      // Player
      this.drawShadow(this.ctxOtherPlay, serverPlayer);
      this.drawPlayer(this.ctxOtherPlay, serverPlayer);

      // Player Name
      this.drawName(this.ctxOtherPlay, serverPlayer);

      // ******************************
      // this.DEBUG_GENERAL(serverPlayer);
      // ******************************
   }


   // ==>  DEBUG MODE  <==
   DEBUG_GENERAL(serverPlayer) {
      
      this.DEBUG_DrawPlayer(serverPlayer);
      this.DEBUG_DrawAttackArea(serverPlayer);
      this.DEBUG_DrawHealthNumber(serverPlayer);
   }

   DEBUG_DrawDetectViewport() {

      this.ctxFixedBack.strokeStyle = "yellow";
      this.ctxFixedBack.lineWidth = 4;
      
      this.ctxFixedBack.strokeRect(
         this.viewSize.width/2 - this.detectViewport.width/2,
         this.viewSize.height/2 - this.detectViewport.height/2,
         this.detectViewport.width,
         this.detectViewport.height,
      );
   }

   DEBUG_DrawPlayer(serverPlayer) {
      
      this.ctxPlayer.fillStyle = "darkviolet";
      this.ctxPlayer.beginPath();
      this.ctxPlayer.arc(
         this.pos(serverPlayer).x,
         this.pos(serverPlayer).y,
         this.initPlayer.radius, 0, Math.PI * 2
      );
      this.ctxPlayer.fill();
      this.ctxPlayer.closePath();
   }

   DEBUG_DrawAttackArea(serverPlayer) {

      this.ctxPlayer.fillStyle = "orangered";
      this.ctxPlayer.beginPath();
      this.ctxPlayer.arc(
         this.pos(serverPlayer).x + serverPlayer.attkOffset_X,
         this.pos(serverPlayer).y + serverPlayer.attkOffset_Y,
         this.initPlayer.attkRadius, 0, Math.PI * 2
      );
      this.ctxPlayer.fill();
      this.ctxPlayer.closePath();
   }

   DEBUG_DrawHealthNumber(serverPlayer) {

      this.ctxPlayer.fillStyle = "black";
      this.ctxPlayer.font = "26px Orbitron-Regular";
      this.ctxPlayer.fillText(
         Math.round(serverPlayer.health),
         this.pos(serverPlayer).x,
         this.pos(serverPlayer).y -15
      );
   }
}