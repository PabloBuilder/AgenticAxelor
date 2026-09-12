# Axelor REST API Cheatsheet (pour Agent & MCP)

## 1. Authentification & Sécurité
- **Login :** `POST /login.jsp` avec `username` et `password` (form-urlencoded).
- **Session :** Récupérer le cookie `JSESSIONID`.
- **CSRF :** Si activé, lire le cookie `CSRF-TOKEN` et renvoyer le header `X-CSRF-Token`.
- **Headers requis :** 
  - `Accept: application/json`
  - `Content-Type: application/json`

---

## 2. Recherche générique (`POST /ws/rest/{model}/search`)
Endpoint principal pour interroger n'importe quel modèle ou table méta.

### Payload type :
```json
{
  "offset": 0,
  "limit": 20,
  "fields": ["id", "name", "title"],
  "sortBy": ["name"],
  "data": {
    "_domain": "self.name like :keyword or self.title like :keyword",
    "_domainContext": {
      "keyword": "%Vente%"
    }
  }
}
```

### Réponse type :
```json
{
  "status": 0,
  "total": 1,
  "data": [
    { "id": 12, "name": "crm.lead", "title": "Pistes" }
  ]
}
```

---

## 3. Métadonnées d'arborescence (Menus)
- **Modèle :** `com.axelor.meta.db.MetaMenu`
- **Champs utiles :** `id`, `name`, `title`, `parent`, `action`, `order`
- **Fil d'Ariane :** En partant d'un menu feuille (`parent != null`), remonter récursivement jusqu'au parent racine pour reconstituer le chemin d'accès dans l'UI.

---

## 4. Métadonnées d'interface (Vues & Formulaires)
- **Modèle :** `com.axelor.meta.db.MetaView`
- **Champs utiles :** `id`, `name`, `title`, `type` (form, grid), `model`, `xml`
- **Usage :** Analyser le XML d'une vue pour extraire les balises `<field name="...">` et leurs libellés associés (`title="..."`).