const net = require("net");
const { argv } = require('process');
const { access, constants } = require('fs');
const path = require('path');

let _dir = '';
argv.forEach((flag, ind) => {
  if (flag === '--directory') {
    _dir = argv[ind + 1];
  }
});
console.log('dir is', _dir);

const isFileExists = (file) => {
  let res = 0;
  access(path.join(_dir, file), constants.F_OK, (err) => {
    if (!err) {
      res = 1;
    }
  });
  return res;
};

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

      // if (isFileExists(_file)) {
      //   const content = fs.readFileSync(path.join(_dir, _file), 'utf8');
      //   response = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\r\n${content}`;
      // } else {
      //   response = `HTTP/1.1 404 Not Found\r\n\r\n`;
      // }

      try {
        const content = fs.readFileSync(path.join(_dir, _file), 'utf8');
        response = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\r\n${content}`;
      } catch (err) {
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
