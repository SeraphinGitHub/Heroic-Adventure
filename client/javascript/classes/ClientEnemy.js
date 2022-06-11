
"use strict"

// =====================================================================
// Enemy
// =====================================================================
class Enemy extends Character {
   constructor(cl_Enemy, initEnemy) {
      
      super();

      // Init Server Enemy
      this.initEnemy = initEnemy;
      this.updateEnemy;

      // Viewport
      this.viewport = cl_Enemy.viewport;

      // Canvas
      this.ctxEnemies = cl_Enemy.ctxEnemies;

      // PNG Files
      this.gameUI_Img = cl_Enemy.gameUI_Img;

      // Game UI ==> Mini Bars
      this.barWidth = cl_Enemy.barWidth;
      this.barHeight = cl_Enemy.barHeight;
      this.barCoordArray = cl_Enemy.barCoordArray;

      this.shadowSize = 0.7;
      this.ringSize = 8;

      // Animation
      this.frameY = 0;
      this.frameToJump = 2;
      this.isAnimable = true;
      this.animState;
      this.animSpecs = initEnemy.animSpecs;
      this.imageSrc = initEnemy.imageSrc;
      this.sprites = initEnemy.sprites;
   }

   pos() {
      return {
         x: this.updateEnemy.x -this.viewport.x,
         y: this.updateEnemy.y -this.viewport.y
      }
   }

   spawnPos() {
      return {
         x: this.initEnemy.spawnX -this.viewport.x,
         y: this.initEnemy.spawnY -this.viewport.y,
      }
   }

   // Draw Mini Bars
   drawMiniBar() {
      
      const colorBar = {
         yellow: 0.7,   // 70%
         orange: 0.5,   // 50%
         red: 0.3,      // 30%
      }

      const enemyBar = {
         ctx: this.ctxEnemies,
         x: this.pos().x,
         y: this.pos().y,
         width: this.barWidth,
         height: this.barHeight,
      }

      const offsetX = -this.barWidth/2;
      const offsetY = -80;
      
      const gameBar = new GameBar(enemyBar, offsetX, offsetY, this.initEnemy.baseHealth, this.updateEnemy.health);
   
      let index = 0;
      if(this.updateEnemy.health <= this.initEnemy.baseHealth * colorBar.yellow) index = 1;
      if(this.updateEnemy.health <= this.initEnemy.baseHealth * colorBar.orange) index = 2;
      if(this.updateEnemy.health <= this.initEnemy.baseHealth * colorBar.red) index = 3;
   
      gameBar.draw(
         this.gameUI_Img,
         this.barCoordArray[index].x,
         this.barCoordArray[index].y,
         this.barCoordArray[index].width,
         this.barCoordArray[index].height
      );
   }

   // Draw Player, Ring, Shadow, Name
   drawRing() {
      
      // Shadow Ring
      this.ctxEnemies.lineWidth = "2";
      this.ctxEnemies.fillStyle = "rgb(160, 0, 0, 0.5)";
      this.ctxEnemies.strokeStyle = "red";

      this.ctxEnemies.beginPath();
      this.ctxEnemies.ellipse(
         this.pos().x,
         this.pos().y +this.sprites.radius,
         this.sprites.radius *this.shadowSize +this.ringSize,
         this.sprites.radius *this.shadowSize *0.5 +this.ringSize *0.75,
         0, 0, Math.PI * 2
      );
      this.ctxEnemies.fill();
      this.ctxEnemies.closePath();
      
      // Color Ring
      this.ctxEnemies.beginPath();
      this.ctxEnemies.ellipse(
         this.pos().x,
         this.pos().y +this.sprites.radius,
         this.sprites.radius *this.shadowSize +this.ringSize,
         this.sprites.radius *this.shadowSize *0.5 +this.ringSize *0.75,
         0, 0, Math.PI * 2
      );
      this.ctxEnemies.stroke();
      this.ctxEnemies.closePath();
   }

   drawShadow() {

      // Shadow
      this.ctxEnemies.fillStyle = "rgba(30, 30, 30, 0.7)";
      this.ctxEnemies.beginPath();
      this.ctxEnemies.ellipse(
         this.pos().x,
         this.pos().y +this.sprites.radius,
         this.sprites.radius *this.shadowSize,
         this.sprites.radius *this.shadowSize/2,
         0, 0, Math.PI * 2
      );
      this.ctxEnemies.fill();
      this.ctxEnemies.closePath();
   }
      
   drawEnemy() {
      
      const enemy_Img = new Image();
      enemy_Img.src = this.imageSrc;

      this.ctxEnemies.drawImage(
         enemy_Img,

         // Source
         (this.updateEnemy.frameX +this.animState) *this.sprites.width,
         this.frameY *this.sprites.height,
         this.sprites.width,
         this.sprites.height,
         
         // Destination
         this.pos().x -this.sprites.width/2 +this.sprites.offsetX,
         this.pos().y -this.sprites.height/2 +this.sprites.offsetY,
         this.sprites.width *this.sprites.sizeRatio,
         this.sprites.height *this.sprites.sizeRatio
      );
   }

   drawName() {

      let offsetY = 87;
      
      this.ctxEnemies.textAlign = "center";
      this.ctxEnemies.font = "28px Dimbo-Regular";
      
      this.ctxEnemies.lineWidth = "1";
      this.ctxEnemies.strokeStyle = "black";
      this.ctxEnemies.fillStyle = "red";

      this.ctxEnemies.fillText(
         this.initEnemy.name,
         this.pos().x,
         this.pos().y -offsetY
      );

      this.ctxEnemies.strokeText(
         this.initEnemy.name,
         this.pos().x,
         this.pos().y -offsetY
      );
   }
   
