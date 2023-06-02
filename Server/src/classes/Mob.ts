
import {
   IPosition,
   IBoolean,
   INumber,
   INumberList,
} from "../utils/interfaces";

import {
   ManagerClass,
   AgentClass,
} from "./_Export";

import dotenv from "dotenv";
dotenv.config();

const speedCoeff: number = Number(process.env.FRAME_RATE) / Number(process.env.MOVE_COEFF);

// =====================================================================
// Mob Class
// =====================================================================
export class MobClass extends AgentClass {

   id:        number;
   name:      string;
   imgSrc:    string;
   radius:    number;

   position:  IPosition;
   spawnPos:  IPosition;
   targetPos: IPosition;

   AI:        INumber;
   stats:     INumber;
   sprite:    INumber;
   
   animSide:  number   = 0; // frameX
   animState: number   = 0; // cachedAnimState
   animList:  INumberList;

   booleans:  IBoolean = {
      isWandering:  true,
      isChasing:    true,
      isAttackable: true,
      isAttackOnCD: false,
      isAttacking:  false, // melleAttack: isAttack
      isPosCalc:    false,
      isPosReCalc:  false,
      isAnimated:   false, // melleAttack: isAnim
      isDecayed:    false, // isHidden
      isDead:       false,
   }

   constructor(
      id:    number,
      props: any,
      spawn: IPosition,
   ) {
      super();

      this.id       = id;
      this.name     = props.name;
      this.imgSrc   = props.imgSrc;
      this.radius   = props.stats.radius,
      this.sprite   = props.sprite;
      this.animList = props.animList;

      // this.aggroPlayersArray  = [];
      
      this.position  = spawn;
      this.spawnPos  = spawn;
      this.targetPos = spawn;
      
      this.AI = {
         baseChaseRange: props.AI.chaseRange,
         chaseRange:     props.AI.chaseRange,
         maxChaseRange:  props.AI.chaseRange *3,
         wanderRange:    props.AI.wanderRange,
         wanderDelay:    props.AI.wanderDelay,
      }
      
      this.stats = {
         baseHealth:  props.stats.baseHealth,
         health:      props.stats.baseHealth,
         
         baseDamages: props.stats.damages,      // melleAttack: base
         damageRatio: props.stats.damageRatio,  // melleAttack: ratio
         attackDelay: props.stats.attackDelay,  // melleAttack: delay
         attackSpeed: props.stats.attackSpeed,

         // attackAnimDelay = Math.floor( client frameRate * index * (spritesNumber -1) * props.attackDelay );

         walkSpeed:   Math.round(speedCoeff *props.stats.walkSpeed),
         runSpeed:    Math.round(speedCoeff *props.stats.runSpeed),
         speed:       0,
      }
   }

   attackCooldown() { // regenGcD()

      if(this.booleans.isAttackable || this.booleans.isAttackOnCD) return;
      this.booleans.isAttackOnCD = true;
      
      setTimeout(() => {
         this.booleans.isAttackable = true;
         this.booleans.isAttackOnCD = false;
      }, this.stats.attackSpeed);
   }

// **********************************************************************************************
// **********************************************************************************************
// **********************************************************************************************
// **********************************************************************************************
   
  
   setTargetPos() { // Calculate random position (Run once)
      
      if(this.booleans.isPosCalc) return;
      this.booleans.isPosCalc = true;
      
      const RnG_Distance = this.RnG(1, this.AI.wanderRange);
      const RnG_Degrees  = this.RnG(1, 360);
      const RnG_Radians  = RnG_Degrees * Math.PI /180;
      
      this.targetPos.x = Math.floor( this.spawnPos.x + (RnG_Distance * Math.cos(RnG_Radians)) );
      this.targetPos.y = Math.floor( this.spawnPos.y + (RnG_Distance * Math.sin(RnG_Radians)) );
   }

   moveToPosition(goal: IPosition) {

      this.targetPos.x = Math.floor(goal.x);
      this.targetPos.y = Math.floor(goal.y);
      
      const { x: targetX, y: targetY }: IPosition = this.targetPos;
      const { x: posX,    y: posY    }: IPosition = this.position;
      
      if(targetX === posX && targetY === posY) return;
      
      const speed: number = this.stats.speed;
      const distX: number = targetX -posX;
      const distY: number = targetY -posY;
      const angle: number = Math.atan2(distX, distY);
      const distH: number = Math.min(speed, Math.hypot(distX, distY));
      
      this.position.x += Math.cos(angle) * distH;
      this.position.y += Math.sin(angle) * distH;
   }
   
