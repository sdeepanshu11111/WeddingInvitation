import Link from "next/link";
import type { ReactNode } from "react";
import type { GuideBlock } from "@/lib/guides";

/** Text with [label](/path) links (lib/guides.ts) → text and next/link elements. Internal paths only. */
export function Inline({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <Link key={m.index} href={m[2]}>
        {m[1]}
      </Link>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

/** One block of a guide: a paragraph, a list, numbered steps, a wording sample or a tip. */
export function Block({ b }: { b: GuideBlock }) {
  if (typeof b === "string")
    return (
      <p>
        <Inline text={b} />
      </p>
    );
  if ("list" in b)
    return (
      <ul>
        {b.list.map((x, i) => (
          <li key={i}>
            <Inline text={x} />
          </li>
        ))}
      </ul>
    );
  if ("steps" in b)
    return (
      <ol>
        {b.steps.map((x, i) => (
          <li key={i}>
            <Inline text={x} />
          </li>
        ))}
      </ol>
    );
  if ("sample" in b)
    return (
      <figure className="guide-sample">
        {b.label ? <figcaption>{b.label}</figcaption> : null}
        <p>{b.sample}</p>
      </figure>
    );
  return (
    <p className="guide-tip">
      <b>Tip</b> <Inline text={b.tip} />
    </p>
  );
}
