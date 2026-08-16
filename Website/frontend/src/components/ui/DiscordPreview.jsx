import React from 'react';

/**
 * Renders Discord markdown into styled HTML for live previews.
 * Supports: **bold**, *italic*, ***bold italic***, __underline__, ~~strikethrough~~,
 * `code`, ```code blocks```, > quotes, >>> block quotes,
 * <#channelId>, <@userId>, <@&roleId>, <:name:id>, <a:name:id>, [text](url)
 */

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parseDiscordMarkdown(text, channels = [], roles = []) {
  if (!text) return null;

  // Split by lines for block-level processing
  const lines = text.split('\n');
  const elements = [];
  let inBlockQuote = false;
  let blockQuoteLines = [];

  const flushBlockQuote = () => {
    if (blockQuoteLines.length > 0) {
      elements.push(
        <div key={`bq-${elements.length}`} style={{
          borderLeft: '4px solid #4e5058',
          paddingLeft: '12px',
          margin: '4px 0',
        }}>
          {blockQuoteLines.map((line, i) => (
            <span key={i}>{formatInline(line, channels, roles)}{i < blockQuoteLines.length - 1 && <br />}</span>
          ))}
        </div>
      );
      blockQuoteLines = [];
    }
    inBlockQuote = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // >>> block quote (rest of message)
    if (line.startsWith('>>> ')) {
      inBlockQuote = true;
      blockQuoteLines.push(line.slice(4));
      // Collect remaining lines
      for (let j = i + 1; j < lines.length; j++) {
        blockQuoteLines.push(lines[j]);
      }
      flushBlockQuote();
      break;
    }

    // > single line quote
    if (line.startsWith('> ')) {
      if (!inBlockQuote) {
        flushBlockQuote();
      }
      inBlockQuote = true;
      blockQuoteLines.push(line.slice(2));
      continue;
    }

    // Not a quote line
    if (inBlockQuote) {
      flushBlockQuote();
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={`br-${i}`} style={{ height: '8px' }} />);
      continue;
    }

    elements.push(
      <div key={`line-${i}`}>{formatInline(line, channels, roles)}</div>
    );
  }

  if (inBlockQuote) {
    flushBlockQuote();
  }

  return elements;
}

