# Pages Légales - SeenIt

Ce dossier contient toutes les pages légales nécessaires pour une application publique conforme au RGPD.

## Pages créées

### 📄 [Mentions Légales](/legal/mentions)
- **Route:** `/legal/mentions`
- **Contenu:**
  - Informations éditeur
  - Contact
  - Hébergement (Vercel + Supabase)
  - Propriété intellectuelle
  - Attribution TMDB
  - Responsabilité
  - Droit applicable

### 🔒 [Politique de Confidentialité](/legal/privacy)
- **Route:** `/legal/privacy`
- **Contenu:**
  - Données collectées (email, préférences)
  - Utilisation des données
  - Stockage sécurisé (Supabase avec RLS)
  - Conformité RGPD
  - Droits des utilisateurs (accès, portabilité, effacement)
  - Gestion des cookies
  - Attribution TMDB
  - Conservation des données

### 📋 [CGU - Conditions Générales d'Utilisation](/legal/terms)
- **Route:** `/legal/terms`
- **Contenu:**
  - Objet du service
  - Création de compte
  - Utilisation autorisée/interdite
  - Propriété intellectuelle
  - Disponibilité du service
  - Limitation de responsabilité
  - Suspension et résiliation
  - Modifications des CGU
  - Droit applicable

## Composants créés

### 🍪 CookieBanner
- **Fichier:** `src/components/CookieBanner.tsx`
- **Affichage:** Automatique au premier chargement
- **Fonctionnalités:**
  - Accepter/Refuser les cookies
  - Stockage dans localStorage
  - Liens vers politique de confidentialité et CGU
  - Design responsive

### 🦶 Footer
- **Fichier:** `src/components/Footer.tsx`
- **Contenu:**
  - Liens de navigation
  - Liens légaux (Mentions, Privacy, CGU)
  - **Attribution TMDB avec logo** (obligatoire)
  - Copyright

## Intégration

### Footer intégré dans:
- ✅ Page d'accueil (`src/app/page.tsx`)
- ✅ Composant réutilisable disponible

### CookieBanner intégré dans:
- ✅ Layout principal (`src/app/layout.tsx`)
- S'affiche automatiquement sur toutes les pages

## Conformité

### ✅ RGPD (Règlement Général sur la Protection des Données)
- Informations claires sur les données collectées
- Finalités du traitement expliquées
- Droits des utilisateurs détaillés
- Consentement explicite pour les cookies
- Base légale: Exécution du contrat + Intérêt légitime

### ✅ TMDB API Requirements
- Attribution visible dans le footer
- Mention "This product uses the TMDB API but is not endorsed or certified by TMDB"
- Logo TMDB affiché

### ✅ Loi Informatique et Libertés
- Droit d'accès, rectification, suppression
- Contact pour exercer les droits
- Délai de conservation mentionné

## À personnaliser

Avant de déployer en production, pensez à modifier:

1. **Contact email/formulaire** dans:
   - Mentions légales
   - Politique de confidentialité
   - CGU

2. **Informations éditeur** dans Mentions légales:
   - Nom complet
   - Adresse postale (si entreprise)
   - SIRET/SIREN (si entreprise)

3. **Domaine de l'application** dans les CGU

4. **Durées de conservation** si différentes de celles indiquées

## Notes importantes

### Cookies utilisés
- `sb-*-auth-token`: Cookie Supabase pour l'authentification (strictement nécessaire)
- `cookies-accepted`: Stocké en localStorage (choix de l'utilisateur)

### Sécurité Supabase
- Row Level Security (RLS) activé
- Authentification sécurisée (hash bcrypt)
- Hébergement Europe (conformité RGPD)
- Chiffrement en transit (HTTPS) et au repos

### Assistance
Pour toute question sur la conformité légale, consultez:
- [CNIL - Délibération cookies](https://www.cnil.fr/fr/cookies-et-autres-traceurs)
- [RGPD - Texte officiel](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
