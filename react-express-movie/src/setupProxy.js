const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://load-balancer:80',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '' // удаляем префикс '/api' при запросе к бэкенду
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({ message: 'Proxy error', error: err.message });
      },
      logLevel: 'warn'
    })
  );
}; 