function formatInline(text, channels = [], roles = []) {
  if (!text) return null;
  
  const parts = [];
  let remaining = text;
  let keyCounter = 0;

  // Process the text character by character with regex patterns
  const patterns = [
    // Code blocks (inline)
    { regex: /`([^`]+)`/, render: (match) => (
      <code key={keyCounter++} style={{ background: '#1e1f22', padding: '2px 6px', borderRadius: '3px', fontSize: '85%', fontFamily: '"Consolas", "Monaco", monospace', color: '#d4d4d4' }}>
        {match[1]}
      </code>
    )},
    // Custom animated emoji <a:name:id> or <a:id>
    { regex: /<a:(?:([^:]*):)?(\d+)>/, render: (match) => (
      <img key={keyCounter++} src={`https://cdn.discordapp.com/emojis/${match[2]}.gif`} alt={match[1] || 'emoji'} style={{ width: '22px', height: '22px', verticalAlign: 'middle', margin: '0 2px' }} />
    )},
    // Custom emoji <:name:id> or <:id>
    { regex: /<:(?:([^:]*):)?(\d+)>/, render: (match) => (
      <img key={keyCounter++} src={`https://cdn.discordapp.com/emojis/${match[2]}.webp`} alt={match[1] || 'emoji'} style={{ width: '22px', height: '22px', verticalAlign: 'middle', margin: '0 2px' }} />
    )},
    // Channel mention <#id>
    { regex: /<#(\d+)>/, render: (match) => {
      const ch = channels.find(c => c.id === match[1]);
      return (
        <span key={keyCounter++} style={{ background: 'rgba(88,101,242,0.15)', color: '#c9cdfb', padding: '0 4px', borderRadius: '3px', fontWeight: '500', cursor: 'pointer' }}>
          #{ch ? ch.name : match[1]}
        </span>
      );
    }},
    // Role mention <@&id>
    { regex: /<@&(\d+)>/, render: (match) => {
      const role = roles.find(r => r.id === match[1]);
      const color = role?.color || '#c9cdfb';
      return (
        <span key={keyCounter++} style={{ background: `${color}22`, color: color, padding: '0 4px', borderRadius: '3px', fontWeight: '500' }}>
          @{role ? role.name : match[1]}
        </span>
      );
    }},
    // User mention <@id> or <@!id>
    { regex: /<@!?(\d+)>/, render: (match) => (
      <span key={keyCounter++} style={{ background: 'rgba(88,101,242,0.15)', color: '#c9cdfb', padding: '0 4px', borderRadius: '3px', fontWeight: '500', cursor: 'pointer' }}>
        @user
      </span>
    )},
    // Hyperlinks [text](url)
    { regex: /\[([^\]]+)\]\(([^)]+)\)/, render: (match) => (
      <a key={keyCounter++} href={match[2]} target="_blank" rel="noopener noreferrer" style={{ color: '#00A8FC', textDecoration: 'none' }}>
        {match[1]}
      </a>
    )},
    // Bold italic ***text***
    { regex: /\*\*\*(.+?)\*\*\*/, render: (match) => (
      <strong key={keyCounter++}><em>{formatInline(match[1], channels, roles)}</em></strong>
    )},
    // Bold **text**
    { regex: /\*\*(.+?)\*\*/, render: (match) => (
      <strong key={keyCounter++}>{formatInline(match[1], channels, roles)}</strong>
    )},
    // Italic *text*
    { regex: /\*(.+?)\*/, render: (match) => (
      <em key={keyCounter++}>{formatInline(match[1], channels, roles)}</em>
    )},
    // Underline __text__
    { regex: /__(.+?)__/, render: (match) => (
      <u key={keyCounter++}>{formatInline(match[1], channels, roles)}</u>
    )},
    // Strikethrough ~~text~~
    { regex: /~~(.+?)~~/, render: (match) => (
      <s key={keyCounter++}>{formatInline(match[1], channels, roles)}</s>
    )},
  ];

  // Iteratively find the earliest match
  while (remaining.length > 0) {
    let earliestMatch = null;
    let earliestIndex = Infinity;
    let earliestPattern = null;

    for (const pattern of patterns) {
      const match = remaining.match(pattern.regex);
      if (match && match.index < earliestIndex) {
        earliestMatch = match;
        earliestIndex = match.index;
        earliestPattern = pattern;
      }
    }

    if (!earliestMatch) {
      // No more patterns found, push remaining text
      parts.push(remaining);
      break;
    }

    // Push text before the match
    if (earliestIndex > 0) {
      parts.push(remaining.slice(0, earliestIndex));
    }

    // Push the rendered match
    parts.push(earliestPattern.render(earliestMatch));

    // Move past the match
    remaining = remaining.slice(earliestIndex + earliestMatch[0].length);
  }

  return parts;
}

// Replace {user}, {server}, {count}, {id} placeholders with styled spans
function replaceVariables(text) {
  if (!text) return text;
  return text
    .replace(/\{user\}/g, '@User')
    .replace(/\{server\}/g, 'My Server')
    .replace(/\{count\}/g, '1,234')
    .replace(/\{id\}/g, '123456789012345678');
}

