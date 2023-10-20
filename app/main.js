const net = require("net");
const { argv } = require('process');
const fs = require('fs');
const path = require('path');

let _dir = argv[3];
// argv.forEach((flag, ind) => {
//   if (flag === '--directory') {
//     _dir = argv[ind + 1];
//   }
// });
console.log('dir is', _dir);

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log('Logs from your program will appear here!');

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const request = data.toString();
    const [start_line, ...headers] = request
      .split(`\r\n`)
      .filter((i) => i.length > 0);
    const [method, PATH, version] = start_line.split(` `);

    let user_agent = null;
    if (typeof headers[1] != 'undefined') {
      user_agent = headers[1].split(' ')[1];
    }

    let response = null;

    if (PATH === '/') {
      response = `HTTP/1.1 200 OK\r\n\r\n`;
    } else if (PATH.includes('/echo')) {
      const content = PATH.substring(6);
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${content}`;
    } else if (PATH.includes('/user-agent')) {
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${user_agent.length}\r\n\r\n${user_agent}`;
    } else if (PATH.includes('/files')) {
      const _file = PATH.substring(7);
      console.log(`file is`, _file);

      if (fs.existsSync(path.join(_dir, _file))) {
        const content = fs.readFileSync(path.join(_dir, _file));
        response = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\r\n${content}`;
      } else {
        console.log(`file sys - not found`);
        response = `HTTP/1.1 404 Not Found\r\n\r\n`;
      }
    } else {
      response = `HTTP/1.1 404 Not Found\r\n\r\n`;
    }

    //no change
    socket.write(response);
    socket.end();
  });

  socket.on('close', () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, 'localhost');
