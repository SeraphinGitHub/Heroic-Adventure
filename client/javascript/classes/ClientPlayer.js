
"use strict"

// =====================================================================
// Player
// =====================================================================
class Player {
   constructor(cl_Player, initPack) {
      
      this.isClient = false;
      this.updatePlayer;
      this.initPack = initPack;
      this.detectViewport = initPack.detectViewport;

      this.viewport = cl_Player.viewport;
      this.ctx = cl_Player.ctx;
      this.imgFiles = cl_Player.imgFiles,
      this.mapSpecs = cl_Player.mapSpecs,
      this.miniBars = cl_Player.miniBars;
      this.barCoordArray = cl_Player.barCoordArray;

      // Player Sprites
      this.sprites = initPack.sprites;
      this.shadowSize = 0.75;
      this.ringSize = 7;

      // Animation
      this.frameY = 0;
      this.frameToJump = 4;
      this.isAnimable = true;
      this.animState;
      this.animSpecs = initPack.animSpecs;
   }
   
   pos() {
      
      if(this.isClient) return {
         x: this.viewport.width/2,
         y: this.viewport.height/2
      }

      else return {
         x: this.updatePlayer.x -this.viewport.x,
         y: this.updatePlayer.y -this.viewport.y
      }
   }

   ctxToRender() {
      if(this.updatePlayer.isCtxPlayer) return this.ctx.player;
      else return this.ctx.enemies;
   }

   // Camera
   scrollCam() {

      this.viewport.x = this.updatePlayer.x -this.viewport.width/2;
      this.viewport.y = this.updatePlayer.y -this.viewport.height/2;
      
      // Viewport bounderies
      let vpLeftCol_Nbr = Math.floor(this.viewport.x / this.mapSpecs.cellSize);
      let vpRightCol_Nbr = Math.ceil((this.viewport.x + this.viewport.width) / this.mapSpecs.cellSize);
      let vpTopRow_Nbr = Math.floor(this.viewport.y / this.mapSpecs.cellSize);
      let vpBottomRow_Nbr = Math.ceil((this.viewport.y + this.viewport.height) / this.mapSpecs.cellSize);

      // Map bounderies ==> no repeat
      if(vpLeftCol_Nbr < 0) vpLeftCol_Nbr = 0;
      if(vpTopRow_Nbr < 0) vpTopRow_Nbr = 0;
      if(vpRightCol_Nbr > this.mapSpecs.columns) vpRightCol_Nbr = this.mapSpecs.columns;
      if(vpBottomRow_Nbr > this.mapSpecs.rows) vpBottomRow_Nbr = this.mapSpecs.rows;
      
      // ================ DEBUG ================
      // this.ctx.player.strokeStyle = "red";
      // this.ctx.player.strokeRect(0, 0, this.viewport.width, this.viewport.height);
      // ================ DEBUG ================

      for(let x = vpLeftCol_Nbr; x < vpRightCol_Nbr; x++) {
         for(let y = vpTopRow_Nbr; y < vpBottomRow_Nbr; y++) {
            
            let tileIndex = y *this.mapSpecs.columns +x;
            let tileToDraw = this.mapSpecs.mapScheme[tileIndex];
            
            let tile_X = x *this.mapSpecs.cellSize -this.viewport.x;
            let tile_Y = y *this.mapSpecs.cellSize -this.viewport.y;
            
            this.ctx.map.drawImage(
               this.imgFiles.mapTile,
               (tileToDraw -1) *this.mapSpecs.mapSpriteSize, 0, this.mapSpecs.mapSpriteSize, this.mapSpecs.mapSpriteSize,
               tile_X, tile_Y, this.mapSpecs.cellSize, this.mapSpecs.cellSize
            );
         }
      }
   }
   
