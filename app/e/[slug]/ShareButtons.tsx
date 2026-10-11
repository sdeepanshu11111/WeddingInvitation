"use client";
import React, { useState } from "react";

/** Copy / WhatsApp (and Download for MP4 shares) on the watch page. */
export function ShareButtons({ title, videoPath, fileName }: { title: string; videoPath?: string; fileName?: string }) {
  const [copied, setCopied] = useState(false);
  const url = () => window.location.href.split("#")[0];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
    } catch {
      window.prompt("Copy this link", url());
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const whatsapp = () => window.open("https://wa.me/?text=" + encodeURIComponent(title + " - you're invited!\n" + url()), "_blank", "noopener");

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
      <button className="btn primary" onClick={whatsapp}>
        Share on WhatsApp
      </button>
      <button className="btn" onClick={copy}>
        {copied ? "Link copied" : "Copy link"}
      </button>
      {videoPath ? (
        <a className="btn" href={videoPath + "?download=1"} download={fileName}>
          Download
        </a>
      ) : null}
    </div>
  );
}
