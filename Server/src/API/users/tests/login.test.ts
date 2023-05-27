
import {
   ILogin
} from "../../../utils/interfaces";

import { SuperAgentTest, agent } from "supertest";
import { expect }                from "chai";
import { app }                   from "../../../_Server";
import { TestConstants }         from "../../../utils/_Constants.test";

const { user_API: varTest } = TestConstants;


describe("Test: /user/login", () => {
   let newAgent: SuperAgentTest;

   before(() => {
      newAgent = agent(app);
   });

   const request = async (data: ILogin) => {
      
      return await newAgent
      .post(`/user/login`)
      .send(data);
   }

   
   it("Should log User if exist & return a token", async () => {
      const response = await request(varTest.correct);
      expect(response.status).to.equal(200);
      expect(response.body.userToken).to.exist;
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
   varTest.wrongLogin.forEach(set => {
      const data = varTest.setInputFields(set);
      
      it("Should fail to log User if wrong input fields", async () => {

         const response = await newAgent
         .post(`/user/login`)
         .send(data);

         expect(response.status).to.equal(500);
      });
   });

});

export {};