   // Draw Mini Bars
   drawBars_Client() {
      
      const clientPlayerBar = {
         ctx: this.ctxToRender(),
         x: this.viewport.width/2 - this.miniBars.width/2,
         y: this.viewport.height/2,
         width: this.miniBars.width,
         height: this.miniBars.height,
      }
      
      const attackBar = new GameBar(clientPlayerBar, 0, 55, this.initPack.GcD, this.updatePlayer.speedGcD);
      const attackCoord = this.barCoordArray[3];

      attackBar.draw(
         this.imgFiles.gameUI,
         attackCoord.x,
         attackCoord.y,
         attackCoord.width,
         attackCoord.height
      );
   }

   drawBars_OtherPlayer() {
      
      // Bar Value Array
      const barValueArray = [
         {
            name: "health",
            maxValue: this.initPack.baseHealth,
            value: this.updatePlayer.health,
         },

         {
            name: "mana",
            maxValue: this.initPack.baseMana,
            value: this.updatePlayer.mana,
         },

         {
            name: "energy",
            maxValue: this.initPack.baseEnergy,
            value: this.updatePlayer.energy,
         }
      ];

      const otherPlayerBar = {
         ctx: this.ctxToRender(),
         x: this.updatePlayer.x - this.viewport.x,
         y: this.updatePlayer.y - this.viewport.y,
         width: this.miniBars.width,
         height: this.miniBars.height,
      }
      
      let barGap = 0;
      let barOffset = 9;
      
      for(let i = 0; i < barValueArray.length; i++) {

         let index;
         let bar = barValueArray[i];
         const gameBar = new GameBar(otherPlayerBar, -this.miniBars.width/2, -95 +barGap, bar.maxValue, bar.value);

         // Health Bar
         if(bar.name === "health") {
            index = 0;
            if(this.updatePlayer.health <= this.initPack.baseHealth * this.minHealthRatio) index = 3;
         }

         // Mana Bar
         if(bar.name === "mana") {
            index = 5;
            if(this.updatePlayer.mana < this.initPack.healCost) index = 6;
         }

         // Energy Bar
         if(bar.name === "energy") index = 1;
         
         // Draw Bar
         gameBar.draw(
            this.imgFiles.gameUI,
            barCoordArray[index].x,
            barCoordArray[index].y,
            barCoordArray[index].width,
            barCoordArray[index].height
         );

         barGap += barOffset;
      };
   }

