
CREATE TABLE users (

   id           SERIAL PRIMARY KEY  UNIQUE NOT NULL,
   name         VARCHAR(12)         UNIQUE NOT NULL,
   password     VARCHAR(255)                NOT NULL,
   friendsList  INT[],

   created_At   TIMESTAMP                  NOT NULL
);