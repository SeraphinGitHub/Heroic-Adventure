
"use strict"

// =====================================================================
// Init Player
// =====================================================================
// const client = new ClientPlayer(
//    viewport,
//    viewport_HTML,
//    viewSize,
//    controls,
//    ctxUI,
//    ctxPlayer,
//    ctxEnemies,
//    ctxFixedBack,
//    ctxFixedFront,
//    hudImage,
//    barWidth,
//    barHeight,
//    barCoordArray,
//    animArray
// );

// playerData.forEach(servPlayer => client.playerSync(servPlayer, viewport, mapTiles, cellSize));



// =====================================================================
// Client Player
// =====================================================================
class ClientPlayer {
   constructor(
         viewport,
         viewport_HTML,
         viewSize,
         ctxUI,
         ctxMap,
         ctxPlayer,
         ctxEnemies,
         ctxFixedBack,
         ctxFixedFront,
         hudImage,
         barWidth,
         barHeight,
         barCoordArray,
         animArray
      ) {
      
      // Viewport
      this.viewport = viewport;
      this.viewport_HTML = viewport_HTML;
      this.viewSize = viewSize;

      // Contexts
      this.ctxUI = ctxUI;
      this.ctxMap = ctxMap;
      this.ctxPlayer = ctxPlayer;
      this.ctxEnemies = ctxEnemies;
      this.ctxFixedBack = ctxFixedBack;
      this.ctxFixedFront = ctxFixedFront;
      
      // HUD
      this.hudImage = hudImage;
      this.HUD_scale_X = 1.2;
      this.HUD_scale_Y = 1;
      this.HUD = {
         x: viewport.width/2 -400/2 * this.HUD_scale_X,
         y: viewport.height -110 * this.HUD_scale_Y,
         width: 400 * this.HUD_scale_X,
         height: 100 * this.HUD_scale_Y,
      }
      this.minHealthRatio = 0.3; // Min Health before flash (%)
      this.flashingSpeed = 6;
      this.flashFrame = 0;

      // Mini Bars
      this.barWidth = barWidth;
      this.barHeight = barHeight;
      this.barCoordArray = barCoordArray;

      // Sprites
      this.sprites = {
         height: 200,
         width: 200,
         offsetY: 5,
         radius: 45,
      }
      this.animArray = animArray;
   }


   // =====================================================================
   // Client check
   // =====================================================================
   pos(servPlayer, coord) {
      
      if(this.viewport_HTML.id === String(servPlayer.id)) {
         if(coord === "x") return this.viewSize.width/2;
         if(coord === "y") return this.viewSize.height/2;
      }

      else {
         if(coord === "x") return this.x - this.viewport.x;
         if(coord === "y") return this.y - this.viewport.y;
      }
   }


   // =====================================================================
   // Scroll Camera
   // =====================================================================
   scrollCam(servPlayer, viewport, mapTiles, cellSize) {

      viewport.scrollTo(servPlayer.x, servPlayer.y);
      
      // Viewport bounderies
      let vpLeftCol_Nbr = Math.floor(viewport.x / cellSize);
      let vpRightCol_Nbr = Math.ceil((viewport.x + viewport.width) / cellSize);
      let vpTopRow_Nbr = Math.floor(viewport.y / cellSize);
      let vpBottomRow_Nbr = Math.ceil((viewport.y + viewport.height) / cellSize);

      // Map bounderies ==> no repeat
      if(vpLeftCol_Nbr < 0) vpLeftCol_Nbr = 0;
      if(vpTopRow_Nbr < 0) vpTopRow_Nbr = 0;
      if(vpRightCol_Nbr > columns) vpRightCol_Nbr = columns;
      if(vpBottomRow_Nbr > rows) vpBottomRow_Nbr = rows;
      
      // ======== Temporary ========
      // this.ctxPlayer.strokeStyle = "black";
      // this.ctxPlayer.strokeRect(centerVp_X, centerVp_Y, viewport.width, viewport.height);
      // ======== Temporary ========

      for(let x = vpLeftCol_Nbr; x < vpRightCol_Nbr; x++) {
         for(let y = vpTopRow_Nbr; y < vpBottomRow_Nbr; y++) {
            
            let tileIndex = y * columns + x;
            let tileToDraw = mapScheme[tileIndex];
            
            let tile_X = x * cellSize - viewport.x + centerVp_X;
            let tile_Y = y * cellSize - viewport.y + centerVp_Y;
            
            this.ctxMap.drawImage(
               mapTiles,
               (tileToDraw -1) * spriteSize, 0, spriteSize, spriteSize,
               tile_X, tile_Y, cellSize, cellSize
            );

            // ==> Still need to hide other players and enemies when leave viewport
         }
      }
   }


