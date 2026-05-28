import { useEffectEvent, useLayoutEffect, useRef, useState } from "react";

type UseChatScrollOptions = {
  messages: unknown[];
  isResponding: boolean;
};

const BOTTOM_OFFSET_THRESHOLD_PX = 6;
const MANUAL_SCROLL_DURATION_MS = 520;

function easeOutCubic(progress: number) {
  return 1 - (1 - progress) ** 3;
}

export function useChatScroll({
  messages,
  isResponding,
}: UseChatScrollOptions) {
  const scrollFollowTrigger = `${messages.length}:${isResponding ? 1 : 0}`;
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const autoFollowEnabledRef = useRef(true);
  const isProgrammaticScrollRef = useRef(false);
  const lastScrollTopRef = useRef(0);
  const scrollAnimationFrameRef = useRef<number | null>(null);

  const getBottomDelta = useEffectEvent(() => {
    const viewport = viewportRef.current;
    if (!viewport) return Number.POSITIVE_INFINITY;

    return viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
  });

  const syncScrollState = useEffectEvent(() => {
    const viewport = viewportRef.current;
    if (!viewport) return false;

    const atBottom = getBottomDelta() <= BOTTOM_OFFSET_THRESHOLD_PX;

    setIsAtBottom(atBottom);
    lastScrollTopRef.current = viewport.scrollTop;

    if (atBottom) {
      autoFollowEnabledRef.current = true;
    }

    return atBottom;
  });

  const cancelScrollAnimation = useEffectEvent(() => {
    if (scrollAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(scrollAnimationFrameRef.current);
      scrollAnimationFrameRef.current = null;
    }

    isProgrammaticScrollRef.current = false;
  });

  const scrollViewportToBottom = useEffectEvent(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    cancelScrollAnimation();
    isProgrammaticScrollRef.current = true;
    viewport.scrollTop = viewport.scrollHeight;
    syncScrollState();
    isProgrammaticScrollRef.current = false;
  });

  const animateViewportToBottom = useEffectEvent(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const startScrollTop = viewport.scrollTop;
    const targetScrollTop = viewport.scrollHeight - viewport.clientHeight;

    cancelScrollAnimation();

    if (targetScrollTop <= startScrollTop) {
      scrollViewportToBottom();
      return;
    }

    if (typeof window.requestAnimationFrame !== "function") {
      scrollViewportToBottom();
      return;
    }

    let startTime: number | null = null;

    isProgrammaticScrollRef.current = true;

    const step = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / MANUAL_SCROLL_DURATION_MS, 1);
      const easedProgress = easeOutCubic(progress);

      viewport.scrollTop =
        startScrollTop + (targetScrollTop - startScrollTop) * easedProgress;

      if (progress < 1) {
        scrollAnimationFrameRef.current = window.requestAnimationFrame(step);
        return;
      }

      viewport.scrollTop = targetScrollTop;
      scrollAnimationFrameRef.current = null;
      syncScrollState();
      isProgrammaticScrollRef.current = false;
    };

    scrollAnimationFrameRef.current = window.requestAnimationFrame(step);
  });

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleScroll = () => {
      const atBottom = getBottomDelta() <= BOTTOM_OFFSET_THRESHOLD_PX;
      const currentScrollTop = viewport.scrollTop;

      setIsAtBottom(atBottom);

      if (isProgrammaticScrollRef.current) {
        lastScrollTopRef.current = currentScrollTop;
        if (atBottom) {
          autoFollowEnabledRef.current = true;
        }
        return;
      }

      cancelScrollAnimation();

      if (atBottom) {
        autoFollowEnabledRef.current = true;
      } else if (currentScrollTop < lastScrollTopRef.current) {
        autoFollowEnabledRef.current = false;
      }

      lastScrollTopRef.current = currentScrollTop;
    };

    syncScrollState();
    viewport.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      viewport.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useLayoutEffect(() => {
    return () => {
      cancelScrollAnimation();
    };
  }, []);

  useLayoutEffect(() => {
    void scrollFollowTrigger;

    if (autoFollowEnabledRef.current) {
      scrollViewportToBottom();
      return;
    }

    syncScrollState();
  }, [scrollFollowTrigger]);

  useLayoutEffect(() => {
    if (!isResponding || typeof ResizeObserver === "undefined") return;

    const content = contentRef.current;
    if (!content) return;

    let previousHeight = content.getBoundingClientRect().height;

    const observer = new ResizeObserver(() => {
      const nextHeight = content.getBoundingClientRect().height;
      const contentGrew = nextHeight > previousHeight;

      previousHeight = nextHeight;

      if (!contentGrew) {
        syncScrollState();
        return;
      }

      if (!autoFollowEnabledRef.current) {
        syncScrollState();
        return;
      }

      scrollViewportToBottom();
    });

    observer.observe(content);

    return () => {
      observer.disconnect();
    };
  }, [isResponding]);

  return {
    viewportRef,
    contentRef,
    isAtBottom,
    scrollToBottom: () => {
      autoFollowEnabledRef.current = true;
      animateViewportToBottom();
    },
    snapToBottom: () => {
      autoFollowEnabledRef.current = true;
      scrollViewportToBottom();
    },
  };
}
