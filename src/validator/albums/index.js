const InvariantError = require('../../exceptions/InvariantError');
const { AlbumPayloadSchema, PostCoverHeadersSchema } = require('./schema');

const AlbumsValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  
  validateCoverHeaders: (headers) => {
    const validationResult = PostCoverHeadersSchema.validate(headers);
    
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AlbumsValidator;
