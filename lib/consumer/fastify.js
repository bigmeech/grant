const _consumer = require('../consumer');

module.exports = function (fastify, opts, done) {
  const app = {};
  const consumer = _consumer({ opts });

  app.config = consumer.config;

  const PATHS = {
    connect: '/connect/:provider/:override',
    callback: '/connect/:provider/callback'
  };

  fastify.all('/connect/*', async (request, reply) => {
    const {
      query,
      path,
      session,
      method,
      body
    } = request;


    if(!session) {
      throw new Error('Make sure session plugin has already been registered');
    }

    if(method === 'POST' && !body) {
      throw new Error('Make sure formbody plugin is already registered');
    }

    // callback
    if(
      path.toLowerCase().includes(PATHS.callback)
      && method === 'GET'
      && Object.keys(query || {}).length
    ) {
      session.grant = session.grant = {};
      const state = reply.locals.grant = reply.locals.grant || {};
      const  { url, error } = await _consumer.callback({ session, query, state }).then({ url, error })
      error? reply.send(error) : url ? reply.redirect(url) : await done()
    }

    // connect
    if(
      (request.method === 'POST' || request.method === 'GET')
      && (Object.keys(request.body || {}).length || Object.keys(request.query || {}).length)
      && request.path.toLowerCase().includes(PATHS.override)
    )
    {
      session.dynamic = request.body
    }

    const state = res.locals.grant


    await done()
  })
};
