
"use strict"

// =====================================================================
// Image Files
// =====================================================================
const imgFiles = () => {
   
   const gameUI = new Image();
   gameUI.src = "client/images/playerUI/Game UI.png";
   
   const player = new Image();
   player.src = "client/images/playerAnim/playerAnim_x4.png";

   const mapTile = new Image();
   mapTile.src = "client/images/map/Map Tiles.png";

   return {
      gameUI: gameUI,
      player: player,
      mapTile: mapTile,
   }
}

const ImgFiles = imgFiles();


// =====================================================================
// Floating Text
// =====================================================================
let FloatTextArray = [];

const initFloatingText = (playerPos, textObj) => {
      
   const newText = new FloatingText(
      ctx.player,
      playerPos.x -viewport.x,
      playerPos.y -viewport.y,
      textObj.x,
      textObj.y,
      textObj.size,
      textObj.color,
      textObj.value
   );
   
   FloatTextArray.push(newText);
}

const drawFloatingText = () => {

   FloatTextArray.forEach(text => {
      text.drawText();
      if(text.displayDuration <= 0) removeIndex(FloatTextArray, text);
   });
}


// =====================================================================
// Fluidity for Game Bars
// =====================================================================
let FluidBarArray = [];

const initFluidBar = (barSpecs) => {
      
   const newFluidBar = new Fluidity(ctx.UI, ImgFiles.gameUI, barSpecs);
   FluidBarArray.push(newFluidBar);
}

const drawFluidBar = () => {
   
   FluidBarArray.forEach(fluidBar => {
      if(fluidBar.stateStr === "getFame") fluidBar.getFameFluid();
      if(fluidBar.stateStr === "looseFame") fluidBar.looseFameFluid();
      if(fluidBar.stateStr === "getHealth") fluidBar.getHealthFluid();
      if(fluidBar.stateStr === "looseHealth") fluidBar.looseHealthFluid();
      if(fluidBar.stateStr === "looseMana") fluidBar.looseManaFluid();
      
      if(fluidBar.fluidDuration <= 0) removeIndex(FluidBarArray, fluidBar);
   });
}


// =====================================================================
// Fame Bar
// =====================================================================
const Fame = {

   position: {
      x: viewport.width/2 - viewport.Fame.width *viewport.Fame.scaleX /2,
      y: viewport.Fame.offsetY,
      width: viewport.Fame.width *viewport.Fame.scaleX,
      height: 53 *viewport.Fame.scaleY,
   },

   offset: {
      x: 32,
      y: 19,
      width: 65,
      height: 27,
   },

   countOffset: {
      x: -20,
      y: 80,
   },
}

// Frame & Backgroud
const FAME_DrawFrame = () => {

   // Background
   ctx.fixedBack.drawImage(
      ImgFiles.gameUI,
      522, 477, 26, 48,
      Fame.position.x + (Fame.offset.x *viewport.Fame.scaleX),
      Fame.position.y + Fame.offset.y,
      Fame.position.width - (Fame.offset.width *viewport.Fame.scaleX),
      Fame.position.height - Fame.offset.height
   );

   // Fame Sprite
   ctx.fixedFront.drawImage(
      ImgFiles.gameUI,
      794, 7, 1701, 87,
      Fame.position.x,
      Fame.position.y,
      Fame.position.width,
      Fame.position.height
   );
}

// FameBar
const FAME_DrawBar = (eventPack) => {
   
   let fameBarWidth = Math.floor(
      (eventPack.fameValue /eventPack.baseFame) * (Fame.position.width - (Fame.offset.width * viewport.Fame.scaleX))
   );

   // Fame Bar
   ctx.fixedUI.drawImage(
      ImgFiles.gameUI,
      522, 529, 26, 48,
      Fame.position.x + (32 * viewport.Fame.scaleX),
      Fame.position.y + 19,
      fameBarWidth,
      Fame.position.height - 27
   );
}

// Count Number
const FAME_DrawCount = (eventPack) => {

   // Fame Count   
   ctx.fixedUI.fillStyle = "darkviolet";
   ctx.fixedUI.font = "40px Dimbo-Regular";
   ctx.fixedUI.fillText(
      eventPack.fameCount,
      Fame.position.x +Fame.position.width +Fame.countOffset.x,
      Fame.position.y +Fame.countOffset.y
   );
   ctx.fixedUI.strokeText(
      eventPack.fameCount,
      Fame.position.x +Fame.position.width +Fame.countOffset.x,
      Fame.position.y +Fame.countOffset.y
   );
}


