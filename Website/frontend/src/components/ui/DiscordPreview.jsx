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
    // Custom Variable Pills {{pill:color:text}}
    { regex: /\{\{pill:([^:]+):([^}]+)\}\}/, render: (match) => {
      const color = match[1];
      const text = match[2];
      let bg, textColor;
      switch (color) {
        case 'green': bg = 'rgba(34, 197, 94, 0.2)'; textColor = '#86efac'; break;
        case 'indigo': case 'purple': bg = 'rgba(99, 102, 241, 0.2)'; textColor = '#a5b4fc'; break;
        case 'amber': case 'yellow': bg = 'rgba(245, 158, 11, 0.2)'; textColor = '#fcd34d'; break;
        case 'cyan': bg = 'rgba(6, 182, 212, 0.2)'; textColor = '#67e8f9'; break;
        case 'orange': bg = 'rgba(249, 115, 22, 0.2)'; textColor = '#fdba74'; break;
        default: bg = 'rgba(88,101,242,0.15)'; textColor = '#c9cdfb';
      }
      return (
        <span key={keyCounter++} style={{ background: bg, color: textColor, padding: '0 4px', borderRadius: '3px', fontWeight: '500' }}>
          {text}
        </span>
      );
    }},
    // Code blocks (inline)
    { regex: /`([^`]+)`/, render: (match) => (
      <code key={keyCounter++} style={{ background: '#1e1f22', padding: '2px 6px', borderRadius: '3px', fontSize: '85%', fontFamily: '"Consolas", "Monaco", monospace', color: '#d4d4d4' }}>
        {match[1]}
      </code>
    )},
    // Custom animated emoji <a:name:id> or <a:id>
    { regex: /<a:(?:([^:]*):)?(\d+)>/, render: (match) => (
      <img key={keyCounter++} src={`https://cdn.discordapp.com/emojis/${match[2]}.gif`} alt={match[1] || 'emoji'} style={{ width: '22px', height: '22px', verticalAlign: 'middle', margin: '0 2px' }} onError={(e) => { e.target.replaceWith(':' + (e.target.alt || 'emoji') + ':'); }} />
    )},
    // Custom emoji <:name:id> or <:id>
    { regex: /<:(?:([^:]*):)?(\d+)>/, render: (match) => (
      <img key={keyCounter++} src={`https://cdn.discordapp.com/emojis/${match[2]}.webp`} alt={match[1] || 'emoji'} style={{ width: '22px', height: '22px', verticalAlign: 'middle', margin: '0 2px' }} onError={(e) => { e.target.replaceWith(':' + (e.target.alt || 'emoji') + ':'); }} />
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

// Replace {user}, {server}, {count}, {id}, {username}, {mention} placeholders with styled spans
function replaceVariables(text) {
  if (!text) return text;
  return text
    .replace(/\{user\}/gi, '{{pill:indigo:@user}}')
    .replace(/\{user\.mention\}/gi, '{{pill:indigo:@user}}')
    .replace(/\{user_mention\}/gi, '{{pill:indigo:@user}}')
    .replace(/\{mention\}/gi, '{{pill:indigo:@user}}')
    .replace(/\{username\}/gi, '{{pill:indigo:User}}')
    .replace(/\{user\.name\}/gi, '{{pill:indigo:User}}')
    .replace(/\{user_globalname\}/gi, '{{pill:indigo:User}}')
    .replace(/\{user\.displayName\}/gi, '{{pill:indigo:CoolUser}}')
    .replace(/\{user\.tag\}/gi, '{{pill:indigo:User#1234}}')
    .replace(/\{user\.id\}/gi, '{{pill:indigo:123456789012345678}}')
    .replace(/\{id\}/gi, '{{pill:indigo:123456789012345678}}')
    .replace(/\{server\}/gi, '{{pill:green:My Server}}')
    .replace(/\{server\.name\}/gi, '{{pill:green:My Server}}')
    .replace(/\{server\.id\}/gi, '{{pill:green:987654321098765432}}')
    .replace(/\{count\}/gi, '{{pill:amber:1,542}}')
    .replace(/\{server\.members\}/gi, '{{pill:amber:1,542}}')
    .replace(/\{memberCount\}/gi, '{{pill:amber:1,542}}')
    .replace(/\{invite\}/gi, '{{pill:cyan:https://discord.gg/abc123}}')
    .replace(/\{inviter\}/gi, '{{pill:orange:@inviter}}')
    .replace(/\{inviter\.name\}/gi, '{{pill:orange:InviterUser}}')
    .replace(/\{time\.in\.server\}/gi, '{{pill:purple:2 years, 3 months}}');
}

export default function DiscordPreview({ content, embedColor, embedAuthor, embedTitle, embedDesc, embedFooter, embedImage, embedThumbnail, embedFields = [], imageUrl, mode, accentColor = '#5865F2', cardTitle = 'WELCOME', channels = [], roles = [] }) {
  const previewContent = replaceVariables(content);
  const previewTitle = replaceVariables(embedTitle);
  const previewDesc = replaceVariables(embedDesc) || (mode === 'embed' && !embedTitle && !embedAuthor && !embedImage && !embedFooter && (!embedFields || embedFields.length === 0) ? 'Start typing to customize...' : replaceVariables(embedDesc));
  const previewFooter = replaceVariables(embedFooter);
  const previewAuthor = replaceVariables(embedAuthor);

  return (
    <div>
      <label style={{ color: '#fff', display: 'block', marginBottom: '12px', fontWeight: '600' }}>Live Discord Preview</label>
      <div className="rounded-xl overflow-hidden border border-neutral-700/30">
        <div className="bg-[#2f3136] px-4 py-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-hash w-3.5 h-3.5 text-neutral-400">
            <line x1="4" x2="20" y1="9" y2="9" />
            <line x1="4" x2="20" y1="15" y2="15" />
            <line x1="10" x2="8" y1="3" y2="21" />
            <line x1="16" x2="14" y1="3" y2="21" />
          </svg>
          <span className="text-xs font-semibold text-white">{cardTitle.toLowerCase()}</span>
        </div>
        <div className="bg-[#313338] px-4 pt-3 pb-4 space-y-2.5" style={{ fontFamily: '"gg sans", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
          
          {/* System Message */}
          {mode !== 'image' && (
            <div className="flex items-center gap-2">
              {cardTitle === 'WELCOME' ? (
                <svg width="14" height="14" viewBox="0 0 16 16" className="text-green-500 flex-shrink-0">
                  <path fill="currentColor" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm3.5 7.5h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3a.5.5 0 0 1 1 0v3h3a.5.5 0 0 1 0 1z" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 16 16" className="text-red-500 flex-shrink-0">
                  <path fill="currentColor" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-3.5 7.5h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1z" />
                </svg>
              )}
              <p className="text-xs text-neutral-500">
                <span className="font-medium text-white hover:underline cursor-pointer">@User</span> {cardTitle === 'WELCOME' ? 'joined the server.' : 'left the server.'}
              </p>
            </div>
          )}

          {/* Image card mode doesn't show system message by user's request, but if mode is image we just render the image block directly */}
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

          {/* Text and Embed modes */}
          {mode !== 'image' && (
            <div className="flex gap-2.5 transition-opacity">
              <img src="/img/logo.png" alt="Orbit" className="w-10 h-10 rounded-full flex-shrink-0 object-cover mt-0.5 bg-black" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; e.target.nextSibling.classList.remove('hidden'); }} />
              <div className="w-10 h-10 rounded-full flex-shrink-0 bg-[#5865F2] items-center justify-center text-white text-xs font-bold hidden mt-0.5" aria-hidden="true">O</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 min-w-0">
                  <span className="text-xs font-semibold text-indigo-400 whitespace-nowrap">Orbit</span>
                  <span className="inline-flex flex-shrink-0 items-center gap-[0.15em] px-1 py-px text-[10px] font-bold bg-[#5865F2] text-white rounded leading-none">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="h-[0.85em] w-[0.85em]">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>APP
                  </span>
                  <span className="text-xs text-neutral-500 truncate">Today at 12:00 PM</span>
                </div>
                
                {/* Text Content */}
                {(mode === 'text' || mode === 'embed') && previewContent && (
                  <div>
                    <p className="text-sm text-neutral-200 leading-relaxed break-all">
                      {parseDiscordMarkdown(previewContent, channels, roles)}
                    </p>
                  </div>
                )}
                {/* Embed Content */}
                {mode === 'embed' && (previewAuthor || previewTitle || previewDesc || previewFooter || embedImage || (embedFields && embedFields.length > 0)) && (
                  <div style={{ borderColor: embedColor || accentColor }} className="border-l-[3px] rounded-r bg-[#2b2d31] max-w-full sm:max-w-[380px] mt-1">
                    <div className="p-2.5 flex gap-2.5">
                      <div className="flex-1 min-w-0 space-y-1">
                        {previewAuthor && (
                          <p className="text-[11px] font-semibold text-white flex items-center gap-1.5">
                            {previewAuthor}
                          </p>
                        )}
                        {previewTitle && (
                          <p className="text-xs font-semibold text-white leading-snug">
                            {parseDiscordMarkdown(previewTitle, channels, roles)}
                          </p>
                        )}
                        {previewDesc && (
                          <p className="text-xs text-neutral-300 leading-relaxed break-all">
                            {parseDiscordMarkdown(previewDesc, channels, roles)}
                          </p>
                        )}
                        {embedFields && embedFields.length > 0 && (
                          <div className="mt-2 text-xs flex flex-wrap gap-y-2">
                            {embedFields.map((field, i) => (
                              <div key={i} className={field.inline ? "w-1/3 min-w-[120px] pr-2" : "w-full"}>
                                <div className="font-semibold text-white mb-0.5">
                                  {parseDiscordMarkdown(replaceVariables(field.name || "​"), channels, roles)}
                                </div>
                                <div className="text-neutral-300 break-all leading-snug">
                                  {parseDiscordMarkdown(replaceVariables(field.value || "​"), channels, roles)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {embedImage && (
                          <img src={embedImage} className="w-full rounded-[3px] mt-2 max-h-[300px] object-cover" alt="" onError={(e) => e.target.style.display = 'none'} />
                        )}
                        {previewFooter && (
                          <p className="text-[10px] text-neutral-400 font-medium">
                            {previewFooter}
                          </p>
                        )}
                      </div>
                      {embedThumbnail && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-700 overflow-hidden">
                          <img src={embedThumbnail} className="w-full h-full object-cover" alt="" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { parseDiscordMarkdown, replaceVariables };
