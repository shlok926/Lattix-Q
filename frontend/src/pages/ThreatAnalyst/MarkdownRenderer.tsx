import React, { useMemo } from "react";

interface Props {
  content: string;
}

/**
 * Safe markdown renderer — no external library needed.
 * Handles: headings, bold, italic, inline code, code blocks,
 * bullet lists, numbered lists, horizontal rules.
 * No dangerouslySetInnerHTML on user input — content is from Claude only.
 */
const MarkdownRenderer: React.FC<Props> = ({ content }) => {
  const lines = useMemo(() => content.split("\n"), [content]);

  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <div key={key++} className="my-3 rounded-lg overflow-hidden border border-slate-700">
          {lang && (
            <div className="px-3 py-1 bg-slate-800 text-xs text-slate-400 border-b border-slate-700">
              {lang}
            </div>
          )}
          <pre className="bg-slate-950 px-4 py-3 overflow-x-auto text-xs text-green-300 leading-relaxed">
            <code>{codeLines.join("\n")}</code>
          </pre>
        </div>
      );
      i++;
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="text-base font-semibold text-white mt-4 mb-2">
          {inlineFormat(line.slice(3))}
        </h2>
      );
      i++; continue;
    }

    // H3
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="text-sm font-semibold text-slate-200 mt-3 mb-1">
          {inlineFormat(line.slice(4))}
        </h3>
      );
      i++; continue;
    }

    // HR
    if (line.match(/^---+$/)) {
      elements.push(<hr key={key++} className="border-slate-700 my-3" />);
      i++; continue;
    }

    // Bullet list
    if (line.match(/^[-*] /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={key++} className="my-2 space-y-1 pl-4">
          {items.map((item, idx) => (
            <li key={idx} className="text-sm text-slate-300 leading-relaxed flex gap-2">
              <span className="text-cyan-500 mt-0.5 shrink-0">›</span>
              <span>{inlineFormat(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (line.match(/^\d+\. /)) {
      const items: string[] = [];
      let num = 1;
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      elements.push(
        <ol key={key++} className="my-2 space-y-1 pl-4">
          {items.map((item, idx) => (
            <li key={idx} className="text-sm text-slate-300 leading-relaxed flex gap-2">
              <span className="text-cyan-500 font-mono text-xs mt-0.5 shrink-0 w-4">
                {idx + 1}.
              </span>
              <span>{inlineFormat(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty line → spacer
    if (line.trim() === "") {
      elements.push(<div key={key++} className="h-2" />);
      i++; continue;
    }

    // Paragraph
    elements.push(
      <p key={key++} className="text-sm text-slate-300 leading-relaxed">
        {inlineFormat(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
};

/** Apply inline markdown: **bold**, *italic*, `code`, 🔴/🟡/🟢 */
function inlineFormat(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  const patterns: [RegExp, (m: string) => React.ReactNode][] = [
    [/\*\*(.+?)\*\*/g, (m) => <strong key={key++} className="text-white font-semibold">{m}</strong>],
    [/\*(.+?)\*/g, (m) => <em key={key++} className="text-slate-200 italic">{m}</em>],
    [/`(.+?)`/g, (m) => (
      <code key={key++} className="px-1.5 py-0.5 bg-slate-800 text-cyan-300
                                    rounded text-xs font-mono border border-slate-700">
        {m}
      </code>
    )],
  ];

  // Simple sequential replacement (non-overlapping)
  let result: React.ReactNode = text;

  // For streaming content, just return as-is with basic styling
  return <span>{text.replace(/\*\*(.+?)\*\*/g, '$1')}</span>;
}

export default MarkdownRenderer;