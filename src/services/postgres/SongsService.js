const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }
  
  async addSong(payload) {
    const id = `song-${nanoid(12)}`;
    const { title, year, genre, performer, duration=null, albumId=null } = payload;
    
    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };
    
    const { rows, rowCount } = await this._pool.query(query);
    if (!rowCount) throw new InvariantError('Lagu gagal ditambahkan');
    
    return rows[0].id;
  }
  
  async getSongs(title='', performer='') {
    const query = {
      text: `SELECT id, title, performer FROM songs 
        WHERE title ILIKE $1 and performer ILIKE $2`,
      values: [`%${title}%`, `%${performer}%`],
    };
    
    const { rows } = await this._pool.query(query);
    
    return rows;
  }
  
  async getSongById(id) {
    try {
      const result = await this._cacheService.get(`song:${id}`);
      const song = JSON.parse(result);
      return { song, source: 'cache' };
    } catch (error) {
      const query = {
        text: 'SELECT * FROM songs WHERE id=$1',
        values: [id],
      };
      
      const { rows, rowCount } = await this._pool.query(query);
      if (!rowCount) {
        throw new NotFoundError('Lagu tidak ditemukan');
      }
      
      await this._cacheService.set(`song:${id}`, JSON.stringify(rows[0]));
      return { song: rows[0], source: 'dbserver' };
    }
  }
  
  async editSongById(id, payload) {
    const { title, year, genre, performer, duration, albumId } = payload;
    
    const query = {
      text: `UPDATE songs 
        SET title=$1, year=$2, genre=$3, performer=$4, duration=$5, album_id=$6
        WHERE id = $7 RETURNING id`,
      values: [title, year, genre, performer, duration, albumId, id],
    };
    
    const { rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu, id tidak ditemukan.');
    }
    
    await this._cacheService.delete(`song:${id}`);
  }
  
  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };
    
    const { rowCount } = await this._pool.query(query);
    
    if (!rowCount) {
      throw new NotFoundError('Lagu gagal dihapus, id tidak ditemukan.');
    }
    
    await this._cacheService.delete(`song:${id}`);
  }
}

module.exports = SongsService;
