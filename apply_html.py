import re

file_path = r"c:\Users\lukeb\OneDrive\Projects\Original\Bots\Orbit\Website\frontend\src\components\dashboard\Moderation.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacement = """            {/* Content Filter */}
            <div data-tour="content-filter" className="scroll-mt-24 w-full">
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex-shrink-0 transition-colors text-amber-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-filter w-4 h-4">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-white truncate">Content Filter</span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className="inline-flex">
                      <div className="flex items-center gap-3">
                        <TailwindToggle checked={bannedWords.enabled} onChange={() => setBannedWords({ ...bannedWords, enabled: !bannedWords.enabled })} />
                      </div>
                    </span>
                  </div>
                </div>
                <div className="p-4 sm:p-5 space-y-5">
                  {/* Filter Level */}
                  <div data-tour="moderation-filter-level" className="scroll-mt-24">
                    <div>
                      <div className="flex items-baseline justify-between gap-3 mb-2">
                        <label className="text-sm font-medium text-neutral-300">Filter level</label>
                        <span className="text-xs text-neutral-500 tabular-nums">{bannedWords.words?.length || 0} words</span>
                      </div>
                      <FilterLevelSelector 
                        value={bannedWords.filter_level} 
                        onChange={(val) => setBannedWords({ ...bannedWords, filter_level: val })} 
                        levels={[
                          { id: 'relaxed', label: 'Relaxed', color: 'amber', activeBars: 1, bars: ['7px', '10px', '13px', '16px'] },
                          { id: 'moderate', label: 'Moderate', color: 'amber', activeBars: 2, bars: ['7px', '10px', '13px', '16px'] },
                          { id: 'strict', label: 'Strict', color: 'amber', activeBars: 3, bars: ['7px', '10px', '13px', '16px'] },
                          { id: 'maximum', label: 'Maximum', color: 'amber', activeBars: 4, bars: ['7px', '10px', '13px', '16px'] }
                        ]} 
                      />
                    </div>
                  </div>

                  {/* When a match is found */}
                  <div data-tour="moderation-content-action" className="scroll-mt-24">
                    <div>
                      <div className="flex items-baseline justify-between gap-3 mb-2">
                        <label className="text-sm font-medium text-neutral-300">When a match is found</label>
                      </div>
                      <div className="space-y-3">
                        <ActionSelector value={bannedWords.action} onChange={(val) => setBannedWords({ ...bannedWords, action: val })} durationValue={bannedWords.timeout_duration_min} onDurationChange={(val) => setBannedWords({ ...bannedWords, timeout_duration_min: parseInt(val) })} />
                      </div>
                    </div>
                  </div>

                  {/* Edit word list */}
                  <div>
                    <button type="button" className="flex items-center justify-between w-full min-h-[44px] py-2 text-left group rounded-lg transition-[scale] duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20" onClick={(e) => { e.currentTarget.nextElementSibling.classList.toggle('hidden'); }}>
                      <span className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">Edit word list</span>
                      <span className="flex items-center gap-2 text-xs text-neutral-500">{bannedWords.words?.length || 0} words
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down w-4 h-4 transition-transform duration-200 ease-out rotate-180">
                          <path d="m6 9 6 6 6-6"></path>
                        </svg>
                      </span>
                    </button>
                    <div className="overflow-hidden hidden">
                      <div className="pt-4">
                        <div className="bg-neutral-800/30 rounded-xl border border-neutral-800 overflow-hidden">
                          <div className="px-4 py-4 border-b border-neutral-800/60 space-y-2.5">
                            <div className="flex gap-2">
                              <div className="flex-1 relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                  <circle cx="11" cy="11" r="8"></circle>
                                  <path d="m21 21-4.3-4.3"></path>
                                </svg>
                                <input placeholder="Search words..." className="w-full h-10 pl-10 pr-9 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 outline-none hover:border-neutral-600 transition-[border-color,box-shadow] duration-150 ease-out focus:border-neutral-600 focus:ring-2 focus:ring-white/10" type="text" />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1 relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                  <path d="M5 12h14"></path>
                                  <path d="M12 5v14"></path>
                                </svg>
                                <input id="banned_word_input" placeholder="Add a word and press Enter..." className="w-full h-10 pl-10 pr-3 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 outline-none hover:border-neutral-600 transition-[border-color,box-shadow] duration-150 ease-out focus:border-neutral-600 focus:ring-2 focus:ring-white/10" type="text" onKeyDown={(e) => {
                                  if (e.key === 'Enter' && e.target.value.trim()) {
                                    setBannedWords({ ...bannedWords, words: [...(bannedWords.words||[]), e.target.value.trim()] });
                                    e.target.value = '';
                                  }
                                }} />
                              </div>
                              <button onClick={() => {
                                const input = document.getElementById('banned_word_input');
                                if (input.value.trim()) {
                                  setBannedWords({ ...bannedWords, words: [...(bannedWords.words||[]), input.value.trim()] });
                                  input.value = '';
                                }
                              }} className="h-10 px-4 bg-neutral-700 text-neutral-200 text-sm font-medium rounded-lg hover:bg-neutral-600 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 flex-shrink-0">Add</button>
                            </div>
                          </div>
                          <div className="px-4 py-4 max-h-[280px] overflow-y-auto scrollbar-thin">
                            <div className="flex flex-wrap gap-1.5">
                              {(bannedWords.words||[]).map((w, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 max-w-full break-all pl-2.5 pr-1 py-1 text-xs bg-neutral-700/50 text-neutral-300 rounded-lg font-mono group hover:bg-neutral-700 transition-[background-color] duration-150 ease-out">
                                  {w}
                                  <button onClick={() => setBannedWords({ ...bannedWords, words: bannedWords.words.filter((_, i) => i !== idx) })} aria-label="Remove word" className="grid place-items-center w-6 h-6 -my-1 text-neutral-600 hover:text-red-400 transition-[transform,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-md opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x w-3 h-3">
                                      <path d="M18 6 6 18"></path>
                                      <path d="m6 6 12 12"></path>
                                    </svg>
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Always allow these words */}
                  <div>
                    <button type="button" className="flex items-center justify-between w-full min-h-[44px] py-2 text-left group rounded-lg transition-[scale] duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20" onClick={(e) => { e.currentTarget.nextElementSibling.classList.toggle('hidden'); }}>
                      <span className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">Always allow these words</span>
                      <span className="flex items-center gap-2 text-xs text-neutral-500">{bannedWords.allowed_words?.length || 0} words
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down w-4 h-4 transition-transform duration-200 ease-out rotate-180">
                          <path d="m6 9 6 6 6-6"></path>
                        </svg>
                      </span>
                    </button>
                    <div className="overflow-hidden hidden">
                      <div className="pt-4">
                        <div className="bg-neutral-800/30 rounded-xl border border-neutral-800 overflow-hidden">
                          <div className="px-4 py-4 border-b border-neutral-800/60 space-y-2.5">
                            <div className="flex gap-2">
                              <div className="flex-1 relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                  <path d="M5 12h14"></path>
                                  <path d="M12 5v14"></path>
                                </svg>
                                <input id="allowed_word_input" placeholder="Add a word and press Enter..." className="w-full h-10 pl-10 pr-3 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 outline-none hover:border-neutral-600 transition-[border-color,box-shadow] duration-150 ease-out focus:border-neutral-600 focus:ring-2 focus:ring-white/10" type="text" onKeyDown={(e) => {
                                  if (e.key === 'Enter' && e.target.value.trim()) {
                                    setBannedWords({ ...bannedWords, allowed_words: [...(bannedWords.allowed_words||[]), e.target.value.trim()] });
                                    e.target.value = '';
                                  }
                                }} />
                              </div>
                              <button onClick={() => {
                                const input = document.getElementById('allowed_word_input');
                                if (input.value.trim()) {
                                  setBannedWords({ ...bannedWords, allowed_words: [...(bannedWords.allowed_words||[]), input.value.trim()] });
                                  input.value = '';
                                }
                              }} className="h-10 px-4 bg-neutral-700 text-neutral-200 text-sm font-medium rounded-lg hover:bg-neutral-600 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 flex-shrink-0">Add</button>
                            </div>
                          </div>
                          <div className="px-4 py-4 max-h-[280px] overflow-y-auto scrollbar-thin">
                            <div className="flex flex-wrap gap-1.5">
                              {(bannedWords.allowed_words||[]).map((w, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 max-w-full break-all pl-2.5 pr-1 py-1 text-xs bg-neutral-700/50 text-neutral-300 rounded-lg font-mono group hover:bg-neutral-700 transition-[background-color] duration-150 ease-out">
                                  {w}
                                  <button onClick={() => setBannedWords({ ...bannedWords, allowed_words: bannedWords.allowed_words.filter((_, i) => i !== idx) })} aria-label="Remove word" className="grid place-items-center w-6 h-6 -my-1 text-neutral-600 hover:text-red-400 transition-[transform,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-md opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x w-3 h-3">
                                      <path d="M18 6 6 18"></path>
                                      <path d="m6 6 12 12"></path>
                                    </svg>
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>"""

start_marker = r"\{\/\* Content Filter \*\/\}.+?(?=\{\/\* Spam Protection \*\/\})"
new_content = re.sub(start_marker, replacement + "\n\n            ", content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)
print("Updated successfully.")
