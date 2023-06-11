const ExportHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'export',
  version: '1.0.0',
  register: async (server, { service, validator, playlistsService }) => {
    const exportsHandler = new ExportHandler(service, validator, playlistsService);
    server.route(routes(exportsHandler));
  },
};
