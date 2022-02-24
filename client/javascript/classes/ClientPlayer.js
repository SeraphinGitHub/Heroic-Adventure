
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
      this.HUD_scale_Y = 0.9;
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

      // Player Sprites
      this.sprites = initPlayer.sprites;
      this.shadowSize = 0.75;
      this.ringSize = 7;

      // Animation
      this.frameY = 0;
      this.frameToJump = 4;
      this.isAnimable = true;
      this.animState;
      this.animSpecs = initPlayer.animSpecs;
   }
   
   pos(updatePlayer) {
      
      if(this.isClient) return {
         x: this.viewSize.width/2,
         y: this.viewSize.height/2
      }

      else return {
         x: updatePlayer.x - this.viewport.x,
         y: updatePlayer.y - this.viewport.y
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
   scrollCam(updatePlayer) {

      this.viewport.scrollTo(updatePlayer.x, updatePlayer.y);
      
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
   toggleFloatingText(updatePlayer, textObj) {
      
      const newText = new FloatingText(
         this.ctxPlayer,
         this.pos(updatePlayer).x,
         this.pos(updatePlayer).y,
         textObj.x,
         textObj.y,
         textObj.size,
         textObj.color,
         textObj.value
      );
      
      this.floatTextArray.push(newText);
   }

   // Fluidity
   baseFluidity(barSpecs) {
      
      const newFluidBar = new Fluidity(this.ctxUI, this.gameUI_Img, barSpecs);
      this.fluidBarArray.push(newFluidBar);
   }

   initFloatingText(socket) {
   
      const mainTexSize = 34;
   
      socket.on("getHeal", (serverPlayer) => {

         this.toggleFloatingText(serverPlayer, {
            x: -5,
            y: -75,
            size: mainTexSize,
            color: "lime",
            value: `+${serverPlayer.calcHealing}`,
         });
      });
   
      socket.on("giveDamage", (playerPos, calcDamage) => {
            
         this.toggleFloatingText(playerPos, {
            x: -5,
            y: -100,
            size: mainTexSize,
            color: "yellow",
            value: `-${calcDamage}`,
         });
      });
   
      socket.on("getDamage", (playerPos, calcDamage) => {
         
         this.toggleFloatingText(playerPos, {
            x: -5,
            y: -85,
            size: mainTexSize,
            color: "red",
            value: `-${calcDamage}`,
         });
      });
      
      socket.on("getFame", (playerPos, serverFame) => {
         
         this.toggleFloatingText(playerPos, {
            x: 0,
            y: 180,
            size: mainTexSize,
            color: "darkviolet",
            value: `+${serverFame.totalFameCost} Fame`,
         });
         
         this.baseFluidity({
            stateStr: "getFame",
            x: this.fame.x,
            y: this.fame.y,
            width: this.fame.width,
            height: this.fame.height,
            fameScale_X: this.fameScale_X,
            baseFame: serverFame.baseFame,
            fame: serverFame.fame,
            fameValue: serverFame.fameValue,
            fameCount: serverFame.fameCount,
            fameCost: serverFame.totalFameCost,
            fluidSpeed: serverFame.fluidSpeed,
            fameFluidValue: 0,
            isFameReseted: false,
            fameDuration: serverFame.totalFameCost /serverFame.fluidSpeed,
         });
      });
      
      socket.on("looseFame", (playerPos, serverFame) => {

         this.toggleFloatingText(playerPos, {
            x: 0,
            y: 180,
            size: mainTexSize,
            color: "red",
            value: `-${serverFame.fameCost} Fame`,
         });

         this.baseFluidity({
            stateStr: "looseFame",
            x: this.fame.x,
            y: this.fame.y,
            width: this.fame.width,
            height: this.fame.height,
            fameScale_X: this.fameScale_X,
            baseFame: serverFame.baseFame,
            fame: serverFame.fame,
            fameValue: serverFame.fameValue,
            fameCount: serverFame.fameCount,
            fameCost: serverFame.fameCost,
            fluidSpeed: serverFame.fluidSpeed,
            fameFluidValue: serverFame.fameCost,
            isFameReseted: false,
            fameDuration: this.clientFrameRate *serverFame.fameCost /serverFame.fluidSpeed,
         });
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

   drawFame_Bar(updatePlayer) {
      
      // let fameBarWidth = Math.floor(
      //    (updatePlayer.fameValue / this.initPlayer.baseFame) * (this.fame.width - (65 * this.fameScale_X))
      // );
   
      // // Fame Bar
      // this.ctxUI.drawImage(this.gameUI_Img,
      //    522, 529, 26, 48,
      //    this.fame.x + (32 * this.fameScale_X),
      //    this.fame.y + 19,
      //    fameBarWidth,
      //    this.fame.height - 27
      // );
   }
   
   drawFame_Count(fameCount) {
   
      // Fame Count   
      this.ctxFixedFront.fillStyle = "darkviolet";
      this.ctxFixedFront.font = "30px Orbitron-ExtraBold";
      this.ctxFixedFront.fillText(fameCount, this.fame.x + this.fame.width -20, this.fame.y +70);
      this.ctxFixedFront.strokeText(fameCount, this.fame.x + this.fame.width -20, this.fame.y +70);
   }
   
   // Draw HUD
   drawHUD_Frame() {

      this.ctxFixedFront.shadowBlur = "2";
      this.ctxFixedFront.shadowColor = "black";

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
      
      let barWidth = Math.floor(
         (this.HUD.width - (offW * this.HUD_scale_X) ) *ratio
      );

      this.ctxUI.drawImage(
         this.gameUI_Img,
         sx, sy, sw *ratio, sh,
         this.HUD.x + (offX * this.HUD_scale_X),                  // Pos X
         this.HUD.y + (offY * this.HUD_scale_Y),                  // Pos Y
         barWidth,   // Width
         this.HUD.height/3 - (offH * this.HUD_scale_Y)            // Height
      );
   }

   drawHUD_Mana(updatePlayer) {
      
      let manaRatio = updatePlayer.mana / this.initPlayer.baseMana;
      
      // Still Castable Mana
      if(updatePlayer.mana >= this.initPlayer.healCost) {

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

   drawHUD_Health(updatePlayer) {
      
      let healthRatio = updatePlayer.health / this.initPlayer.baseHealth;

      // if Health Over 30%
      if(updatePlayer.health > this.initPlayer.baseHealth * this.minHealthRatio) {

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

   drawHUD_Energy(updatePlayer) {
      
      let energyRatio = updatePlayer.energy / this.initPlayer.baseEnergy;

      // Yellow Bar
      this.drawHUD_BaseBar(
         energyRatio,
         6, 582, 460, 46,
         82, 65, 165, 8
      );
   }
   
   // Draw Mini Bars
   drawBars_Client(ctxToRender, updatePlayer) {
      
      const clientPlayerBar = {
         ctx: ctxToRender,
         x: this.viewSize.width/2 - this.barWidth/2,
         y: this.viewSize.height/2,
         width: this.barWidth,
         height: this.barHeight,
      }
      
      const attackBar = new GameBar(clientPlayerBar, 0, 65, this.initPlayer.GcD, updatePlayer.speedGcD);
      const attackCoord = this.barCoordArray[3];

      attackBar.draw(
         this.gameUI_Img,
         attackCoord.x,
         attackCoord.y,
         attackCoord.width,
         attackCoord.height
      );
   }

   drawBars_OtherPlayer(ctxToRender, updatePlayer) {
      
      // Bar Value Array
      const barValueArray = [
         {
            name: "health",
            maxValue: this.initPlayer.baseHealth,
            value: updatePlayer.health,
         },

         {
            name: "mana",
            maxValue: this.initPlayer.baseMana,
            value: updatePlayer.mana,
         },

         {
            name: "energy",
            maxValue: this.initPlayer.baseEnergy,
            value: updatePlayer.energy,
         }
      ];

      const otherPlayerBar = {
         ctx: ctxToRender,
         x: updatePlayer.x - this.viewport.x,
         y: updatePlayer.y - this.viewport.y,
         width: this.barWidth,
         height: this.barHeight,
      }
      
      let barGap = 0;
      let barOffset = 9;
      
      for(let i = 0; i < barValueArray.length; i++) {
         
         let index;
         let bar = barValueArray[i];
         if(updatePlayer.isDead) bar.value = 0;
         
         const gameBar = new GameBar(otherPlayerBar, -this.barWidth/2, -95 +barGap, bar.maxValue, bar.value);

         // Health Bar
         if(bar.name === "health") {
            index = 0;
            if(updatePlayer.health <= this.initPlayer.baseHealth * this.minHealthRatio) index = 3;
         }

         // Mana Bar
         if(bar.name === "mana") {
            index = 5;
            if(updatePlayer.mana < this.initPlayer.healCost) index = 6;
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

   // Draw Player, Ring, Shadow, Name
   drawRing(ctx, updatePlayer) {

      if(this.isClient) {
         ctx.fillStyle = "rgb(0, 85, 0, 0.5)";
         ctx.strokeStyle = "lime";
      }
      else {
         ctx.fillStyle = "rgb(170, 90, 0, 0.5)";
         ctx.strokeStyle = "darkorange";
      }

      // Shadow Ring
      ctx.lineWidth = "2";
      ctx.beginPath();
      ctx.ellipse(
         this.pos(updatePlayer).x,
         this.pos(updatePlayer).y +this.sprites.radius,
         this.sprites.radius *this.shadowSize +this.ringSize,
         this.sprites.radius *this.shadowSize *0.5 +this.ringSize *0.75,
         0, 0, Math.PI * 2
      );
      ctx.fill();
      ctx.closePath();

      // Color Ring
      ctx.lineWidth = "2";
      ctx.beginPath();
      ctx.ellipse(
         this.pos(updatePlayer).x,
         this.pos(updatePlayer).y +this.sprites.radius,
         this.sprites.radius *this.shadowSize +this.ringSize,
         this.sprites.radius *this.shadowSize *0.5 +this.ringSize *0.75,
         0, 0, Math.PI * 2
      );
      ctx.stroke();
      ctx.closePath();
   }

   drawShadow(ctx, updatePlayer) {
      
      ctx.fillStyle = "rgba(30, 30, 30, 0.7)";
      ctx.beginPath();
      ctx.ellipse(
         this.pos(updatePlayer).x,
         this.pos(updatePlayer).y + this.sprites.radius,
         this.sprites.radius * this.shadowSize,
         this.sprites.radius * this.shadowSize/2,
         0, 0, Math.PI * 2
      );
      ctx.fill();
      ctx.closePath();
   }

   drawPlayer(ctx, updatePlayer) {
      
      ctx.drawImage(
         this.player_Img,

         // Source
         (updatePlayer.frameX + this.animState) * this.sprites.width,
         this.frameY * this.sprites.height,
         this.sprites.width,
         this.sprites.height,      
         
         // Destination
         this.pos(updatePlayer).x - this.sprites.width/2,
         this.pos(updatePlayer).y - this.sprites.height/2 - this.sprites.offsetY,
         this.sprites.height,
         this.sprites.width,
      );
   }

   drawName(ctx, updatePlayer) {
      
      let offsetY = 95;
      let namePos_X = this.pos(updatePlayer).x;
      let namePos_Y = this.pos(updatePlayer).y + offsetY;
      
      if(this.isClient) ctx.fillStyle = "lime";
      else ctx.fillStyle = "darkorange";

      ctx.textAlign = "center";
      ctx.font = "22px Orbitron-ExtraBold";
      
      ctx.lineWidth = "1";
      ctx.strokeStyle = "black";
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

   playerState(frame, updatePlayer) {

      switch(updatePlayer.state) {
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
   render_ClientPlayer(updatePlayer, frame) {

      // Animation State
      this.playerState(frame, updatePlayer);
      
      // Camera 
      this.scrollCam(updatePlayer);
      
      // UI
      this.drawFame_Bar(updatePlayer);
      this.drawHUD_Mana(updatePlayer);
      this.drawHUD_Health(updatePlayer);
      this.drawHUD_Energy(updatePlayer);
      
      let ctxToRender;
      if(updatePlayer.isCtxPlayer) ctxToRender = this.ctxPlayer;
      else ctxToRender = this.ctxEnemies;
      
      // Player
      this.drawRing(ctxToRender, updatePlayer);
      this.drawShadow(ctxToRender, updatePlayer);
      this.drawPlayer(ctxToRender, updatePlayer);
      this.drawBars_Client(ctxToRender, updatePlayer);
      this.drawName(ctxToRender, updatePlayer);

      // ******************************
      // this.DEBUG_GENERAL(updatePlayer);
      // this.DEBUG_DrawDetectViewport();
      // ******************************
   }


   // =====================================================================
   // Other Players Sync (Every frame)
   // =====================================================================
   render_OtherPlayer(updatePlayer, frame) {
      
      // Animation State
      this.playerState(frame, updatePlayer);
      
      let ctxToRender;
      if(updatePlayer.isCtxPlayer) ctxToRender = this.ctxPlayer;
      else ctxToRender = this.ctxEnemies;

      // Player
      this.drawRing(ctxToRender, updatePlayer);
      this.drawShadow(ctxToRender, updatePlayer);
      this.drawPlayer(ctxToRender, updatePlayer);
      this.drawBars_OtherPlayer(ctxToRender, updatePlayer);
      this.drawName(ctxToRender, updatePlayer);

      // ******************************
      // this.DEBUG_GENERAL(updatePlayer);
      // ******************************
   }


   // ==>  DEBUG MODE  <==
   DEBUG_GENERAL(updatePlayer) {
      
      this.DEBUG_DrawPlayer(updatePlayer);
      this.DEBUG_DrawAttackArea(updatePlayer);
      this.DEBUG_DrawHealthNumber(updatePlayer);
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

   DEBUG_DrawPlayer(updatePlayer) {
      
      this.ctxPlayer.fillStyle = "darkviolet";
      this.ctxPlayer.beginPath();
      this.ctxPlayer.arc(
         this.pos(updatePlayer).x,
         this.pos(updatePlayer).y,
         this.initPlayer.radius, 0, Math.PI * 2
      );
      this.ctxPlayer.fill();
      this.ctxPlayer.closePath();
   }

   DEBUG_DrawAttackArea(updatePlayer) {

      this.ctxPlayer.fillStyle = "orangered";
      this.ctxPlayer.beginPath();
      this.ctxPlayer.arc(
         this.pos(updatePlayer).x + updatePlayer.attkOffset_X,
         this.pos(updatePlayer).y + updatePlayer.attkOffset_Y,
         this.initPlayer.attkRadius, 0, Math.PI * 2
      );
      this.ctxPlayer.fill();
      this.ctxPlayer.closePath();
   }

   DEBUG_DrawHealthNumber(updatePlayer) {

      this.ctxPlayer.fillStyle = "black";
      this.ctxPlayer.font = "26px Orbitron-Regular";
      this.ctxPlayer.fillText(
         Math.round(updatePlayer.health),
         this.pos(updatePlayer).x,
         this.pos(updatePlayer).y -15
      );
   }
}