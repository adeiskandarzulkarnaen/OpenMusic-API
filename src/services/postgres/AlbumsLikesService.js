const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class AlbumsLikesService {
  constructor(cacheService) {
    this._pool = new Pool;
    this._cacheService = cacheService;
  }
  
  async verifyAlbumLike(userId, albumId) {
    const query = {
      text: `SELECT * FROM user_album_likes 
        WHERE user_id = $1 AND album_id = $2`,
      values: [userId, albumId],
    };
    
    const { rowCount } = await this._pool.query(query);
    return rowCount;
  }
  
  async addAlbumLike(userId, albumId) {
    const albumLiked = await this.verifyAlbumLike(userId, albumId);
    if (albumLiked) throw new InvariantError('Album sudah anda sukai');
    
    const id = `like-${nanoid(16)}`;
    
    const query = {
      text: `INSERT INTO user_album_likes VALUES($1, $2, $3)`,
      values: [id, userId, albumId],
    };
    
    await this._pool.query(query);
    await this._cacheService.delete(`likes:${albumId}`);
  }
  
  async deleteAlbumLike(userId, albumId) {
    const albumLiked = await this.verifyAlbumLike(userId, albumId);
    if (!albumLiked) throw new InvariantError('Album belum anda sukai');
    
    const query = {
      text: `DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2`,
      values: [userId, albumId],
    };
    
    await this._pool.query(query);
    await this._cacheService.delete(`likes:${albumId}`);
  }
  
  async getAlbumLikeCount(albumId) {
    try {
      const result = await this._cacheService.get(`likes:${albumId}`);
      const likes = JSON.parse(result);
      
      return { likes, source: 'cache' };
    } catch (error) {
      const query = {
        text: `SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1`,
        values: [albumId],
      };
      
      const { rows } = await this._pool.query(query);
      const { count: likes } = rows[0];
      
      await this._cacheService.set(`likes:${albumId}`, JSON.stringify(likes));
      
      return { likes, source: 'dbserver' };
    }
  }
}

module.exports = AlbumsLikesService;
