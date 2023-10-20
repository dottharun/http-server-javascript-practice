const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const request = data.toString();
    const [start_line, ...headerLines] = request
      .split(`\r\n`)
      .filter((i) => i.length > 0);
    const [method, path, version] = start_line.split(` `);

    //headers
    const headers = Object.fromEntries(
      headerLines.map((line) => {
        const colon = line.indexOf(':');
        return [line.slice(0, colon), line.slice(colon + 1).trimStart()];
      })
    );

    let response = '';

    if (path === '/') {
      response = `HTTP/1.1 200 OK\r\n\r\n`;
    } else if (path.includes('/echo')) {
      const content = path.substring(6);
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${content}`;
    } else if (path.includes('/user-agent')) {
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${user_agent.length}\r\n\r\n${user_agent}`;
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