   calcAggroPlayers(player, distanceMap) {

      let distance = this.Ag_CalcDistance(this.position, player.position);
      distanceMap.set(player.id, distance);

      if(!this.aggroPlayersList[player.id]) this.aggroPlayersList[player.id] = player;
   }
   
   
   calcNearestPlayer(distanceMap) {

      let nearestPlayer;
      let nearestDistance = Infinity;

      distanceMap.forEach((distance, playerID) => {
         if(distance < nearestDistance) {
            nearestDistance = distance;
            nearestPlayer   = this.aggroPlayersList[playerID];
         }
      });

      return nearestPlayer;
   }
   
   movements() { // ***** Need Recast to enhance perf *****
      // For 2 Directions Sprites Sheets

      // Cross Move
      if(this.position.y > this.target.y || this.position.x > this.target.x) this.frameX = 1; // Left
      if(this.position.y < this.target.y || this.position.x < this.target.x) this.frameX = 0; // Right

      // Diag Move
      if(this.position.y > this.target.y && this.position.x > this.target.x
      || this.position.y < this.target.y && this.position.x > this.target.x) this.frameX = 1; // Top / Down Left
      if(this.position.y > this.target.y && this.position.x < this.target.x
      || this.position.y < this.target.y && this.position.x < this.target.x) this.frameX = 0; // Top / Down Right
   }

   regenGcD() {

      // Regen GcD
      if(this.stats.GcD < this.stats.baseGcD) {
         this.stats.GcD = Math.floor((this.stats.GcD + this.Ag_Coeff.sync) *10) /10;
         if(this.stats.meleeDamages.isAttack) this.stats.meleeDamages.isAttack = false;
      }
      else this.stats.GcD = this.stats.baseGcD;   
   }   

   wanderingState() {
      if(this.booleans.isWandering) {

         this.stats.speed = this.stats.walkSpeed;
         this.setTargetPos();
         this.moveToPosition(this.target);
   
         // Stop && Renewal calculation (Run once)
         if(this.target.x === this.position.x
         && this.target.y === this.position.y
         && !this.booleans.isReCalc) {
            
            this.booleans.isReCalc = true;
            let randomBreakTime = this.Ag_RnG(1, this.AI.wanderBreakTime);
            
            setTimeout(() => {
               this.booleans.isReCalc  = false;
               this.booleans.isCalcPos = false
            }, randomBreakTime *1000);
         }
      }
   }

   chasingState(player) {
      if(this.booleans.isChasing) {

         this.booleans.isWandering        = false;
         this.stats.meleeDamages.isAttack = false;
         this.stats.speed = this.stats.runSpeed;

         this.moveToPosition(player.position);
         
         let distFromSpawn = this.Ag_CalcDistance(this.spawn, this.position);
         if(distFromSpawn >= this.AI.maxChaseRange) this.backToSpawn(player);
      }
   }

   attackingState(socket, player) {

      if(!this.stats.meleeDamages.isAttack
      && !this.stats.meleeDamages.isAnim
      &&  this.stats.GcD >= this.stats.baseGcD) {

         this.stats.meleeDamages.isAttack = true;
         this.stats.meleeDamages.isAnim   = true;
         this.stats.speed = 0;
         this.stats.GcD   = 0;

         this.damagingPlayers(socket, player);
      }
   }
   
   damagingPlayers(socket, player) {

      if(!player.booleans.isDead) {
         let damages = this.Ag_StatRnG(this.stats.meleeDamages)
                  
         // Delay the logic to match animation
         setTimeout(() => player.getDamage(this, socket, damages), this.animDelay *this.stats.meleeDamages.delay);
         setTimeout(() => this.stats.meleeDamages.isAnim = false, this.animDelay);
      }
   }

   getDamage(player, damages) {
      
      this.stats.health -= damages;

      // Mob's Death
      if(this.stats.health <= 0) {
         
         player.score.totalKills++;
         player.score.mobsKills++;
         player.fame.stackValue += this.fame.getCost;
         
         this.resetChaseLists(player);
         this.death();
      }
   }

   backToSpawn(player) {
      
      this.AI.chasingRange = 0;
      this.stats.speed     = this.stats.runSpeed;
      this.stats.meleeDamages.isAttack = false;

      this.moveToPosition(this.spawn);
      
      if(this.position.x === this.spawn.x
      && this.position.y === this.spawn.y) {

         if(this.stats.health !== this.stats.baseHealth) this.stats.health = this.stats.baseHealth;

         this.AI.chasingRange      = this.AI.baseChasingRange;
         this.booleans.isWandering = true;
         this.booleans.isChasing   = true;

         this.resetChaseLists(player);
      }
   }

   resetChaseLists(player) {

      if(player.chasedByMobsList[this.id]) delete player.chasedByMobsList[this.id];
      if(this.aggroPlayersList[player.id]) delete this.aggroPlayersList[player.id];
   }
   