export default function DiscordPreview({ content, embedColor, embedAuthor, embedTitle, embedDesc, embedFooter, embedImage, embedThumbnail, imageUrl, mode, accentColor = '#5865F2', cardTitle = 'WELCOME', channels = [], roles = [] }) {
  const previewContent = replaceVariables(content);
  const previewTitle = replaceVariables(embedTitle);
  const previewDesc = replaceVariables(embedDesc);
  const previewFooter = replaceVariables(embedFooter);
  const previewAuthor = replaceVariables(embedAuthor);

  return (
    <div>
      <label style={{ color: '#fff', display: 'block', marginBottom: '12px', fontWeight: '600' }}>Live Discord Preview</label>
      <div style={{ background: '#313338', borderRadius: '8px', padding: '16px', display: 'flex', gap: '16px', fontFamily: '"gg sans", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: accentColor, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>
          O
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ color: '#F2F3F5', fontWeight: '500', fontSize: '16px' }}>Orbit</span>
            <span style={{ background: '#5865F2', color: '#fff', fontSize: '10px', padding: '2px 4px', borderRadius: '3px', fontWeight: 'bold', textTransform: 'uppercase' }}>Bot</span>
            <span style={{ color: '#949BA4', fontSize: '12px' }}>Today at 12:00 PM</span>
          </div>

          {/* Content text (outside embed) */}
          {previewContent && (
            <div style={{ color: '#DBDEE1', fontSize: '14px', marginBottom: '8px', lineHeight: '1.375', wordBreak: 'break-word' }}>
              {parseDiscordMarkdown(previewContent, channels, roles)}
            </div>
          )}

          {/* Embed */}
          {mode === 'embed' && (previewAuthor || previewTitle || previewDesc || previewFooter || embedImage) && (
            <div style={{ background: '#2B2D31', borderRadius: '4px', borderLeft: `4px solid ${embedColor || accentColor}`, padding: '12px 16px', maxWidth: '432px', display: 'flex' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {previewAuthor && (
                  <div style={{ color: '#F2F3F5', fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {previewAuthor}
                  </div>
                )}
                {previewTitle && (
                  <div style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
                    {parseDiscordMarkdown(previewTitle, channels, roles)}
                  </div>
                )}
                {previewDesc && (
                  <div style={{ color: '#DBDEE1', fontSize: '14px', lineHeight: '1.375', wordBreak: 'break-word', marginBottom: embedImage ? '12px' : '0' }}>
                    {parseDiscordMarkdown(previewDesc, channels, roles)}
                  </div>
                )}
                {embedImage && (
                  <img src={embedImage} style={{ width: '100%', borderRadius: '4px', marginTop: '8px', maxHeight: '300px', objectFit: 'cover' }} alt="" onError={(e) => e.target.style.display = 'none'} />
                )}
                {previewFooter && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ color: '#949BA4', fontSize: '12px' }}>{previewFooter}</span>
                  </div>
                )}
              </div>
              {embedThumbnail && (
                <div style={{ width: '80px', height: '80px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, marginLeft: '16px' }}>
                  <img src={embedThumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
            </div>
          )}

          {/* Image card mode */}
          {mode === 'image' && (
            <div style={{ maxWidth: '400px', borderRadius: '8px', overflow: 'hidden', position: 'relative', background: '#2B2D31', minHeight: '180px' }}>
              {imageUrl ? (
                <img src={imageUrl} style={{ width: '100%', display: 'block', objectFit: 'cover', minHeight: '180px', maxHeight: '250px' }} alt="Card Background" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <div style={{ width: '100%', height: '200px', background: `linear-gradient(135deg, ${accentColor}33, #1f2023, #2b2d31)` }}></div>
              )}
              
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `linear-gradient(135deg, ${accentColor}55, rgba(0,0,0,0.7))`, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '30px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#313338', marginBottom: '12px', border: `3px solid ${accentColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                  <img src="https://cdn.discordapp.com/embed/avatars/0.png" style={{ width: '100%' }} alt="User Avatar" />
                </div>
                <div style={{ color: '#fff', fontSize: '22px', fontWeight: '800', fontStyle: 'italic', letterSpacing: '1px', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{cardTitle}</div>
                <div style={{ color: '#fff', fontSize: '14px', opacity: 0.9, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>@User</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { parseDiscordMarkdown, replaceVariables };
