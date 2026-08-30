#!/usr/bin/env node
// Fetches YouTube's existing (manual or auto-generated) captions and prints a transcript.
// Usage: node scripts/youtube-transcript.mjs <url-or-video-id> [--lang en] [--format txt|srt|json] [-o file] [--list]

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function printHelp() {
  console.log(`YouTube transcript fetcher

Usage:
  node scripts/youtube-transcript.mjs <url-or-video-id> [options]

Options:
  --lang <code>     Preferred caption language (default: en)
  --format <type>   Output format: txt | srt | json (default: txt)
  -o, --output <f>  Write output to file instead of stdout
  --list            List available caption tracks and exit
  -h, --help        Show this help

Examples:
  node scripts/youtube-transcript.mjs https://youtu.be/yZJQB4FBHqo
  node scripts/youtube-transcript.mjs yZJQB4FBHqo --lang ja --format srt -o out.srt
  node scripts/youtube-transcript.mjs yZJQB4FBHqo --list
`);
}

function extractVideoId(input) {
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.hostname === "youtu.be") {
      return url.pathname.slice(1).split("/")[0] || null;
    }
    if (url.hostname.endsWith("youtube.com")) {
      if (url.searchParams.has("v")) return url.searchParams.get("v");
      const match = url.pathname.match(/\/(embed|shorts|live)\/([a-zA-Z0-9_-]{11})/);
      if (match) return match[2];
    }
  } catch {
    // not a URL, fall through
  }
  return null;
}

function extractBalancedJson(html, marker) {
  const markerIdx = html.indexOf(marker);
  if (markerIdx === -1) return null;
  const start = html.indexOf("{", markerIdx);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return html.slice(start, i + 1);
    }
  }
  return null;
}

async function fetchCaptionTracks(videoId) {
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=en`, {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch watch page (HTTP ${res.status})`);
  }
  const html = await res.text();

  const json = extractBalancedJson(html, "ytInitialPlayerResponse");
  if (!json) {
    throw new Error(
      "Could not find player data in the page. YouTube may have served a consent/CAPTCHA page instead."
    );
  }

  const playerResponse = JSON.parse(json);
  const tracks =
    playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!tracks || tracks.length === 0) {
    throw new Error("This video has no captions/subtitles available.");
  }
  return tracks;
}

function pickTrack(tracks, lang) {
  const base = lang.split("-")[0];
  return (
    tracks.find((t) => t.languageCode === lang && t.kind !== "asr") ||
    tracks.find((t) => t.languageCode === lang) ||
    tracks.find((t) => t.languageCode.startsWith(base)) ||
    tracks[0]
  );
}

async function fetchTranscriptEvents(track) {
  const sep = track.baseUrl.includes("?") ? "&" : "?";
  const res = await fetch(`${track.baseUrl}${sep}fmt=json3`, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch captions (HTTP ${res.status})`);
  }
  const data = await res.json();
  const events = data.events || [];

  return events
    .filter((e) => e.segs && e.segs.length > 0)
    .map((e) => ({
      start: e.tStartMs || 0,
      duration: e.dDurationMs || 0,
      text: e.segs.map((s) => s.utf8 || "").join(""),
    }))
    .map((e) => ({ ...e, text: e.text.replace(/\s+/g, " ").trim() }))
    .filter((e) => e.text.length > 0);
}

function pad(n, len) {
  return String(n).padStart(len, "0");
}

function msToSrtTime(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const rem = Math.floor(ms % 1000);
  return `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)},${pad(rem, 3)}`;
}

function formatOutput(entries, format) {
  if (format === "json") {
    return JSON.stringify(entries, null, 2);
  }
  if (format === "srt") {
    return entries
      .map((e, i) => {
        const start = msToSrtTime(e.start);
        const end = msToSrtTime(e.start + (e.duration || 1000));
        return `${i + 1}\n${start} --> ${end}\n${e.text}\n`;
      })
      .join("\n");
  }
  return entries.map((e) => e.text).join(" ");
}

function parseArgs(argv) {
  const opts = { lang: "en", format: "txt", output: null, list: false, positional: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      opts.help = true;
    } else if (arg === "--lang") {
      opts.lang = argv[++i];
    } else if (arg === "--format") {
      opts.format = argv[++i];
    } else if (arg === "-o" || arg === "--output") {
      opts.output = argv[++i];
    } else if (arg === "--list") {
      opts.list = true;
    } else {
      opts.positional.push(arg);
    }
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help || opts.positional.length === 0) {
    printHelp();
    process.exit(opts.help ? 0 : 1);
  }

  const videoId = extractVideoId(opts.positional[0]);
  if (!videoId) {
    console.error(`Could not parse a video ID from: ${opts.positional[0]}`);
    process.exit(1);
  }

  if (!["txt", "srt", "json"].includes(opts.format)) {
    console.error(`Unknown format: ${opts.format} (expected txt, srt, or json)`);
    process.exit(1);
  }

  const tracks = await fetchCaptionTracks(videoId);

  if (opts.list) {
    for (const t of tracks) {
      const kind = t.kind === "asr" ? "auto-generated" : "manual";
      console.log(`${t.languageCode}\t${kind}\t${t.name?.simpleText ?? ""}`);
    }
    return;
  }

  const track = pickTrack(tracks, opts.lang);
  const entries = await fetchTranscriptEvents(track);
  const output = formatOutput(entries, opts.format);

  if (opts.output) {
    const fs = await import("node:fs");
    fs.writeFileSync(opts.output, output);
    console.error(`Wrote transcript (${track.languageCode}, ${entries.length} lines) to ${opts.output}`);
  } else {
    console.log(output);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
