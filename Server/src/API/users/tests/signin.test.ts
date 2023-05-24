
import {
   ISignin,
} from "../../../utils/interfaces";

import { DBexecute }             from "../../../DB/DataBase";
import { SuperAgentTest, agent } from "supertest";
import { expect }                from "chai";
import { app }                   from "../../../_Server";
import { TestConstants }         from "../../../utils/_Constants.test";

const { user_API: varTest } = TestConstants;


describe("Test: /user/signin", () => {
   let newAgent: SuperAgentTest;

   before(async () => {
      newAgent = agent(app);
      await DBexecute(__dirname, "DeleteUser", { userName: varTest.correct.userName });
   });

   const request = async (data: ISignin) => {
      return await newAgent
      .post(`/user/signin`)
      .send(data);
   }
   
   
   it("Should create User if not exist", async () => {
      const response = await request(varTest.correct);
      expect(response.status).to.equal(200);
   });

   it("Should fail to create User if already exist", async () => {
      const response = await request(varTest.correct);
      expect(response.status).to.equal(500);
   });

   // "Should fail to create User if wrong input fields"
   varTest.wrongSignin.forEach(set => {
      const data = varTest.setInputFields(set);
      
      it("Should fail to create User if wrong input fields", async () => {

         const response = await newAgent
         .post(`/user/signin`)
         .send(data);

         expect(response.status).to.equal(500);
      });
   });

});

export {};