
import {
   IPosition,
   IBoolean,
   INumber,
   INumberList,
   INearestPlayer,
} from "../utils/interfaces";

import {
   ManagerClass,
   AgentClass,
   PlayerClass,
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

   aggroPlayersMap: Map<number, boolean> = new Map<number, boolean>();

   position:  IPosition;
   spawnPos:  IPosition;
   targetPos: IPosition;

   AI:        INumber;
   stats:     INumber;
   sprite:    INumber;
   
   animSide:  number   = 0;
   animState: number   = 0;
   animList:  INumberList;

   booleans:  IBoolean = {
      isMovable:     true,
      isWandering:   true,
      isChasable:    true,
      isAttackable:  true,
      isAttacking:   false,
      isAttackOnCD:  false,
      isSendToSpawn: false,
      isPosCalc:     false,
      isPosReCalc:   false,
      isAnimated:    false,
      isDecayed:     false,
      isDead:        false,
   }

   constructor(
      id:    number,
      props: any,
      spawn: IPosition,
   ) {
      super();

      this.id        = id;
      this.name      = props.name;
      this.imgSrc    = props.imgSrc;
      this.radius    = props.stats.radius,
      this.sprite    = props.sprite;
      this.animList  = props.animList;
      
      this.position  = spawn;
      this.spawnPos  = spawn;
      this.targetPos = spawn;
      
      this.AI = {
         chaseRange:    props.AI.chaseRange,
         maxChaseRange: props.AI.chaseRange *3,
         wanderRange:   props.AI.wanderRange,
         wanderDelay:   props.AI.wanderDelay,
      }
      
      this.stats = {
         baseHealth:  props.stats.baseHealth,
         health:      props.stats.baseHealth,
         
         baseDamages: props.stats.damages,      // melleAttack: base
         damageRatio: props.stats.damageRatio,  // melleAttack: ratio
         attackDelay: props.stats.attackDelay,  // melleAttack: delay
         attackSpeed: props.stats.attackSpeed,

         // attackAnimDelay = Math.floor( client frameRate * index * (spritesNumber -1) * props.attackDelay );

         decayTime:   props.stats.decayTime,
         respawnTime: props.stats.respawnTime,
         fameReward:  props.stats.fameReward,
         fameLoss:    props.stats.fameLoss,
         
         walkSpeed:   Math.round(speedCoeff *props.stats.walkSpeed),
         runSpeed:    Math.round(speedCoeff *props.stats.runSpeed),
         speed:       0,
      }
   }
  
   setTargetPos() { // Calculate target random position
      
      if(this.booleans.isPosCalc) return;
      this.booleans.isPosCalc = true;
      
      const RnG_Distance = this.RnG(1, this.AI.wanderRange);
      const RnG_Degrees  = this.RnG(1, 360);
      const RnG_Radians  = RnG_Degrees * Math.PI /180;
      
      this.targetPos.x = Math.floor( this.spawnPos.x + (RnG_Distance * Math.cos(RnG_Radians)) );
      this.targetPos.y = Math.floor( this.spawnPos.y + (RnG_Distance * Math.sin(RnG_Radians)) );
   }

   isAtTargetPos(
      otherPos?: IPosition,
   ): boolean {

      let targetPos = this.targetPos;

      if(otherPos) targetPos = otherPos;
      
      const { x: targetX, y: targetY }: IPosition = targetPos;
      const { x: posX,    y: posY    }: IPosition = this.position;

      if(posX === targetX
      && posY === targetY) {

         return true;
      }
      return false;
   }

   moveToTarget() {
      
      if(!this.booleans.isMovable) return;

      const { x: targetX, y: targetY }: IPosition = this.targetPos;
      const { x: posX,    y: posY    }: IPosition = this.position;
      
      if(this.isAtTargetPos()) return;

      const distX: number = targetX -posX;
      const distY: number = targetY -posY;
      const angle: number = Math.atan2(distX, distY);
      const distH: number = Math.min(this.stats.speed, Math.hypot(distX, distY));
      
      this.position.x += Math.cos(angle) * distH;
      this.position.y += Math.sin(angle) * distH;
   }
   
   watchDirection() {
      // For 2 Directions Sprites Sheets

      const { x: targetX, y: targetY }: IPosition = this.targetPos;
      const { x: posX,    y: posY    }: IPosition = this.position;

      if(targetX < posX || targetY < posY && posX === targetX) this.animSide = 1;
      if(targetX > posX || targetY > posY && posX === targetX) this.animSide = 0;
   }

   attackCooldown() {

      if(this.booleans.isAttackable || this.booleans.isAttackOnCD) return;
      this.booleans.isAttackOnCD = true;
      
      setTimeout(() => {
         this.booleans.isAttackable = true;
         this.booleans.isAttackOnCD = false;
      }, this.stats.attackSpeed);
   }  

   wanderingState() { // Wander

      if(!this.booleans.isWandering) return;

      this.booleans.isMovable = true;
      this.stats.speed = this.stats.walkSpeed;
      
      this.setTargetPos();
      this.moveToTarget();

      if(this.booleans.isPosReCalc || !this.isAtTargetPos()) return;
      this.booleans.isPosReCalc = true;
      
      // Mob take a break && recalc random target position
      const breakTime: number = this.RnG(1, this.AI.wanderDelay);
      
      setTimeout(() => {
         this.booleans.isPosReCalc = false;
         this.booleans.isPosCalc   = false;

      }, breakTime *1000);
   }

   aggroState() {     // Aggro

      const mobPos:     IPosition  = this.position;
      const chaseRange: number     = this.AI.chaseRange;
      const { isChasable, isSendToSpawn }: IBoolean = this.booleans;

      let nearestAggroDist: number  = Infinity;
      let nearestPlayer:    unknown = undefined;

      // Foreach detected player ==> Check if aggro Mob
      this.aggroPlayersMap.forEach((
         isPlayerChased: boolean,
         playerID:       number,
      ) => {

         let playerAggroDist: number  = Infinity;

         const {
            position:  playerPos,
            radius:    playerRad,
            booleans:  playerBools,
            getDamage: playerGetDamage,
            
         }: PlayerClass = ManagerClass.playersMap.get(playerID)!;

         // If player enter chasing range ==> Aggro player
         if(!playerBools.isDead
         && isChasable
         && this.Collision_CircToCirc(
            mobPos, chaseRange, playerPos, playerRad
         )) {

            playerAggroDist = this.calcDist(mobPos, playerPos);
            this.aggroPlayersMap.set(playerID, true);
         }

         // If player leave range || player die ==> Back to spawn
         else if(!isSendToSpawn && isPlayerChased) {

            this.setBackToSpawn();
            this.aggroPlayersMap.set(playerID, false);
         }

         // Set nearest aggroed player
         if(playerAggroDist < nearestAggroDist) {

            nearestAggroDist = playerAggroDist;
            nearestPlayer    = {
               id:        playerID,
               position:  playerPos,
               radius:    playerRad,
               isDead:    playerBools.isDead,
               isChased:  isPlayerChased,
               getDamage: playerGetDamage,
               
            };
         }
      });      
      
      return nearestPlayer;
   }

   chasingState(      // Chase
      player: INearestPlayer,
   ) {

      if(!player.isChased) return;

      this.booleans.isMovable   = true;
      this.booleans.isWandering = false;
      this.booleans.isAttacking = false;
      
      this.stats.speed = this.stats.runSpeed;
      this.targetPos   = player.position;

      this.moveToTarget();
      
      const distFromSpawn: number = this.calcDist(this.spawnPos, this.position);
      if(distFromSpawn > this.AI.maxChaseRange) this.setBackToSpawn();
   }

   attackingState(    // Attack
      player: INearestPlayer,
   ) {
      const { isAttacking, isAnimated, isAttackOnCD }: IBoolean = this.booleans;
      
      if(isAttacking
      || isAnimated
      || isAttackOnCD
      ||!this.Collision_CircToCirc(
         this.position, this.radius, player.position, player.radius
      )) {
         
         return;
      }

      this.booleans.isMovable    = false;
      this.booleans.isAttacking  = true;
      this.booleans.isAnimated   = true;
      this.booleans.isAttackOnCD = true;

      this.damagePlayer(player);
   }
   
   damagePlayer(
      player: INearestPlayer,
   ) {

      if(!player.isDead) {
         let damages = this.Ag_StatRnG(this.stats.meleeDamages)
                  
         // Delay the logic to match animation
         setTimeout(() => player.getDamage(this, damages), this.animDelay *this.stats.meleeDamages.delay);
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

   setBackToSpawn() {
      
      this.booleans.isMovable     = true;
      this.booleans.isSendToSpawn = true;
      this.booleans.isAttacking   = false;
      this.booleans.isChasable    = false;

      this.stats.speed = this.stats.runSpeed;
      this.targetPos   = this.spawnPos;
   }

   moveBackToSpawn() {

      if(!this.booleans.isSendToSpawn) return;
      
      this.moveToTarget();

      if(!this.isAtTargetPos(this.spawnPos)) return;
      
      // When reached spawn position
      this.booleans.isSendToSpawn = false;
      this.booleans.isWandering   = true;
      this.booleans.isChasable    = true;

      this.stats.health = this.stats.baseHealth;
   }

   sateMachine() { // Handle states && behaviors

      const nearestPlayer: unknown = this.aggroState();
      
      if(nearestPlayer === undefined) return;
      
      this.chasingState  (nearestPlayer as INearestPlayer);
      this.attackingState(nearestPlayer as INearestPlayer);
   }
   
   death() {

      this.stats.health       = 0;
      this.booleans.isDead    = true;
      this.booleans.isMovable = false;
            
      setTimeout(() => {
         this.booleans.isDecayed = true
         
         setTimeout(() => {
            this.booleans.isDead      = false;
            this.booleans.isDecayed   = false;
            this.booleans.isWandering = true;
            this.booleans.isMovable   = true;

            this.stats.health = this.stats.baseHealth;
            this.position     = this.spawnPos;
   
         }, this.stats.respawnTime);
      }, this.stats.decayTime);
   }
   
   animation() {
      
      let state: unknown;

      const { runSpeed, walkSpeed, speed     }: INumber     = this.stats;
      const { isDead, isAttacking, isMovable }: IBoolean    = this.booleans;
      const { died, attack, idle, run, walk  }: INumberList = this.animList;

      // Dead
      if(isDead) state = died.id;

      // Attack
      if(isAttacking) state = attack.id;

      // Idle
      if(this.isAtTargetPos() || !isMovable) state = idle.id;

      // Run
      if(speed === runSpeed) state = run.id;

      // Walk
      if(speed === walkSpeed) state = walk.id;


      if(this.animState !== state) this.animState = state as number;
   }

   // Sync
   update() {
      
      this.animation();
      
      if(this.booleans.isDead) return;

      this.sateMachine();
      this.watchDirection();
      this.attackCooldown();
      this.moveBackToSpawn();
      this.wanderingState();
   }

   initPack() {
      return {
         id:            this.id,
         name:          this.name,
         position:      this.position,
         baseHealth:    this.stats.baseHealth,
         wanderRange:   this.AI.wanderRange,
         maxChaseRange: this.AI.maxChaseRange,
         imgSrc:        this.imgSrc,
         animList:      this.animList,
         sprite:        this.sprite,
      }
   }

   updatePack() {
      
      this.update();

      return {
         position:  this.position,
         targetPos: this.targetPos,
         health:    this.stats.health,       // Remove later ==> Use socket event instead
         isDead:    this.booleans.isDead,    // Remove later ==> Use socket event instead
         isDecayed: this.booleans.isDecayed, // Remove later ==> Use socket event instead
         animSide:  this.animSide,           // Remove later ==> Use socket event instead
         animState: this.animState,          // Remove later ==> Use socket event instead
      }
   }
}