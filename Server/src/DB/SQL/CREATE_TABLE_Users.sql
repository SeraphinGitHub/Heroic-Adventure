
CREATE TABLE users (

   id             SERIAL PRIMARY KEY   UNIQUE NOT NULL,
   name           VARCHAR(12)          UNIQUE NOT NULL,
   password       VARCHAR(255)                NOT NULL,
   friends_list   INT[],
   is_connected   BOOLEAN                     NOT NULL,

   created_at     TIMESTAMP                   NOT NULL
);