# 🚀 SOLAR VISION PM - Instrukce pro Testování

## Ahoj jednateli! 👋

Máme pro tebe připravenou aplikaci **SOLAR VISION PM** - kompletní CRM a Project Management systém.

Pojď si ji vyzkoušet a řekni nám, co se ti líbí a co by se mělo zlepšit!

---

## 📱 Jak Spustit?

### **Nejjednodušší: Přes Místní Síť (WiFi)**

1. **Na počítači (Mac/Linux/Windows):**
   ```bash
   cd "/Users/tomasbednar/SOLAR VISION, projekt/solar-vision-web"
   npm run dev -- --host
   ```

2. **V terminálu se zobrazí URL:**
   ```
   ➜  Local:   http://localhost:5173
   ➜  Network: http://192.168.X.X:5173  ← TADY!
   ```

3. **Na iPhone/iPad v Safari:**
   - Otevři Safari
   - Zkopíruj URL: `http://192.168.X.X:5173`
   - Enter
   - ✅ Máš aplikaci!

---

## 👥 Demo Uživatelé

Klikni na kteréhokoliv uživatele pro přihlášení (bez hesla):

### **Obchodníci** (vidí své metriky + porovnání)
- **Jan Novák** - jan@solar.cz
- **Petr Svoboda** - petr@solar.cz
- **Marie Kučerová** - marie@solar.cz

### **Správce** (vidí vše + může měnit plány)
- **Admin** - admin@solar.cz

---

## 🎯 Co Vyzkoušet?

### 1️⃣ **Kanban Deska** (Projekty)
```
Klikni: "Projekty" v horní navigaci

Co vidíš:
├─ 7 sloupců = 7 fází projektu
├─ Projektové kartičky s detaily
│  ├─ Výkon (kWp)
│  ├─ Výnos (Kč)
│  ├─ Náklady (Kč)
│  └─ Marže (%)
└─ Tlačítka pro editaci & mazání

Co vyzkoušej:
✓ Drag & Drop - přetáhni projekt do dalšího sloupce
✓ Nový projekt - klikni "+Nový projekt"
✓ Editace - klikni na tužku
✓ Mazání - klikni na koš
```

### 2️⃣ **Enterprise Dashboard** (Grafy)
```
Klikni: "Dashboard" v horní navigaci

Co vidíš (když si přihlášen jako obchodník):
├─ 4 KPI Karty
│  ├─ Roční Plán (Kč)
│  ├─ Splnění (dosavadní výnos)
│  ├─ Procenta Plánu (%)
│  └─ Počet Projektů
├─ 6 Grafů & Vizualizací
│  ├─ Měsíční výkon vs plán (bar chart)
│  ├─ Roční cíl (bar chart)
│  ├─ Trend během roku (area chart - POWER BI!)
│  ├─ Progress bary všech obchodníků
│  ├─ Finanční přehled (3 karty)
│  └─ Detail tvých projektů (kartičky)
└─ Modrá linka: "Zobrazuješ svou desku: [Jméno]"

Jako Admin navíc:
├─ Tlačítko "⚙️ Nastavit Plány"
├─ Dropdown pro výběr obchodníka
│  ├─ Zvolíš Petra
│  └─ Vidíš Petrovy grafy
└─ Můžeš měnit roční plány
```

### 3️⃣ **Admin Panel** (Nastavení Plánů)
```
Klikni: "⚙️ Nastavit Plány" (vidíš jen jako Admin)

Co dělá:
├─ Vyber obchodníka (Jan/Petr/Marie)
├─ Nastavit roční plán (Kč)
├─ Automaticky se rozloží na 12 měsíců
├─ Ručně upravit jednotlivé měsíce
└─ Klikni "💾 Uložit Plán"

Příklad:
├─ Jan Novák: 5 000 000 Kč/rok
├─ Petr Svoboda: 6 000 000 Kč/rok
└─ Marie Kučerová: 4 500 000 Kč/rok
```

---

## 📝 Formulář Zpětné Vazby

Po testování prosím vyplň:

