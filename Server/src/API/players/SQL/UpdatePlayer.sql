
UPDATE players SET
   
   position  = '{{{ position  }}}',
   stats     = '{{{ stats     }}}',
   booleans  = '{{{ booleans  }}}'

WHERE id = '{{ playerID }}' AND user_id = '{{ userID }}';