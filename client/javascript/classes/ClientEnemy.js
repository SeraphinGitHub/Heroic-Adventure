
"use strict"

// =====================================================================
// Enemy
// =====================================================================
class Enemy extends Character {
   constructor(cl_EnemyObj, initEnemy) {
      
      super();

      // Init Server Enemy
      this.initEnemy = initEnemy;

      // Viewport
      this.viewport = cl_EnemyObj.viewport;

      // Canvas
      this.ctxEnemies = cl_EnemyObj.ctxEnemies;

      // PNG Files
      this.gameUI_Img = cl_EnemyObj.gameUI_Img;

      // Game UI ==> Mini Bars
      this.barWidth = cl_EnemyObj.barWidth;
      this.barHeight = cl_EnemyObj.barHeight;
      this.barCoordArray = cl_EnemyObj.barCoordArray;

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

   pos(updateEnemy) {
      return {
         x: updateEnemy.x -this.viewport.x,
         y: updateEnemy.y -this.viewport.y
      }
   }

   spawnPos() {
      return {
         x: this.initEnemy.spawnX -this.viewport.x,
         y: this.initEnemy.spawnY -this.viewport.y,
      }
   }

   // Draw Mini Bars
   drawMiniBar(updateEnemy) {
      
      const colorBar = {
         yellow: 0.7,   // 70%
         orange: 0.5,   // 50%
         red: 0.3,      // 30%
      }

      const enemyBar = {
         ctx: this.ctxEnemies,
         x: this.pos(updateEnemy).x,
         y: this.pos(updateEnemy).y,
         width: this.barWidth,
         height: this.barHeight,
      }

      const offsetX = -this.barWidth/2;
      const offsetY = -80;
      
      const gameBar = new GameBar(enemyBar, offsetX, offsetY, this.initEnemy.baseHealth, updateEnemy.health);
   
      let index = 0;
      if(updateEnemy.health <= this.initEnemy.baseHealth * colorBar.yellow) index = 1;
      if(updateEnemy.health <= this.initEnemy.baseHealth * colorBar.orange) index = 2;
      if(updateEnemy.health <= this.initEnemy.baseHealth * colorBar.red) index = 3;
   
      gameBar.draw(
         this.gameUI_Img,
         this.barCoordArray[index].x,
         this.barCoordArray[index].y,
         this.barCoordArray[index].width,
         this.barCoordArray[index].height
      );
   }

   // Draw Player, Ring, Shadow, Name
   drawRing(updateEnemy) {
      
      // Shadow Ring
      this.ctxEnemies.lineWidth = "2";
      this.ctxEnemies.fillStyle = "rgb(160, 0, 0, 0.5)";
      this.ctxEnemies.strokeStyle = "red";

      this.ctxEnemies.beginPath();
      this.ctxEnemies.ellipse(
         this.pos(updateEnemy).x,
         this.pos(updateEnemy).y +this.sprites.radius,
         this.sprites.radius *this.shadowSize +this.ringSize,
         this.sprites.radius *this.shadowSize *0.5 +this.ringSize *0.75,
         0, 0, Math.PI * 2
      );
      this.ctxEnemies.fill();
      this.ctxEnemies.closePath();
      
      // Color Ring
      this.ctxEnemies.beginPath();
      this.ctxEnemies.ellipse(
         this.pos(updateEnemy).x,
         this.pos(updateEnemy).y +this.sprites.radius,
         this.sprites.radius *this.shadowSize +this.ringSize,
         this.sprites.radius *this.shadowSize *0.5 +this.ringSize *0.75,
         0, 0, Math.PI * 2
      );
      this.ctxEnemies.stroke();
      this.ctxEnemies.closePath();
   }

   drawShadow(updateEnemy) {

      // Shadow
      this.ctxEnemies.fillStyle = "rgba(30, 30, 30, 0.7)";
      this.ctxEnemies.beginPath();
      this.ctxEnemies.ellipse(
         this.pos(updateEnemy).x,
         this.pos(updateEnemy).y +this.sprites.radius,
         this.sprites.radius *this.shadowSize,
         this.sprites.radius *this.shadowSize/2,
         0, 0, Math.PI * 2
      );
      this.ctxEnemies.fill();
      this.ctxEnemies.closePath();
   }
      
   drawEnemy(updateEnemy) {
      
      const enemy_Img = new Image();
      enemy_Img.src = this.imageSrc;

      this.ctxEnemies.drawImage(
         enemy_Img,

         // Source
         (updateEnemy.frameX +this.animState) *this.sprites.width,
         this.frameY *this.sprites.height,
         this.sprites.width,
         this.sprites.height,
         
         // Destination
         this.pos(updateEnemy).x -this.sprites.width/2 +this.sprites.offsetX,
         this.pos(updateEnemy).y -this.sprites.height/2 +this.sprites.offsetY,
         this.sprites.width *this.sprites.sizeRatio,
         this.sprites.height *this.sprites.sizeRatio
      );
   }

   drawName(updateEnemy) {

      let offsetY = 87;
      
      this.ctxEnemies.textAlign = "center";
      this.ctxEnemies.font = "20px Orbitron-ExtraBold";
      
      this.ctxEnemies.lineWidth = "1";
      this.ctxEnemies.strokeStyle = "black";
      this.ctxEnemies.fillStyle = "red";

      this.ctxEnemies.fillText(
         this.initEnemy.name,
         this.pos(updateEnemy).x,
         this.pos(updateEnemy).y -offsetY
      );

      this.ctxEnemies.strokeText(
         this.initEnemy.name,
         this.pos(updateEnemy).x,
         this.pos(updateEnemy).y -offsetY
      );
   }
   
   // Animation
   animation(frame, index, spritesNumber, updateEnemy) {
      
      if(frame % index === 0) {
         if(this.frameY < spritesNumber -1) this.frameY++;

         else {
            if(!this.isAnimable) this.isAnimable = true;
            if(!updateEnemy.isDead) this.frameY = 0;
         }
      }
   }

   enemyState(frame, updateEnemy) {

      switch(updateEnemy.state) {
         case "walk": {
            
            this.animState = this.frameToJump * 1;
            this.animation(
               frame,
               this.animSpecs.walk.index,
               this.animSpecs.walk.spritesNumber,
               updateEnemy
            );
         }
         break;

         case "run": {

            this.animState = this.frameToJump * 1;
            this.animation(
               frame,
               this.animSpecs.run.index,
               this.animSpecs.run.spritesNumber,
               updateEnemy
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
               this.animSpecs.attack.spritesNumber,
               updateEnemy
            );
         }
         break;
      
         case "died": {

            this.animState = this.frameToJump * 3;
            this.animation(
               frame,
               this.animSpecs.died.index,
               this.animSpecs.died.spritesNumber,
               updateEnemy
            );
         }
         break;

         default: {

            this.animState = this.frameToJump * 0;
            this.animation(frame,
               this.animSpecs.idle.index,
               this.animSpecs.idle.spritesNumber,
               updateEnemy
            );
         }
         break;
      }
   }
   
   // =====================================================================
   // Enemy Sync (Every frame)
   // =====================================================================
   render_Enemy(updateEnemy, frame) {
      
      if(!updateEnemy.isHidden) {
         
         // Animation State
         this.enemyState(frame, updateEnemy);
         
         // ******************************
         // this.DEBUG_GENERAL(updateEnemy);
         // ******************************

         this.drawRing(updateEnemy)
         this.drawShadow(updateEnemy);
         this.drawEnemy(updateEnemy);
         this.drawMiniBar(updateEnemy);
         this.drawName(updateEnemy);
      }
   }


   // ==>  DEBUG MODE  <==
   DEBUG_GENERAL(updateEnemy) {
   
      if(!updateEnemy.isDead) {
         this.DEBUG_MaxChaseRange();
         this.DEBUG_WanderRange(updateEnemy);
         this.DEBUG_ChasingRange(updateEnemy);
         this.DEBUG_DrawEnemy(updateEnemy);
         this.DEBUG_PathLine(updateEnemy);
         this.DEBUG_ReachPoint(updateEnemy);
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
   
   DEBUG_ChasingRange(updateEnemy) {
   
      // Circle
      this.ctxEnemies.globalAlpha = 0.6;
      this.ctxEnemies.fillStyle = "red";
      this.ctxEnemies.beginPath();
      this.ctxEnemies.arc(
         this.pos(updateEnemy).x,
         this.pos(updateEnemy).y,
         updateEnemy.chasingRange, 0, Math.PI * 2);
      this.ctxEnemies.fill();
      this.ctxEnemies.closePath();
      this.ctxEnemies.globalAlpha = 1;
   }
   
   DEBUG_DrawEnemy(updateEnemy) {
      
      // Mob Radius
      this.ctxEnemies.fillStyle = "blue";
      this.ctxEnemies.beginPath();
      this.ctxEnemies.arc(
         this.pos(updateEnemy).x,
         this.pos(updateEnemy).y,
         this.initEnemy.radius, 0, Math.PI * 2);
      this.ctxEnemies.fill();
      this.ctxEnemies.closePath();
   
      // Health
      this.ctxEnemies.textAlign = "center";
      this.ctxEnemies.fillStyle = "black";
      this.ctxEnemies.font = "26px Orbitron-Regular";
      this.ctxEnemies.fillText(
         Math.round(updateEnemy.health),
         this.pos(updateEnemy).x,
         this.pos(updateEnemy).y
      );
   
      // Center
      this.ctxEnemies.fillStyle = "yellow";
      this.ctxEnemies.beginPath();
      this.ctxEnemies.arc(
         this.pos(updateEnemy).x,
         this.pos(updateEnemy).y,
         6, 0, Math.PI * 2);
      this.ctxEnemies.fill();
      this.ctxEnemies.closePath();
   }
   
   DEBUG_PathLine(updateEnemy) {
   
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
         updateEnemy.calcX -this.viewport.x,
         updateEnemy.calcY -this.viewport.y
      );

      this.ctxEnemies.lineWidth = 4;
      this.ctxEnemies.stroke();
   }
   
   DEBUG_ReachPoint(updateEnemy) {
   
      // Point
      this.ctxEnemies.fillStyle = "blue";
      this.ctxEnemies.beginPath();
      this.ctxEnemies.arc(
         updateEnemy.calcX -this.viewport.x,
         updateEnemy.calcY -this.viewport.y,
         4, 0, Math.PI * 2
      );
      this.ctxEnemies.fill();
      this.ctxEnemies.closePath();
   }
}