```
1. ⭐ CELKOVÉ DOJMY
   [ ] Skvělé! Přesně to chci
   [ ] Dobré, ale chybí mi...
   [ ] Vylepšit potřebuje...
   [ ] Nefunguje správně

2. 🎨 DESIGN & UI
   [ ] Vypadá super
   [ ] Zkusit jinak
   [ ] Nevidím dobře na mobilu
   [ ] Tlačítka jsou moc malá

3. 📊 KANBAN & DRAG & DROP
   [ ] Super funguje
   [ ] Chybí mi [funkce]
   [ ] Drag & Drop nefunguje
   [ ] Okrajení není jasné

4. 📈 DASHBOARD & GRAFY
   [ ] Skvělé - vidím co potřebuji
   [ ] Chybí mi [graf]
   [ ] Grafy jsou matoucí
   [ ] Numerické údaje jsou v pořádku

5. 📱 MOBILNÍ VERZE (iPhone/iPad)
   [ ] Perfektně na mobilu
   [ ] Trochu necitlivé
   [ ] Neúplné zobrazení
   [ ] Nefunguje

6. 🔄 DRAG & DROP NA MOBILU
   [ ] Funguje hladce
   [ ] Trochu problematické
   [ ] Nefunguje
   [ ] Neviděl jsem je

7. 💡 CO BY MĚLO BÝT JINAK?
   - [Zkopíruj své nápady sem]
   - [Přidej další body]

8. 🐛 NALEZENÉ CHYBY?
   - [Popis problému]
   - [Kdy k tomu došlo]
   - [Screenshots pokud je máš]
```

---

## 📱 Testování na Telefonech

### iPhone/iPad
```
Safari → zadej http://192.168.X.X:5173

Pro přidání na home screen:
1. Klikni sdílení (share button)
2. "Přidat na Home Screen"
3. Název: "SOLAR VISION"
4. Add
5. ✅ Máš app na home screenu!
```

### Android (Pokud máš)
```
Chrome → zadej http://192.168.X.X:5173
Mělo by fungovat stejně
```

---

## 🎬 Scénáře k Testování

### Scénář 1: Obchodník Jan
```
1. Přihlas se jako Jan Novák
2. Jdi na Kanban
3. Vidíš své 2 projekty v "Příležitostech"
4. Přetáhni jeden projekt do "Přípravy"
5. Jdi na Dashboard
6. Vidíš svůj roční plán (5M) a splnění (2.5M = 50%)
7. Vidíš grafy - jak si vede v jednotlivých měsících
8. Vidíš porovnání se všemi obchodníky
```

### Scénář 2: Admin
```
1. Přihlas se jako Admin
2. Jdi na Kanban
3. Vidíš VŠECHNY projekty všech obchodníků
4. Můžeš editovat kterýkoliv projekt
5. Jdi na Dashboard
6. Klikni "⚙️ Nastavit Plány"
7. Vyber Petra, nastav mu nový roční plán
8. Uloži - plán se změní
9. Zpět na Dashboard, vyber Petra
10. Vidíš aktualizované grafy!
```

### Scénář 3: Mobile
```
1. Otevři aplikaci na iPhonu
2. Vidíš hamburger menu (tři čáry)
3. Klikni pro otevření menu
4. Vidíš "Projekty", "Dashboard", "Odhlásit"
5. Přetáhni projekt (dlouhý stisk)
6. Jdi na Dashboard
7. Vidíš responsive grafy na malé obrazovce
```

---

## ✅ Očekávaný Obsah Aplikace

### Kanban Deska
```
Příležitosti:
├─ Panely na střechu - rodina Novotná (Jan Novák)
└─ Výměna střechy + solární - Kovářová (Marie)

Příprava:
└─ Komerční systém - BOZP s.r.o. (Petr)

Nákup:
└─ Průmysl - Automechanika Švadlena (Jan)

Realizace:
└─ Chata na Moravě - Pavlíčka (Petr)

Revize:
└─ Garáž + dílna - Holubář (Marie)

Distribuce:
└─ Restaurace u Třech Lípů (Jan)

Servis:
└─ Rodinný dům - Novotná (Petr)
```

### Dashboard Metriky
```
Plány:
├─ Jan: 5.0M Kč/rok
├─ Petr: 6.0M Kč/rok
└─ Marie: 4.5M Kč/rok

Splnění:
├─ Jan: 2.5M (50%)
├─ Petr: 3.6M (60%)
└─ Marie: 3.8M (85%)
```

---

## 🆘 Pokud Něco Nefunguje

1. **Refresh stránky** (Cmd+R nebo Ctrl+R)
2. **Vyloguj se a přihlas znova**
3. **Zkus jiného uživatele**
4. **Zkontroluj WiFi připojení**
5. **Restart aplikace**

Pokud pořád nefunguje → napiš nám s popisem problému! 📧

---

## 💬 Zpětná Vazba

Prosím řekni nám:
- ✅ Co se ti líbí
- ❌ Co nefunguje
- 💡 Jaké funkce chybí
- 📱 Jak se chová na mobilu
- 🐛 Jaké jsi našel chyby

**Můžeš odpovědět tímto textem nebo e-mailem.**

---

## 🎉 Děkujeme za Testování!

Tvoje zpětná vazba nám pomůže vylepšit aplikaci.

**Hodně štěstí s testováním!** 🚀

---

**Kontakt:** [tvůj e-mail nebo telefon]
**Datum testování:** [Dnes nebo kdy je to aktuální]
**Verze:** SOLAR VISION PM v1.0
