
INSERT INTO players (
   user_id,
   name,
   position,
   move_speed,
   base_stats,
   stats,
   fame,
   score,
   spells_list,
   booleans,
   created_at
)

VALUES (
   '{{userID}}',
   '{{name}}',
   '{{{ position }}}',
   '{{{ moveSpeed }}}',
   '{{{ baseStats }}}',
   '{{{ stats }}}',
   '{}',
   '{}',
   '{}',
   '{{{ booleans }}}',
   CURRENT_TIMESTAMP
)

ON CONFLICT (name) DO NOTHING

RETURNING id;