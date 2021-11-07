
"use strict"

// const setBar = (color, maxValue, value) => {
//    return { 
//       color: color,
//       maxValue: maxValue,
//       value: value
//    }
// }

// const drawBar = (player) => {

//    // ctxUI.shadowColor = "black";
//    // ctxUI.shadowBlur = 6;
   
//    const barWidth = 250;
//    const barHeight = 18;

//    // Mana color on low mana
//    let manaColor = "deepskyblue";
//    if(player.mana < player.healCost) manaColor = "blue";
   
//    // Set up Bar
//    const healthBar = setBar("lime", player.baseHealth, player.health);
//    const manaBar   = setBar(manaColor, player.baseMana, player.mana);
//    const attackBar = setBar("red", player.GcD, player.speedGcD);
//    const energyBar = setBar("gold", player.baseEnergy, player.energy);
   
//    let gameBarArray = [
//       healthBar,
//       manaBar,
//       attackBar,
//       energyBar,
//    ];
   
//    let barGap = 0;
//    let topOffset = -110;

//    gameBarArray.forEach(bar => {
//       if(player.isDead) bar.value = 0;
//       new GameBar(ctxUI, 150, 150, -barWidth/2, topOffset + barGap, barWidth, barHeight, bar.color, bar.maxValue, bar.value).draw();
//       barGap += 20;
//    });
// }


// socket.on("newSituation", (data) => {
//    data.situation.forEach(player => {
      
//       if(player.id === data.id) drawBar(player);
//    });
// });