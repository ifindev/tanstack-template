import { Check, Copy } from "lucide-react";
import {
  Children,
  type ComponentProps,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactMarkdown, {
  type Components,
  MarkdownAsync,
  MarkdownHooks,
  type Options as MarkdownOptions,
} from "react-markdown";
import rehypePrettyCode, {
  type Options as PrettyCodeOptions,
} from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

type MessageMarkdownProps = {
  content: string;
};

type MarkdownDataAttributes = {
  "data-language"?: string;
  "data-theme"?: string;
};

type MarkdownFigureProps = ComponentProps<"figure"> &
  MarkdownDataAttributes & {
    children?: ReactNode;
    node?: unknown;
  };

type MarkdownPreProps = ComponentProps<"pre"> &
  MarkdownDataAttributes & {
    children?: ReactNode;
    node?: unknown;
  };

type MarkdownCodeProps = ComponentProps<"code"> &
  MarkdownDataAttributes & {
    children?: ReactNode;
    node?: unknown;
  };

type BlockCodeElement = ReactElement<MarkdownCodeProps>;

const prettyCodeOptions = {
  theme: "github-light",
  keepBackground: false,
  defaultLang: { block: "text" },
  bypassInlineCode: true,
} satisfies PrettyCodeOptions;

const assistantMarkdownRemarkPlugins = [remarkGfm] satisfies NonNullable<
  MarkdownOptions["remarkPlugins"]
>;
const assistantMarkdownRehypePlugins = [
  [rehypePrettyCode, prettyCodeOptions],
] satisfies NonNullable<MarkdownOptions["rehypePlugins"]>;

type AssistantMarkdownOptions = Omit<MarkdownOptions, "children">;

export function getMarkdownTextContent(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }

      if (isValidElement<{ children?: ReactNode }>(child)) {
        return getMarkdownTextContent(child.props.children);
      }

      return "";
    })
    .join("");
}

function getLanguageLabel(
  className?: string,
  dataLanguage?: unknown,
): string | null {
  if (typeof dataLanguage === "string" && dataLanguage.length > 0) {
    return dataLanguage;
  }

  if (!className) return null;

  const match = /language-([a-z0-9_-]+)/i.exec(className);
  return match?.[1] ?? null;
}

function normalizeCodeContent(content: string): string {
  return content.replace(/\n$/, "");
}

function isBlockCodeElement(element: ReactNode): element is BlockCodeElement {
  return isValidElement<MarkdownCodeProps>(element);
}

function getAssistantMarkdownOptions({
  highlighted,
}: {
  highlighted: boolean;
}): AssistantMarkdownOptions {
  return {
    components: assistantMarkdownComponents,
    rehypePlugins: highlighted ? assistantMarkdownRehypePlugins : undefined,
    remarkPlugins: assistantMarkdownRemarkPlugins,
    skipHtml: true,
  };
}

function CopyCodeButton({ code }: { code: string }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const resetTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    if (
      typeof navigator === "undefined" ||
      typeof navigator.clipboard?.writeText !== "function"
    ) {
      setCopyState("error");
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }

    if (resetTimeoutRef.current !== null) {
      window.clearTimeout(resetTimeoutRef.current);
    }

    resetTimeoutRef.current = window.setTimeout(() => {
      setCopyState("idle");
      resetTimeoutRef.current = null;
    }, 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-[0.68rem] font-medium tracking-[0.12em] uppercase text-muted-foreground transition hover:border-border hover:text-foreground"
      aria-label="Copy code block"
    >
      {copyState === "copied" ? (
        <Check className="size-3" />
      ) : (
        <Copy className="size-3" />
      )}
      {copyState === "copied"
        ? "Copied"
        : copyState === "error"
          ? "Unavailable"
          : "Copy"}
    </button>
  );
}

function MarkdownBlockShell({
  children,
  code,
  languageLabel,
}: {
  children: ReactNode;
  code: string;
  languageLabel: string | null;
}) {
  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-border bg-surface-soft/70">
      <div className="flex items-center justify-between gap-3 border-b border-border/80 px-3 py-2">
        <span className="min-h-4 text-[0.68rem] font-medium tracking-[0.12em] uppercase text-muted-foreground">
          {languageLabel ?? ""}
        </span>
        <CopyCodeButton code={code} />
      </div>
      {children}
    </div>
  );
}

