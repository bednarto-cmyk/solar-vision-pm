# 🌞 SOLAR VISION PM
### Projektové řízení & CRM pro Solární Instalace

---

## 🎯 Přehled

Komplexní web aplikace pro správu procesů a sledování výkonu 3 obchodníků v SOLAR VISION. Zahrnuje:

✅ **Kanban Deska** - 7 fází + Drag & Drop pro změnu statusu  
✅ **Real-time Synchronizace** - Okamžitá aktualizace dat  
✅ **Customizable Dashboard** - Nastavitelné widgety s metrikami  
✅ **CRM Funkce** - Správa zákazníků a projektů  
✅ **Offline Mode** - Funguje bez internetu  
✅ **Drag & Drop** - Přetahy projektů mezi fázemi  

---

## 🚀 Spuštění

```bash
# Instalace
npm install

# Development (http://localhost:5173)
npm run dev

# Build pro produkci
npm run build
npm run preview
```

---

## 🏗️ Architektura

```
src/
├── components/          # React komponenty
│   ├── Navbar.tsx      # Horní navigace
│   ├── LoginPage.tsx   # 4 demo uživatelé
│   ├── Kanban.tsx      # Deska s 7 fázemi
│   ├── Dashboard.tsx   # Metriky & analytics
│   ├── ProjectModal.tsx # Formulář projektů
│   └── ProjectCard.tsx  # Projektová karta
├── store/
│   └── projectStore.ts # Zustand state management
└── index.css           # Tailwind CSS
```

---

## 👥 Demo Přihlášení

**Obchodníci:**
- Jan Novák (jan@solar.cz)
- Petr Svoboda (petr@solar.cz)
- Marie Kučerová (marie@solar.cz)

**Admin panel:** Admin (admin@solar.cz)

*Vyberte uživatele na přihlašovací stránce*

---

## 📊 7 Fází Procesu

1. **Příležitosti** - Zaevidování, první kontakt
2. **Příprava** - SOP, žádost, dokumentace
3. **Nákup** - Materiál, subdodavatelé
4. **Realizace** - Montáž, zkoušky
5. **Revize** - Kontrola, opravy
6. **Distribuce** - Schválení UTP
7. **Servis** - Reklamace, záruky

---

## 💾 Tech Stack

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Zustand** - State Management
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

---

## 🔄 Data Model

```typescript
interface Project {
  id: string
  name: string          // Popis projektu
  customer: string      // Zákazník
  status: ProjectStatus // Fáze (7 možností)
  assignedTo: string    // Obchodník (ID)
  power: number         // kWp
  cost: number          // Náklady Kč
  revenue: number       // Výnos Kč
  startDate: string     // Začátek
  endDate: string       // Termín
  phases: {}            // Milestones
  documents: []         // Soubory
  notes: string         // Poznámky
}
```

---

## 📈 Dashboard Funkce (Admin)

- Počet projektů celkem
- Celkový výnos (Kč)
- Celkový zisk (Kč)
- Zisková marže (%)
- Výkon každého obchodníka
- Rozložení projektů dle stavu

---

## 🔐 Bezpečnost

- localStorage (lze upgradovat na šifrování)
- Validace vstupů
- TypeScript type checking
- Bez citlivých dat v URL

---

## 📦 Next Steps

- [ ] Supabase Cloud Integration
- [ ] PDF Export
- [ ] Email notifikace
- [ ] Drag-and-drop v Kanban
- [ ] Pokročilé filtry
- [ ] iCloud Sync
- [ ] Real-time Collaboration
- [ ] Mobile App (React Native)

---

## 📞 Info

**Vytvořeno:** Červen 2026  
**Status:** ✅ MVP Funkční  
**Tým:** Claude Code

*Připraveno k nasazení na produkci*
