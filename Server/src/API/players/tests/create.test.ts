
import { SuperAgentTest, agent } from "supertest";
import { expect }                from "chai";
import { app }                   from "../../../_Server";
import { DBexecute }             from "../../../DB/DataBase";
import { TestConstants }         from "../../../utils/_Constants.test";

const { user_API: auth, player_API: varTest } = TestConstants;

describe("Test: /player/create", () => {
   let newAgent: SuperAgentTest;

   before(() => {
      newAgent = agent(app);
   });
   
   const request = async (data: any) => {

      const loginReq = await newAgent
      .post(`/user/login`)
      .send(auth.correct);

      return await newAgent
      .post(`/player/create`)
      .set('Authorization', `Bearer ${loginReq.body.token}`)
      .send(data);
   }
   

   // "Should create player if not exist"
   varTest.correct.forEach(name => {
      
      it("Should create player if not exist", async () => {
         await DBexecute(__dirname, "DeletePlayer", { playerName: name });

         const response = await request({ playerName: name });
         expect(response.status).to.equal(200);
      });
   });

   // "Should fail to create player if already exist"
   varTest.correct.forEach(name => {
      
      it("Should fail to create player if already exist", async () => {
         const response = await request({ playerName: name });
         expect(response.status).to.equal(500);
         
         if(name === "JohnWick" || name == "ChuckNorris") return;

         await DBexecute(__dirname, "DeletePlayer", { playerName: name });
      });
   });

   // "Should fail to create player with wrong input"
   varTest.wrong.forEach(name => {
      
      it("Should fail to create player with wrong input", async () => {

         const response = await request({ playerName: name });
         expect(response.status).to.equal(500);
      });
   });
});

export {};