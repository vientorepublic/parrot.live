import http, { IncomingMessage, ServerResponse } from 'http';
import { ParsedUrlQuery } from 'querystring';
import { Readable } from 'stream';
import colors from 'colors/safe';
import path from 'path';
import fs from 'mz/fs';
import url from 'url';

let original: string[] = [];
let flipped: string[] = [];

const FRAMES_PATH = 'frames';
const COLORS_OPTIONS: (keyof typeof colors)[] = [
  'red',
  'yellow',
  'green',
  'blue',
  'magenta',
  'cyan',
  'white',
];
const FRAME_INTERVAL = 70;
const DEFAULT_PORT = 3000;

// Load frames from the file system
const loadFrames = async (): Promise<void> => {
  try {
    const files = await fs.readdir(FRAMES_PATH);
    original = await Promise.all(
      files.map(async (file) =>
        fs.readFile(path.join(FRAMES_PATH, file), 'utf8'),
      ),
    );
    flipped = original.map((frame) => frame.split('').reverse().join(''));
  } catch (err) {
    console.error('Error loading frames:', err);
  }
};

// Select a random color, ensuring it's different from the previous one
const selectColor = (previousColor: number): number => {
  let color: number;
  do {
    color = Math.floor(Math.random() * COLORS_OPTIONS.length);
  } while (color === previousColor);
  return color;
};

// Stream frames to the client
const streamer = (
  stream: Readable,
  opts: { flip: boolean },
): NodeJS.Timeout => {
  let index = 0;
  let lastColor: number | undefined;
  const frames = opts.flip ? flipped : original;

  return setInterval(() => {
    stream.push('\x1b[2J\x1b[3J\x1b[H'); // Clear the screen
    const newColor = (lastColor = selectColor(lastColor ?? -1));
    const colorFn = colors[COLORS_OPTIONS[newColor]] as (str: string) => string;
    stream.push(colorFn(frames[index]));
    index = (index + 1) % frames.length;
  }, FRAME_INTERVAL);
};

// Validate and parse query parameters
const validateQuery = (query: ParsedUrlQuery): { flip: boolean } => ({
  flip: String(query.flip).toLowerCase() === 'true',
});

// Handle health check requests
const handleHealthCheck = (res: ServerResponse): void => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok' }));
};

// Redirect non-cURL requests
const handleRedirect = (res: ServerResponse): void => {
  res.writeHead(302, { Location: 'https://github.com/hugomd/parrot.live' });
  res.end();
};

// Main server logic
const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse): void => {
    if (req.url === '/healthcheck') {
      handleHealthCheck(res);
      return;
    }

    if (
      req.headers?.['user-agent'] &&
      !req.headers['user-agent'].includes('curl')
    ) {
      handleRedirect(res);
      return;
    }

    const stream = new Readable({ read() {} });
    stream.pipe(res);

    const parsedUrl = url.parse(req.url || '', true);
    const interval = streamer(stream, validateQuery(parsedUrl.query));

    req.on('close', () => {
      stream.destroy();
      clearInterval(interval);
      stream.push(null);
      stream.unpipe(res);
      res.end();
    });
  },
);

// Start the server
const port = parseInt(process.env.PARROT_PORT || String(DEFAULT_PORT), 10);
server.listen(port, (err?: Error): void => {
  if (err) {
    console.error('Server failed to start:', err);
    return;
  }
  console.log(`Listening on localhost:${port}`);
});

// Load frames on startup
(async () => {
  await loadFrames();
})();
