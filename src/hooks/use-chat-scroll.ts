import { useEffect, useRef, useState } from "react";

export function useChatScroll() {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;

    const viewport = el.closest<HTMLElement>(
      "[data-radix-scroll-area-viewport]",
    );
    if (!viewport) return;

    const checkAtBottom = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      setIsAtBottom(scrollHeight - scrollTop - clientHeight < 10);
    };

    checkAtBottom();
    viewport.addEventListener("scroll", checkAtBottom, { passive: true });
    const ro = new ResizeObserver(checkAtBottom);
    ro.observe(viewport);

    return () => {
      viewport.removeEventListener("scroll", checkAtBottom);
      ro.disconnect();
    };
  }, []);

  return {
    bottomRef,
    isAtBottom,
    scrollToBottom: () => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    },
  };
}
