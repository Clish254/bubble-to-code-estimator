"use client";

import { useEffect } from "react";

const MESSAGE_TYPE = "goodspeed-estimator:resize";
const MIN_REASONABLE_HEIGHT = 200;

/**
 * When the estimator is loaded inside an iframe, relaxes the viewport-height
 * layout (via a `data-embedded="true"` attribute on <html> that CSS hooks onto)
 * and posts the document's content height to the parent window so the iframe
 * can resize to fit its content. This prevents the scroll-trap that happens
 * when an embed has its own internal scroll container.
 *
 * The outbound message shape is:
 *   { type: "goodspeed-estimator:resize", height: number }
 */
export function EmbedResizer() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.self === window.top) return;

    const html = document.documentElement;
    html.setAttribute("data-embedded", "true");

    let lastPostedHeight = 0;
    let rafId = 0;

    const measure = () => {
      const body = document.body;
      return Math.max(
        html.scrollHeight,
        body?.scrollHeight ?? 0,
        html.offsetHeight,
        body?.offsetHeight ?? 0
      );
    };

    const post = () => {
      rafId = 0;
      const height = measure();
      // Guard against transient 0 heights during AnimatePresence mode="wait"
      // step transitions where the outgoing step unmounts before the incoming
      // one paints.
      if (height < MIN_REASONABLE_HEIGHT) return;
      if (height === lastPostedHeight) return;
      lastPostedHeight = height;
      window.parent.postMessage({ type: MESSAGE_TYPE, height }, "*");
    };

    const schedule = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(post);
    };

    const observer = new ResizeObserver(schedule);
    observer.observe(html);
    if (document.body) observer.observe(document.body);

    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);

    // Initial post after layout settles.
    schedule();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("load", schedule);
      if (rafId) window.cancelAnimationFrame(rafId);
      html.removeAttribute("data-embedded");
    };
  }, []);

  return null;
}
