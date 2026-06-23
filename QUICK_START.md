# 🌞 SOLAR VISION PM - Rychlý Start

## Jak spustit aplikaci?

```bash
cd "/Users/tomasbednar/SOLAR VISION, projekt/solar-vision-web"
npm run dev
```

**Otevřít:** http://localhost:5173

---

## 👥 Přihlášení

Na login stránce vyberte jednoho ze 4 demo uživatelů:

### Obchodníci
- **Jan Novák** (jan@solar.cz) - Obchodní zástupce
- **Petr Svoboda** (petr@solar.cz) - Obchodní zástupce
- **Marie Kučerová** (marie@solar.cz) - Obchodní zástupce

### Správce
- **Admin** (admin@solar.cz) - Má přístup k Dashboard s metrikami všech obchodníků

---

## 📊 Kanban Deska

### Co vidíte?
Kanban deska se 7 sloupci reprezentujícími fáze procesu SOLAR VISION:

1. **Příležitosti** - Nové zájemce, poptávky
2. **Příprava** - Smlouvy, dokumentace, projektování
3. **Nákup** - Výběr materiálu, objednávky
4. **Realizace** - Montáž, instalace
5. **Revize** - Kontrola, zkoušky
6. **Distribuce** - Schválení UTP
7. **Servis** - Zaplaceno, záruka, servis

### Projektová karta obsahuje:

```
┌──────────────────────────────┐
│ 🎯 Uchopovací rukojeť (drag) │
│ 📌 Název projektu            │
│    Zákazník                  │
├──────────────────────────────┤
│ ⚡ Výkon:     10 kWp          │
│ 💰 Výnos:     350k Kč         │
│ 📊 Náklady:   250k Kč         │
│ 📈 Marže:     29%             │
├──────────────────────────────┤
│ 📅 Termín:    24.07.26       │
└──────────────────────────────┘
```

### Akce s projekty:

- **✏️ Editovat** - Klikni na ikonu tužky
- **🗑️ Smazat** - Klikni na ikonu koše
- **➕ Nový projekt** - Tlačítko v pravém horním rohu
- **🎯 Drag & Drop** - Uchop kartu za ikon vlevo a přetáhni do dalšího sloupce = změna statusu!

---

## 📝 Vytvoření Nového Projektu

1. Klikni **"➕ Nový projekt"** v pravém horním rohu
2. Vyplň formulář:
   - **Název projektu*** - Popis (např. "Panely na střechu - Suchár")
   - **Zákazník*** - Jméno zákazníka
   - **Status** - Fáze (Příležitosti, Příprava, atd.)
   - **Výkon (kWp)** - Výkon v kilowattech (10, 50, atd.)
   - **Výnos (Kč)** - Cena pro zákazníka
   - **Náklady (Kč)** - Náklady na realizaci
   - **Počáteční datum** - Kdy začít
   - **Termín dokončení** - Cílový termín
   - **Poznámky** - Dodatečné informace

3. Klikni **"✅ Vytvořit"**

---

## 📈 Dashboard s Customizovatelými Widgety

Klikni na **"Dashboard"** v horní navigaci.

### ⚙️ Nastavení Widgetů

Klikni na **"Nastavení widgetů"** v pravém rohu aby jsi mohl:
- ✅ Zapnout/Vypnout widgety podle potřeby
- 🔄 Resetovat do výchozího stavu
- 📍 Přizpůsobit si dashboard dle svých preferencí

### Dostupné Widgety:

1. **📊 Počet projektů** - Celkový počet aktivních projektů
2. **💰 Celkový výnos** - Součet všech výnosů (Kč)
3. **💵 Celkový zisk** - Výnos minus náklady
4. **📈 Zisková marže** - Procentní podíl zisku z výnosu
5. **👥 Výkon týmu** - Detaily pro každého obchodníka (počet projektů, výnos, zisk, marže)
6. **📊 Projekty dle stavu** - Počet projektů v každé fázi (Příležitosti, Příprava, atd.)
7. **💵 Finanční přehled** - Detailní přehled výnosů, nákladů, zisku

### Co vidíte (admin)?

**Klíčové metriky:**
- 📊 Počet projektů celkem
- 💰 Celkový výnos (Kč)
- 💵 Celkový zisk (Kč)
- 📈 Zisková marže (%)

**Výkon obchodníků:**
- Počet projektů per obchodník
- Výnos per obchodník
- Zisk per obchodník
- Marže per obchodník

**Rozložení projektů dle stavu:**
- Počet projektů v každé fázi
- 7 sloupců = 7 stavů

---

## 💡 Pro Obchodníky

Přihlásíte se jako obchodník (Jan/Petr/Marie) a vidíte:

- Vaše projekty v Kanban desce
- Vaši výkony v Dashboard (váš přehled)
- Možnost vytvářet/editovat vaše projekty

---

## 💾 Kde se data ukládají?

Momentálně se data ukládají:
- **Local Storage** - Vaše přihlášení
- **In-Memory (Zustand)** - Projektová data

⚠️ **Pozor:** Data se vymažou při zavření prohlížeče!

**Pro produkci:** Doporučujeme připojit **Supabase** pro cloudové uložení.

---

## 🔧 Funkce v Přípravě

- [ ] Supabase Integration (Cloud Data)
- [ ] iCloud Sync
- [ ] PDF Export
- [ ] Email Notifikace
- [ ] Drag & Drop Kanban
- [ ] Real-time Collaboration
- [ ] Mobile App

---

## 📞 Support

Máš problém? Zkontroluj:
1. Máš otevřený dev server? (`npm run dev`)
2. Je aplikace na http://localhost:5173?
3. Zkus refresh stránky (Cmd+R)
4. Vymažeme localStorage: `localStorage.clear()`

---

## 🎯 Demo Scénář

Chceš vyzkoušet aplikaci? Zkus toto:

1. **Přihlas se jako Jan Novák**
2. **Klikni "Nový projekt"** a vytvoř svůj projekt
3. **Přepni na Admin** a podívej se na Dashboard s všemi metrics
4. **Edituj** některý projekt a změň jeho status
5. **Smaž** projekt který už nepotřebuješ

---

**Hotovo!** Aplikace je připravena k používání. Vítej v SOLAR VISION PM! 🌞
