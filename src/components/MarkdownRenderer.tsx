import React, { useState } from 'react';
import { Copy, Check, Terminal, Code2 } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isStreaming }) => {
  // Parse content into structured blocks
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className="prose-bayan space-y-3.5 leading-relaxed text-[15.5px]">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'heading':
            if (block.level === 1) {
              return (
                <h1 key={idx} className="text-2xl font-bold text-neutral-900 dark:text-white pt-3 pb-1 tracking-tight">
                  {block.text}
                </h1>
              );
            }
            if (block.level === 2) {
              return (
                <h2 key={idx} className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 pt-3 pb-1 tracking-tight">
                  {block.text}
                </h2>
              );
            }
            return (
              <h3 key={idx} className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 pt-2 pb-0.5 tracking-tight">
                {block.text}
              </h3>
            );

          case 'code':
            return <CodeBlock key={idx} code={block.code} language={block.language} />;

          case 'callout':
            return (
              <div
                key={idx}
                className="my-3.5 px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border-s-4 border-indigo-500/80 text-neutral-700 dark:text-neutral-300 text-[14.5px] leading-relaxed"
              >
                <div dangerouslySetInnerHTML={{ __html: formatInline(block.text) }} />
              </div>
            );

          case 'table':
            return <TableBlock key={idx} rows={block.rows} />;

          case 'list':
            return (
              <ul key={idx} className="space-y-1.5 my-2 list-none ps-0">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500 mt-2 shrink-0" />
                    <div
                      className="flex-1"
                      dangerouslySetInnerHTML={{ __html: formatInline(item) }}
                    />
                  </li>
                ))}
              </ul>
            );

          case 'ordered-list':
            return (
              <ol key={idx} className="space-y-1.5 my-2 list-none ps-0">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-semibold shrink-0 mt-0.5 font-mono">
                      {itemIdx + 1}
                    </span>
                    <div
                      className="flex-1"
                      dangerouslySetInnerHTML={{ __html: formatInline(item) }}
                    />
                  </li>
                ))}
              </ol>
            );

          case 'paragraph':
          default:
            return (
              <p
                key={idx}
                className="text-neutral-800 dark:text-neutral-200"
                dangerouslySetInnerHTML={{ __html: formatInline(block.text) }}
              />
            );
        }
      })}
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-indigo-500 animate-pulse ms-1 align-middle" />
      )}
    </div>
  );
};

// Specialized Code Block with Toolbar and Copy
const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLang = language ? language.toUpperCase() : 'CODE';

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 bg-[#16181D] text-neutral-200 text-sm shadow-sm">
      {/* Code Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1E2028] border-b border-neutral-800/80 text-xs select-none">
        <div className="flex items-center gap-2 text-neutral-400 font-mono">
          <Terminal size={13} className="text-neutral-500" />
          <span className="font-semibold tracking-wide text-neutral-300">{displayLang}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400">تم النسخ</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>نسخ الكود</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-4 overflow-x-auto text-[13.5px] font-mono leading-relaxed" dir="ltr">
        <pre className="text-neutral-200">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

// Clean Table Block
const TableBlock: React.FC<{ rows: string[][] }> = ({ rows }) => {
  if (rows.length === 0) return null;
  const header = rows[0];
  const body = rows.slice(1);

  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
      <table className="min-w-full text-start text-sm divide-y divide-neutral-200 dark:divide-neutral-800">
        <thead className="bg-neutral-50/80 dark:bg-neutral-800/40">
          <tr>
            {header.map((col, idx) => (
              <th
                key={idx}
                className="px-4 py-2.5 text-neutral-900 dark:text-neutral-100 font-semibold text-start text-xs uppercase tracking-wider"
                dangerouslySetInnerHTML={{ __html: formatInline(col) }}
              />
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 bg-white dark:bg-transparent">
          {body.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
              {row.map((cell, cIdx) => (
                <td
                  key={cIdx}
                  className="px-4 py-2.5 text-neutral-700 dark:text-neutral-300"
                  dangerouslySetInnerHTML={{ __html: formatInline(cell) }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Inline formatter for bold, code, and links
function formatInline(str: string): string {
  if (!str) return '';
  return str
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-neutral-900 dark:text-white">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em class="italic text-neutral-700 dark:text-neutral-300">$1</em>')
    // Inline code
    .replace(
      /`([^`]+)`/g,
      '<code class="px-1.5 py-0.5 rounded text-[13px] bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-mono border border-neutral-200/50 dark:border-neutral-700/50">$1</code>'
    );
}

// Markdown Parser Helper
type ParsedBlock =
  | { type: 'heading'; level: number; text: string }
  | { type: 'code'; language: string; code: string }
  | { type: 'callout'; text: string }
  | { type: 'table'; rows: string[][] }
  | { type: 'list'; items: string[] }
  | { type: 'ordered-list'; items: string[] }
  | { type: 'paragraph'; text: string };

function parseMarkdownBlocks(text: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code blocks
    if (line.trim().startsWith('```')) {
      const language = line.trim().replace(/^```/, '').trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({
        type: 'code',
        language,
        code: codeLines.join('\n'),
      });
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('#')) {
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        blocks.push({
          type: 'heading',
          level: match[1].length,
          text: match[2],
        });
        i++;
        continue;
      }
    }

    // Callout / Blockquote
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({
        type: 'callout',
        text: quoteLines.join(' '),
      });
      continue;
    }

    // Markdown Table
    if (line.includes('|') && line.trim().startsWith('|')) {
      const tableRows: string[][] = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim().startsWith('|')) {
        // Skip separator row like |:---|:---|
        if (lines[i].match(/^[|\s:-]+$/)) {
          i++;
          continue;
        }
        const cells = lines[i]
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());
        if (cells.length > 0) {
          tableRows.push(cells);
        }
        i++;
      }
      if (tableRows.length > 0) {
        blocks.push({
          type: 'table',
          rows: tableRows,
        });
      }
      continue;
    }

    // Unordered lists (- or *)
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      blocks.push({
        type: 'list',
        items,
      });
      continue;
    }

    // Ordered lists (1. 2.)
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      blocks.push({
        type: 'ordered-list',
        items,
      });
      continue;
    }

    // Empty lines
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Regular Paragraph
    const paraLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('```') &&
      !lines[i].startsWith('>') &&
      !lines[i].startsWith('|') &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }

    blocks.push({
      type: 'paragraph',
      text: paraLines.join(' '),
    });
  }

  return blocks;
}
