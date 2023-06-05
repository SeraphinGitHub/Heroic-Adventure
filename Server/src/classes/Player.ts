
import {
   IBoolean,
   IEntity,
   INumber,
   IPosition,
} from "../utils/interfaces";

import {
   ManagerClass,
   AgentClass,
   MobClass,
} from "./_Export";

import {
   savePlayerData,
   getPlayerData,
} from "../API/players/accessDB";

import dotenv from "dotenv";
dotenv.config();

const speedCoeff: number = Number(process.env.FRAME_RATE) / Number(process.env.MOVE_COEFF);

// =====================================================================
// Player Class
// =====================================================================
export class PlayerClass extends AgentClass {

   id:        number | undefined = undefined;
   userID:    number;
   name:      string;
   radius:    number  = 45;

   position:  IPosition = { x: 250, y: 450 };
   
   // detectPlayersMap: Map<number, interface> = new Map<number, interface>();
   // detectPlayersMap ==> Map <playerID, IPlayerUpdatePack>
   
   // detectMobsMap: Map<number, interface> = new Map<number, interface>();
   // detectMobsMap ==> Map <mobID, IMobUpdatePack>

   detectVP: INumber = {
      height: 1280, // ==> 1080 +200
      width:  2120, // ==> 1920 +200
      // height: 600,  // Debug
      // width:  1000, // Debug
   }

   baseStats: INumber = {
      GcD:         Math.floor(this.meleeHitbox.damages.speed *this.Ag_Coeff.speed),

      health:      3000,
      mana:        2200,
      energy:      3500,

      regenHealth: 30,  // Per second
      regenMana:   70,  // Per second
      regenEnergy: 90,  // Per second
      energyCost:  70,  // Per second

      walkSpeed:   100, // Percent
      runSpeed:    200, // Percent
   };
   
   stats:     INumber = {
      GcD:         this.baseStats.GcD,

      health:      this.baseStats.health,
      mana:        this.baseStats.mana,
      energy:      this.baseStats.energy,

      regenHealth: this.Ag_SetRegenValue(this.baseStats.regenHealth),   // calc value per frame
      regenMana:   this.Ag_SetRegenValue(this.baseStats.regenMana),     // calc value per frame
      regenEnergy: this.Ag_SetRegenValue(this.baseStats.regenEnergy),   // calc value per frame

      walkSpeed:  Math.round(speedCoeff *this.baseStats.walkSpeed),
      runSpeed:   Math.round(speedCoeff *this.baseStats.runSpeed),
   };

   animSide: number = 1; // frameX   
   
   booleans: IBoolean = {
      isAttacking: false,
      isCasting:   false,
      isRespawn:   false,
      isDead:      false,
   };

   constructor(entity: IEntity) {
      super();

      this.name   = entity.playerName;
      this.userID = entity.userID;


      // this.detectPlayersList = {};
      // this.renderPlayersList = {};
      // this.detectMobsList    = {};
      // this.renderMobsList    = {};

      this.meleeHitbox = {
         position: {
            x: this.position.x,
            y: this.position.y,
            radius:  32,
         },

         offset: {
            x:  30,
            y:  45,
            sY: 10,
            ratio: 0.7,
         },

         damages: {
            speed:    0.6,  // (times) Lower ==> Faster
            base:     27,
            ratio:    0.62, // Higher => Higher RnG Range => More damage
            isAttack: false,
            isAnim:   false,
         },
      }

      this.spells = {
         heal: {
            base:   this.baseStats.health * 0.15, // ==> 15% from MaxHealth
            ratio:  0.57, // Higher => Higher RnG Range => More heals
            cost:   45,
            isCast: false,
            isAnim: false,
         },
      }
      
      this.fame = {
         getCost:    600,
         looseCost:  400,
         maxValue:   10000,
         tempValue:  0,
         stackValue: 0,
         value:      0,
         count:      0,
         fluidSpeed: 8,
      }

      this.respawn = {
         time:  1000 *20, // times
         range: 1000,
      }


      
      // ***** Need to recast *****
      this.moveAxis = {
         up:    false,
         down:  false,
         left:  false,
         right: false,
      }

      // Higher ==> faster
      this.fluidSpeed = {
         HUD:     1.5,
         miniBar: 1,
      }
      // ***** Need to recast *****


      
      this.score = {
         totalKills:   0,
         playersKills: 0,
         mobsKills:    0,
         deathCount:   0,
      }
      
      this.booleans = {
         isForeground: true,
         isCasting:    false,
         isRunning:    false,
         isRunnable:   false,
         isRespawned:  false,
         isDead:       false,
      }

      this.animStates = {
         idle: {
            id: 0,
            index: 2,
            spritesNumber: 30,
         },
      
         walk: {
            id: 1,
            index: 1,
            spritesNumber: 30,
         },
      
         run: {
            id: 2,
            index: 1,
            spritesNumber: 15,
         },
      
         attack: {
            id: 3,
            index: 1,
            spritesNumber: 15,
         },
      
         heal: {
            id: 4,
            index: 2,
            spritesNumber: 15,
         },
      
         died: {
            id: 5,
            index: 3,
            spritesNumber: 30,
         },
      }

      this.sprites = {
         height:  200,
         width:   200,
         offsetY: 12,
         radius:  this.position.radius,
      }
   }
   

   createDB() {

      const data = {
         userID:     this.userID,
         playerName: this.name,

         position:   JSON.stringify(this.position),
         moveSpeed:  JSON.stringify(this.moveSpeed),
         baseStats:  JSON.stringify(this.baseStats),
         stats:      JSON.stringify(this.stats),
         booleans:   JSON.stringify(this.booleans),
      }
      
      return savePlayerData("CreatePlayer", data);
   }

   updateDB() {
      
      const data = {
         userID:     this.userID,
         playerName: this.name,

         position:   JSON.stringify(this.position),
         stats:      JSON.stringify(this.stats),
         booleans:   JSON.stringify(this.booleans),
      }

      return savePlayerData("UpdatePlayer", data);
   }

   async syncWithDB() {

      const data: any = await getPlayerData({
         userID:     this.userID,
         playerName: this.name
      });
      
      this.id        = data.id;
      this.position  = data.position;
      this.moveSpeed = data.move_speed;
      this.baseStats = data.base_stats;
      this.stats     = data.stats;
      this.booleans  = data.booleans;
   }


   getDamage() {

      // Implement recast later
   }
}