
import { SuperAgentTest, agent } from "supertest";
import { expect }                from "chai";
import { app }                   from "../../../_Server";
import { inputVar }              from "./_Constants.test"


describe("Test: /user/logout", () => {
   let newAgent: SuperAgentTest;

   before(() => {
      newAgent = agent(app);
   });
   
   
   it("Should log out User if exist", async () => {

      const logRequest = await newAgent.post(`/user/login`).send(inputVar.correct);
      const response   = await newAgent
      .post(`/user/logout`)
      .set('Authorization', `Bearer ${logRequest.body.token}`)
      .send();
      
      expect(response.status).to.equal(200);
   });

});

export {};