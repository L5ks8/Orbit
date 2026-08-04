const translations = {
    "de": {
        "The last Discord bot": "Der einzige Discord Bot,",
        "you'll ever need.": "den du je brauchen wirst.",
        "Add to Discord": "Zu Discord hinzufügen",
        "Support Server": "Support Server",
        "Open Dashboard": "Dashboard öffnen",
        "Login with Discord": "Mit Discord einloggen",
        "Get Orbit — It's Free": "Hole dir Orbit — Kostenlos",
        "Join Support Server": "Support Server beitreten",
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
        "Verification Gate": "Verifizierungs-Gate",
        "Temp Voice": "Temp Voice",
        "Giveaways & Polls": "Giveaways & Umfragen",
        "Auto-Replies": "Auto-Antworten",
        "Ready to upgrade your server?": "Bereit, deinen Server aufzuleveln?",
        "Add Orbit in seconds. No credit card, no setup fees. Completely free.": "Füge Orbit in Sekunden hinzu. Keine Kreditkarte, kostenlos.",
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
        "Messages": "Nachrichten",
        "Level System": "Level System",
        "Economy System": "Wirtschaft",
        "Overview": "Übersicht",
        "Select Server": "Server auswählen",
        "Enable Module": "Modul aktivieren",
        "Save Changes": "Änderungen speichern",
        "General Settings": "Allgemeine Einstellungen"
    },
    "fr": {
        "The last Discord bot": "Le dernier bot Discord",
        "you'll ever need.": "dont vous aurez besoin.",
        "Add to Discord": "Ajouter à Discord",
        "Support Server": "Serveur Support",
        "Open Dashboard": "Ouvrir le Dashboard",
        "Login with Discord": "Se connecter avec Discord",
        "Get Orbit — It's Free": "Obtenez Orbit — C'est gratuit",
        "Join Support Server": "Rejoindre le Support",
        "Servers": "Serveurs",
        "Users Protected": "Utilisateurs protégés",
        "ms Latency": "ms Latence",
        "What Orbit Does": "Ce que fait Orbit",
        "AutoMod & Security": "AutoMod & Sécurité",
        "Ticket System": "Système de Tickets",
        "Web Dashboard": "Dashboard Web",
        "Advanced Logs": "Logs Avancés",
        "Join Roles": "Rôles de Bienvenue",
        "Welcome Cards": "Cartes de Bienvenue",
        "Verification Gate": "Vérification",
        "Temp Voice": "Vocal Temporaire",
        "Giveaways & Polls": "Concours & Sondages",
        "Auto-Replies": "Réponses Auto",
        "Ready to upgrade your server?": "Prêt à améliorer votre serveur ?",
        "Add Orbit in seconds. No credit card, no setup fees. Completely free.": "Ajoutez Orbit en quelques secondes. 100% Gratuit.",
        "Dashboard": "Tableau de bord",
        "Settings": "Paramètres",
        "Overview": "Aperçu"
    }
};

let currentLang = localStorage.getItem('orbit_lang') || 'de';

function applyTranslations(lang) {
    currentLang = lang;
    localStorage.setItem('orbit_lang', lang);

    if (lang === 'en') {
        // If Google Translate is active, let it handle or reset
        var selectField = document.querySelector("select.goog-te-combo");
        if (selectField) {
            selectField.value = 'en';
            selectField.dispatchEvent(new Event('change'));
        }
        return;
    }
    
    const dict = translations[lang];
    if (dict) {
        const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walk.nextNode()) {
            const text = node.nodeValue.trim();
            if (dict[text]) {
                node.nodeValue = node.nodeValue.replace(text, dict[text]);
            }
        }
        
        document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
            const text = el.getAttribute('placeholder');
            if (dict[text]) el.setAttribute('placeholder', dict[text]);
        });
    }

    // Trigger Google Translate as fallback for unmapped text
    var selectField = document.querySelector("select.goog-te-combo");
    if (selectField) {
        selectField.value = lang;
        selectField.dispatchEvent(new Event('change'));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initial lang sync
    const savedLang = localStorage.getItem('orbit_lang') || 'de';
    const langInfo = {
        'de': { text: 'DE', flag: 'https://flagcdn.com/w40/de.png' },
        'en': { text: 'EN', flag: 'https://flagcdn.com/w40/gb.png' },
        'fr': { text: 'FR', flag: 'https://flagcdn.com/w40/fr.png' }
    };
    
    if (langInfo[savedLang]) {
        const flagImg = document.getElementById('lang-switcher-flag');
        const flagText = document.getElementById('lang-switcher-text');
        if (flagImg) flagImg.src = langInfo[savedLang].flag;
        if (flagText) flagText.innerText = langInfo[savedLang].text;
    }
});
