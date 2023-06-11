const autoBind = require('auto-bind');

class ExportHandler {
  constructor(service, validator, playlistsService) {
    this._service = service;
    this._validator = validator;
    this._playlistsService = playlistsService;
    
    autoBind(this);
  }
  
  async postExportSongsHandler({ params, payload, auth }, h) {
    this._validator.validateExportSongsPayload(payload);
    const { playlistId } = params;
    const { targetEmail } = payload;
    const { userId } = auth.credentials;
    
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    
    const message = {
      playlistId,
      targetEmail,
    };
    
    await this._service.sendMessage('export:songs', JSON.stringify(message));
    
    const response = h.response({
      'status': 'success',
      'message': 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportHandler;
