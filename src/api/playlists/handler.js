const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    
    autoBind(this);
  }
  
  async postPlaylistHandler({ payload, auth }, h) {
    this._validator.validatePostPlaylistPayload(payload);
    const { name: playlistName } = payload;
    const { userId: owner } = auth.credentials;
    
    const playlistId = await this._service.addPlaylist(playlistName, owner);
    
    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }
  
  async getPlaylistsHandler({ auth }) {
    const { userId: owner } = auth.credentials;
    
    const playlists = await this._service.getPlaylists(owner);
    
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }
  
  async deletePlaylistByIdHandler({ params, auth }) {
    const { id: playlistId } = params;
    const { userId: owner } = auth.credentials;
    
    await this._service.verifyPlaylistOwner(playlistId, owner);
    await this._service.deletePlaylistById(playlistId);
    
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }
  
  async postSongIntoPlaylistHandler({ params, payload, auth }, h) {
    this._validator.validatePostSongIntoPlaylistPayload(payload);
    
    const { id: playlistId } = params;
    const { songId } = payload;
    const { userId } = auth.credentials;
    
    await this._service.verifyPlaylistAccess(playlistId, userId);
    await this._service.addSongToPlaylist(playlistId, songId);
    
    await this._service.addPlaylistActivity({
      playlistId, songId, userId, action: 'add',
    });
    
    const response = h.response({
      status: 'success',
      message: 'lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }
  
  async getSongsFromPlaylistHandler({ params, auth }) {
    const { id: playlistId } = params;
    const { userId } = auth.credentials;
    
    await this._service.verifyPlaylistAccess(playlistId, userId);
    const playlist = await this._service.getSongsFromPlaylist(playlistId);
    
    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }
  
  async deleteSongFromPlaylistHandler({ params, payload, auth }) {
    this._validator.validateDeleteSongFromPlaylistPayload(payload);
    
    const { id: playlistId } = params;
    const { songId } = payload;
    const { userId } = auth.credentials;
    
    await this._service.verifyPlaylistAccess(playlistId, userId);
    await this._service.deleteSongFromPlaylist(playlistId, songId);
    
    await this._service.addPlaylistActivity({
      playlistId, songId, userId, action: 'delete',
    });
    
    return {
      status: 'success',
      message: 'lagu berhasil dihapus dari playlist',
    };
  }
  
  async getPlaylistActivitiesHandler({ params, auth }) {
    const { id: playlistId } = params;
    const { userId } = auth.credentials;
    
    await this._service.verifyPlaylistAccess(playlistId, userId);
    
    const activities = await this._service.getPlaylistActivities(playlistId);
    
    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
};

module.exports = PlaylistsHandler;
