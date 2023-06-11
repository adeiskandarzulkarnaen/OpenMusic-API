const autoBind = require('auto-bind');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    
    autoBind(this);
  }
  
  async postSongHandler({ payload }, h) {
    this._validator.validateSongPayload(payload);
    
    const songId = await this._service.addSong(payload);
    
    const response = h.response({
      status: 'success',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }
  
  async getSongsHandler({ query }) {
    const { title, performer } = query;
    
    const songs = await this._service.getSongs(title, performer);
    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }
  
  async getSongByIdHandler({ params }) {
    const song = await this._service.getSongById(params.id);
    
    return {
      status: 'success',
      data: {
        song,
      },
    };
  }
  
  async putSongByIdHandler({ params, payload }) {
    this._validator.validateSongPayload(payload);
    
    const { id: songId } = params;
    await this._service.editSongById(songId, payload);
    
    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    };
  }
  
  async deleteSongByIdHandler({ params }) {
    await this._service.deleteSongById(params.id);
    
    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
