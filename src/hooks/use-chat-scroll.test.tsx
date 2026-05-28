// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useChatScroll } from "./use-chat-scroll";

const VIEWPORT_HEIGHT_PX = 100;
const DEFAULT_PADDING_BOTTOM_PX = 40;
const viewportMetrics = new WeakMap<HTMLDivElement, ViewportMetrics>();
const contentMetrics = new WeakMap<HTMLDivElement, ContentMetrics>();

type ViewportMetrics = {
  clientHeight: number;
  contentHeight: number;
  paddingBottom: number;
  scrollTop: number;
};

type ContentMetrics = {
  contentHeight: number;
  paddingBottom: number;
};

type ScrollHarnessProps = {
  contentHeight: number;
  isResponding: boolean;
  messageCount: number;
  paddingBottom?: number;
};

let originalResizeObserver: typeof globalThis.ResizeObserver | undefined;
let originalRequestAnimationFrame: typeof globalThis.requestAnimationFrame;
let originalCancelAnimationFrame: typeof globalThis.cancelAnimationFrame;
let originalIsReactActEnvironment: boolean | undefined;
let resizeObservers: ResizeObserverMock[] = [];
let animationFrameCallbacks = new Map<number, FrameRequestCallback>();
let nextAnimationFrameId = 1;
let animationTimestampMs = 0;

class ResizeObserverMock {
  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    resizeObservers.push(this);
  }

  disconnect() {
    resizeObservers = resizeObservers.filter((observer) => observer !== this);
  }

  observe() {}

  unobserve() {}
}

function ScrollHarness({
  contentHeight,
  isResponding,
  messageCount,
  paddingBottom = DEFAULT_PADDING_BOTTOM_PX,
}: ScrollHarnessProps) {
  const scroll = useChatScroll({
    messages: Array.from({ length: messageCount }, (_, index) => index),
    isResponding,
  });

  const setViewportRef = (node: HTMLDivElement | null) => {
    scroll.viewportRef.current = node;
    if (!node) return;

    let metrics = viewportMetrics.get(node);
    if (!metrics) {
      const nextMetrics: ViewportMetrics = {
        clientHeight: VIEWPORT_HEIGHT_PX,
        contentHeight,
        paddingBottom,
        scrollTop: 0,
      };

      viewportMetrics.set(node, nextMetrics);
      metrics = nextMetrics;

      defineViewportProperty(
        node,
        "clientHeight",
        () => nextMetrics.clientHeight,
      );
      defineViewportProperty(node, "scrollHeight", () =>
        Math.max(
          nextMetrics.clientHeight,
          nextMetrics.contentHeight + nextMetrics.paddingBottom,
        ),
      );
      defineViewportProperty(
        node,
        "scrollTop",
        () => nextMetrics.scrollTop,
        (value) => {
          const maxScrollTop = Math.max(
            0,
            Math.max(
              nextMetrics.clientHeight,
              nextMetrics.contentHeight + nextMetrics.paddingBottom,
            ) - nextMetrics.clientHeight,
          );

          nextMetrics.scrollTop = Math.min(Math.max(0, value), maxScrollTop);
        },
      );
    }

    metrics.contentHeight = contentHeight;
    metrics.paddingBottom = paddingBottom;
  };

  const setContentRef = (node: HTMLDivElement | null) => {
    scroll.contentRef.current = node;
    if (!node) return;

    let metrics = contentMetrics.get(node);
    if (!metrics) {
      const nextMetrics: ContentMetrics = {
        contentHeight,
        paddingBottom,
      };

      contentMetrics.set(node, nextMetrics);
      metrics = nextMetrics;
      node.getBoundingClientRect = () =>
        ({
          bottom: nextMetrics.contentHeight + nextMetrics.paddingBottom,
          height: nextMetrics.contentHeight + nextMetrics.paddingBottom,
          left: 0,
          right: 0,
          top: 0,
          width: 0,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }) satisfies DOMRect;
    }

    metrics.contentHeight = contentHeight;
    metrics.paddingBottom = paddingBottom;
  };

  return (
    <div>
      <span data-testid="state">
        {scroll.isAtBottom ? "bottom" : "away-from-bottom"}
      </span>
      <button type="button" onClick={scroll.scrollToBottom}>
        Follow latest
      </button>
      <div ref={setViewportRef} data-testid="viewport">
        <div
          ref={setContentRef}
          data-testid="content"
          style={{ paddingBottom }}
        >
          <div style={{ height: contentHeight }} />
        </div>
      </div>
    </div>
  );
}