   // Animation
   animation(frame, index, spritesNumber) {
      
      if(frame % index === 0) {
         if(this.frameY < spritesNumber -2) this.frameY++;

         else {
            if(!this.isAnimable) this.isAnimable = true;
            if(!this.updateEnemy.isDead) this.frameY = 0;
         }
      }
   }

   enemyState(frame) {

      switch(this.updateEnemy.state) {
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

            this.animState = this.frameToJump * 1;
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
            
            this.animState = this.frameToJump * 2;
            this.animation(
               frame,
               this.animSpecs.attack.index,
               this.animSpecs.attack.spritesNumber
            );
         }
         break;
      
         case "died": {

            this.animState = this.frameToJump * 3;
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
   // Enemy Sync (Every frame)
   // =====================================================================
   render_Enemy(updateEnemy, frame, debugMobs) {
      
      this.updateEnemy = updateEnemy;
      
      if(!updateEnemy.isHidden) {
         
         // Animation State
         this.enemyState(frame);
         
         // ******************************
         if(debugMobs) this.DEBUG_GENERAL();
         // ******************************

         this.drawRing()
         this.drawShadow();
         this.drawEnemy();
         this.drawMiniBar();
         this.drawName();
      }
   }


   // ==>  DEBUG MODE  <==
   DEBUG_GENERAL() {
   
      if(!this.updateEnemy.isDead) {
         this.DEBUG_MaxChaseRange();
         this.DEBUG_WanderRange();
         this.DEBUG_ChasingRange();
         this.DEBUG_DrawEnemy();
         this.DEBUG_PathLine();
         this.DEBUG_ReachPoint();
      }
   }
   
   DEBUG_MaxChaseRange() {
   
      // Circle
      this.ctxEnemies.globalAlpha = 0.5;
      this.ctxEnemies.fillStyle = "gold";
      this.ctxEnemies.beginPath();
      this.ctxEnemies.arc(
         this.spawnPos().x,
         this.spawnPos().y,
         this.initEnemy.maxChaseRange + this.initEnemy.radius,
         0, Math.PI * 2);
      this.ctxEnemies.fill();
      this.ctxEnemies.closePath();
      this.ctxEnemies.globalAlpha = 1;
   }
   
   DEBUG_WanderRange() {

      // Circle
      this.ctxEnemies.fillStyle = "darkviolet";
      this.ctxEnemies.beginPath();
      this.ctxEnemies.arc(
         this.spawnPos().x,
         this.spawnPos().y,
         this.initEnemy.wanderRange + this.initEnemy.radius,
         0, Math.PI * 2);
      this.ctxEnemies.fill();
      this.ctxEnemies.closePath();
   }
   
   DEBUG_ChasingRange() {
   
      // Circle
      this.ctxEnemies.globalAlpha = 0.6;
      this.ctxEnemies.fillStyle = "red";
      this.ctxEnemies.beginPath();
      this.ctxEnemies.arc(
         this.pos().x,
         this.pos().y,
         this.updateEnemy.chasingRange, 0, Math.PI * 2);
      this.ctxEnemies.fill();
      this.ctxEnemies.closePath();
      this.ctxEnemies.globalAlpha = 1;
   }
   
   DEBUG_DrawEnemy() {
      
      // Mob Radius
      this.ctxEnemies.fillStyle = "blue";
      this.ctxEnemies.beginPath();
      this.ctxEnemies.arc(
         this.pos().x,
         this.pos().y,
         this.initEnemy.radius, 0, Math.PI * 2);
      this.ctxEnemies.fill();
      this.ctxEnemies.closePath();
   
      // Health
      this.ctxEnemies.textAlign = "center";
      this.ctxEnemies.fillStyle = "black";
      this.ctxEnemies.font = "28px Dimbo-Regular";
      this.ctxEnemies.fillText(
         Math.round(this.updateEnemy.health),
         this.pos().x,
         this.pos().y
      );
   
      // Center
      this.ctxEnemies.fillStyle = "yellow";
      this.ctxEnemies.beginPath();
      this.ctxEnemies.arc(
         this.pos().x,
         this.pos().y,
         6, 0, Math.PI * 2);
      this.ctxEnemies.fill();
      this.ctxEnemies.closePath();
   }
   
   DEBUG_PathLine() {
   
      // Point
      this.ctxEnemies.fillStyle = "lime";
      this.ctxEnemies.beginPath();
      this.ctxEnemies.arc(
         this.spawnPos().x,
         this.spawnPos().y,
         4, 0, Math.PI * 2);
      this.ctxEnemies.fill();
      this.ctxEnemies.closePath();
   
      // Path Line
      this.ctxEnemies.strokeStyle = "lime";
      this.ctxEnemies.beginPath();

      this.ctxEnemies.moveTo(
         this.spawnPos().x,
         this.spawnPos().y
      );

      this.ctxEnemies.lineTo(
         this.updateEnemy.calcX -this.viewport.x,
         this.updateEnemy.calcY -this.viewport.y
      );

      this.ctxEnemies.lineWidth = 4;
      this.ctxEnemies.stroke();
   }
   
   DEBUG_ReachPoint() {
   
      // Point
      this.ctxEnemies.fillStyle = "blue";
      this.ctxEnemies.beginPath();
      this.ctxEnemies.arc(
         this.updateEnemy.calcX -this.viewport.x,
         this.updateEnemy.calcY -this.viewport.y,
         4, 0, Math.PI * 2
      );
      this.ctxEnemies.fill();
      this.ctxEnemies.closePath();
   }
}