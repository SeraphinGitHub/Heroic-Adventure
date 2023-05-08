
INSERT INTO users (
   name,
   password,
   friends_list,
   is_connected,
   created_at
)

VALUES (
   '{{userName}}',
   '{{hashPsw}}',
   '{}',
   FALSE,
   CURRENT_TIMESTAMP
)

ON CONFLICT (name) DO NOTHING;