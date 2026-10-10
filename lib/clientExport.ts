/* =====================================================================
 * In-browser MP4 export (no server).
 *   1. seek(t) draws frame N into the live <Frame/> DOM
 *   2. modern-screenshot rasterises that DOM to a canvas (fonts + images
 *      embedded once per export via a reused context)
 *   3. WebCodecs H.264 via mediabunny, music as AAC, muxed to MP4 in memory
 * Same pure-function-of-time frames as the server renderer, so output matches.
 * ===================================================================== */
import { createContext, destroyContext, domToCanvas } from "modern-screenshot";
import { AudioBufferSource, BufferTarget, CanvasSource, Mp4OutputFormat, Output, canEncodeAudio, canEncodeVideo } from "mediabunny";
import type { Project } from "./types";

export type ClientExportOptions = {
  node: HTMLElement;
  /** Draw internal time t (ms) and resolve once the pixels are final. */
  seek: (t: number) => Promise<void>;
  W: number;
  H: number;
  /** Output height in px, e.g. 720 for 720p (the short side for 16:9 is the height too). */
  outShort: number;
  fps: number;
  /** Internal timeline length (ms) and playback speed. */
  total: number;
  speed: number;
  music: Project["music"];
  onProgress?: (p: number) => void;
  signal?: AbortSignal;
};

export type ClientExportResult = { blob: Blob; ms: number; frames: number; msPerFrame: number; audio: boolean };

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

export async function clientSupport() {
  if (typeof VideoEncoder === "undefined") return { ok: false, reason: "This browser has no WebCodecs video encoder." };
  if (!(await canEncodeVideo("avc"))) return { ok: false, reason: "This browser cannot encode H.264." };
  return { ok: true, aac: await canEncodeAudio("aac") };
}

export async function exportInBrowser(o: ClientExportOptions): Promise<ClientExportResult> {
  const t0 = performance.now();
  const short = Math.min(o.W, o.H);
  const scale = o.outShort / short;
  const outW = even(o.W * scale);
  const outH = even(o.H * scale);
  const seconds = o.total / o.speed / 1000;
  const frames = Math.ceil(seconds * o.fps);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const g = canvas.getContext("2d")!;

  const output = new Output({ format: new Mp4OutputFormat({ fastStart: "in-memory" }), target: new BufferTarget() });
  const video = new CanvasSource(canvas, { codec: "avc", bitrate: outW * outH * o.fps * 0.15, keyFrameInterval: 2 });
  output.addVideoTrack(video, { frameRate: o.fps });

  const audioBuf = o.music?.src && (await canEncodeAudio("aac")) ? await mixMusic(o.music, seconds) : null;
  const audio = audioBuf ? new AudioBufferSource({ codec: "aac", bitrate: 192_000 }) : null;
  if (audio) output.addAudioTrack(audio);
  await output.start();

  // Fonts and images are fetched/embedded once here, then reused for every frame.
  const ctx = await createContext(o.node, { width: o.W, height: o.H, scale, autoDestruct: false });
  try {
    for (let i = 0; i < frames; i++) {
      if (o.signal?.aborted) throw new Error("Cancelled");
      await o.seek((i / o.fps) * 1000 * o.speed);
      const shot = await domToCanvas(ctx);
      g.drawImage(shot, 0, 0, outW, outH);
      await video.add(i / o.fps, 1 / o.fps);
      o.onProgress?.((i + 1) / frames);
    }
    if (audio && audioBuf) await audio.add(audioBuf);
    await output.finalize();
  } catch (e) {
    await output.cancel().catch(() => {});
    throw e;
  } finally {
    destroyContext(ctx);
  }

  const buf = (output.target as BufferTarget).buffer!;
  const ms = performance.now() - t0;
  return { blob: new Blob([buf], { type: "video/mp4" }), ms, frames, msPerFrame: ms / frames, audio: !!audio };
}

/** Music trimmed to the video, with the same volume and fades as the server's ffmpeg filter. */
async function mixMusic(m: NonNullable<Project["music"]>, seconds: number): Promise<AudioBuffer> {
  const rate = 48_000;
  const bytes = await (await fetch(m.src)).arrayBuffer();
  const ac = new OfflineAudioContext(2, Math.ceil(seconds * rate), rate);
  const decoded = await ac.decodeAudioData(bytes);
  const src = ac.createBufferSource();
  src.buffer = decoded;
  const gain = ac.createGain();
  const vol = m.volume ?? 0.8;
  const fadeAt = Math.max(0, seconds - 2.2);
  gain.gain.setValueAtTime(0, 0);
  gain.gain.linearRampToValueAtTime(vol, 0.6);
  gain.gain.setValueAtTime(vol, fadeAt);
  gain.gain.linearRampToValueAtTime(0, seconds);
  src.connect(gain).connect(ac.destination);
  src.start(0, m.offset || 0);
  return ac.startRendering();
}