   // State Machine
   sateMachine() {

      let distanceMap = new Map();
      let chasingArea   = {
         x: this.position.x,
         y: this.position.y,
         radius: this.AI.chasingRange,
      };
      
      // ===========================================
      // Chasing ==> Players enter Chasing range
      // ===========================================
      Object.values(this.detectPlayersList).forEach((player) => {
         let playerChasedlist = player.chasedByMobsList[this.id];
         
         if(this.Ag_CircleToCircle(chasingArea, player.position)
         && !player.booleans.isDead) {

            this.calcAggroPlayers(player, distanceMap);
            if(!playerChasedlist[this.id]) playerChasedlist[this.id] = {};
         }
         else if(playerChasedlist[this.id]) this.backToSpawn(player);
      });

      let nearestPlayer = this.calcNearestPlayer(distanceMap);

      
      // ===========================================
      // Attacking ==> Players collide with enemy
      // ===========================================
      if(nearestPlayer !== undefined) {

         // this.aggroPlayersArray.forEach((playerID) => {
            // const player = this.detectPlayersList[playerID];

         Object.values(this.aggroPlayersList).forEach((player) => {
            let socket = this.detectSocketList[player.id];

            if(nearestPlayer.id === player.id) {
               if(this.Ag_CircleToCircle(this.position, player.position)) {
                  this.attackingState(socket, player);
               }
               else this.chasingState(player);
            }
         });
      }
      
      this.wanderingState();
   }
   
   death() {

      this.stats.health       = 0;
      this.booleans.isDead    = true;
      this.booleans.isChasing = false;
            
      setTimeout(() => {
         this.booleans.isHidden = true
         
         setTimeout(() => {
            this.booleans.isDead      = false;
            this.booleans.isHidden    = false;
            this.booleans.isWandering = true;

            this.stats.health = this.stats.baseHealth;
            this.position.x   = this.spawn.x;
            this.position.y   = this.spawn.y;
   
         }, this.respawn.time);
      }, this.respawn.hiddenTime);
   }
   
   animationStates() {
      
      // if(!this.booleans.isDead) {

      //    // Attack State
      //    if(this.stats.meleeDamages.isAnim) {
      //       return this.animStates.attack.id;
      //    }

      //    // Idle State
      //    if((this.position.x  === this.target.x
      //    &&  this.position.y  === this.target.y)
      //    ||  this.stats.speed === 0) {
      //       return this.animStates.idle.id;
      //    }

      //    // Run State
      //    if(this.stats.speed === this.stats.runSpeed) {
      //       return this.animStates.run.id;
      //    }

      //    // Walk State
      //    else return this.animStates.walk.id;

      // }
      // else return this.animStates.died.id;

      // Dead
      if(this.booleans.isDead) {
         return this.animStates.died.id;
      }

      // Attack
      if(this.stats.meleeDamages.isAnim) {
         return this.animStates.attack.id;
      }

      // Idle
      if((this.position.x  === this.target.x
      &&  this.position.y  === this.target.y)
      ||  this.stats.speed === 0) {       // check if need or not
         return this.animStates.idle.id;
      }

      // ((this.position.x  === this.target.x
      // &&  this.position.y  === this.target.y) {
      //    return this.animStates.idle.id;
      // }

      // Run
      if(this.stats.speed === this.stats.runSpeed) {
         return this.animStates.run.id;
      }

      // Walk
      return this.animStates.walk.id;
   }

   // Sync
   update() {
      let state = this.cachedAnimState;

      if(state !== this.animationStates()) {
         state = this.animationStates();
      }
      
      if(this.booleans.isDead) return;
      else {
         this.movements();
         this.regenGcD();
         this.sateMachine();
      }

      return this.lightPack(state);
   }

   initPack() {
      return {
         id:            this.id,
         name:          this.name,
         position:      this.position,
         baseHealth:    this.stats.baseHealth,
         wanderRange:   this.AI.wanderRange,
         maxChaseRange: this.AI.maxChaseRange,
         imageSrc:      this.imageSrc,
         animStates:    this.animStates,
         sprites:       this.sprites,
      }
   }

   lightPack(state) {
      return {
         x:            this.position.x,
         y:            this.position.y,
         calcX:        this.target.x,
         calcY:        this.target.y,
         health:       this.stats.health,
         chasingRange: this.AI.chasingRange, // ==> DEBUG Only ==> need to create event
         isDead:       this.booleans.isDead,      // need to send from an event
         isHidden:     this.booleans.isHidden,
         state:        state,
         frameX:       this.frameX,   // need to delete
      }
   }
}