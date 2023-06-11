const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }
  
  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };
    
    const { rows } = await this._pool.query(query);
    if (!rows[0].id) {
      throw new InvariantError('album gagal ditambahkan');
    }
    
    return rows[0].id;
  }
  
  async getAlbumById(id) {
    const query = {
      text: `SELECT 
        albums.id,
        albums.name,
        albums.year,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', songs.id, 
              'title', songs.title,
              'performer', songs.performer
            ) ORDER BY songs.title ASC
          ) FILTER (WHERE songs.id IS NOT NULL), '[]'
        ) AS songs
      FROM albums
      LEFT JOIN songs ON albums.id = songs.album_id
      WHERE albums.id = $1 
      GROUP BY albums.id`,
      values: [id],
    };
    
    const { rows, rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('gagal mendapatkan album,id tidak ditemukan.');
    }
    return rows[0];
  }
  
  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name=$1, year=$2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };
    
    const { rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('gagal memperbarui album, id tidak ditemukan.');
    }
  }
  
  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id=$1 RETURNING id',
      values: [id],
    };
    
    const { rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('album gagal dihapus, Id tidak ditemukan.');
    }
  }
}

module.exports = AlbumsService;
