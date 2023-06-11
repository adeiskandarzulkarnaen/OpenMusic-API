const CollaborationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: (server, {
    collaborationsService, usersService, playlistsService, validator,
  }) => {
    const collaborationsHandler = new CollaborationsHandler(
        collaborationsService, usersService, playlistsService, validator,
    );
    server.route(routes(collaborationsHandler));
  },
};
