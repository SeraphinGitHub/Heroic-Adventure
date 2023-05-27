
CREATE TABLE players (

   id             SERIAL PRIMARY KEY   UNIQUE NOT NULL,
   user_id        INT                         NOT NULL,
   name           VARCHAR(12)          UNIQUE NOT NULL,

   position       JSONB,
   move_speed     JSONB,
   base_stats     JSONB,
   stats          JSONB,
   fame           JSONB,
   score          JSONB,
   spells_list    JSONB,
   booleans       JSONB,
   is_connected   BOOLEAN                     NOT NULL,
   
   created_at     TIMESTAMP                   NOT NULL
);