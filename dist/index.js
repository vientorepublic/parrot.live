"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const stream_1 = require("stream");
const safe_1 = __importDefault(require("colors/safe"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("mz/fs"));
const url_1 = __importDefault(require("url"));
let original = [];
let flipped = [];
const FRAMES_PATH = 'frames';
const COLORS_OPTIONS = [
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
const loadFrames = async () => {
    try {
        const files = await fs_1.default.readdir(FRAMES_PATH);
        original = await Promise.all(files.map(async (file) => fs_1.default.readFile(path_1.default.join(FRAMES_PATH, file), 'utf8')));
        flipped = original.map((frame) => frame.split('').reverse().join(''));
    }
    catch (err) {
        console.error('Error loading frames:', err);
    }
};
const selectColor = (previousColor) => {
    let color;
    do {
        color = Math.floor(Math.random() * COLORS_OPTIONS.length);
    } while (color === previousColor);
    return color;
};
const streamer = (stream, opts) => {
    let index = 0;
    let lastColor;
    const frames = opts.flip ? flipped : original;
    return setInterval(() => {
        stream.push('\x1b[2J\x1b[3J\x1b[H');
        const newColor = (lastColor = selectColor(lastColor ?? -1));
        const colorFn = safe_1.default[COLORS_OPTIONS[newColor]];
        stream.push(colorFn(frames[index]));
        index = (index + 1) % frames.length;
    }, FRAME_INTERVAL);
};
const validateQuery = (query) => ({
    flip: String(query.flip).toLowerCase() === 'true',
});
const handleHealthCheck = (res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
};
const handleRedirect = (res) => {
    res.writeHead(302, { Location: 'https://github.com/hugomd/parrot.live' });
    res.end();
};
const server = http_1.default.createServer((req, res) => {
    if (req.url === '/healthcheck') {
        handleHealthCheck(res);
        return;
    }
    if (req.headers?.['user-agent'] &&
        !req.headers['user-agent'].includes('curl')) {
        handleRedirect(res);
        return;
    }
    const stream = new stream_1.Readable({ read() { } });
    stream.pipe(res);
    const parsedUrl = url_1.default.parse(req.url || '', true);
    const interval = streamer(stream, validateQuery(parsedUrl.query));
    req.on('close', () => {
        stream.destroy();
        clearInterval(interval);
        stream.push(null);
        stream.unpipe(res);
        res.end();
    });
});
const port = parseInt(process.env.PARROT_PORT || String(DEFAULT_PORT), 10);
server.listen(port, (err) => {
    if (err) {
        console.error('Server failed to start:', err);
        return;
    }
    console.log(`Listening on localhost:${port}`);
});
(async () => {
    await loadFrames();
})();
