
import pg         from "pg";
import fs         from "fs";
import path       from "path";
import handlebars from "handlebars";
import dotenv     from "dotenv";
dotenv.config();

const pgClient: pg.Client = new pg.Client(process.env.DB_URL);

const tableCreation = () => {
   
   const tablesName: string[] = [
      "Users",
      "Players",
   ];

   tablesName.forEach(name => {

      DBexecute(__dirname, `CreateTable_${name}`)
      .then(() => console.log(`Table created ! ==> ${name}`))
      .catch((error) => {
         if(error.message.includes("already exists")) console.log(`Existing table : ${name}`);
         else console.log(`Could not create table : ${name} ==> ${error.message}`);
      });
   });
}

export const DBconnect = () => {

   pgClient.connect((error) => {
      if(error) throw error;
      else {
         console.log("");
         console.log("**************************************");
         console.log(`Connected to DataBase ==> ${process.env.DB_Type}`);
         console.log("**************************************");
         console.log("");
      }
   });

   tableCreation();
}

export const DBexecute = async (
   filePath: string,
   fileName: string,
   params?:  {},
) => {
   
   const reqPath: string = path.join(`${filePath}/SQL/`, `${fileName}.sql`);
   const reqStr:  string = fs.readFileSync(reqPath).toString();
   const request: string = handlebars.compile(reqStr)(params);

   const { rowCount, rows } = await pgClient.query(request);

   return {
      DB_Count: rowCount,
      DB_Data:  rows,
   }
}