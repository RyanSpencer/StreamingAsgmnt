const fs = require('fs');
const path = require('path');


const readRange = (request, response, file, contentType, stats) => {
  const range = request.headers.range;

  if (!range) {
    return response.writeHead(416);
  }

  const positions = range.replace(/bytes=/, '').split('-');

  let start = parseInt(positions[0], 10);

  const total = stats.size;
  const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

  if (start > end) {
    start = end - 1;
  }

  const chunksize = (end - start) + 1;

  response.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${total}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunksize,
    'Content-Type': contentType,
  });

  const stream = fs.createReadStream(file, { start, end });

  stream.on('open', () => {
    stream.pipe(response);
  });
  stream.on('error', (streamErr) => {
    response.end(streamErr);
  });

  return stream;
};

const loadFile = (request, response, filePath, contentType) => {
  const file = path.resolve(__dirname, filePath);

  fs.stat(file, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        response.writeHead(404);
      }
      return response.end(err);
    }

    return readRange(request, response, file, contentType, stats);
  });
};

const getParty = (request, response) => {
  loadFile(request, response, '../client/party.mp4', 'vidoe/mp4');
};

const getBling = (request, response) => {
  loadFile(request, response, '../client/bling.mp3', 'audio/mpeg');
};

const getBird = (request, response) => {
  loadFile(request, response, '../client/bird.mp4', 'video/mp4');
};


module.exports.getParty = getParty;
module.exports.getBling = getBling;
module.exports.getBird = getBird;
