
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
   
   
   it("Should log out User if exist", async () => {
      const loginReq = await newAgent.post(`/user/login`).send(varTest.correct);

      const response = await newAgent
      .post(`/user/logout`)
      .set('Authorization', `Bearer ${loginReq.body.token}`)
      .send();
      
      expect(response.status).to.equal(200);
   });

   it("Should fail to logout with empty token", async () => {
      await newAgent.post(`/user/login`).send(varTest.correct);

      const response = await newAgent
      .post(`/user/logout`)
      .set('Authorization', `Bearer `)
      .send();
      
      expect(response.status).to.equal(500);
   });

   it("Should fail to logout with invalid token", async () => {
      await newAgent.post(`/user/login`).send(varTest.correct);

      const response = await newAgent
      .post(`/user/logout`)
      .set('Authorization', `Bearer $_invalid_token_$`)
      .send();
      
      expect(response.status).to.equal(500);
   });

});

export {};