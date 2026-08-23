import re

file_path = r"c:\Users\lukeb\OneDrive\Projects\Original\Bots\Orbit\Website\frontend\src\components\dashboard\Moderation.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add the specialized inline dropdown component before ActionSelector
custom_dropdown = """
const ModerationSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find(o => String(o.value) === String(value))?.label || placeholder;

  return (
    <div className="relative">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 h-10 sm:h-8 pl-3 pr-2 rounded-lg bg-neutral-800 border border-neutral-700 hover:border-neutral-600 text-sm text-white transition-[color,border-color,scale] duration-150 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
      >
        {selectedLabel}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chevron-down w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ease-out ${isOpen ? 'rotate-180' : ''}`}>
          <path d="m6 9 6 6 6-6"></path>
        </svg>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute z-20 mt-1 left-0 min-w-[130px] p-1 rounded-lg bg-neutral-800 border border-neutral-700 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_18px_40px_-20px_rgba(0,0,0,0.9)]">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-[color,background-color,scale] duration-150 active:scale-[0.98] hover:bg-white/5 ${String(value) === String(opt.value) ? 'text-white' : 'text-neutral-400'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

"""

# Insert ModerationSelect right before ActionSelector
content = re.sub(
    r'(const ActionSelector = \({)',
    custom_dropdown + r'\1',
    content
)

# Replace <CustomSelect /> usages in Moderation.jsx with <ModerationSelect />
content = re.sub(
    r'<CustomSelect\s*value=\{durationValue\}\s*onChange=\{onDurationChange\}\s*options=\{([^\}]+)\}\s*placeholder="([^"]+)"\s*(darker=\{[^\}]+\}\s*)?(className="[^"]+"\s*)?/>',
    r'<ModerationSelect value={durationValue} onChange={onDurationChange} options={\1} placeholder="\2" />',
    content
)

# And if there are any other direct usages in ActionSelector:
content = re.sub(
    r'<CustomSelect([^>]+)/>',
    lambda m: '<CustomSelect' + m.group(1) + '/>' if 'options={timeoutOptions}' not in m.group(1) and 'options={banOptions}' not in m.group(1) else '<ModerationSelect' + m.group(1).replace('darker={false}', '').replace('darker={true}', '').replace('className="bg-neutral-800 border-neutral-700 hover:border-neutral-600 text-sm text-white"', '') + '/>',
    content
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated dropdown successfully.")
