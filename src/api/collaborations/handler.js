const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(collaborationsService, usersService, playlistsService, validator) {
    this._collaborationsService = collaborationsService;
    this._usersService = usersService;
    this._playlistsService = playlistsService;
    this._validator = validator;
    
    autoBind(this);
  }
  
  async postCollaboration({ payload, auth }, h) {
    this._validator.validatePostCollaborationPayload(payload);
    
    const { playlistId, userId } = payload;
    const { userId: credentialId } = auth.credentials;
    
    await this._usersService.findUserByid(userId);
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    const collaborationId = await this._collaborationsService.addCollaboration(
        playlistId, userId,
    );
    
    const response = h.response({
      status: 'success',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }
  
  async deleteCollaboration({ payload, auth }) {
    this._validator.validateDeleteCollaborationPayload(payload);
    
    const { playlistId, userId } = payload;
    const { userId: credentialId } = auth.credentials;
    
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._collaborationsService.deleteCollaboration(playlistId, userId);
    
    return {
      status: 'success',
      message: 'Collaborator berhasil dihapus',
    };
  }
}

module.exports = CollaborationsHandler;
