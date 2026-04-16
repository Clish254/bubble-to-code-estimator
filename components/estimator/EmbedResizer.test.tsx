import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  EmbedResizer,
  measureEmbeddedContentHeight,
} from "@/components/estimator/EmbedResizer";

function setElementHeight(
  element: HTMLElement,
  values: {
    rectHeight: number;
    scrollHeight?: number;
    offsetHeight?: number;
  }
) {
  Object.defineProperty(element, "scrollHeight", {
    configurable: true,
    value: values.scrollHeight ?? Math.floor(values.rectHeight),
  });
  Object.defineProperty(element, "offsetHeight", {
    configurable: true,
    value: values.offsetHeight ?? Math.floor(values.rectHeight),
  });
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    width: 0,
    height: values.rectHeight,
    top: 0,
    right: 0,
    bottom: values.rectHeight,
    left: 0,
    toJSON: () => ({}),
  });
}

describe("measureEmbeddedContentHeight", () => {
  it("ignores html-sized viewport height when content is shorter", () => {
    const root = document.createElement("main");
    const body = document.createElement("body");

    setElementHeight(root, { rectHeight: 715.75, scrollHeight: 716, offsetHeight: 716 });
    setElementHeight(body, { rectHeight: 716, scrollHeight: 716, offsetHeight: 716 });

    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 1502,
    });
    Object.defineProperty(document.documentElement, "offsetHeight", {
      configurable: true,
      value: 1502,
    });

    expect(measureEmbeddedContentHeight(root, body)).toBe(716);
  });

  it("returns the larger real content height when the estimator is tall", () => {
    const root = document.createElement("main");
    const body = document.createElement("body");

    setElementHeight(root, {
      rectHeight: 1501.1,
      scrollHeight: 1501,
      offsetHeight: 1501,
    });
    setElementHeight(body, { rectHeight: 1499, scrollHeight: 1499, offsetHeight: 1499 });

    expect(measureEmbeddedContentHeight(root, body)).toBe(1502);
  });
});

describe("EmbedResizer", () => {
  let originalSelf: WindowProxy | null;
  let resizeObserverCallback: ResizeObserverCallback | undefined;
  let rafQueue: FrameRequestCallback[];
  let postMessageSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    originalSelf = window.self;
    Object.defineProperty(window, "self", {
      configurable: true,
      value: {},
    });

    rafQueue = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      rafQueue.push(callback);
      return rafQueue.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);

    class ResizeObserverMock {
      constructor(callback: ResizeObserverCallback) {
        resizeObserverCallback = callback;
      }

      observe() {}
      unobserve() {}
      disconnect() {}
    }

    globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;

    postMessageSpy = vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
  });

  afterEach(() => {
    Object.defineProperty(window, "self", {
      configurable: true,
      value: originalSelf,
    });
  });

  it("posts a shorter height after the embedded content shrinks", () => {
    render(
      <main data-estimator-root>
        <EmbedResizer />
      </main>
    );

    const root = document.querySelector<HTMLElement>("main[data-estimator-root]");
    expect(root).not.toBeNull();

    setElementHeight(root!, {
      rectHeight: 1501.63,
      scrollHeight: 1502,
      offsetHeight: 1502,
    });
    setElementHeight(document.body, {
      rectHeight: 1502,
      scrollHeight: 1502,
      offsetHeight: 1502,
    });

    act(() => {
      const callbacks = [...rafQueue];
      rafQueue = [];
      callbacks.forEach((callback) => callback(0));
    });

    expect(postMessageSpy).toHaveBeenNthCalledWith(1, {
      type: "goodspeed-estimator:resize",
      height: 1502,
    }, "*");

    setElementHeight(root!, {
      rectHeight: 715.75,
      scrollHeight: 716,
      offsetHeight: 716,
    });
    setElementHeight(document.body, {
      rectHeight: 716,
      scrollHeight: 716,
      offsetHeight: 716,
    });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 1502,
    });
    Object.defineProperty(document.documentElement, "offsetHeight", {
      configurable: true,
      value: 1502,
    });

    act(() => {
      resizeObserverCallback?.([], {} as ResizeObserver);
      const callbacks = [...rafQueue];
      rafQueue = [];
      callbacks.forEach((callback) => callback(0));
    });

    expect(postMessageSpy).toHaveBeenNthCalledWith(2, {
      type: "goodspeed-estimator:resize",
      height: 716,
    }, "*");
  });
});
