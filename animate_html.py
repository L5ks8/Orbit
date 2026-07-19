import os

with open('Web/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add animations to landing page
html = html.replace('<div class="landing-hero">', '<div class="landing-hero fade-in-up delay-1">')
html = html.replace('<h1 style="font-size: 56px;', '<h1 class="floating-element" style="font-size: 56px;')
html = html.replace('<a href="#features" class="btn-secondary" style="padding: 12px 32px; font-size: 16px;">', '<a href="#features" class="btn-secondary btn-animated" style="padding: 12px 32px; font-size: 16px;">')
html = html.replace('<button id="btn-hero-login" class="btn-primary" style="padding: 12px 32px; font-size: 16px;">', '<button id="btn-hero-login" class="btn-primary btn-animated" style="padding: 12px 32px; font-size: 16px;">')

# Add card glow
html = html.replace('class="feature-card"', 'class="feature-card card-glow"')

with open('Web/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Animations added to index.html')
