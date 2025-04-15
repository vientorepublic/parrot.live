# parrot.live - TypeScript

`parrot.live` is a fun project that streams an animated party parrot directly to your terminal using `curl`. It has been rewritten in TypeScript to improve maintainability, type safety, and developer experience.

## Features

- Streams an animated party parrot to your terminal.
- Supports optional flipped animation via query parameters.
- Randomized color effects for each frame.
- Includes a health check endpoint.
- Redirects non-cURL requests to the GitHub repository.

## How It Works

The server streams frames of the party parrot animation to the client. Each frame is displayed with a random color, and users can optionally flip the animation horizontally by passing a query parameter.

## Usage

### Try It Out

Run the following command in your terminal:

```bash
curl parrot.live
```

### Flip the Animation

To flip the animation horizontally, use the `flip` query parameter:

```bash
curl parrot.live?flip=true
```

### Health Check

Check the server's health status:

```bash
curl parrot.live/healthcheck
```

### Non-cURL Requests

If you access the server from a browser or a non-cURL client, you will be redirected to the [GitHub repository](https://github.com/hugomd/parrot.live).

## Configuration

The server runs on port `3000` by default. You can change the port by setting the `PARROT_PORT` environment variable:

```bash
export PARROT_PORT=8080
node dist/index.js
```

## :partyparrot:

<div align="center">
  <img src='https://d.pr/i/jKluc0.gif' />
</div>

## Thanks

- [jmhobbs](https://github.com/jmhobbs) for [`terminal-parrot`](https://github.com/jmhobbs/terminal-parrot) and the animation frames.
- [Robert Koch](https://github.com/kochie/) and [Eric Jiang](https://github.com/lorderikir) for testing and feedback ⭐.

## More Parrots

- [cultofthepartyparrot.com](http://cultofthepartyparrot.com/)
- [`terminal-parrot`](https://github.com/jmhobbs/terminal-parrot)
- [`parrotsay`](https://github.com/matheuss/parrotsay)
- [`ascii.live`](https://github.com/hugomd/ascii.live)
