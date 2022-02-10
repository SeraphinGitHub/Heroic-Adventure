
"use strict"

// =====================================================================
// Map Settings
// =====================================================================
const initMap = () => {

   const mapSpriteSize = 256;
   const cellSize = 180;
   const columns = 12;
   const rows = 9;
   
   const mapScheme = [
      1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1,
      1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
      1, 2, 3, 3, 2, 3, 3, 2, 3, 3, 2, 1,
      1, 2, 3, 2, 2, 2, 2, 2, 2, 3, 2, 1,
      2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 2, 2,
      1, 2, 3, 2, 2, 2, 2, 2, 2, 3, 2, 1,
      1, 2, 3, 3, 2, 3, 3, 2, 3, 3, 2, 1,
      1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
      1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1,
   ];

   return {
      mapSpriteSize: mapSpriteSize,
      cellSize: cellSize,
      columns: columns,
      rows: rows,
      mapScheme: mapScheme,
   }
}

const mapSpecs = initMap();