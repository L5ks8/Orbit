const translations = {
    "de": {
        "The last Discord bot": "Der einzige Discord Bot,",
        "you'll ever need.": "den du je brauchen wirst.",
        "Add to Discord": "Zu Discord hinzufügen",
        "Support Server": "Support Server",
        "Open Dashboard": "Dashboard öffnen",
        "Login with Discord": "Mit Discord einloggen",
        "Servers": "Server",
        "Users Protected": "Geschützte Nutzer",
        "ms Latency": "ms Latenz",
        "What Orbit Does": "Was Orbit macht",
        "AutoMod & Security": "AutoMod & Sicherheit",
        "Ticket System": "Ticket System",
        "Web Dashboard": "Web Dashboard",
        "Advanced Logs": "Erweiterte Logs",
        "Join Roles": "Join Rollen",
        "Welcome Cards": "Willkommenskarten",
        "Dashboard": "Dashboard",
        "Settings": "Einstellungen",
        "Server Stats": "Server Statistiken",
        "Welcome": "Willkommen",
        "Goodbye": "Verabschiedung",
        "Boosts": "Boosts",
        "Auto Mod": "Auto Mod",
        "Verify": "Verifizieren",
        "Auto Responder": "Auto Responder",
        "Tickets": "Tickets",
        "Logs": "Logs",
        "Channel Automation": "Kanal Automation",
        "Temp Voice": "Temp Voice",
        "Messages": "Nachrichten",
        "Level System": "Level System",
        "Economy System": "Wirtschaft",
        "Overview": "Übersicht",
        "Select Server": "Server auswählen",
        "Enable Module": "Modul aktivieren",
        "Save Changes": "Änderungen speichern",
        "General Settings": "Allgemeine Einstellungen",
        "Prefix": "Präfix",
        "Language": "Sprache",
        "Create Category": "Kategorie erstellen",
        "Category Name": "Kategoriename",
        "Support Roles": "Support Rollen",
        "Log Channel": "Log Kanal",
        "Create Ticket Panel": "Ticket Panel erstellen",
        "Panel Title": "Panel Titel",
        "Panel Description": "Panel Beschreibung",
        "Button Text": "Button Text"
    }
};

let currentLang = localStorage.getItem('orbit_lang') || 'en';

function applyTranslations(lang) {
    if (lang === 'en') {
        location.reload(); // Reload to reset to original English HTML
        return;
    }
    
    const dict = translations[lang];
    if (!dict) return;

    // A simple function to walk text nodes and replace exact matches
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walk.nextNode()) {
        const text = node.nodeValue.trim();
        if (dict[text]) {
            node.nodeValue = node.nodeValue.replace(text, dict[text]);
        }
    }
    
    // Also translate placeholders
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
        const text = el.getAttribute('placeholder');
        if (dict[text]) el.setAttribute('placeholder', dict[text]);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const switcher = document.getElementById('lang-switcher');
    if (switcher) {
        switcher.innerText = currentLang === 'de' ? '🇬🇧 EN' : '🇩🇪 DE';
        switcher.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'de' : 'en';
            localStorage.setItem('orbit_lang', currentLang);
            if (currentLang === 'de') {
                applyTranslations('de');
                switcher.innerText = '🇬🇧 EN';
            } else {
                location.reload();
            }
        });
    }

    if (currentLang !== 'en') {
        // Wait a bit for dynamic content to load (like user info)
        setTimeout(() => applyTranslations(currentLang), 100);
        setTimeout(() => applyTranslations(currentLang), 1000); // And again for fetch calls
    }
});
