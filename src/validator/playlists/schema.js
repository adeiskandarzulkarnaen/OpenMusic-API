const Joi = require('joi');

const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PostSongIntoPlaylistSchema = Joi.object({
  songId: Joi.string().required(),
});

const DeleteSongFromPlaylistSchema = Joi.object({
  songId: Joi.string().required(),
});


module.exports = {
  PostPlaylistPayloadSchema,
  PostSongIntoPlaylistSchema,
  DeleteSongFromPlaylistSchema,
};
