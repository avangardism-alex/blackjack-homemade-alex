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
          <div className="text-4xl sm:text-6xl md:text-8xl font-bold text-yellow-400 animate-bounce px-4 text-center">
            🎉 GAGNÉ ! 🎉
          </div>
        </div>
      )}
      

      
      {showTie && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-4xl sm:text-6xl md:text-8xl font-bold text-blue-400 animate-ping px-4 text-center">
            🤝 ÉGALITÉ ! 🤝
          </div>
        </div>
      )}
    </>
  );
}
