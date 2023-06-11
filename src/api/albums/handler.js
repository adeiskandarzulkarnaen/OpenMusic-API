const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, likeService, storageService, validator) {
    this._service = service;
    this._likeService = likeService;
    this._storageService = storageService;
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
  
  async postCoverImageHandler({ params, payload }, h) {
    const { id: albumId } = params;
    const { cover } = payload;
    
    this._validator.validateCoverHeaders(cover.hapi.headers);
    
    const albumCover = await this._service.getAlbumCoverById(albumId);
    const filename = await this._storageService.writeFile(cover, cover.hapi);
    
    if (albumCover) await this._storageService.deleteFile(albumCover);
    
    // eslint-disable-next-line max-len
    const url = `http://${process.env.HOST}:${process.env.PORT}/albums/covers/${filename}`;
    await this._service.addAlbumCover(albumId, url);
    
    const response = h.response({
      'status': 'success',
      'message': 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }
  
  async postAlbumLikeHandler({ params, auth }, h) {
    const { id: albumId } = params;
    const { userId } = auth.credentials;
    
    await this._service.verifyAlbumAvailability(albumId);
    
    await this._likeService.addAlbumLike(userId, albumId);
    
    const response = h.response({
      status: 'success',
      message: 'menyukai album',
    });
    response.code(201);
    return response;
  }

  async deleteAlbumLikeHandler({ params, auth }, h) {
    const { id: albumId } = params;
    const { userId } = auth.credentials;
    
    await this._service.verifyAlbumAvailability(albumId);
    
    await this._likeService.deleteAlbumLike(userId, albumId);
    
    const response = h.response({
      status: 'success',
      message: 'batal menyukai album',
    });
    response.code(200);
    return response;
  }
  
  async getNumberOfLikeHandler({ params }, h) {
    const { id } = params;
    
    await this._service.verifyAlbumAvailability(id);
    const { likes, source } = await this._likeService.getAlbumLikeCount(id);
    
    const response = h.response({
      status: 'success',
      data: {
        likes: Number(likes),
      },
    });
    response.header('X-Data-Source', source);
    response.code(200);
    return response;
  }
}

module.exports = AlbumsHandler;