   // =====================================================================
   // Player Floating Text
   // =====================================================================
   playerFloatingText(floatTextArray, servPlayer, ctx, offsetX, offsetY, textColor, textValue) {

      const textSize = 30;
      
      const newText = new FloatingText(
         ctx,
         this.pos(servPlayer, "x"),
         this.pos(servPlayer, "y"),
         offsetX,
         offsetY,
         textSize,
         textColor,
         textValue
      );

      floatTextArray.push(newText);
   }


   // =====================================================================
   // Init Floating Text
   // =====================================================================
   initFloatingText(floatTextArray, socket) {

      socket.on("getHeal", (servPlayer) => this.playerFloatingText(floatTextArray, servPlayer, -35, -100, "lime", `+${servPlayer.calcHealing}`));
      socket.on("giveDamage", (servPlayer) => this.playerFloatingText(floatTextArray, servPlayer, -35, -100, "yellow", `-${servPlayer.calcDamage}`));
      socket.on("getDamage", (servPlayer) => this.playerFloatingText(floatTextArray, servPlayer, -35, -100, "red", `-${servPlayer.calcDamage}`));
      socket.on("getFame", (servPlayer, fameCost) => this.playerFloatingText(floatTextArray, servPlayer, -85, 180, "darkviolet", `+${fameCost} Fame`));
      socket.on("looseFame", (servPlayer, fameCost) => this.playerFloatingText(floatTextArray, servPlayer, -85, 180, "red", `-${fameCost} Fame`));
   }


   // =====================================================================
   // Player Fame
   // =====================================================================
   playerFame(servPlayer) {

      const fameBarWidth = 1000;

      const fameBarSpecs = {
         ctx: this.ctxUI,
         x: this.viewSize.width/2 - fameBarWidth/2,
         y: 10,
         width: fameBarWidth,
         height: 20,
      }

      const fameBar = new GameBar(fameBarSpecs, 0, 0, servPlayer.baseFame, servPlayer.fameValue);

      fameBar.draw(
         this.hudImage,
         50, 586, 350, 50
         // 50, 612, 350, 23
      );
   }


   // =====================================================================
   // Player HUD
   // =====================================================================
   drawHUD_Frame() {
      
      // Background
      this.ctxFixedBack.drawImage(
         this.hudImage,
         4, 179, 729, 141,
         this.HUD.x + (15 * this.HUD_scale_X),     // Pos X
         this.HUD.y + (10 * this.HUD_scale_Y),     // Pos Y
         this.HUD.width - (30 * this.HUD_scale_X), // Width
         this.HUD.height - (20 * this.HUD_scale_Y) // Height
      );

      // HUD Sprite
      this.ctxFixedFront.drawImage(
         this.hudImage,
         3, 4, 782, 172,
         this.HUD.x, this.HUD.y, this.HUD.width, this.HUD.height
      );
   }

   drawHUD_BaseBar(ratio, sx, sy, sw, sh, offX, offY, offW, offH) {

      this.ctxUI.drawImage(
         this.hudImage,
         sx, sy, sw *ratio, sh,
         this.HUD.x + (offX * this.HUD_scale_X),                  // Pos X
         this.HUD.y + (offY * this.HUD_scale_Y),                  // Pos Y
         ( this.HUD.width - (offW * this.HUD_scale_X) ) *ratio,   // Width
         this.HUD.height/3 - (offH * this.HUD_scale_Y)            // Height
      );
   }

   drawHUD_Mana(servPlayer) {
      
      let manaRatio = servPlayer.mana / servPlayer.baseMana;
      
      // Still Castable Mana
      if(servPlayer.mana >= servPlayer.healCost) {

         this.drawHUD_BaseBar(
            manaRatio,
            4, 382, 460, 47,
            82, 10, 165, 8
         );
      }
      
      // Low Mana
      else {
         this.drawHUD_BaseBar(
            manaRatio,
            3, 328, 462, 47,
            82, 10, 165, 8
         );
      }
   }

