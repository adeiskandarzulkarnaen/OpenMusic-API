const InvariantError = require('../../exceptions/InvariantError');
const {
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema,
} = require('./schema');


const AutenticationsValidator = {
  validatePostAuthenticationPayload: (payload) => {
    const validationResult = PostAuthenticationPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  
  validatePutAuthenticationPayload: (payload) => {
    const validationResult = PutAuthenticationPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  
  validateDeleteAuthenticationPayload: (payload) => {
    // eslint-disable-next-line max-len
    const validationResult = DeleteAuthenticationPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AutenticationsValidator;
