// Système de comptage de cartes Hi-Lo
export class CardCounter {
  private count = 0;
  private totalCards = 0;
  private estimatedDecks = 1; // On commence avec 1 deck
  
  // Méthode Hi-Lo : +1 pour 2-6, -1 pour 10-A, 0 pour 7-9
  updateCount(card: { r: string; s: string }) {
    if (['2', '3', '4', '5', '6'].includes(card.r)) {
      this.count++;
    } else if (['10', 'J', 'Q', 'K', 'A'].includes(card.r)) {
      this.count--;
    }
    // 7, 8, 9 = neutres (count reste inchangé)
    
    this.totalCards++;
    this.updateDeckEstimate();
  }
  
  // Estimer le nombre de decks restants
  private updateDeckEstimate() {
    // Approximation : 52 cartes par deck
    this.estimatedDecks = Math.max(0.5, (52 - this.totalCards) / 52);
  }
  
  // Obtenir le "true count" (count ajusté par deck)
  getTrueCount(): number {
    if (this.estimatedDecks <= 0) return this.count;
    return Math.round((this.count / this.estimatedDecks) * 100) / 100;
  }
  
  // Obtenir le count brut
  getCount(): number {
    return this.count;
  }
  
  // Obtenir le pourcentage de cartes restantes
  getCardsRemaining(): number {
    return Math.max(0, 100 - (this.totalCards / 52) * 100);
  }
  
  // Évaluer la situation du deck
  getDeckStatus(): 'favorable' | 'neutre' | 'défavorable' {
    const trueCount = this.getTrueCount();
    if (trueCount >= 2) return 'favorable';
    if (trueCount <= -2) return 'défavorable';
    return 'neutre';
  }
  
  // Conseils selon le count
  getAdvice(): string {
    const trueCount = this.getTrueCount();
    const status = this.getDeckStatus();
    
    if (status === 'favorable') {
      if (trueCount >= 3) return '🎯 Excellent ! Augmente tes mises, plus de blackjacks !';
      return '✅ Favorable - Les cartes hautes restent, joue normalement';
    } else if (status === 'défavorable') {
      if (trueCount <= -3) return '⚠️ Très défavorable - Réduis tes mises, plus de cartes basses';
      return '📉 Défavorable - Les cartes basses restent, sois prudent';
    }
    return '🔄 Neutre - Jouer normalement';
  }
  
  // Conseils spécifiques pour l'assurance
  shouldTakeInsurance(): boolean {
    return this.getTrueCount() > 3;
  }
  
  // Conseils pour doubler
  shouldDoubleDown(hand: { cards: Array<{ r: string; s: string }>; bet: number }, dealerCard: { r: string; s: string }): boolean {
    const trueCount = this.getTrueCount();
    const handScore = this.calculateHandScore(hand.cards);
    
    // Plus agressif sur le double quand le count est favorable
    if (trueCount >= 2) {
      // Double plus souvent sur 9, 10, 11
      if (handScore.total === 9 && ['3', '4', '5', '6'].includes(dealerCard.r)) return true;
      if (handScore.total === 10 && ['2', '3', '4', '5', '6', '7', '8', '9'].includes(dealerCard.r)) return true;
      if (handScore.total === 11) return true;
    }
    
    return false;
  }
  
  // Calculer le score d'une main
  private calculateHandScore(cards: Array<{ r: string; s: string }>): { total: number; isSoft: boolean } {
    let total = 0;
    let aces = 0;
    
    for (const card of cards) {
      if (card.r === 'A') {
        aces++;
        total += 11;
      } else if (['K', 'Q', 'J', 'T'].includes(card.r)) {
        total += 10;
      } else {
        total += parseInt(card.r);
      }
    }
    
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    
    return { total, isSoft: aces > 0 && total <= 21 };
  }
  
  // Reset pour nouvelle partie
  reset() {
    this.count = 0;
    this.totalCards = 0;
    this.estimatedDecks = 1;
  }
  
  // Obtenir les statistiques complètes
  getStats() {
    return {
      count: this.count,
      trueCount: this.getTrueCount(),
      totalCards: this.totalCards,
      estimatedDecks: this.estimatedDecks,
      cardsRemaining: this.getCardsRemaining(),
      status: this.getDeckStatus(),
      advice: this.getAdvice()
    };
  }
}

