
import { SuperAgentTest, agent } from "supertest";
import { expect }                from "chai";
import { app }                   from "../../../_Server";


describe("Test: /player/page", () => {
   let newAgent: SuperAgentTest;

   before(() => {
      newAgent = agent(app);
   });

   const request = async () => {
      return await newAgent.get(`/player/page`);
   }


   
   // it.only("Should .........", async () => {
   //    const response = await request();
   //    expect(response.status).to.equal(200);
   //    // expect(response.body.token).to.exist;
   // });
});

export {};