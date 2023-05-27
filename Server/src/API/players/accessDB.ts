
import { DBexecute } from "../../DB/DataBase";


export const savePlayerData = async (
   fileSQL:    string,
   data:       any,
) => {

   const { DB_Count }: any = await DBexecute(__dirname, fileSQL, data);

   if(DB_Count === 0) return false;

   return true;
}

export const getPlayerData = async (
   data: any,
) => {

   const { DB_Count, DB_Row }: any = await DBexecute(__dirname, "GetPlayer", data);

   if(DB_Count === 0) return undefined;

   return DB_Row[0];
}