describe("useChatScroll", () => {
  beforeEach(() => {
    resizeObservers = [];
    animationFrameCallbacks = new Map();
    nextAnimationFrameId = 1;
    animationTimestampMs = 0;
    originalResizeObserver = globalThis.ResizeObserver;
    originalRequestAnimationFrame = globalThis.requestAnimationFrame;
    originalCancelAnimationFrame = globalThis.cancelAnimationFrame;
    originalIsReactActEnvironment = (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT;
    globalThis.ResizeObserver =
      ResizeObserverMock as unknown as typeof ResizeObserver;
    globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      const id = nextAnimationFrameId++;
      animationFrameCallbacks.set(id, callback);
      return id;
    }) as typeof requestAnimationFrame;
    globalThis.cancelAnimationFrame = ((id: number) => {
      animationFrameCallbacks.delete(id);
    }) as typeof cancelAnimationFrame;
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(() => {
    if (originalResizeObserver) {
      globalThis.ResizeObserver = originalResizeObserver;
    } else {
      delete (globalThis as { ResizeObserver?: typeof ResizeObserver })
        .ResizeObserver;
    }

    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = originalIsReactActEnvironment;

    document.body.innerHTML = "";
  });

  it("lands at the true bottom after existing conversation hydration", async () => {
    const harness = await renderHarness({
      contentHeight: 0,
      isResponding: false,
      messageCount: 0,
    });

    await harness.rerender({
      contentHeight: 300,
      isResponding: false,
      messageCount: 3,
    });

    expect(getScrollTop(harness.viewport)).toBe(240);
    expect(getBottomDelta(harness.viewport)).toBe(0);
    expect(getStateText(harness.container)).toBe("bottom");

    harness.dispose();
  });

  it("animates to the true bottom when the arrow is clicked", async () => {
    const harness = await renderHarness({
      contentHeight: 300,
      isResponding: false,
      messageCount: 3,
    });

    await setScrollTop(harness.viewport, 120);

    expect(getStateText(harness.container)).toBe("away-from-bottom");

    await act(async () => {
      harness.button.click();
    });

    expect(getScrollTop(harness.viewport)).toBe(120);

    await advanceAnimationFrames(2, 32);

    expect(getScrollTop(harness.viewport)).toBeGreaterThan(120);
    expect(getScrollTop(harness.viewport)).toBeLessThan(240);
    expect(getBottomDelta(harness.viewport)).toBeGreaterThan(0);

    await runAnimationFramesUntilIdle();

    expect(getScrollTop(harness.viewport)).toBe(240);
    expect(getBottomDelta(harness.viewport)).toBe(0);
    expect(getStateText(harness.container)).toBe("bottom");

    harness.dispose();
  });

  it("keeps following streamed content while auto-follow is enabled", async () => {
    const harness = await renderHarness({
      contentHeight: 320,
      isResponding: true,
      messageCount: 1,
    });

    expect(getScrollTop(harness.viewport)).toBe(260);
    expect(getBottomDelta(harness.viewport)).toBe(0);

    await harness.rerender({
      contentHeight: 480,
      isResponding: true,
      messageCount: 1,
    });
    await triggerResizeObservers();

    expect(getScrollTop(harness.viewport)).toBe(420);
    expect(getBottomDelta(harness.viewport)).toBe(0);
    expect(getStateText(harness.container)).toBe("bottom");

    harness.dispose();
  });

  it("stops following when the user scrolls away during streaming", async () => {
    const harness = await renderHarness({
      contentHeight: 360,
      isResponding: true,
      messageCount: 2,
    });

    await setScrollTop(harness.viewport, 120);

    expect(getStateText(harness.container)).toBe("away-from-bottom");

    await harness.rerender({
      contentHeight: 520,
      isResponding: true,
      messageCount: 2,
    });
    await triggerResizeObservers();

    expect(getScrollTop(harness.viewport)).toBe(120);
    expect(getBottomDelta(harness.viewport)).toBe(340);
    expect(getStateText(harness.container)).toBe("away-from-bottom");

    harness.dispose();
  });

  it("resumes follow mode after clicking the arrow during streaming", async () => {
    const harness = await renderHarness({
      contentHeight: 400,
      isResponding: true,
      messageCount: 2,
    });

    await setScrollTop(harness.viewport, 110);

    await act(async () => {
      harness.button.click();
    });

    await runAnimationFramesUntilIdle();

    expect(getScrollTop(harness.viewport)).toBe(340);
    expect(getStateText(harness.container)).toBe("bottom");

    await harness.rerender({
      contentHeight: 560,
      isResponding: true,
      messageCount: 2,
    });
    await triggerResizeObservers();

    expect(getScrollTop(harness.viewport)).toBe(500);
    expect(getBottomDelta(harness.viewport)).toBe(0);
    expect(getStateText(harness.container)).toBe("bottom");

    harness.dispose();
  });

  it("re-enables auto-follow when the user manually scrolls back to bottom", async () => {
    const harness = await renderHarness({
      contentHeight: 420,
      isResponding: true,
      messageCount: 3,
    });

    await setScrollTop(harness.viewport, 140);
    expect(getStateText(harness.container)).toBe("away-from-bottom");

    await setScrollTop(harness.viewport, getMaxScrollTop(harness.viewport));
    expect(getStateText(harness.container)).toBe("bottom");

    await harness.rerender({
      contentHeight: 520,
      isResponding: true,
      messageCount: 3,
    });
    await triggerResizeObservers();

    expect(getScrollTop(harness.viewport)).toBe(460);
    expect(getBottomDelta(harness.viewport)).toBe(0);
    expect(getStateText(harness.container)).toBe("bottom");

    harness.dispose();
  });

  it("does not treat transcript padding as being away from bottom", async () => {
    const harness = await renderHarness({
      contentHeight: 300,
      isResponding: false,
      messageCount: 3,
      paddingBottom: 40,
    });

    expect(getScrollTop(harness.viewport)).toBe(240);
    expect(getBottomDelta(harness.viewport)).toBe(0);
    expect(getStateText(harness.container)).toBe("bottom");

    harness.dispose();
  });
});

function defineViewportProperty(
  viewport: HTMLDivElement,
  propertyName: "clientHeight" | "scrollHeight" | "scrollTop",
  getValue: () => number,
  setValue?: (value: number) => void,
) {
  Object.defineProperty(viewport, propertyName, {
    configurable: true,
    get: getValue,
    set: setValue,
  });
}

async function renderHarness(initialProps: ScrollHarnessProps) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);

  async function render(props: ScrollHarnessProps) {
    await act(async () => {
      root.render(<ScrollHarness {...props} />);
    });
  }

  await render(initialProps);

  const viewport = getViewport(container);
  const button = container.querySelector("button");

  if (!(button instanceof HTMLButtonElement)) {
    throw new Error("Expected follow button to be rendered");
  }

  return {
    button,
    container,
    viewport,
    dispose: () => {
      root.unmount();
      container.remove();
    },
    rerender: render,
  };
}