// =====================================================================
// HUD
// =====================================================================
const HUD = {
   
   position: {
      x: viewport.width/2 - viewport.HUD.width *viewport.HUD.scaleX /2,
      y: viewport.height -110 *viewport.HUD.scaleY +viewport.HUD.offsetY,
      width: viewport.HUD.width *viewport.HUD.scaleX,
      height: 100 *viewport.HUD.scaleY,
   },

   mana: {
      x: 82,
      y: 10,
      width: 165,
      height: 8,
   },

   health: {
      x: 15,
      y: 39,
      width: 30,
      height: 9,
   },

   energy: {
      x: 82,
      y: 65,
      width: 165,
      height: 8,
   },

   flashing: {
      frame: 0,
      speed: 6,      // Lower ==> faster
      minRatio: 0.3, // Min Health before flash (%)
   }
}

// Template Bar
const HUD_BaseBar = (sx, sy, sw, sh, ratio, offset)  => {
   
   let barWidth = Math.floor(
      (HUD.position.width - (offset.width * viewport.HUD.scaleX) ) *ratio
   );

   ctx.UI.drawImage(
      ImgFiles.gameUI,
      sx, sy, sw *ratio, sh,
      HUD.position.x + (offset.x * viewport.HUD.scaleX),
      HUD.position.y + (offset.y * viewport.HUD.scaleY),
      barWidth,
      HUD.position.height/3 - (offset.height * viewport.HUD.scaleY)
   );
}

// Frame & Backgroud
const HUD_DrawFrame = () => {

   ctx.fixedFront.shadowBlur = "2";
   ctx.fixedFront.shadowColor = "black";

   // Background
   ctx.fixedBack.drawImage(
      ImgFiles.gameUI,
      5, 181, 729, 141,
      HUD.position.x + (15 * viewport.HUD.scaleX),     // Pos X
      HUD.position.y + (10 * viewport.HUD.scaleY),     // Pos Y
      HUD.position.width - (30 * viewport.HUD.scaleX), // Width
      HUD.position.height - (20 * viewport.HUD.scaleY) // Height
   );

   // HUD Sprite
   ctx.fixedFront.drawImage(
      ImgFiles.gameUI,
      5, 4, 782, 173,
      HUD.position.x,
      HUD.position.y,
      HUD.position.width,
      HUD.position.height
   );
}

// Mana Bar
const HUD_DrawMana = (initPack, updatePlayer) => {
   
   let manaRatio = updatePlayer.mana / initPack.baseMana;
   
   // Still Castable Mana
   if(updatePlayer.mana >= initPack.healCost) HUD_BaseBar(
      6, 528, 460, 47,
      manaRatio,
      HUD.mana
   );
   
   // Low Mana
   else HUD_BaseBar(
      5, 475, 461, 47,
      manaRatio,
      HUD.mana
   ); 
}

// Health Bar
const HUD_DrawHealth = (initPack, updatePlayer) => {

   let healthRatio = updatePlayer.health /initPack.baseHealth;

   // if Health Over 30% ==> Normal Bar
   if(updatePlayer.health > initPack.baseHealth * HUD.flashing.minRatio) HUD_BaseBar(
      5, 327, 729, 45,
      healthRatio,
      HUD.health
   );

   // if Health Under 30% ==> Flashing Bar
   else {
      HUD_BaseBar(
         6, 424, 729, 45,
         healthRatio,
         HUD.health
      );

      HUD.flashing.frame++;

      if(HUD.flashing.frame > HUD.flashing.speed) {

         // Normal Bar
         HUD_BaseBar(
            5, 327, 729, 45,
            healthRatio,
            HUD.health
         );
      }

      if(HUD.flashing.frame > HUD.flashing.speed *2) HUD.flashing.frame = 0;
   }
}

// Energy Bar
const HUD_DrawEnergy = (initPack, updatePlayer) => {
   
   let energyRatio = updatePlayer.energy / initPack.baseEnergy;

   // Yellow Bar
   HUD_BaseBar(
      6, 582, 460, 46,
      energyRatio,
      HUD.energy
   );
}


