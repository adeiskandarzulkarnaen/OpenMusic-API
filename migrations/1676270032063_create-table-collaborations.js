/* eslint-disable camelcase, max-len */

exports.up = (pgm) => {
  pgm.createTable('collaborations', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'playlists',
      referencesConstraintName: 'fk_collaborations.playlist_id:playlists.id',
      onDelete: 'cascade',
      onUpdate: 'cascade',
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users',
      referencesConstraintName: 'fk_collaborations.user_id:users.id',
      onDelete: 'cascade',
      onUpdate: 'cascade',
    },
  });

  // memberikan constraint UNIQUE, kombinasi dari kolom playlist_id dan user_id. Guna menghindari duplikasi data antara nilai keduanya.
  pgm.addConstraint('collaborations', 'unique_playlist_id_and_user_id', 'UNIQUE(playlist_id, user_id)');
};

exports.down = (pgm) => {
  pgm.dropTable('collaborations');
};
