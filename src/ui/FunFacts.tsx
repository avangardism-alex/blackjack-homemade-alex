import React, { useState, useEffect } from "react";

const FUN_FACTS = [
  "🎯 Le Blackjack vient de France au 18ème siècle !",
  "🎰 Record de gains : 15 millions de dollars !",
  "🃏 2,598,960 combinaisons possibles !",
  "🎉 Meilleur taux de retour au casino !",
  "💎 Nommé d'après l'As de pique + Valet noir",
  "🎲 48% de chances de gagner en moyenne !",
  "🌟 Plus gros gain : 1,2 million de dollars !",
  "🎪 Premier casino : Venise 1638 !",
  "🎯 Le 21 parfait est très rare !",
  "🎰 Cartes inventées par les Chinois !",
  "🎉 Plus joué après le Poker !",
  "🧠 Adoré des mathématiciens !",
  "💫 Histoire de 600 ans !"
];

const ENCOURAGEMENT = [];

export default function FunFacts() {
  const [currentFact, setCurrentFact] = useState(0);
  const [currentEncouragement, setCurrentEncouragement] = useState(0);
  const [showFact, setShowFact] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);

  useEffect(() => {
    // Change le fact toutes les 8 secondes
    const factInterval = setInterval(() => {
      setCurrentFact(Math.floor(Math.random() * FUN_FACTS.length));
      setShowFact(true);
      setTimeout(() => setShowFact(false), 4000);
    }, 8000);

    return () => {
      clearInterval(factInterval);
    };
  }, []);

  return (
    <>
      {showFact && (
        <div className="fixed top-20 left-4 z-40 bg-slate-800/90 backdrop-blur p-3 rounded-lg border border-emerald-500/50 shadow-lg">
          <div className="text-sm text-emerald-300 max-w-xs">
            {FUN_FACTS[currentFact]}
          </div>
        </div>
      )}
      

    </>
  );
}
