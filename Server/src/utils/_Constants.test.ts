
export const TestConstants = {

   user_API: {
      correct: {
         userName:       "TestUser",
         password:       "Azerty1234",
         verifyUserName: "TestUser",
         verifyPassword: "Azerty1234"
      },
      
      wrongSignin: [
         ["",         "Azerty1234", "TestUser", "Azerty1234"],
         ["TestUser", "",           "TestUser", "Azerty1234"],
         ["TestUser", "Azerty1234", "",         "Azerty1234"],
         ["TestUser", "Azerty1234", "TestUser", ""          ],
         ["<script>", "Azerty1234", "TestUser", "Azerty1234"],
         ["TestUser", "<script>",   "TestUser", "Azerty1234"],
         ["Test__er", "Azerty1234", "TestUser", "Azerty1234"],
         ["TestUser", "Azerty0000", "TestUser", "Azerty1234"],
         ["NewUser",  "Azerty1234", "TestUser", "Azerty1234"],
         ["VeryLongUserName", "Azerty1234",  "VeryLongUserName", "Azerty1234"],
      ],
   
      wrongLogin: [
         ["",         "Azerty1234"],
         ["TestUser", ""          ],
         ["<script>", "Azerty1234"],
         ["TestUser", "<script>"  ],
         ["Test__er", "Azerty1234"],
         ["VeryLongUserName", "Azerty1234"],
      ],
   
      setInputFields: (set: string[]) => {
         return {
            userName:       set[0],
            password:       set[1],
            verifyUserName: set[2],
            verifyPassword: set[3]
         };
      }
   },

   player_API: {
      correct: [
         "JohnWick",
         "ChuckNorris",
         "Insomnium",
         "AleStorm",
         "Belakor",
         "ArchEnemy",
      ],
   
      wrong: [
         "",
         "Inso mnium",
         "Ale_Storm",
         "Be'lakor",
         "Arch 8nemy",
      ],
   },

}