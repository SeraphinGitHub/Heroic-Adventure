
import { SuperAgentTest, agent } from "supertest";
import { expect }                from "chai";
import { app }                   from "../../../_Server";
import { TestConstants }         from "../../../utils/_Constants.test";
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

      return await newAgent
      .get(`/player/page`)
      .set('Authorization', `Bearer ${loginReq.body.userToken}`);
   }

   
   it("Should return an array of data and a message", async () => {
      
      const response = await request();      
      let dataCheck: unknown;

      if(!response.body.characters) dataCheck = {
         message: "No character found !",
      }
      
      else dataCheck = {
         characters: [
            { name: "JohnWick"    },
            { name: "ChuckNorris" },
         ],
         message: "Success",
      }

      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal(dataCheck);
   });
});

export {};