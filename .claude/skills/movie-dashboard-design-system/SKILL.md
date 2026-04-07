---
name: movie-dashboard-design-system
description: Charte graphique et design system du projet movie_dashboard (Next.js). Définit la palette de couleurs, la typographie, les espacements, les composants UI (cards de films, système de notation, tags, listes) et les règles d'accessibilité WCAG AA. Utilise cette skill dès que tu crées ou modifies un composant UI, une page, un layout, ou que tu touches au styling du projet movie_dashboard. Utilise-la aussi quand l'utilisateur parle de couleurs, de design, de style, de mise en page, de responsive, de dark mode, ou de tout élément visuel du dashboard.
---

# Movie Dashboard — Design System

Ce document est la référence unique pour toutes les décisions visuelles du projet `movie_dashboard`. Tout composant, toute page, tout élément UI doit respecter ces règles.

## Direction artistique

Le movie_dashboard est un **catalogue personnel de films** — pas un site de réservation de cinéma. L'ambiance visuelle est celle d'une **bibliothèque vintage et chaleureuse**, combinée à une **typographie sans-serif moderne et clean**. Pense à une collection de vinyles soigneusement rangée, à des étagères en bois, à la lumière dorée d'un projecteur.

Principes directeurs :

- **Intime et curé** : chaque film a sa place, comme un livre sur une étagère personnelle
- **Chaleureux sans être rétro** : les couleurs chaudes et textures subtiles évoquent le vintage, mais la typo et les espacements restent contemporains
- **Lisible et accessible** : le contraste et la hiérarchie visuelle priment toujours sur la décoration

---

## Palette de couleurs

### Couleurs principales

| Nom       | Hex       | Rôle                                                        |
| --------- | --------- | ----------------------------------------------------------- |
| Paper     | `#F6F4F1` | Fond principal, surfaces claires                            |
| Stone     | `#E4DED2` | Fond secondaire, séparateurs, cards en retrait              |
| Coral     | `#F95C4B` | Accent principal — boutons, liens actifs, actions           |
| Eclipse   | `#0D0D0D` | Texte principal, fonds sombres, barres de navigation        |
| Gold Reel | `#D4A843` | Accent secondaire — étoiles de notation, badges, highlights |

### Variantes fonctionnelles

Dériver ces variantes pour les états interactifs et les retours utilisateur :

| Nom         | Hex       | Usage                                       |
| ----------- | --------- | ------------------------------------------- |
| Coral Light | `#FDE8E5` | Fond de badge, hover léger sur fond clair   |
| Coral Dark  | `#C7392A` | Texte Coral accessible sur fond Paper/Stone |
| Gold Light  | `#F5E6C4` | Fond de badge doré, highlight léger         |
| Gold Dark   | `#8C6D2A` | Texte doré accessible sur fond Paper/Stone  |
| Stone Dark  | `#B8B0A0` | Bordures, éléments désactivés               |
| Paper Dark  | `#EBE7E0` | Hover sur fond Paper                        |

---

## Règles d'accessibilité WCAG AA

Le niveau AA exige un ratio de contraste minimum de **4.5:1 pour le texte normal** et **3:1 pour le gros texte (≥18px bold ou ≥24px) et les éléments UI**.

### Combinaisons autorisées

#### Texte normal (toute taille)

- Eclipse `#0D0D0D` sur Paper `#F6F4F1` → 17.4:1 ✅
- Eclipse `#0D0D0D` sur Stone `#E4DED2` → 13.8:1 ✅
- Paper `#F6F4F1` sur Eclipse `#0D0D0D` → 17.4:1 ✅
- Coral `#F95C4B` sur Eclipse `#0D0D0D` → 5.4:1 ✅
- Gold Reel `#D4A843` sur Eclipse `#0D0D0D` → 6.5:1 ✅
- Coral Dark `#C7392A` sur Paper `#F6F4F1` → 5.2:1 ✅
- Gold Dark `#8C6D2A` sur Paper `#F6F4F1` → 4.9:1 ✅

#### Gros texte et éléments UI uniquement (≥18px bold ou ≥24px)

- Coral `#F95C4B` sur Paper `#F6F4F1` → 3.2:1 ✅ (gros texte uniquement)
- Gold Reel `#D4A843` sur Paper `#F6F4F1` → 2.7:1 ❌ (même en gros texte, utiliser Gold Dark)

### Combinaisons interdites pour le texte

- ❌ Coral `#F95C4B` en texte normal sur Paper ou Stone
- ❌ Gold Reel `#D4A843` en texte sur Paper ou Stone
- ❌ Stone `#E4DED2` en texte sur Paper (contraste insuffisant)

### Règles d'usage des accents

Coral et Gold Reel sont des couleurs d'accent. Sur fonds clairs (Paper, Stone) :