function MarkdownFigure({
  children,
  className,
  node: _node,
  ...props
}: MarkdownFigureProps) {
  return (
    <figure {...props} className={cn("m-0", className)}>
      {children}
    </figure>
  );
}

function MarkdownPre({
  children,
  className,
  node: _node,
  ...props
}: MarkdownPreProps) {
  const codeChild = Children.toArray(children)[0];

  if (isBlockCodeElement(codeChild)) {
    const {
      children: codeChildren,
      className: codeClassName,
      ...codeProps
    } = codeChild.props;
    const code = normalizeCodeContent(getMarkdownTextContent(codeChildren));
    const languageLabel = getLanguageLabel(
      typeof codeClassName === "string" ? codeClassName : undefined,
      codeProps["data-language"],
    );

    return (
      <MarkdownBlockShell code={code} languageLabel={languageLabel}>
        <pre
          {...props}
          className={cn(
            "overflow-x-auto px-4 py-3 font-mono text-[0.8125rem] leading-6 text-foreground",
            className,
          )}
        >
          {codeChild}
        </pre>
      </MarkdownBlockShell>
    );
  }

  return (
    <pre
      {...props}
      className={cn(
        "my-4 overflow-x-auto rounded-2xl border border-border bg-surface-soft/70 px-4 py-3 font-mono text-[0.8125rem] leading-6 text-foreground",
        className,
      )}
    >
      {children}
    </pre>
  );
}

function MarkdownCode({
  children,
  className,
  node: _node,
  ...props
}: MarkdownCodeProps) {
  const isBlockCode =
    typeof className === "string" ||
    typeof props["data-language"] === "string" ||
    typeof props["data-theme"] === "string";

  if (isBlockCode) {
    return (
      <code {...props} className={className}>
        {children}
      </code>
    );
  }

  return (
    <code className="rounded-md bg-surface-soft px-1.5 py-0.5 font-mono text-[0.8125rem] break-words text-foreground">
      {children}
    </code>
  );
}

export const assistantMarkdownComponents: Components = {
  a: ({ children, href, ...props }) => (
    <a
      {...props}
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="font-medium text-primary underline decoration-primary/40 underline-offset-4 transition hover:decoration-primary"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-primary/35 pl-4 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  code: MarkdownCode,
  em: ({ children }) => <em className="italic">{children}</em>,
  figure: MarkdownFigure,
  li: ({ children }) => <li className="pl-1 leading-7">{children}</li>,
  ol: ({ children }) => (
    <ol className="my-4 list-decimal space-y-2 pl-6">{children}</ol>
  ),
  p: ({ children }) => <p className="my-4 break-words leading-7">{children}</p>,
  pre: MarkdownPre,
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-2xl border border-border">
      <table className="min-w-full border-collapse text-left text-[0.8125rem] leading-6">
        {children}
      </table>
    </div>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  td: ({ children }) => (
    <td className="px-3 py-2 align-top text-foreground">{children}</td>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 font-semibold text-foreground">{children}</th>
  ),
  thead: ({ children }) => (
    <thead className="bg-surface-soft/70">{children}</thead>
  ),
  tr: ({ children }) => (
    <tr className="border-t border-border/80">{children}</tr>
  ),
  ul: ({ children }) => (
    <ul className="my-4 list-disc space-y-2 pl-6">{children}</ul>
  ),
};

function MarkdownContainer({ children }: { children: ReactNode }) {
  return (
    <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      {children}
    </div>
  );
}

export async function renderMessageMarkdownAsync(content: string) {
  const markdown = await MarkdownAsync({
    ...getAssistantMarkdownOptions({ highlighted: true }),
    children: content,
  });

  return <MarkdownContainer>{markdown}</MarkdownContainer>;
}

export default function MessageMarkdown({ content }: MessageMarkdownProps) {
  return (
    <MarkdownContainer>
      <MarkdownHooks
        {...getAssistantMarkdownOptions({ highlighted: true })}
        fallback={
          <ReactMarkdown
            {...getAssistantMarkdownOptions({ highlighted: false })}
          >
            {content}
          </ReactMarkdown>
        }
      >
        {content}
      </MarkdownHooks>
    </MarkdownContainer>
  );
}
