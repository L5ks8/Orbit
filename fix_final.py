import re

file_path = r"c:\Users\lukeb\OneDrive\Projects\Original\Bots\Orbit\Website\frontend\src\components\dashboard\Moderation.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix TailwindToggle exactly as requested
new_toggle = """const TailwindToggle = ({ checked, onChange }) => (
    <button 
      type="button" 
      role="switch" 
      aria-checked={checked} 
      onClick={onChange}
      className={`relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 ${checked ? 'bg-neutral-800 dark:bg-white' : 'bg-neutral-800'}`}
    >
      <span className={`pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out will-change-transform ${checked ? 'translate-x-[21px] !bg-white dark:!bg-black' : 'translate-x-[3px] bg-neutral-400'}`} />
    </button>
);"""

content = re.sub(
    r'const TailwindToggle = \(\{ checked, onChange \}\) => \([\s\S]*?</button>\s*\);',
    new_toggle,
    content
)

# Fix Inputs (rounded-lg -> rounded-xl, border-neutral-600 -> border-neutral-700)
# specifically for the 3 inputs (Search words, banned words, allowed words)
content = content.replace(
    'className="w-full h-10 pr-9 bg-neutral-800 border border-neutral-600 rounded-lg',
    'className="w-full h-10 pr-9 bg-neutral-800 border border-neutral-700 rounded-xl'
)

content = content.replace(
    'className="w-full h-10 pr-3 bg-neutral-800 border border-neutral-600 rounded-lg',
    'className="w-full h-10 pr-3 bg-neutral-800 border border-neutral-700 rounded-xl'
)

content = content.replace(
    'className="w-full h-10 px-3 bg-neutral-800 border border-neutral-600 rounded-lg',
    'className="flex-1 h-10 px-3 bg-neutral-800 border border-neutral-700 rounded-xl'
)

# Fix Add button
content = content.replace(
    'className="h-10 px-4 bg-neutral-700 text-neutral-200 text-sm font-medium rounded-lg hover:bg-neutral-600',
    'className="h-10 px-4 bg-neutral-700 text-neutral-200 text-sm font-medium rounded-xl hover:bg-neutral-600'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated successfully.")
