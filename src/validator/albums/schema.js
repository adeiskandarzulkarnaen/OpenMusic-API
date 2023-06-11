const Joi = require('joi');

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().min(1970).max(new Date().getFullYear()).required(),
});

const PostCoverHeadersSchema = Joi.object({
  'content-type': Joi.string()
      .valid(
          'image/avif',
          'image/bmp',
          'image/gif',
          'image/jpeg',
          'image/png',
          'image/tiff',
          'image/webp',
      ).required(),
}).unknown();

module.exports = { AlbumPayloadSchema, PostCoverHeadersSchema };
