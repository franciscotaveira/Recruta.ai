import http from 'http';
const server = http.createServer((req, res) => {
  res.end('ok');
});
server.listen(8080, '127.0.0.1', () => {
  console.log('Listening on 8080');
  process.exit(0);
});
server.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
