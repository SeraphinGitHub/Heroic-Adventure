
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

      // Animation
      this.frameY = 0;
      this.frameToJump = 2;
      this.isAnimable = true;
      this.animState;
      this.animSpecs = initEnemy.animSpecs;
      this.imageSrc = initEnemy.imageSrc;
      this.sprites = initEnemy.sprites;
   }

   pos(serverEnemy) {
      return {
         x: serverEnemy.x -this.viewport.x,
         y: serverEnemy.y -this.viewport.y
      }
   }

   spawnPos() {
      return {
         x: this.initEnemy.spawnX -this.viewport.x,
         y: this.initEnemy.spawnY -this.viewport.y,
      }
   }

   // Draw Mini Bars
   drawMiniBar(serverEnemy) {

      const colorBar = {
         yellow: 0.7,   // 70%
         orange: 0.5,   // 50%
         red: 0.3,      // 30%
      }

      const enemyBar = {
         ctx: this.ctxEnemies,
         x: this.pos(serverEnemy).x,
         y: this.pos(serverEnemy).y,
         width: this.barWidth,
         height: this.barHeight,
      }

      const offsetX = -this.barWidth/2;
      const offsetY = -80;
      
      const gameBar = new GameBar(enemyBar, offsetX, offsetY, this.initEnemy.baseHealth, serverEnemy.health);
   
      let index = 0;
      if(serverEnemy.health <= this.initEnemy.baseHealth * colorBar.yellow) index = 1;
      if(serverEnemy.health <= this.initEnemy.baseHealth * colorBar.orange) index = 2;
      if(serverEnemy.health <= this.initEnemy.baseHealth * colorBar.red) index = 3;
   
      gameBar.draw(
         this.gameUI_Img,
         this.barCoordArray[index].x,
         this.barCoordArray[index].y,
         this.barCoordArray[index].width,
         this.barCoordArray[index].height
      );
   }

   // Draw Player, Shadow, Name
   drawShadow(serverEnemy) {

      this.ctxEnemies.fillStyle = "rgba(30, 30, 30, 0.6)";
      this.ctxEnemies.beginPath();
      this.ctxEnemies.ellipse(
         this.pos(serverEnemy).x,
         this.pos(serverEnemy).y +this.sprites.radius,
         this.sprites.radius * 0.8, this.sprites.radius * 0.4, 0, 0, Math.PI * 2
      );
      this.ctxEnemies.fill();
      this.ctxEnemies.closePath();
   }

   drawEnemy(serverEnemy) {
      
      const enemy_Img = new Image();
      enemy_Img.src = this.imageSrc;

      this.ctxEnemies.drawImage(
         enemy_Img,

         // Source
         (serverEnemy.frameX +this.animState) *this.sprites.width,
         this.frameY *this.sprites.height,
         this.sprites.width,
         this.sprites.height,
         
         // Destination
         this.pos(serverEnemy).x -this.sprites.width/2 +this.sprites.offsetX,
         this.pos(serverEnemy).y -this.sprites.height/2 +this.sprites.offsetY,
         this.sprites.width *this.sprites.sizeRatio,
         this.sprites.height *this.sprites.sizeRatio
      );
   }

   drawName(serverEnemy) {

      let offsetY = 87;
      
      this.ctxEnemies.textAlign = "center";
      this.ctxEnemies.fillStyle = "red";
      this.ctxEnemies.font = "20px Orbitron-ExtraBold";

      this.ctxEnemies.fillText(
         this.initEnemy.name,
         this.pos(serverEnemy).x,
         this.pos(serverEnemy).y -offsetY
      );

      this.ctxEnemies.strokeText(
         this.initEnemy.name,
         this.pos(serverEnemy).x,
         this.pos(serverEnemy).y -offsetY
      );
   }
   
   // Animation
   animation(frame, index, spritesNumber, serverEnemy) {
      
      if(frame % index === 0) {
         if(this.frameY < spritesNumber -1) this.frameY++;

         else {
            if(!this.isAnimable) this.isAnimable = true;
            if(!serverEnemy.isDead) this.frameY = 0;
         }
      }
   }

   enemyState(frame, serverEnemy) {

      switch(serverEnemy.state) {
         case "walk": {
            
            this.animState = this.frameToJump * 1;
            this.animation(
               frame,
               this.animSpecs.walk.index,
               this.animSpecs.walk.spritesNumber,
               serverEnemy
            );
         }
         break;

         case "run": {

            this.animState = this.frameToJump * 1;
            this.animation(
               frame,
               this.animSpecs.run.index,
               this.animSpecs.run.spritesNumber,
               serverEnemy
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
               serverEnemy
            );
         }
         break;
      
         case "died": {

            this.animState = this.frameToJump * 3;
            this.animation(
               frame,
               this.animSpecs.died.index,
               this.animSpecs.died.spritesNumber,
               serverEnemy
            );
         }
         break;

         default: {

            this.animState = this.frameToJump * 0;
            this.animation(frame,
               this.animSpecs.idle.index,
               this.animSpecs.idle.spritesNumber,
               serverEnemy
            );
         }
         break;
      }
   }
   
   // =====================================================================
   // Enemy Sync (Every frame)
   // =====================================================================
   render_Enemy(serverEnemy, frame) {
      
      if(!serverEnemy.isHidden) {
         
         // Animation State
         this.enemyState(frame, serverEnemy);

         // this.DEBUG_enemy(serverEnemy);
         this.drawName(serverEnemy);
         this.drawMiniBar(serverEnemy);
         this.drawShadow(serverEnemy);
         this.drawEnemy(serverEnemy);
      }
   }


   // ==>  DEBUG MODE  <==
   DEBUG_enemy(serverEnemy) {
   
      if(!serverEnemy.isDead) {
         this.DEBUG_MaxChaseRange();
         this.DEBUG_WanderRange();
         this.DEBUG_ChasingRange(serverEnemy);
         this.DEBUG_DrawEnemy(serverEnemy);
         this.DEBUG_PathLine(serverEnemy);
         this.DEBUG_ReachPoint(serverEnemy);
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
   
   DEBUG_ChasingRange(serverEnemy) {
   
      // Circle
      this.ctxEnemies.globalAlpha = 0.6;
      this.ctxEnemies.fillStyle = "red";
      this.ctxEnemies.beginPath();
      this.ctxEnemies.arc(
         this.pos(serverEnemy).x,
         this.pos(serverEnemy).y,
         serverEnemy.chasingRange, 0, Math.PI * 2);
      this.ctxEnemies.fill();
      this.ctxEnemies.closePath();
      this.ctxEnemies.globalAlpha = 1;
   }
   
   DEBUG_DrawEnemy(serverEnemy) {
      
      // Mob Radius
      this.ctxEnemies.fillStyle = "blue";
      this.ctxEnemies.beginPath();
      this.ctxEnemies.arc(
         this.pos(serverEnemy).x,
         this.pos(serverEnemy).y,
         this.initEnemy.radius, 0, Math.PI * 2);
      this.ctxEnemies.fill();
      this.ctxEnemies.closePath();
   
      // Health
      this.ctxEnemies.textAlign = "center";
      this.ctxEnemies.fillStyle = "black";
      this.ctxEnemies.font = "26px Orbitron-Regular";
      this.ctxEnemies.fillText(
         Math.round(serverEnemy.health),
         this.pos(serverEnemy).x,
         this.pos(serverEnemy).y
      );
   
      // Center
      this.ctxEnemies.fillStyle = "yellow";
      this.ctxEnemies.beginPath();
      this.ctxEnemies.arc(
         this.pos(serverEnemy).x,
         this.pos(serverEnemy).y,
         6, 0, Math.PI * 2);
      this.ctxEnemies.fill();
      this.ctxEnemies.closePath();
   }
   
   DEBUG_PathLine(serverEnemy) {
   
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
         serverEnemy.calcX -this.viewport.x,
         serverEnemy.calcY -this.viewport.y
      );

      this.ctxEnemies.lineWidth = 4;
      this.ctxEnemies.stroke();
   }
   
   DEBUG_ReachPoint(serverEnemy) {
   
      // Point
      this.ctxEnemies.fillStyle = "blue";
      this.ctxEnemies.beginPath();
      this.ctxEnemies.arc(
         serverEnemy.calcX -this.viewport.x,
         serverEnemy.calcY -this.viewport.y,
         4, 0, Math.PI * 2
      );
      this.ctxEnemies.fill();
      this.ctxEnemies.closePath();
   }
}