# Bios Computer — Sito (Git + Netlify)
Tema scuro, bollettino IT (EN/IT), pacchetti assistenza con Stripe, form contatti Netlify.

## Deploy da GitHub su Netlify
1. Crea repo GitHub e fai push di questa cartella.
2. In Netlify → Add new site → Import from Git → seleziona repo.
3. Build settings:
   - Build command: `npm --prefix netlify/functions install`
   - Publish directory: `.`
   - Functions directory: `netlify/functions`
4. Deploy. Testa `/.netlify/functions/bulletin` (deve restituire `{ posts: [...] }`).

## Dominio
- Aggiungi `www.bioscomputer.it` su Netlify.
- In Aruba: CNAME `www` → `<tuo-sito>.netlify.app`.
- HTTPS → Let's Encrypt.

## Stripe (già integrato)
- 30 min → €25 + IVA — https://buy.stripe.com/fZu7sN1Oc3IDablfYCc3m00
- 60 min → €40 + IVA — https://buy.stripe.com/3cIdRb64s7YTdnxeUyc3m01
- 90 min → €55 + IVA — https://buy.stripe.com/eVq5kFcsQ6UP3MX9Aec3m02

## Modifica loghi
Sostituisci i file in `assets/logos/` con gli SVG ufficiali mantenendo lo stesso nome file.
Per cambiare il logo principale, aggiorna `assets/logo_bios.svg` o l'`<img src>` nell'header.

## Note
- Il bollettino mostra badge EN/IT in base alla fonte.
- Se Zyxel non ha RSS, vedrai un “segnalibro” che punta alla pagina advisory.
"# bioscomputer-site" 
