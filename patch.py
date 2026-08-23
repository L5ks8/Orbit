import sys

with open('Website/frontend/src/components/dashboard/Moderation.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update antiLink state
code = code.replace(
    "const [antiLink, setAntiLink] = useState({ enabled: false, action: 'delete', timeout_duration_min: 5, blocked_domains: [] });",
    "const [antiLink, setAntiLink] = useState({ enabled: false, action: 'delete', timeout_duration_min: 5, blocked_domains: [], allowed_domains: [], allow_media: false, allow_gifs: false });"
)

# 2. Add predefined words logic before getPayload
predefined_logic = """  const profanity_basic = ["fuck", "shit", "bitch", "asshole", "cunt", "nigger", "nigga", "faggot", "whore", "slut", "dick", "cock", "pussy"];
  const profanity_strict = [...profanity_basic, "bastard", "motherfucker", "twat", "wanker", "prick", "retard", "dyke", "tranny", "kys", "kill yourself"];
  const profanity_maximum = [...profanity_strict, "crap", "damn", "ass", "piss", "boobs", "tits", "vagina", "penis", "cum", "jizz", "wank"];
  
  const getPredefinedWords = (level) => {
    if (level === 'maximum') return profanity_maximum;
    if (level === 'strict') return profanity_strict;
    if (level === 'moderate') return profanity_basic;
    return [];
  };

  const predefinedWords = getPredefinedWords(bannedWords.filter_level);
  const allBannedWords = Array.from(new Set([...(bannedWords.words || []), ...predefinedWords])).filter(w => !(bannedWords.allowed_words || []).includes(w));

  const removeBannedWord = (w) => {
    if (predefinedWords.includes(w)) {
      setBannedWords({ ...bannedWords, allowed_words: [...(bannedWords.allowed_words || []), w] });
    }
    if ((bannedWords.words || []).includes(w)) {
      setBannedWords({ ...bannedWords, words: bannedWords.words.filter(word => word !== w) });
    }
  };

  const getPayload = () => {"""
code = code.replace("  const getPayload = () => {", predefined_logic, 1)

# 3. Update the word list display map to use allBannedWords
code = code.replace(
    "(bannedWords.words||[]).filter(w => w.toLowerCase().includes(bannedWordsSearch.toLowerCase())).map((w, idx) => (",
    "allBannedWords.filter(w => w.toLowerCase().includes(bannedWordsSearch.toLowerCase())).map((w, idx) => ("
)

# 4. Update the word list remove button
code = code.replace(
    "<button onClick={() => setBannedWords({ ...bannedWords, words: bannedWords.words.filter(word => word !== w) })} aria-label=\"Remove word\"",
    "<button onClick={() => removeBannedWord(w)} aria-label=\"Remove word\""
)

# 5. Update the 'Add a word' logic (onKeyDown)
old_add_logic_1 = """if (e.key === 'Enter' && e.target.value.trim()) {
                                    setBannedWords({ ...bannedWords, words: [...(bannedWords.words||[]), e.target.value.trim()] });
                                    e.target.value = '';
                                  }"""
new_add_logic_1 = """if (e.key === 'Enter' && e.target.value.trim()) {
                                    const w = e.target.value.trim();
                                    if ((bannedWords.allowed_words || []).includes(w)) {
                                      setBannedWords({ ...bannedWords, allowed_words: bannedWords.allowed_words.filter(word => word !== w) });
                                    } else if (!allBannedWords.includes(w)) {
                                      setBannedWords({ ...bannedWords, words: [...(bannedWords.words||[]), w] });
                                    }
                                    e.target.value = '';
                                  }"""
code = code.replace(old_add_logic_1, new_add_logic_1)

# 6. Update the 'Add a word' logic (onClick)
old_add_logic_2 = """if (input.value.trim()) {
                                  setBannedWords({ ...bannedWords, words: [...(bannedWords.words||[]), input.value.trim()] });
                                  input.value = '';
                                }"""
new_add_logic_2 = """if (input.value.trim()) {
                                  const w = input.value.trim();
                                  if ((bannedWords.allowed_words || []).includes(w)) {
                                    setBannedWords({ ...bannedWords, allowed_words: bannedWords.allowed_words.filter(word => word !== w) });
                                  } else if (!allBannedWords.includes(w)) {
                                    setBannedWords({ ...bannedWords, words: [...(bannedWords.words||[]), w] });
                                  }
                                  input.value = '';
                                }"""
code = code.replace(old_add_logic_2, new_add_logic_2)

# 7. Update word count
code = code.replace("{bannedWords.words?.length || 0} words", "{allBannedWords.length} words")

# 8. Update antiInvites toggle (only the second TailwindToggle for antiLink.enabled)
code = code.replace(
    """<p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">Removes discord.gg / discord.com invite links</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <TailwindToggle checked={antiLink.enabled} onChange={() => setAntiLink({ ...antiLink, enabled: !antiLink.enabled })} />""",
    """<p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">Removes discord.gg / discord.com invite links</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <TailwindToggle checked={antiInvites.enabled} onChange={() => setAntiInvites({ ...antiInvites, enabled: !antiInvites.enabled })} />"""
)


# 9. Update link filter text inputs
old_link_inputs = """                    <div>
                      <div className="flex items-baseline justify-between gap-3 mb-2">
                        <label className="text-sm font-medium text-neutral-300">Always allowed</label>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 min-h-[40px] px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl cursor-text hover:border-neutral-600 transition-[border-color] duration-150 ease-out focus-within:border-neutral-600 focus-within:ring-2 focus-within:ring-white/10">
                        <input placeholder="youtube.com, twitter.com..." title="" autoComplete="off" className="flex-1 min-w-[80px] bg-transparent text-sm text-white placeholder-neutral-500 outline-none border-none shadow-none py-0.5" defaultValue="" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline justify-between gap-3 mb-2">
                        <label className="text-sm font-medium text-neutral-300">Always blocked</label>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 min-h-[40px] px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl cursor-text hover:border-neutral-600 transition-[border-color] duration-150 ease-out focus-within:border-neutral-600 focus-within:ring-2 focus-within:ring-white/10">
                        <input placeholder="spam-site.com..." title="" autoComplete="off" className="flex-1 min-w-[80px] bg-transparent text-sm text-white placeholder-neutral-500 outline-none border-none shadow-none py-0.5" defaultValue="" />
                      </div>
                    </div>"""

new_link_inputs = """                    <div>
                      <div className="flex items-baseline justify-between gap-3 mb-2">
                        <label className="text-sm font-medium text-neutral-300">Always allowed</label>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 min-h-[40px] px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl cursor-text hover:border-neutral-600 transition-[border-color] duration-150 ease-out focus-within:border-neutral-600 focus-within:ring-2 focus-within:ring-white/10">
                        {(antiLink.allowed_domains || []).map((domain, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-0.5 rounded-lg bg-neutral-700/50 text-xs font-medium text-neutral-300 group">
                            {domain}
                            <button type="button" aria-label="Remove domain" onClick={() => setAntiLink({ ...antiLink, allowed_domains: antiLink.allowed_domains.filter(d => d !== domain) })} className="p-0.5 rounded-md text-red-500/80 hover:text-red-400 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                            </button>
                          </span>
                        ))}
                        <input placeholder="youtube.com, twitter.com..." title="" autoComplete="off" className="flex-1 min-w-[80px] bg-transparent text-sm text-white placeholder-neutral-500 outline-none border-none shadow-none py-0.5" onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            e.preventDefault();
                            setAntiLink({ ...antiLink, allowed_domains: [...(antiLink.allowed_domains || []), e.target.value.trim()] });
                            e.target.value = '';
                          }
                        }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline justify-between gap-3 mb-2">
                        <label className="text-sm font-medium text-neutral-300">Always blocked</label>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 min-h-[40px] px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl cursor-text hover:border-neutral-600 transition-[border-color] duration-150 ease-out focus-within:border-neutral-600 focus-within:ring-2 focus-within:ring-white/10">
                        {(antiLink.blocked_domains || []).map((domain, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-0.5 rounded-lg bg-neutral-700/50 text-xs font-medium text-neutral-300 group">
                            {domain}
                            <button type="button" aria-label="Remove domain" onClick={() => setAntiLink({ ...antiLink, blocked_domains: antiLink.blocked_domains.filter(d => d !== domain) })} className="p-0.5 rounded-md text-red-500/80 hover:text-red-400 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                            </button>
                          </span>
                        ))}
                        <input placeholder="spam-site.com..." title="" autoComplete="off" className="flex-1 min-w-[80px] bg-transparent text-sm text-white placeholder-neutral-500 outline-none border-none shadow-none py-0.5" onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            e.preventDefault();
                            setAntiLink({ ...antiLink, blocked_domains: [...(antiLink.blocked_domains || []), e.target.value.trim()] });
                            e.target.value = '';
                          }
                        }} />
                      </div>
                    </div>"""

code = code.replace(old_link_inputs, new_link_inputs)


with open('Website/frontend/src/components/dashboard/Moderation.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
