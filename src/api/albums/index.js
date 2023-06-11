const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { service, likeService, storageService, validator }) => {
    const albumsHandler = new AlbumsHandler(
        service, likeService, storageService, validator,
    );
    
    server.route(routes(albumsHandler));
  },
};
