
WITH selected_user AS (
  SELECT * FROM users WHERE name = '{{userName}}'
)

UPDATE users SET is_connected = true
FROM selected_user WHERE users.name = selected_user.name

RETURNING selected_user.*;