const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    
    autoBind(this);
  }
  
  async postAlbumHandler({ payload }, h) {
    this._validator.validateAlbumPayload(payload);
    
    const albumId = await this._service.addAlbum(payload);
    
    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }
  
  async getAlbumByIdHandler({ params }) {
    const album = await this._service.getAlbumById(params.id);
    
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }
  
  async putAlbumByIdHandler({ params, payload }) {
    this._validator.validateAlbumPayload(payload);
    
    const { id: albumId } = params;
    await this._service.editAlbumById(albumId, payload);
    return {
      status: 'success',
      message: 'album berhasil diperbarui',
    };
  }
  
  async deleteAlbumByIdHandler({ params }) {
    await this._service.deleteAlbumById(params.id);
    
    return {
      status: 'success',
      message: 'album berhasil dihapus',
    };
  }
}

module.exports = AlbumsHandler;
