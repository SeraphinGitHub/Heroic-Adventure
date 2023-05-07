
CREATE TABLE players (

   id           SERIAL PRIMARY KEY  UNIQUE NOT NULL,
   userID       INT                        NOT NULL,
   name         VARCHAR(12)         UNIQUE NOT NULL,

   position     JSONB[],
   moveSpeed    JSONB[],
   baseStats    JSONB[],
   stats        JSONB[],
   fame         JSONB[],
   score        JSONB[],
   spellsList   JSONB[],
   booleans     JSONB[],

   created_At   TIMESTAMP                  NOT NULL
);