async function setScrollTop(viewport: HTMLDivElement, nextScrollTop: number) {
  await act(async () => {
    viewport.scrollTop = nextScrollTop;
    viewport.dispatchEvent(new Event("scroll"));
  });
}

async function triggerResizeObservers() {
  await act(async () => {
    for (const observer of resizeObservers) {
      observer.callback([] as ResizeObserverEntry[], observer as never);
    }
  });
}

async function advanceAnimationFrames(frameCount = 1, frameDurationMs = 16) {
  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    if (animationFrameCallbacks.size === 0) {
      return;
    }

    animationTimestampMs += frameDurationMs;
    const callbacks = [...animationFrameCallbacks.entries()];
    animationFrameCallbacks.clear();

    await act(async () => {
      for (const [, callback] of callbacks) {
        callback(animationTimestampMs);
      }
    });
  }
}

async function runAnimationFramesUntilIdle(
  maxFrames = 60,
  frameDurationMs = 16,
) {
  let framesRun = 0;

  while (animationFrameCallbacks.size > 0 && framesRun < maxFrames) {
    framesRun += 1;
    await advanceAnimationFrames(1, frameDurationMs);
  }

  if (animationFrameCallbacks.size > 0) {
    throw new Error("Animation frames did not settle");
  }
}

function getViewport(container: HTMLDivElement) {
  const viewport = container.querySelector("[data-testid='viewport']");
  if (!(viewport instanceof HTMLDivElement)) {
    throw new Error("Expected viewport element");
  }

  return viewport;
}

function getMetrics(viewport: HTMLDivElement) {
  const metrics = viewportMetrics.get(viewport);
  if (!metrics) {
    throw new Error("Missing viewport metrics");
  }

  return metrics;
}

function getMaxScrollTop(viewport: HTMLDivElement) {
  const metrics = getMetrics(viewport);
  return Math.max(
    0,
    Math.max(
      metrics.clientHeight,
      metrics.contentHeight + metrics.paddingBottom,
    ) - metrics.clientHeight,
  );
}

function getScrollTop(viewport: HTMLDivElement) {
  return getMetrics(viewport).scrollTop;
}

function getBottomDelta(viewport: HTMLDivElement) {
  const metrics = getMetrics(viewport);
  const scrollHeight = Math.max(
    metrics.clientHeight,
    metrics.contentHeight + metrics.paddingBottom,
  );

  return scrollHeight - metrics.scrollTop - metrics.clientHeight;
}

function getStateText(container: HTMLDivElement) {
  const state = container.querySelector("[data-testid='state']");
  if (!(state instanceof HTMLSpanElement)) {
    throw new Error("Expected state element");
  }

  return state.textContent;
}
