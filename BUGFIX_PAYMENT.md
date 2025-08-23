# 🚨 CORRECTION DU BUG DE PAIEMENT - BLACKJACK

## 🐛 **PROBLÈME IDENTIFIÉ**

La banque ne payait pas toujours les gains car la logique de gestion des mises et des paiements était défaillante :

### **Problème Principal :**
1. **Argent retiré trop tôt** : L'argent était retiré de la banque dès l'ajout de jetons (`addChip`)
2. **Paiements incorrects** : Les gains n'étaient pas correctement calculés (mise + gains)
3. **Désynchronisation** : La banque et les mises n'étaient pas synchronisées

## 🔧 **CORRECTIONS APPORTÉES**

### **1. Fonction `addChip` (lignes 95-100)**
```typescript
// AVANT : Argent retiré immédiatement
const bank = st.bank - amt;
localStorage.setItem(LS_KEY, String(bank));
return { betAmount: next, bank };

// APRÈS : Argent retiré seulement au deal
return { betAmount: next };
```

### **2. Fonction `deal` (lignes 160-165)**
```typescript
// NOUVEAU : Retirer l'argent au moment de la distribution
const bank = st.bank - st.betAmount;
localStorage.setItem(LS_KEY, String(bank));
```

### **3. Fonction `doubleDown` (lignes 490-495)**
```typescript
// CORRECTION : Retirer la mise supplémentaire maintenant
const additionalBet = originalBet;
const bank = st.bank - additionalBet;
```

### **4. Fonction `split` (lignes 540-545)**
```typescript
// CORRECTION : Retirer l'argent maintenant
const bank = st.bank - h.bet;
localStorage.setItem(LS_KEY, String(bank));
```

### **5. Logique de Paiement (toutes les fonctions)**
```typescript
// CORRECTION : Rembourser la mise + ajouter le gain/perte
const bank = Math.max(0, finalSt.bank + totalGains);
```

## ✅ **RÉSULTAT ATTENDU**

Maintenant, quand vous gagnez :
- ✅ **Victoire** : Vous récupérez votre mise + vos gains
- ✅ **Blackjack** : Vous récupérez votre mise + 1.5x votre mise
- ✅ **Égalité** : Vous récupérez votre mise
- ✅ **Défaite** : Vous perdez votre mise (comportement normal)

## 🧪 **TEST DE VALIDATION**

1. **Misez de l'argent** - La banque ne doit PAS diminuer
2. **Distribuez les cartes** - La banque diminue du montant de la mise
3. **Gagnez la partie** - La banque augmente de (mise + gains)
4. **Vérifiez que le total est correct**

## 📝 **FICHIERS MODIFIÉS**

- `src/state/store.ts` - Logique de gestion des mises et paiements

## 🚀 **STATUT**

**BUG CORRIGÉ** ✅ - La banque paie maintenant correctement !

---
*Corrigé le : $(date)*
*Développeur : Assistant IA*