   drawHUD_Health(servPlayer) {
      
      let healthRatio = servPlayer.health / servPlayer.baseHealth;

      // if Health Over 30%
      if(servPlayer.health > servPlayer.baseHealth * minHealthRatio) {

         // Normal Bar
         this.drawHUD_BaseBar(
            healthRatio,
            5, 486, 729, 45,
            15, 39, 30, 9
         );
      }

      // if Health Under 30%
      else {

         // Flashing Bar
         this.drawHUD_BaseBar(
            healthRatio,
            4, 435, 729, 45,
            15, 39, 30, 9
         );

         this.flashFrame++;

         if(this.flashFrame > this.flashingSpeed) {

            // Normal Bar
            this.drawHUD_BaseBar(
               healthRatio,
               5, 486, 729, 45,
               15, 39, 30, 9
            );
         }

         if(this.flashFrame > this.flashingSpeed *2) this.flashFrame = 0;
      }
   }

   drawHUD_Energy(servPlayer) {
      
      let energyRatio = servPlayer.energy / servPlayer.baseEnergy;

      // Yellow Bar
      this.drawHUD_BaseBar(
         energyRatio,
         4, 536, 461, 45,
         82, 65, 165, 8
      );
   }


   // =====================================================================
   // Player Mini Bars
   // =====================================================================   
   drawBars_Client(servPlayer) {
      
      const clientPlayerBar = {
         ctx: this.ctxUI,
         x: this.viewSize.width/2 - this.barWidth/2,
         y: this.viewSize.height/2,
         width: this.barWidth,
         height: this.barHeight,
      }
      
      // GameBar(playerBarObj, offsetX, offsetY, maxValue, value)
      const attackBar = new GameBar(clientPlayerBar, 0, 65, servPlayer.GcD, servPlayer.speedGcD);
      const attackCoord = this.barCoordArray[ this.barCoordArray.length -1 ]; // Always get last index

      attackBar.draw(
         this.hudImage,
         attackCoord.x,
         attackCoord.y,
         attackCoord.width,
         attackCoord.height
      );
   }

   drawBars_OtherPlayer(servPlayer) {
      
      const healthBar = {
         name: "health",
         maxValue: servPlayer.baseHealth,
         value: servPlayer.health,
      };

      const manaBar = {
         name: "mana",
         maxValue: servPlayer.baseMana,
         value: servPlayer.mana,
      };

      const energyBar = {
         name: "energy",
         maxValue: servPlayer.baseEnergy,
         value: servPlayer.energy,
      };

      // Bar Value Array
      const barValueArray = [
         healthBar,
         manaBar,
         energyBar,
      ];

      const otherPlayerBar = {
         ctx: this.ctxEnemies,
         x: this.x - this.viewport.x,
         y: this.y - this.viewport.y,
         width: this.barWidth,
         height: this.barHeight,
      }
      
      let barGap = 0;
      let barOffset = 9;
      
      for(let i = 0; i < barValueArray.length; i++) {
         
         let bar = barValueArray[i];
         if(servPlayer.isDead) bar.value = 0;
         
         // GameBar(playerBarObj, offsetX, offsetY, maxValue, value)
         const otherBar = new GameBar(otherPlayerBar, -this.barWidth/2, -95 +barGap, bar.maxValue, bar.value);
         
         let index = i;

         // Mana Bar
         if(bar.name === "mana") {
            if(servPlayer.mana >= servPlayer.healCost) index = i;
            else index = this.barCoordArray.length -2;
         }
         
         // Health Bar
         if(bar.name === "health") {
            if(servPlayer.health > servPlayer.baseHealth * this.minHealthRatio) index = i;
            else index = this.barCoordArray.length -1;
         }
         
         // Other Bar
         otherBar.draw(
            this.hudImage,
            this.barCoordArray[index].x,
            this.barCoordArray[index].y,
            this.barCoordArray[index].width,
            this.barCoordArray[index].height
         );

         barGap += barOffset;
      };
   }


   // =====================================================================
   // Draw Player ==> Sprites, Shadow, Name
   // =====================================================================
   drawShadow(ctx, servPlayer) {
      
      ctx.fillStyle = "rgba(30, 30, 30, 0.6)";
      ctx.beginPath();
      ctx.ellipse(
         this.pos(servPlayer, "x"),
         this.pos(servPlayer, "y") + this.sprites.radius,
         this.sprites.radius * 0.8, this.sprites.radius * 0.4, 0, 0, Math.PI * 2
      );
      ctx.fill();
      ctx.closePath();
   }

