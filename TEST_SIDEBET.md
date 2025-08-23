# 🧪 TEST DES SIDE BETS - VÉRIFICATION

## 🎯 **SCÉNARIO DE TEST**

### **Test 1 : Mise Simple**
1. **État initial** : Side bet = 0€, Banque = 1000€
2. **Action** : Clic sur bouton +25
3. **Résultat attendu** : Side bet = 25€, Banque = 975€
4. **Logs attendus** :
   ```
   === DEBUG SIDE BET ===
   Montant demandé: 25 €
   Side bet actuel: 0 €
   Banque actuelle: 1000 €
   ✅ Side bet ajouté: 25 €
   Nouveau total side bet: 25 €
   Nouvelle banque: 975 €
   =====================
   ```

### **Test 2 : Mise Multiple**
1. **État initial** : Side bet = 25€, Banque = 975€
2. **Action** : Clic sur bouton +25
3. **Résultat attendu** : Side bet = 50€, Banque = 950€
4. **Logs attendus** :
   ```
   === DEBUG SIDE BET ===
   Montant demandé: 25 €
   Side bet actuel: 25 €
   Banque actuelle: 975 €
   ✅ Side bet ajouté: 25 €
   Nouveau total side bet: 50 €
   Nouvelle banque: 950 €
   =====================
   ```

### **Test 3 : Mise Impossibilité**
1. **État initial** : Side bet = 50€, Banque = 950€
2. **Action** : Clic sur bouton +1000
3. **Résultat attendu** : Side bet = 50€, Banque = 950€ (pas de changement)
4. **Logs attendus** :
   ```
   === DEBUG SIDE BET ===
   Montant demandé: 1000 €
   Side bet actuel: 50 €
   Banque actuelle: 950 €
   ❌ Pas assez d'argent pour miser 1000 €
   =====================
   ```

## 🔍 **COMMENT TESTER**

1. **Ouvrir la console** (F12 → Console)
2. **Aller en phase betting** (début de partie)
3. **Cliquer sur les boutons side bet** (+1, +5, +25, +100)
4. **Vérifier les logs** dans la console
5. **Vérifier l'affichage** des montants

## 🚨 **PROBLÈMES POTENTIELS**

### **Si le problème persiste :**
- Vérifier que `g.sideBetAmount` est bien à jour dans l'interface
- Vérifier que `g.bank` est bien à jour
- Vérifier qu'il n'y a pas de conflit avec d'autres fonctions

### **Debug avancé :**
- Ajouter des logs dans `handleSideBetChange`
- Vérifier que `onSideBetChange` reçoit le bon paramètre
- Vérifier que le composant se re-render correctement

## 📝 **FICHIERS À SURVEILLER**

- `src/App.tsx` - `handleSideBetChange`
- `src/ui/SideBets.tsx` - Boutons de mise
- `src/state/store.ts` - `addSideBetAmount`

---
*Test créé le : $(date)*
*Développeur : Assistant IA*