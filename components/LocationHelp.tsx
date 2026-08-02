"use client";

import { useEffect, useState, type ReactNode } from "react";

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

// Shown when the browser has BLOCKED location. A repeat request can't re-prompt,
// so we tell the user exactly how to turn location back on for their device, with
// a no-settings fallback passed in by the caller.
export default function LocationHelp({ fallback }: { fallback?: ReactNode }) {
  const [platform, setPlatform] = useState<Platform>("other");
  useEffect(() => setPlatform(detectPlatform()), []);

  return (
    <div className="loc-help">
      <p className="loc-help-title">How to turn on location</p>

      {platform === "ios" && (
        <ol>
          <li>Open the iPhone <strong>Settings</strong> app.</li>
          <li>Tap <strong>Privacy &amp; Security</strong> → <strong>Location Services</strong> and make sure it&rsquo;s on.</li>
          <li>In that list, tap your browser (e.g. <strong>Safari</strong> or <strong>Chrome</strong>) and choose <strong>While Using the App</strong>.</li>
          <li>Come back here, <strong>reload the page</strong>, then tap the button again.</li>
        </ol>
      )}

      {platform === "android" && (
        <ol>
          <li>Tap the <strong>lock icon</strong> next to the web address at the top of your browser.</li>
          <li>Tap <strong>Permissions</strong> → <strong>Location</strong> → <strong>Allow</strong>.</li>
          <li>Make sure your phone&rsquo;s <strong>Location</strong> is on (swipe down from the top and check the Location toggle).</li>
          <li><strong>Reload the page</strong>, then tap the button again.</li>
        </ol>
      )}

      {platform === "other" && (
        <ol>
          <li>Click the <strong>lock icon</strong> next to the web address in your browser.</li>
          <li>Set <strong>Location</strong> to <strong>Allow</strong> for this site.</li>
          <li><strong>Reload the page</strong>, then click the button again.</li>
        </ol>
      )}

      {fallback && <p className="loc-help-alt">{fallback}</p>}
    </div>
  );
}
