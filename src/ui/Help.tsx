import React, { useState } from "react";

export default function Help() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Bouton d'aide flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200"
        title="Aide stratégie"
      >
        ❓
      </button>

      {/* Modal d'aide */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">🎯 Stratégie de Base du Blackjack</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center">
              <img
                src="https://sp-ao.shortpixel.ai/client/to_auto,q_glossy,ret_img,w_533,h_805/https://www.guide-blackjack.com/wp-content/uploads/2013/11/strategiebasefrancenov09.gif"
                alt="Stratégie de base du Blackjack"
                className="mx-auto max-w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            
            <div className="mt-4 text-sm text-gray-600 text-center">
              <p>📚 <strong>Légende :</strong></p>
              <p>🟢 <strong>Vert :</strong> Tirer (Hit)</p>
              <p>🔴 <strong>Rouge :</strong> Rester (Stand)</p>
              <p>🟡 <strong>Jaune :</strong> Doubler (Double)</p>
              <p>✂️ <strong>Scissors :</strong> Diviser (Split)</p>
            </div>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
