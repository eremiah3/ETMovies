const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy for VidSrc domains to bypass CORS for embed URLs
  app.use(
    '/proxy/vidsrc',
    createProxyMiddleware({
      target: 'https://vidsrcme.ru',
      changeOrigin: true,
      secure: true,
      pathRewrite: {
        '^/proxy/vidsrc': '',
      },
    })
  );

  // Additional proxies for other VidSrc variants
  app.use(
    '/proxy/vidsrc-su',
    createProxyMiddleware({
      target: 'https://vidsrcme.su',
      changeOrigin: true,
      secure: true,
      pathRewrite: {
        '^/proxy/vidsrc-su': '',
      },
    })
  );

  app.use(
    '/proxy/vidsrc-me',
    createProxyMiddleware({
      target: 'https://vidsrc-me.su',
      changeOrigin: true,
      secure: true,
      pathRewrite: {
        '^/proxy/vidsrc-me': '',
      },
    })
  );

  app.use(
    '/proxy/vidsrc-embed',
    createProxyMiddleware({
      target: 'https://vidsrc-embed.ru',
      changeOrigin: true,
      secure: true,
      pathRewrite: {
        '^/proxy/vidsrc-embed': '',
      },
    })
  );

  // For CloudStream and others if needed, but focus on VidSrc
  app.use(
    '/proxy/cloudstream',
    createProxyMiddleware({
      target: 'https://www.cloudstream.pro',
      changeOrigin: true,
      secure: true,
      pathRewrite: {
        '^/proxy/cloudstream': '',
      },
    })
  );
};
