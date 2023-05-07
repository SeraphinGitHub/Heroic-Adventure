
-- UPDATE players SET name = '{{userName}}' WHERE id = '{{userID}}'
-- SELECT id FROM players WHERE name = 'Séraphin'

WITH update_user AS (
   UPDATE players SET name = '{{userName}}' WHERE id = '{{userID}}' RETURNING id, name
)
SELECT id FROM update_user WHERE name = 'Arthur';
