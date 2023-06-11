const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }
  
  async addPlaylist(name, owner) {
    try {
      const id = `playlist-${nanoid(16)}`;
      
      const query = {
        text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
        values: [id, name, owner],
      };
      
      const { rows } = await this._pool.query(query);
      return rows[0].id;
    } catch {
      throw new InvariantError('Playlist Gagal ditambahkan');
    }
  }
  
  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
        LEFT JOIN users ON playlists.owner = users.id
        LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
        WHERE playlists.owner = $1 OR collaborations.user_id = $1;`,
      values: [owner],
    };
    
    const { rows } = await this._pool.query(query);
    return rows;
  }
  
  async deletePlaylistById(id) {
    await this.deletePlaylistActivity(id);
    
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };
    
    const { rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }
  
  /* Song to Playlist */
  
  async addSongToPlaylist(playlistId, songId) {
    await this.verifyNewSongInPlaylist(playlistId, songId);
    try {
      const id = `ply-song-${nanoid(16)}`;
      const query = {
        text: `INSERT INTO playlist_songs VALUES($1, $2, $3)`,
        values: [id, playlistId, songId],
      };
      await this._pool.query(query);
    } catch {
      throw new NotFoundError('lagu tidak ditemukan.');
    }
  }
  
  async getSongsFromPlaylist(playlistId) {
    const query = {
      text: `
        SELECT 
          playlists.id, 
          playlists.name, 
          users.username, 
          ARRAY_AGG(
            JSON_BUILD_OBJECT(
              'id', songs.id ,
              'title', songs.title,
              'performer', songs.performer
            )
            ORDER BY songs.title ASC
          ) songs
        FROM playlist_songs
        INNER JOIN playlists ON playlist_songs.playlist_id = playlists.id
        INNER JOIN users ON playlists.owner = users.id
        INNER JOIN songs ON playlist_songs.song_id = songs.id
        WHERE playlist_id = $1
        GROUP BY playlists.id, users.username`,
      values: [playlistId],
    };
    
    const { rows } = await this._pool.query(query);
    return rows[0];
  }
  
  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: `DELETE FROM playlist_songs 
      WHERE playlist_id = $1 AND song_id = $2 RETURNING id`,
      values: [playlistId, songId],
    };
    
    const { rowCount } = await this._pool.query(query);
    
    if (!rowCount) throw new NotFoundError('lagu tidak ditemukan');
  }
  
  /* activity */
  
  async addPlaylistActivity({ playlistId, songId, userId, action }) {
    const id = `activity-${Date.now()}`;
    const createdAt = new Date().toISOString();
    
    const query = {
      text: `INSERT INTO playlist_song_activities 
        VALUES($1, $2, $3, $4, $5, $6)`,
      values: [id, playlistId, songId, userId, action, createdAt],
    };
    
    await this._pool.query(query);
  }
  
  async getPlaylistActivities(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title, action, time 
        FROM playlist_song_activities
        INNER JOIN users ON playlist_song_activities.user_id = users.id
        INNER JOIN songs ON playlist_song_activities.song_id = songs.id
        WHERE playlist_id = $1 `,
      values: [playlistId],
    };
    
    const { rows, rowCount } = await this._pool.query(query);
    if (!rowCount) throw new NotFoundError('Playlist Activity tidak ditemukan');
    
    return rows;
  };
  
  async deletePlaylistActivity(playlistId) {
    const query = {
      text: `DELETE FROM playlist_song_activities WHERE playlist_id = $1`,
      values: [playlistId],
    };
    
    await this._pool.query(query);
  }
  
  /* verification */
  
  async verifyNewSongInPlaylist(playlistId, songId) {
    const query = {
      text: `SELECT song_id FROM playlist_songs 
        WHERE playlist_id = $1 AND song_id = $2`,
      values: [playlistId, songId],
    };
    
    const { rowCount } = await this._pool.query(query);
    
    if (rowCount) throw new InvariantError('lagu sudah ada di playlist.');
  }
  
  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    
    const { rows, rowCount } = await this._pool.query(query);
    if (!rowCount) throw new NotFoundError('playlist tidak ditemukan');
     
    
    const playlist = rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('anda tidak berhak mengakses resource ini');
    }
  }
  
  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
};

module.exports = PlaylistsService;