   drawPlayer(ctx, servPlayer) {

      let animState = this.playerAnimState();

      ctx.drawImage(
         animState,

         // Source
         servPlayer.frameX * this.sprites.width,
         servPlayer.frameY * this.sprites.height,
         this.sprites.width,
         this.sprites.height,      
         
         // Destionation
         this.pos(servPlayer, "x") - this.sprites.width/2,
         this.pos(servPlayer, "y") - this.sprites.height/2 - this.sprites.offsetY,
         this.sprites.height,
         this.sprites.width,
      );
   }

   drawName(ctx, servPlayer) {
      
      let offsetY = 95;
      let namePos_X = this.pos(servPlayer, "x") - (servPlayer.name.length * 7);
      let namePos_Y = this.pos(servPlayer, "y") + offsetY;
      
      ctx.fillStyle = "lime";
      ctx.font = "22px Orbitron-ExtraBold";
      ctx.fillText(this.name, namePos_X, namePos_Y);
      ctx.strokeText(this.name, namePos_X, namePos_Y);
   }


   // =====================================================================
   // Player Animation State
   // =====================================================================
   playerAnimState() {
      
      let animState;

      switch(this.state) {
         case "walk": animState = this.animArray[1];
         break;

         case "run": animState = this.animArray[2];
         break;

         case "attack": animState = this.animArray[3];
         break;

         case "heal": animState = this.animArray[4];
         break;

         case "died": animState = this.animArray[5];
         break;

         default: animState = this.animArray[0];
         break;
      }

      return animState;
   }


   // =====================================================================
   // Player Sync (Every frame)
   // =====================================================================
   playerSync(servPlayer, viewport, mapTiles, cellSize) {

      // if Client
      if(this.viewport_HTML.id === String(servPlayer.id)) {
         
         // Camera 
         this.scrollCam(servPlayer, viewport, mapTiles, cellSize);
         
         // UI
         this.playerFame(servPlayer);
         this.drawHUD_Mana(servPlayer);
         this.drawHUD_Health(servPlayer);
         this.drawHUD_Energy(servPlayer);
         
         // Player
         this.drawShadow(this.ctxPlayer, servPlayer);
         this.drawPlayer(this.ctxPlayer, servPlayer);
         this.drawName(this.ctxPlayer, servPlayer);  
         this.drawBars_Client(servPlayer);
      }
      
      
      // if Other Players
      else {
         this.drawBars_OtherPlayer(servPlayer);

         // Player
         this.drawShadow(this.ctxEnemies, servPlayer);
         this.drawPlayer(this.ctxEnemies, servPlayer);
         this.drawName(this.ctxEnemies, servPlayer);   
      }
      
      // this.DEBUG_Player(servPlayer);
   }


   // =====================================================================
   // ==>  DEBUG MODE  <==
   // =====================================================================
   DEBUG_Player(servPlayer) {

      this.DEBUG_DrawPlayer(servPlayer);
      this.DEBUG_DrawAttackArea(servPlayer);
      this.DEBUG_DrawHealthNumber(servPlayer);
   }

   DEBUG_DrawPlayer(servPlayer) {
      
      this.ctxPlayer.fillStyle = "darkviolet";
      this.ctxPlayer.beginPath();
      this.ctxPlayer.arc( this.pos(servPlayer, "x"), this.pos(servPlayer, "y"), servPlayer.radius, 0, Math.PI * 2);
      this.ctxPlayer.fill();
      this.ctxPlayer.closePath();
   }

   DEBUG_DrawAttackArea(servPlayer) {

      this.ctxPlayer.fillStyle = "orangered";
      this.ctxPlayer.beginPath();
      this.ctxPlayer.arc( this.pos(servPlayer, "x") + servPlayer.attkOffset_X, this.pos(servPlayer, "y") + servPlayer.attkOffset_Y, servPlayer.attkRadius, 0, Math.PI * 2);
      this.ctxPlayer.fill();
      this.ctxPlayer.closePath();
   }

   DEBUG_DrawHealthNumber(servPlayer) {

      this.ctxPlayer.fillStyle = "black";
      this.ctxPlayer.font = "26px Orbitron-Regular";
      this.ctxPlayer.fillText(Math.floor(servPlayer.health), this.pos(servPlayer, "x") -35, this.pos(servPlayer, "y") -15);
   }
}