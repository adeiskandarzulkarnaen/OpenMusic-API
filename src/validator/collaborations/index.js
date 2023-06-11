const {
  PostCollaborationsPayloadSchema,
  DeleteCollaborationsPayloadSchema,
} = require('./schema');

const InvariantError = require('../../exceptions/InvariantError');

const CollaborationsValidator = {
  validatePostCollaborationPayload: (payload) => {
    const validationResult = PostCollaborationsPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateDeleteCollaborationPayload: (payload) => {
    // eslint-disable-next-line max-len
    const validationResult = DeleteCollaborationsPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CollaborationsValidator;
