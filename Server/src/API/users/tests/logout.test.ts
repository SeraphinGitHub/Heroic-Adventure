
import { SuperAgentTest, agent } from "supertest";
import { expect }                from "chai";
import { app }                   from "../../../_Server";
import { TestConstants }         from "../../../utils/_Constants.test";

const { user_API: varTest } = TestConstants;


describe("Test: /user/logout", () => {
   let newAgent: SuperAgentTest;

   before(() => {
      newAgent = agent(app);
   });
   
   const request = async (tokenTest?: string) => {

      const loginReq = await newAgent
      .post(`/user/login`)
      .send(varTest.correct);

      let token: string = loginReq.body.token;

      if(tokenTest !== undefined) token = tokenTest;

      return await newAgent
      .post(`/user/logout`)
      .set('Authorization', `Bearer ${token}`)
      .send();
   }

   
   it("Should log out User if exist with valid token", async () => {
      const response = await request();
      expect(response.status).to.equal(200);
   });

   it("Should fail to logout if exist with empty token", async () => {
      const response = await request("");
      expect(response.status).to.equal(500);
   });

   it("Should fail to logout if exist with invalid token", async () => {
      const response = await request("$_invalid_token_$");
      expect(response.status).to.equal(500);
   });

});

export {};