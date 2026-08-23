import re

file_path = r"c:\Users\lukeb\OneDrive\Projects\Original\Bots\Orbit\Website\frontend\src\components\dashboard\Moderation.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

new_toggle = """const TailwindToggle = ({ checked, onChange }) => (
  <button 
    type="button" 
    role="switch" 
    aria-checked={checked} 
    onClick={onChange}
    className={`peer relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 ${checked ? 'bg-white' : 'bg-neutral-800'}`}
  >
    <span className={`pointer-events-none block h-[16px] w-[16px] rounded-full shadow-sm ring-0 transition-transform duration-200 ease-in-out ${checked ? 'translate-x-[18px] bg-black' : 'translate-x-[2px] bg-neutral-400'}`} />
  </button>
);"""

content = re.sub(
    r'const TailwindToggle = \(\{ checked, onChange \}\) => \([\s\S]*?</button>\s*\);',
    new_toggle,
    content
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated successfully.")
