# 📊 Enterprise Dashboard - Manuál

## 🎯 Co je Enterprise Dashboard?

Pokročilý dashboard pro správce (admin) s Power BI-stylem grafy a analýzami. Umožňuje sledovat výkon obchodníků, jejich plnění roční plánů a vizualizovat data.

---

## 🚀 Jak ho spustit?

1. **Přihlas se jako Admin** - admin@solar.cz
2. Klikni na **"Dashboard"** v horní navigaci
3. Uvidíš Enterprise Dashboard s grafy

---

## 📈 Sekce Dashboard

### 1️⃣ **Quick Stats** (horní 4 karty)

Čtyři klíčové metriky:

```
┌─────────────────────────┐
│ 📅 ROČNÍ PLÁN          │  ← Nastavitelný plán obchodníka
│ 5.0M Kč                 │     (admin jej může měnit)
└─────────────────────────┘

┌─────────────────────────┐
│ ✅ SPLNĚNÍ              │  ← Dosavadní výnos
│ 2.5M Kč                 │     (vypočítáno z projektů)
└─────────────────────────┘

┌─────────────────────────┐
│ 📊 PROCENTA PLÁNU       │  ← Kolik % z plánu splnil
│ 50%                     │     (výnos / plán × 100)
└─────────────────────────┘

┌─────────────────────────┐
│ 📦 POČET PROJEKTŮ       │  ← Aktivní projekty
│ 5                       │     obchodníka
└─────────────────────────┘
```

### 2️⃣ **Selektor Obchodníka**

```
┌──────────────────────────────┐
│ Vybrat obchodníka:           │
│                              │
│ [Jan Novák] [Petr] [Marie]   │
│     ↑ aktivní                │
│                              │
│ Všechny grafy se přepínají   │
│ pro vybraného obchodníka     │
└──────────────────────────────┘
```

### 3️⃣ **Měsíční Výkon vs Plán** (Bar Chart)

```
Zobrazuje každý měsíc:
- Plánovaný výnos (šedý sloupec)
- Dosažený výnos (modrý sloupec)

Ideální: Modré sloupce jsou vyšší nebo rovné šedým
```

### 4️⃣ **Plnění Ročního Cíle** (Bar Chart)

```
Porovnání všech 3 obchodníků:
- Jejich roční plány (šedé)
- Jejich dosavadní splnění (zelené)

Kdo plní nejlépe?
```

### 5️⃣ **Plnění Během Roku** (Area Chart)

```
Trend linky ukazující:
- Kolik % z měsíčního plánu každý měsíc dosáhly
- 100% = plán splnění

Ideální: Linka se drží kolem 100%
```

### 6️⃣ **Porovnání Všech Obchodníků** (Progress Bars)

```
Každý obchodník má:
- Jméno
- Progress bar % plnění
- Čísla: 1.5M / 5.0M (dosaženo / plán)

Barvy:
🟢 Zelená  = 100%+  (překročil plán)
🔵 Modrá   = 80-99% (téměř plán)
🟡 Žlutá   = <80%   (pod plánem)
```

### 7️⃣ **Detail Projektů** (Kartičky)

```
Všechny projekty vybraného obchodníka:
- Název & zákazník
- Výnos (k Kč)
- Status (fáze)

Pomocí těchto projektů se počítá:
Celkový výnos = součet všech projektů
```

---

## ⚙️ Nastavení Roční Plánů

### Jak nastavit plán pro obchodníka?

1. Klikni na **"⚙️ Nastavit plány"** (v pravém horním rohu)
2. Otevře se modal s nastavením
3. Zvolí si obchodníka (Jan/Petr/Marie)
4. Napiš **roční plán** (Kč) - např. 5000000
5. Systém automaticky rozloží na měsíce (5M / 12)
6. Můžeš **ručně upravit jednotlivé měsíce**
7. Klikni **"💾 Uložit Plán"**

### Příklad: Roční Plán

```
Obchodník: Jan Novák
Roční plán: 5 000 000 Kč

Automatický rozděl (rovnoměrný):
- Leden: 416 667 Kč
- Únor: 416 667 Kč
- ... (všechny měsíce stejně)
- Prosinec: 416 667 Kč
```

### Příklad: Nerovnoměrný Plán

```
Některé měsíce jsou více lukrativní:
- Leden-Březen: 300k (zimoviště, méně zájmu)
- Duben-Květen: 500k (jaro, vzestup)
- Červen-Srpen: 600k (léto, peak sezóna)
- Září-Listopad: 450k (podzim)
- Prosinec: 550k (konec roku, doběh)

Celkem: ~5M Kč
```

---

## 📊 Power BI Style Features

Inspirace z Power BI:

✅ **Multiple Chart Types**
- Bar charts (porovnání)
- Area charts (trend)
- Progress bars (% plnění)
- KPI cards (klíčové metriky)

✅ **Drill-down**
- Vybrat obchodníka → vidět jeho detaily
- Vidět jednotlivé projekty

✅ **Color Coding**
- 🟢 Dobré (100%+ plnění)
- 🔵 OK (80-99%)
- 🟡 Zlé (<80%)

✅ **Interactive**
- Lze vybírat obchodníka
- Grafy se dynamicky aktualizují
- Hover nad grafem = detaily

---

## 💡 Use Cases

### Manažer Chce Vědět:

**"Jak si stojí Jan v plnění?"**
→ Zvol Jana v selektoru, vidíš všechny jeho metriky a grafy

**"Kdo je nejlépe na tom?"**
→ Podívej se na "Porovnání Všech Obchodníků" (progress bars)

**"Který měsíc byl nejlepší?"**
→ Podívej se na "Měsíční Výkon vs Plán" (bar chart)

**"Budeme moci splnit roční plán?"**
→ Sleduj "Plnění Během Roku" (area chart)
→ Pokud je linka pod 100%, máme problém

**"Kolik by měl Petr splnit do příštího měsíce?"**
→ Otevři "Nastavit plány" a podívej se na Petrův měsíční plán

---

## 🔧 Technické Details

### Data Source:
- **Výnos** = součet `project.revenue` všech projektů obchodníka
- **Plán** = `SalesTarget.yearlyTarget` / `monthlyBreakdown`
- **% Plnění** = (výnos / plán) × 100
- **Měsíční data** = simulace (v reálu by se počítalo ze `project.createdAt`)

### Grafy:
- **Recharts** - React graphing library
- **Responsive** - přizpůsobuje se velikosti okna
- **Interaktivní** - hover = tooltip s hodnotami

### State Management:
- `useSalesTargetStore` - ukládá plány obchodníků
- `useProjectStore` - ukládá projekty a jejich výnosy
- Data se synchronizují v reálném čase

---

## 🎓 Admin Tips

1. **Realistické Plány** - plán by měl být dosažitelný ale náročný (80-120% z minulého roku)
2. **Měsíční Rozdíly** - vezmi v úvahu sezónnost (léto > zima)
3. **Pravidelná Kontrola** - kontroluj progress jednou za týden
4. **Feedback** - sděluj obchodníkům jejich plnění, aby věděli jak si vedou

---

## 📱 Pro Budoucnost

- [ ] Real-time data (propojit na backend)
- [ ] Export do PDF
- [ ] Email notifikace když plán není splněn
- [ ] Predikce splnění (AI)
- [ ] Srovnání vs loňský rok
- [ ] Přidání komentářů k projektům

---

**Hotovo!** Máš kompletní Enterprise Dashboard. 🚀
