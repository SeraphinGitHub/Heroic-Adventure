
import { SuperAgentTest, agent } from "supertest";
import { expect }                from "chai";
import { app }                   from "../../../_Server";
import { DBexecute }             from "../../../DB/DataBase";
import { TestConstants }         from "../../../utils/_Constants.test";
import jwt                       from "jsonwebtoken";
import dotenv                    from "dotenv";
dotenv.config();

const { user_API: auth } = TestConstants;


describe("Test: /player/page", () => {
   let newAgent: SuperAgentTest;

   before(() => {
      newAgent = agent(app);
   });

   const request = async () => {

      const loginReq = await newAgent
      .post(`/user/login`)
      .send(auth.correct);

      const testReq = await newAgent
      .get(`/player/page`)
      .set('Authorization', `Bearer ${loginReq.body.token}`);

      const { userID }: any = jwt.verify(loginReq.body.token, process.env.SECURITY_TOKEN!);

      return {
         userID,
         response: testReq,
      }
   }

   
   it("Should return an array and a message", async () => {
      
      const { response, userID } = await request();
      const { DB_GetAll }: any   = await DBexecute(__dirname, "GetAllPlayersID", { userID });
      
      let dataCheck: unknown;

      if(!response.body.data) dataCheck = {
         message: "No character found !",
      }
      
      else dataCheck = {
         data: [
            { id: DB_GetAll[0].id, name: "JohnWick"    },
            { id: DB_GetAll[1].id, name: "ChuckNorris" },
         ],
         message: "Success",
      }

      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal(dataCheck);
   });
});

export {};