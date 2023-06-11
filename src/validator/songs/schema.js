const Joi = require('joi');

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().min(1970).max(new Date().getFullYear()).required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number().integer().min(0),
  albumId: Joi.string(),
});

module.exports = { SongPayloadSchema };
