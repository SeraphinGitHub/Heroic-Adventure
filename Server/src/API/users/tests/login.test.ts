
import {
   ILogin
} from "../../../utils/interfaces";

import { SuperAgentTest, agent } from "supertest";
import { expect }                from "chai";
import { app }                   from "../../../_Server";
import { inputVar }              from "./_Constants.test"


describe("Test: /user/login", () => {
   let newAgent: SuperAgentTest;

   before(() => {
      newAgent = agent(app);
   });

   const request = async (data: ILogin) => {
      return await newAgent.post(`/user/login`).send(data);
   }


   
   it("Should log User if exist & return a token", async () => {
      const response = await request(inputVar.correct);
      expect(response.status).to.equal(200);
      expect(response.body.token).to.exist;
   });

   it("Should fail to log User if not exist", async () => {
      
      const fakeUser = {
         userName:       "FakeUser",
         password:       "NotExist1234",
         verifyUserName: "FakeUser",
         verifyPassword: "NotExist1234"
      }

      const response = await request(fakeUser);
      expect(response.status).to.equal(400);
   });

   // "Should fail to log User if wrong input fields"
   inputVar.wrongLogin.forEach(set => {
      const data = inputVar.setInputFields(set);
      
      it("Should fail to log User if wrong input fields", async () => {

         const response = await newAgent
         .post(`/user/login`)
         .send(data);

         expect(response.status).to.equal(500);
      });
   });

});

export {};