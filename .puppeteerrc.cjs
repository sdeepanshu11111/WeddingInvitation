// Vercel builds never run MP4 export, so skip puppeteer's ~150 MB Chrome download there.
const skip = !!process.env.VERCEL;

/** @type {import("puppeteer").Configuration} */
module.exports = {
  skipDownload: skip,
  chrome: { skipDownload: skip },
  "chrome-headless-shell": { skipDownload: skip },
};
