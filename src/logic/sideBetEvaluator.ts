import { evaluateSideBet, SideBetResult } from "./sideBets";
import { SideBetRule, TableRules } from "../config/sidebet.rules";
import { Card } from "./game";

// Évaluateur de side bets pour le store
export class SideBetEvaluator {
  
  // Évaluer tous les side bets actifs selon la phase du jeu
  static evaluateSideBets(
    sideBets: Record<string, number>,
    tableRules: TableRules,
    playerCards: Card[],
    dealerCards: Card[],
    phase: string
  ): SideBetResult[] {
    const results: SideBetResult[] = [];
    
    // Parcourir tous les side bets actifs
    for (const [betCode, amount] of Object.entries(sideBets)) {
      if (amount <= 0) continue;
      
      // Trouver la règle correspondante
      const rule = tableRules.sideBets.find(r => r.code === betCode);
      if (!rule) continue;
      
      // Vérifier si c'est le bon moment pour évaluer
      if (this.shouldEvaluateNow(rule, phase)) {
        const evaluation = evaluateSideBet(betCode, playerCards, dealerCards, rule);
        
        if (evaluation.isWin && evaluation.result) {
          // Calculer le payout
          const payout = amount * evaluation.result.multiplier;
          
          // Créer le résultat final
          const result: SideBetResult = {
            ...evaluation.result,
            amount,
            payout
          };
          
          results.push(result);
        }
      }
    }
    
    return results;
  }
  
  // Déterminer si un side bet doit être évalué maintenant
  private static shouldEvaluateNow(rule: SideBetRule, phase: string): boolean {
    switch (rule.settlePhase) {
      case "DEALT":
        return phase === "dealing" || phase === "player" || phase === "dealer";
      case "DEALER_TURN":
        return phase === "dealer" || phase === "payout";
      case "IMMEDIATE":
        return phase === "dealing";
      default:
        return false;
    }
  }
  
  // Vérifier si un side bet est disponible selon les conditions
  static isSideBetAvailable(
    rule: SideBetRule,
    dealerUpCard?: Card,
    canPlaceBets: boolean = true
  ): boolean {
    if (!canPlaceBets) return false;
    
    switch (rule.availability.type) {
      case "ALWAYS":
        return true;
      case "DEALER_UPCARD_IN":
        return dealerUpCard && rule.availability.ranks.includes(dealerUpCard.r);
      case "INSURANCE_ONLY":
        return dealerUpCard && dealerUpCard.r === "A";
      default:
        return false;
    }
  }
  
  // Calculer le total des side bets actifs
  static getTotalSideBets(sideBets: Record<string, number>): number {
    return Object.values(sideBets).reduce((sum, amount) => sum + amount, 0);
  }
  
  // Vérifier si un joueur peut placer un side bet
  static canPlaceSideBet(
    betCode: string,
    amount: number,
    currentSideBets: Record<string, number>,
    tableRules: TableRules,
    bank: number
  ): boolean {
    const rule = tableRules.sideBets.find(r => r.code === betCode);
    if (!rule) return false;
    
    const currentAmount = currentSideBets[betCode] || 0;
    const newAmount = currentAmount + amount;
    
    // Vérifier les limites
    if (newAmount < rule.min || newAmount > rule.max) return false;
    
    // Vérifier que le joueur a assez d'argent
    if (newAmount > bank) return false;
    
    return true;
  }
}