   // Draw Player, Ring, Shadow, Name
   drawRing() {

      let ctx = this.ctxToRender();

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
         this.pos().x,
         this.pos().y +this.sprites.radius -this.sprites.offsetY /2,
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
         this.pos().x,
         this.pos().y +this.sprites.radius -this.sprites.offsetY /2,
         this.sprites.radius *this.shadowSize +this.ringSize,
         this.sprites.radius *this.shadowSize *0.5 +this.ringSize *0.75,
         0, 0, Math.PI * 2
      );
      ctx.stroke();
      ctx.closePath();
   }

   drawShadow() {
      
      let ctx = this.ctxToRender();

      ctx.fillStyle = "rgba(30, 30, 30, 0.7)";
      ctx.beginPath();
      ctx.ellipse(
         this.pos().x,
         this.pos().y + this.sprites.radius -this.sprites.offsetY /2,
         this.sprites.radius * this.shadowSize,
         this.sprites.radius * this.shadowSize/2,
         0, 0, Math.PI * 2
      );
      ctx.fill();
      ctx.closePath();
   }

   drawPlayer() {
      
      let ctx = this.ctxToRender();

      ctx.drawImage(
         this.imgFiles.player,

         // Source
         (this.updatePlayer.frameX + this.animState) * this.sprites.width,
         this.frameY * this.sprites.height,
         this.sprites.width,
         this.sprites.height,      
         
         // Destination
         this.pos().x - this.sprites.width/2,
         this.pos().y - this.sprites.height/2 - this.sprites.offsetY,
         this.sprites.height,
         this.sprites.width,
      );
   }

   drawName() {
      
      let ctx = this.ctxToRender();

      let offsetY = 89;
      let namePos_X = this.pos().x;
      let namePos_Y = this.pos().y + offsetY;
      
      if(this.isClient) ctx.fillStyle = "lime";
      else ctx.fillStyle = "darkorange";

      ctx.textAlign = "center";
      ctx.font = "30px Dimbo-Regular";
      
      ctx.lineWidth = "1";
      ctx.strokeStyle = "black";
      ctx.fillText(this.initPack.name, namePos_X, namePos_Y);
      ctx.strokeText(this.initPack.name, namePos_X, namePos_Y);
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

   playerState(frame) {

      switch(this.updatePlayer.state) {
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
   render_ClientPlayer(updatePlayer, frame, debugPlayer) {

      this.updatePlayer = updatePlayer;

      this.playerState(frame);
      this.scrollCam();
      
      // Player
      this.drawRing();
      this.drawShadow();
      this.drawPlayer();
      this.drawBars_Client();
      this.drawName();
      
      // DEBUG
      if(debugPlayer) this.DEBUG_GENERAL();
   }


   // =====================================================================
   // Other Players Sync (Every frame)
   // =====================================================================
   render_OtherPlayer(updatePlayer, frame) {
      
      this.updatePlayer = updatePlayer;

      // Animation State
      this.playerState(frame);

      // Player
      this.drawRing();
      this.drawShadow();
      this.drawPlayer();
      this.drawBars_OtherPlayer();
      this.drawName();

      // ******************************
      // this.DEBUG_GENERAL();
      // ******************************
   }


   // ==>  DEBUG MODE  <==
   DEBUG_GENERAL() {
      
      this.DEBUG_DrawPlayer();
      this.DEBUG_DrawAttackArea();
      this.DEBUG_DrawHealthNumber();
      this.DEBUG_DrawDetectViewport();
      this.DEBUG_DrawOrigin();
   }

   DEBUG_DrawOrigin() {
      
      const lineSize = 100;
      this.ctx.UI.lineWidth = 2;
      this.ctx.UI.strokeStyle = "red";

      // Horizontal Line
      this.ctx.UI.beginPath();
      this.ctx.UI.moveTo(
         this.pos().x -lineSize,
         this.pos().y,
      );
      this.ctx.UI.lineTo(
         this.pos().x +lineSize,
         this.pos().y,
      );
      this.ctx.UI.stroke();


      // Vertical Line
      this.ctx.UI.beginPath();
      this.ctx.UI.moveTo(
         this.pos().x,
         this.pos().y -lineSize,
      );
      this.ctx.UI.lineTo(
         this.pos().x,
         this.pos().y +lineSize,
      );
      this.ctx.UI.stroke();
   }

   DEBUG_DrawDetectViewport() {

      this.ctx.fixedBack.strokeStyle = "yellow";
      this.ctx.fixedBack.lineWidth = 4;
      
      this.ctx.fixedBack.strokeRect(
         this.viewport.width/2 - this.detectViewport.width/2,
         this.viewport.height/2 - this.detectViewport.height/2,
         this.detectViewport.width,
         this.detectViewport.height,
      );
   }

   DEBUG_DrawPlayer() {
      
      this.ctx.player.fillStyle = "darkviolet";
      this.ctx.player.beginPath();
      this.ctx.player.arc(
         this.pos().x,
         this.pos().y,
         this.initPack.radius, 0, Math.PI * 2
      );
      this.ctx.player.fill();
      this.ctx.player.closePath();
   }

   DEBUG_DrawAttackArea() {

      this.ctx.player.fillStyle = "orangered";
      this.ctx.player.beginPath();
      this.ctx.player.arc(
         this.pos().x + this.updatePlayer.attkOffset_X,
         this.pos().y + this.updatePlayer.attkOffset_Y,
         this.initPack.attkRadius, 0, Math.PI * 2
      );
      this.ctx.player.fill();
      this.ctx.player.closePath();
   }

   DEBUG_DrawHealthNumber() {

      this.ctx.player.fillStyle = "black";
      this.ctx.player.font = "26px Dimbo-Regular";
      this.ctx.player.fillText(
         Math.round(this.updatePlayer.health),
         this.pos().x,
         this.pos().y -15
      );
   }
}