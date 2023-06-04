
import {
   IBoolean,
   IEntity,
   INumber,
   IPosition,
} from "../utils/interfaces";

import {
   savePlayerData,
   getPlayerData,
} from "../API/players/accessDB";


// =====================================================================
// Player Class
// =====================================================================
export class PlayerClass {

   id:        number | undefined = undefined;
   userID:    number;
   name:      string;
   radius:    number  = 45;

   position:  IPosition = { x: 250, y: 450 };
   
   moveSpeed: INumber = {
      walkSpeed: 100,
      runSpeed:  200,
   };

   baseStats: INumber = {
      health: 3000,
      mana:   2500,
      energy: 3300,
   };

   stats:     INumber = {
      health: this.baseStats.health,
      mana:   this.baseStats.mana,
      energy: this.baseStats.energy,
   };

   booleans: IBoolean = {
      isDead:      false,
      isRespawn:   false,
      isAttacking: false,
      isCasting:   false,
   };


   constructor(entity: IEntity) {
      this.name   = entity.playerName;
      this.userID = entity.userID;
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
   // getDamage(enemy, socket, damages, killerSocket) {

      // this.stats.health -= damages;

      // const damagPack = {
      //    baseHealth:  this.baseStats.health,
      //    health:      this.stats.health,
      //    damageValue: damages,
      //    fluidSpeed:  this.fluidSpeed.HUD,
      // }

      // socket.emit("getDamage", this.position, damagPack);
      // if(killerSocket) killerSocket.emit("giveDamage", this.position, damages);

      // if(this.stats.health <= 0) this.death(socket, enemy, killerSocket);
   }
}