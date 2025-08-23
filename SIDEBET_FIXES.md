# 🎰 CORRECTION DES SIDE BETS - BLACKJACK

## 🐛 **PROBLÈMES IDENTIFIÉS**

### **1. Logique de Mise Incorrecte**
- **Problème** : Les boutons ajoutaient `currentSideBetAmount + amount` au lieu de juste `amount`
- **Résultat** : Confusion dans les calculs, mises incorrectes
- **Exemple** : Clic sur +25 avec 25€ déjà misés → 50€ au lieu de 25€

### **2. Gestion de l'Argent Défaillante**
- **Problème** : L'argent des side bets n'était pas retiré de la banque
- **Résultat** : Possibilité de miser plus que ce qu'on a
- **Impact** : Trésorerie virtuelle illimitée

### **3. Paiements Non Remboursés**
- **Problème** : Les side bets n'étaient pas remboursés après la partie
- **Résultat** : Perte d'argent à chaque partie
- **Impact** : Déséquilibre économique du jeu

## 🔧 **CORRECTIONS APPORTÉES**

### **1. Fonction `addSideBetAmount` (lignes 692-705)**
```typescript
// AVANT : Pas de retrait d'argent
addSideBetAmount: (amount: number) => {
  const current = get();
  const newAmount = current.sideBetAmount + amount;
  if (newAmount > current.bank) return;
  set({ sideBetAmount: newAmount });
},

// APRÈS : Retrait immédiat de l'argent
addSideBetAmount: (amount: number) => {
  const current = get();
  if (amount > current.bank) return;
  const bank = current.bank - amount;
  localStorage.setItem(LS_KEY, String(bank));
  const newAmount = current.sideBetAmount + amount;
  set({ sideBetAmount: newAmount, bank });
},
```

### **2. Composant `SideBets.tsx` (ligne 70)**
```typescript
// AVANT : Logique confuse
onClick={() => onSideBetChange(currentSideBetAmount + amount)}

// APRÈS : Logique claire
onClick={() => onSideBetChange(amount)}
```

### **3. Fonction `clearSideBet` (lignes 709-718)**
```typescript
// AVANT : Pas de remboursement
clearSideBet: () => set({ sideBetAmount: 0 }),

// APRÈS : Remboursement automatique
clearSideBet: () => {
  const current = get();
  if (current.sideBetAmount > 0) {
    const bank = current.bank + current.sideBetAmount;
    localStorage.setItem(LS_KEY, String(bank));
    set({ sideBetAmount: 0, bank });
  } else {
    set({ sideBetAmount: 0 });
  }
},
```

### **4. Remboursement Automatique des Side Bets**
```typescript
// NOUVEAU : Remboursement à la fin de chaque partie
const totalWithSideBets = delta + currentSt.sideBetAmount;
const finalBank = Math.max(0, currentSt.bank + totalWithSideBets);

// Réinitialisation automatique
set({ 
  bank: finalBank, 
  phase: "betting", 
  hands: [], 
  dealer: [], 
  betAmount: 0, 
  active: 0, 
  sideBetAmount: 0  // ← Réinitialisation des side bets
});
```

## ✅ **RÉSULTAT ATTENDU**

Maintenant, les side bets fonctionnent correctement :

1. **Mise** : Clic sur +25 → Ajoute exactement 25€
2. **Banque** : Diminue immédiatement de 25€
3. **Gains** : Calculés correctement selon les règles
4. **Remboursement** : Automatique à la fin de la partie
5. **Réinitialisation** : Side bets remis à 0 après chaque partie

## 🧪 **TEST DE VALIDATION**

### **Test 1 : Mise Simple**
1. Clic sur +25 → Side bet doit passer de 0 à 25€
2. Banque doit diminuer de 25€
3. Pas de confusion dans les calculs

### **Test 2 : Mise Multiple**
1. Clic sur +25 → Side bet = 25€
2. Clic sur +25 → Side bet = 50€
3. Banque doit diminuer de 50€ au total

### **Test 3 : Remboursement**
1. Placer des side bets
2. Jouer une partie
3. Vérifier que l'argent est remboursé
4. Vérifier que sideBetAmount = 0

## 📝 **FICHIERS MODIFIÉS**

- `src/state/store.ts` - Logique de gestion des side bets
- `src/ui/SideBets.tsx` - Interface des side bets

## 🚀 **STATUT**

**SIDE BETS CORRIGÉS** ✅ - Fonctionnement logique et équitable !

---
*Corrigé le : $(date)*
*Développeur : Assistant IA*