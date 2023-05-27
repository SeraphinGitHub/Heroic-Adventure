
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
   is_connected,
   created_at
)

VALUES (
   '{{ userID }}',
   '{{ playerName }}',
   '{{{ position }}}',
   '{{{ moveSpeed }}}',
   '{{{ baseStats }}}',
   '{{{ stats }}}',
   '{}',
   '{}',
   '{}',
   '{{{ booleans }}}',
   false,
   CURRENT_TIMESTAMP
)

ON CONFLICT (name) DO NOTHING;