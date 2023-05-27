
WITH selected_user AS (
  SELECT * FROM users WHERE id = '{{ userID }}'
)

UPDATE users SET is_connected = false
FROM selected_user WHERE users.id = selected_user.id

RETURNING selected_user.*;