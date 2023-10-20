const net = require("net");
const { argv } = require('process');
const fs = require('fs');
const path = require('path');

let _dir = '';
argv.forEach((a, ind) => {
  if (a === '--directory') {
    _dir = argv[ind + 1];
  }
});
console.log('dir is', _dir);

console.log('Logs from your program will appear here!');

const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const request = data.toString();
    const [start_line, hostLine, uaLine, ...req_content] = request
      .split(`\r\n`)
      .filter((i) => i.length > 0);
    const [method, PATH, version] = start_line.split(` `);

    let user_agent = null;
    if (typeof uaLine != 'undefined') {
      user_agent = uaLine.split(' ')[1];
    }

    let response = null;

    if (method == 'GET') {
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
      }
    } else if (method === 'POST') {
      if (PATH.includes('/files')) {
        const _file = PATH.substring(7);
        console.log(`file is`, _file);

        //get content from req and write to file
        const content = req_content;
        fs.writeFileSync(path.join(_dir, _file), content);

        response = `HTTP/1.1 200 OK\r\n\r\n`;
      }
    } else {
      response = `HTTP/1.1 404 Not Found\r\n\r\n`;
    }

    socket.write(response);
    socket.end();
  });

  socket.on('close', () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, 'localhost');
