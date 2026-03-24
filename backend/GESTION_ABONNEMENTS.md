# Gestion des Abonnements - Documentation

## Vue d'ensemble

Ce document décrit l'implémentation complète de la gestion des abonnements pour les cabinets médicaux dans l'application Medinova.

## Fonctionnalités implémentées

### 1. Activation/Désactivation des services pour un cabinet donné

**Objectif :** Permettre à l'administrateur de contrôler l'accès aux fonctionnalités de l'application pour chaque cabinet médical en fonction de la validité de son abonnement.

**Comportement :**
- Lors de la création ou modification d'un cabinet, l'administrateur peut définir une durée d'abonnement (ex. : 6 mois, 1 an)
- L'administrateur peut activer ou désactiver les services du cabinet
- Si l'abonnement est expiré ou non payé :
  - Le médecin et la secrétaire ne peuvent pas se connecter
  - Un message d'expiration d'abonnement est affiché
- L'administrateur peut renouveler l'abonnement et réactiver les services

**Endpoints API :**
- `POST /api/admin/abonnements/cabinet/{cabinetId}` - Créer un abonnement pour un cabinet
- `PUT /api/admin/abonnements/{abonnementId}` - Mettre à jour un abonnement
- `PATCH /api/admin/abonnements/{abonnementId}/toggle?actif={true|false}` - Activer/Désactiver un abonnement
- `POST /api/admin/abonnements/{abonnementId}/renew` - Renouveler un abonnement

### 2. Statistiques des abonnements dans le Dashboard Administrateur

**Objectif :** Permettre à l'administrateur de visualiser en temps réel l'état des abonnements des cabinets médicaux.

**Affichage :**
- Nombre total de cabinets enregistrés
- Nombre d'abonnements actifs (payés et en cours)
- Nombre d'abonnements expirés (non renouvelés ou non payés)
- Nombre d'abonnements proches de l'expiration (alerte à J-15)

**Tableau de gestion :**
- Liste de tous les cabinets avec :
  - Nom du cabinet
  - Médecin associé
  - Date de début et de fin d'abonnement
  - Statut : ✅ Actif / ❌ Expiré / ⚠️ À renouveler / 🔒 Désactivé

**Actions disponibles :**
- Filtrer les cabinets par statut d'abonnement
- Activer/Désactiver un abonnement
- Renouveler ou prolonger un abonnement

**Endpoint API :**
- `GET /api/admin/abonnements/stats` - Récupérer les statistiques détaillées
- `GET /api/admin/abonnements` - Récupérer tous les abonnements

## Architecture technique

### Backend

#### Entités
- **Abonnement** : Entité JPA avec méthodes utilitaires :
  - `isActif()` : Vérifie si l'abonnement est actif (actif = true et dateFin >= aujourd'hui)
  - `isExpire()` : Vérifie si l'abonnement est expiré
  - `expireBientot()` : Vérifie si l'abonnement expire dans les 15 prochains jours
  - `getStatut()` : Retourne le statut sous forme de chaîne (ACTIF, EXPIRÉ, À RENOUVELER, DÉSACTIVÉ)

#### Repository
- **AbonnementRepository** : Méthodes de recherche :
  - `findByCabinetId(Long cabinetId)`
  - `findActiveSubscriptions(LocalDate today)`
  - `findExpiredSubscriptions(LocalDate today)`
  - `findSubscriptionsExpiringSoon(LocalDate today, LocalDate alertDate)`
  - Méthodes de comptage pour les statistiques

#### Services
- **AdminService** : Gestion complète des abonnements :
  - `createAbonnement()` : Créer un abonnement
  - `updateAbonnement()` : Mettre à jour un abonnement
  - `toggleAbonnementStatus()` : Activer/Désactiver
  - `renewAbonnement()` : Renouveler
  - `getAllAbonnements()` : Récupérer tous les abonnements avec détails
  - `getSubscriptionStats()` : Statistiques détaillées
  - `isCabinetSubscriptionActive()` : Vérifier si un cabinet a un abonnement actif

- **AuthService** : Vérification du statut d'abonnement avant login :
  - Les médecins et secrétaires ne peuvent pas se connecter si l'abonnement de leur cabinet n'est pas actif
  - L'administrateur n'est pas soumis à cette vérification

#### DTOs
- **AbonnementDTO** : Transfert de données pour les abonnements
- **SubscriptionStatsDTO** : Statistiques des abonnements
- **CreateAbonnementRequest** : Requête de création
- **RenewAbonnementRequest** : Requête de renouvellement

#### Controllers
- **AdminController** : Endpoints REST pour la gestion des abonnements

### Frontend

#### Composants
- **DashboardAdmin** : 
  - Onglet "Vue d'ensemble" : Statistiques générales + statistiques des abonnements
  - Onglet "Abonnements" : Tableau de gestion des abonnements

- **AbonnementsTable** :
  - Affichage de tous les abonnements dans un tableau
  - Actions : Activer/Désactiver, Renouveler
  - Modal de renouvellement avec sélection de date

## Flux d'authentification avec vérification d'abonnement

1. L'utilisateur (médecin ou secrétaire) tente de se connecter
2. `AuthService.login()` authentifie les credentials
3. Si l'utilisateur n'est pas admin, vérifie le statut de l'abonnement du cabinet
4. Si l'abonnement n'est pas actif, la connexion est refusée avec un message d'erreur
5. Si l'abonnement est actif, la connexion est autorisée

## Statuts des abonnements

- **ACTIF** : Abonnement actif (actif = true et dateFin >= aujourd'hui)
- **EXPIRÉ** : Date de fin dépassée
- **À RENOUVELER** : Expire dans les 15 prochains jours
- **DÉSACTIVÉ** : Désactivé manuellement par l'administrateur

## Exemples d'utilisation

### Créer un abonnement pour un cabinet

```http
POST /api/admin/abonnements/cabinet/1
Content-Type: application/json

{
  "type": "PREMIUM",
  "dateDebut": "2024-01-01",
  "dateFin": "2024-07-01",
  "actif": true
}
```

### Renouveler un abonnement

```http
POST /api/admin/abonnements/1/renew
Content-Type: application/json

{
  "nouvelleDateFin": "2025-01-01",
  "activer": true
}
```

### Activer/Désactiver un abonnement

```http
PATCH /api/admin/abonnements/1/toggle?actif=false
```

### Récupérer les statistiques

```http
GET /api/admin/abonnements/stats
```

## Notes importantes

- Les abonnements sont vérifiés à chaque tentative de connexion pour les médecins et secrétaires
- L'alerte d'expiration est configurée à 15 jours avant la date de fin
- Un cabinet peut avoir un seul abonnement à la fois
- La désactivation d'un abonnement bloque immédiatement l'accès des utilisateurs du cabinet concerné

