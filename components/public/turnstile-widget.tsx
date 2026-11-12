"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("turnstile script failed"));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export type TurnstileHandle = { reset: () => void };

type Props = {
  siteKey: string;
  onToken: (token: string | null) => void;
  /** React 19 passes ref as a normal prop, so no forwardRef wrapper is needed. */
  ref?: Ref<TurnstileHandle>;
};

/**
 * Cloudflare Turnstile, loaded only when the widget scrolls near the viewport
 * (keeps the third-party script off the critical path).
 */
export function TurnstileWidget({ siteKey, onToken, ref }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useImperativeHandle(ref, () => ({
    reset() {
      onTokenRef.current(null);
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    },
  }));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let cancelled = false;

    const mount = async () => {
      try {
        await loadScript();
        if (cancelled || !window.turnstile || widgetId.current) return;
        widgetId.current = window.turnstile.render(el, {
          sitekey: siteKey,
          theme: "dark",
          size: "flexible",
          callback: (token: string) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => onTokenRef.current(null),
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          void mount();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey]);

  return (
    <div>
      {/* Reserves the widget's 65px height, so the form does not jump when Turnstile renders. */}
      <div ref={containerRef} className="min-h-[65px]" />
      {failed && (
        <p role="alert" className="text-sm text-red-400">
          დაცვის შემოწმება ვერ ჩაიტვირთა. განაახლეთ გვერდი.
        </p>
      )}
    </div>
  );
}
