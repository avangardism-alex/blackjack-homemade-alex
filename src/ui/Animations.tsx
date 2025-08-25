import React from "react";

interface AnimationsProps {
  showWin: boolean;
  showTie: boolean;
}

export default function Animations({ showWin, showTie }: AnimationsProps) {
  if (!showWin && !showTie) return null;

  return (
    <>
      {showWin && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-center">
            <div className="text-2xl sm:text-4xl md:text-6xl font-bold text-yellow-400 animate-bounce px-4 mb-2">
              🎉 GAGNÉ ! 🎉
            </div>
            <div className="text-lg sm:text-2xl md:text-3xl font-bold text-green-400 animate-pulse px-4">
              💰 LA BANQUE PAIE ! 💰
            </div>
          </div>
        </div>
      )}
      
      {showTie && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-2xl sm:text-4xl md:text-6xl font-bold text-blue-400 animate-ping px-4 text-center">
            🤝 ÉGALITÉ ! 🤝
          </div>
        </div>
      )}
    </>
  );
}