// =====================================================================
// Init Game UI
// =====================================================================
const initGameUI = (socket) => {

   FAME_DrawFrame();
   HUD_DrawFrame();
   
   const mainTexSize = 42;

   // Fame Event
   socket.on("fameEvent", (eventPack) => {
      ctx.fixedUI.clearRect(0, 0, viewport.width, viewport.height);

      FAME_DrawBar(eventPack);
      FAME_DrawCount(eventPack);
   });

   socket.on("getFame", (playerPos, serverFame) => {
      
      initFloatingText(
         playerPos,
         {
            x: 0,
            y: 180,
            size: mainTexSize *1.2,
            color: "darkviolet",
            value: `+${serverFame.fameCost} Fame`,
         }
      );
      
      initFluidBar({
         stateStr: "getFame",
         scaleX: viewport.Fame.scaleX,
         position: Fame.position,
         offset: Fame.offset,
         baseStat: serverFame.baseFame,
         stat: serverFame.fameValue,
         calcStat: serverFame.fameCost,
         statFluidValue: 0,
         isFameReseted: false,
         fame: serverFame.fame,
         fameCount: serverFame.fameCount,
         fluidSpeed: serverFame.fluidSpeed,
      });
   });
   
   socket.on("looseFame", (playerPos, serverFame) => {

      initFloatingText(
         playerPos,
         {
            x: 0,
            y: 180,
            size: mainTexSize *1.2,
            color: "red",
            value: `-${serverFame.fameCost} Fame`,
         }
      );

      initFluidBar({
         stateStr: "looseFame",
         scaleX: viewport.Fame.scaleX,
         position: Fame.position,
         offset: Fame.offset,
         baseStat: serverFame.baseFame,
         stat: serverFame.fameValue,
         calcStat: serverFame.fameCost,
         statFluidValue: serverFame.fameCost,
         isFameReseted: false,
         fame: serverFame.fame,
         fameCount: serverFame.fameCount,
         fluidSpeed: serverFame.fluidSpeed,
      });
   });


   // Mana Event
   socket.on("looseMana", (serverMana) => {

      initFluidBar({
         stateStr: "looseMana",
         scaleX: viewport.HUD.scaleX,
         scaleY: viewport.HUD.scaleY,
         position: HUD.position,
         offset: HUD.mana,
         baseStat: serverMana.baseMana,
         stat: serverMana.mana,
         calcStat: serverMana.calcManaCost,
         statFluidValue: serverMana.calcManaCost,
         fluidSpeed: serverMana.fluidSpeed,
      });
   });


   // Health Event
   socket.on("getHeal", (playerPos, serverHealing) => {

      initFloatingText(
         playerPos,
         {
            x: -5,
            y: -75,
            size: mainTexSize,
            color: "lime",
            value: `+${serverHealing.calcHealing}`,
         }
      );

      initFluidBar({
         stateStr: "getHealth",
         scaleX: viewport.HUD.scaleX,
         scaleY: viewport.HUD.scaleY,
         position: HUD.position,
         offset: HUD.health,
         baseStat: serverHealing.baseHealth,
         stat: serverHealing.health,
         calcStat: serverHealing.calcHealing,
         statFluidValue: serverHealing.calcHealing,
         fluidSpeed: serverHealing.fluidSpeed,
      });
   });

   socket.on("giveDamage", (playerPos, calcDamage) => {

      initFloatingText(
         playerPos,
         {
            x: -5,
            y: -100,
            size: mainTexSize,
            color: "yellow",
            value: `-${calcDamage}`,
         }
      );
   });

   socket.on("getDamage", (playerPos, serverDamage) => {

      initFloatingText(
         playerPos,
         {
            x: -5,
            y: -85,
            size: mainTexSize,
            color: "red",
            value: `-${serverDamage.calcDamage}`,
         }
      );

      initFluidBar({
         stateStr: "looseHealth",
         scaleX: viewport.HUD.scaleX,
         scaleY: viewport.HUD.scaleY,
         position: HUD.position,
         offset: HUD.health,
         baseStat: serverDamage.baseHealth,
         stat: serverDamage.health,
         calcStat: serverDamage.calcDamage,
         statFluidValue: serverDamage.calcDamage,
         fluidSpeed: serverDamage.fluidSpeed,
      });
   });
}