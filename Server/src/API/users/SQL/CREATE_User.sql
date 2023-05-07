
INSERT INTO users (name, password, friendsList, created_at)
VALUES (
   '{{userName}}',
   '{{hashPassword}}',
   '{}',
   CURRENT_TIMESTAMP
)