- Les utiliser pour les **éléments non-textuels** : icônes, bordures, fonds de boutons, étoiles, séparateurs décoratifs
- Pour du **texte accent lisible** sur fonds clairs, utiliser les variantes Dark (Coral Dark, Gold Dark)
- Sur fond **Eclipse**, Coral et Gold Reel sont librement utilisables en texte

---

## Typographie

### Police principale : DM Sans

Importer depuis Google Fonts :

```css
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap");
```

### Échelle typographique

| Élément    | Taille | Poids | Hauteur de ligne | Usage                         |
| ---------- | ------ | ----- | ---------------- | ----------------------------- |
| h1         | 32px   | 700   | 1.2              | Titre de page                 |
| h2         | 24px   | 700   | 1.3              | Titre de section              |
| h3         | 20px   | 500   | 1.4              | Sous-titre, nom de liste      |
| h4         | 16px   | 500   | 1.4              | Label de card, catégorie      |
| body       | 16px   | 400   | 1.6              | Texte courant                 |
| body-small | 14px   | 400   | 1.5              | Texte secondaire, métadonnées |
| caption    | 12px   | 400   | 1.4              | Tags, timestamps, badges      |

### Règles typographiques

- Ne jamais descendre en dessous de 12px
- Utiliser le poids 500 pour les labels et sous-titres, 700 pour les titres principaux
- Couleur du texte principal : Eclipse `#0D0D0D` sur fonds clairs, Paper `#F6F4F1` sur fonds sombres
- Couleur du texte secondaire : Stone Dark `#B8B0A0` sur fonds clairs, Stone `#E4DED2` sur fonds sombres

---

## Espacements

Utiliser un système en multiples de 4px :

| Token | Valeur | Usage                                    |
| ----- | ------ | ---------------------------------------- |
| xs    | 4px    | Écart interne de badges, micro-gaps      |
| sm    | 8px    | Écart entre icône et texte, padding tags |
| md    | 16px   | Padding interne de cards, gap de grille  |
| lg    | 24px   | Marge entre sections, padding de page    |
| xl    | 32px   | Séparation de blocs majeurs              |
| 2xl   | 48px   | Marge haute/basse de page                |

---

## Coins et bordures

| Élément             | Border-radius | Bordure                                         |
| ------------------- | ------------- | ----------------------------------------------- |
| Cards de films      | 12px          | 1px solid Stone `#E4DED2`                       |
| Boutons             | 8px           | Aucune (fond Coral ou Eclipse)                  |
| Tags / badges       | 999px (pill)  | Aucune (fond Stone ou Coral Light / Gold Light) |
| Champs de recherche | 8px           | 1px solid Stone Dark `#B8B0A0`                  |
| Affiches de films   | 8px           | Aucune                                          |

---

## Ombres

Utiliser les ombres avec parcimonie — l'ambiance est chaleureuse, pas clinquante :

| Token     | Valeur                           | Usage             |
| --------- | -------------------------------- | ----------------- |
| shadow-sm | `0 1px 3px rgba(13,13,13,0.06)`  | Cards au repos    |
| shadow-md | `0 4px 12px rgba(13,13,13,0.08)` | Cards au hover    |
| shadow-lg | `0 8px 24px rgba(13,13,13,0.12)` | Modals, dropdowns |

---

## Composants UI

### Card de film

Structure d'une card de film dans la grille principale :

```
┌─────────────────────┐
│                     │
│    [Affiche]        │  ← Image, ratio 2:3, border-radius: 8px
│    aspect-ratio 2/3 │
│                     │
├─────────────────────┤
│ Titre du film       │  ← h4, Eclipse, 16px/500, 1 ligne max (ellipsis)
│ Année • Genre       │  ← body-small, Stone Dark, 14px/400
│ ★ ★ ★ ★ ☆  4/5    │  ← Étoiles en Gold Reel, note en Eclipse
└─────────────────────┘
```

Règles :

- Grille responsive : `grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))`
- Gap : 16px (md)
- Hover : élévation avec shadow-md, léger scale(1.02) en transition 200ms ease
- L'affiche occupe toute la largeur de la card, pas de padding autour
- Le bloc texte a un padding de 12px horizontal, 8px vertical

### Système de notation

- 5 étoiles en Gold Reel `#D4A843` pour les pleines, Stone Dark `#B8B0A0` pour les vides
- Taille des étoiles : 16px dans les cards, 24px dans la vue détaillée
- Afficher la note numérique à côté : `4/5` en body-small, Eclipse
- Les étoiles sont interactives (clic pour noter) dans la vue détaillée
- Demi-étoiles autorisées (notation sur 10 affichée en /5)

### Tags et catégories

```
[ Thriller ]  [ Science-fiction ]  [ Vu en 2024 ]
```

