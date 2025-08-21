import React from "react";

interface AnimationsProps {
  showWin: boolean;
  showLose: boolean;
  showTie: boolean;
}

export default function Animations({ showWin, showLose, showTie }: AnimationsProps) {
  if (!showWin && !showLose && !showTie) return null;

  return (
    <>
      {showWin && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-8xl font-bold text-yellow-400 animate-bounce">
            🎉 GAGNÉ ! 🎉
          </div>
        </div>
      )}
      
      {showLose && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-8xl font-bold text-red-400 animate-pulse">
            💔 PERDU 💔
          </div>
        </div>
      )}
      
      {showTie && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-8xl font-bold text-blue-400 animate-ping">
            🤝 ÉGALITÉ ! 🤝
          </div>
        </div>
      )}
    </>
  );
}
