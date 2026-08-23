import re

file_path = r"c:\Users\lukeb\OneDrive\Projects\Original\Bots\Orbit\Website\frontend\src\components\dashboard\Moderation.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacement = """                  {/* Always allow these words */}
                  <div>
                    <div className="flex items-baseline justify-between gap-3 mb-2">
                      <label className="text-sm font-medium text-neutral-300">Always allow these words</label>
                      <span className="text-xs text-neutral-500 tabular-nums">{bannedWords.allowed_words?.length || 0} words</span>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input id="allowed_word_input" placeholder="Add a word that should never be filtered..." className="w-full h-10 px-3 bg-[#2A2A2A] border border-neutral-600 rounded-lg text-sm text-white placeholder-neutral-500 outline-none hover:border-neutral-600 transition-[border-color,box-shadow] duration-150 ease-out focus:border-neutral-600 focus:ring-2 focus:ring-white/10" type="text" onKeyDown={(e) => {
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
                      {((bannedWords.allowed_words||[]).length > 0) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {bannedWords.allowed_words.map((w, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-[#2A2A2A] border border-neutral-700 text-xs font-medium text-white group cursor-pointer hover:bg-neutral-700 transition-colors" onClick={() => setBannedWords({ ...bannedWords, allowed_words: bannedWords.allowed_words.filter((_, i) => i !== idx) })}>
                              {w}
                              <button aria-label="Remove word" className="p-0.5 rounded-md text-neutral-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M18 6 6 18"></path>
                                  <path d="m6 6 12 12"></path>
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>"""

start_marker = r"\{\/\* Always allow these words \*\/\}.+?(?=\{\/\* Spam Protection \*\/\})"
new_content = re.sub(start_marker, replacement + "\n\n                </div>\n              </div>\n            </div>\n\n            ", content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)
print("Updated successfully.")