- Forme : pill (border-radius 999px)
- Fond : Stone `#E4DED2` sur fond Paper, Paper `#F6F4F1` sur fond Stone
- Texte : Eclipse `#0D0D0D`, taille caption (12px)
- Padding : 4px 12px
- Tags spéciaux (favoris, à voir) : fond Gold Light `#F5E6C4`, texte Gold Dark `#8C6D2A`

### Listes personnalisées

Les listes (« À voir », « Favoris », « Vus en 2024 ») sont affichées comme des sections avec :

- Titre h3 (20px/500) avec un compteur en Stone Dark à droite (`12 films`)
- Sous la ligne de titre, une bordure de 2px en Coral sur 40px de large (accent décoratif)
- Contenu : grille de cards de films (même composant que ci-dessus)
- Possibilité de vue liste (une ligne par film) en alternative à la grille

### Boutons

| Variante   | Fond              | Texte                | Hover                      |
| ---------- | ----------------- | -------------------- | -------------------------- |
| Primaire   | Coral `#F95C4B`   | Paper `#F6F4F1`      | Fond Coral Dark `#C7392A`  |
| Secondaire | Eclipse `#0D0D0D` | Paper `#F6F4F1`      | Fond `#2A2A2A`             |
| Ghost      | Transparent       | Eclipse `#0D0D0D`    | Fond Paper Dark `#EBE7E0`  |
| Danger     | Transparent       | Coral Dark `#C7392A` | Fond Coral Light `#FDE8E5` |

Tous les boutons : padding 10px 20px, border-radius 8px, transition 150ms ease, taille 14px/500.

### Champ de recherche

- Fond : Paper `#F6F4F1`
- Bordure : 1px Stone Dark `#B8B0A0`
- Bordure focus : 2px Coral `#F95C4B`
- Placeholder : Stone Dark `#B8B0A0`
- Icône loupe : Stone Dark, 20px
- Border-radius : 8px
- Hauteur : 44px (cible tactile accessible)

---

## Variables CSS

Définir ces variables à la racine du projet (dans `globals.css` ou le layout principal) :

```css
:root {
  /* Couleurs principales */
  --color-paper: #f6f4f1;
  --color-stone: #e4ded2;
  --color-coral: #f95c4b;
  --color-eclipse: #0d0d0d;
  --color-gold: #d4a843;

  /* Variantes */
  --color-coral-light: #fde8e5;
  --color-coral-dark: #c7392a;
  --color-gold-light: #f5e6c4;
  --color-gold-dark: #8c6d2a;
  --color-stone-dark: #b8b0a0;
  --color-paper-dark: #ebe7e0;

  /* Sémantique */
  --color-bg-primary: var(--color-paper);
  --color-bg-secondary: var(--color-stone);
  --color-text-primary: var(--color-eclipse);
  --color-text-secondary: var(--color-stone-dark);
  --color-accent: var(--color-coral);
  --color-accent-secondary: var(--color-gold);

  /* Typo */
  --font-family: "DM Sans", system-ui, sans-serif;

  /* Espacements */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Rayons */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-pill: 999px;

  /* Ombres */
  --shadow-sm: 0 1px 3px rgba(13, 13, 13, 0.06);
  --shadow-md: 0 4px 12px rgba(13, 13, 13, 0.08);
  --shadow-lg: 0 8px 24px rgba(13, 13, 13, 0.12);
}
```

---

## Responsive

| Breakpoint | Largeur    | Colonnes grille films | Comportement               |
| ---------- | ---------- | --------------------- | -------------------------- |
| Mobile     | < 640px    | 2                     | Navigation en bottom bar   |
| Tablette   | 640–1024px | 3–4                   | Sidebar repliable          |
| Desktop    | > 1024px   | 5–6                   | Sidebar fixe, grille large |

Règles :

- Utiliser `auto-fill` et `minmax` pour la grille plutôt que des breakpoints rigides
- Les cards ne descendent jamais en dessous de 140px de large
- Le champ de recherche passe en pleine largeur sur mobile
- Taille minimale des cibles tactiles : 44×44px

---

## Dark mode (optionnel, pour évolution future)

Si le dark mode est implémenté, inverser les rôles :

| Token                    | Light mode | Dark mode |
| ------------------------ | ---------- | --------- |
| --color-bg-primary       | Paper      | Eclipse   |
| --color-bg-secondary     | Stone      | `#1A1A1A` |
| --color-text-primary     | Eclipse    | Paper     |
| --color-text-secondary   | Stone Dark | Stone     |
| --color-accent           | Coral      | Coral     |
| --color-accent-secondary | Gold Reel  | Gold Reel |

Coral et Gold Reel restent identiques — ils passent déjà le contraste AA sur fond sombre.
