import React, { useEffect } from 'react';
import { EuroIcon } from 'lucide-react';

interface CostNotificationProps {
  cost: number | null;
  onClose: () => void;
}

export const CostNotification: React.FC<CostNotificationProps> = ({ cost, onClose }) => {
  useEffect(() => {
    if (cost !== null) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [cost, onClose]);

  if (cost === null) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
      <EuroIcon className="h-4 w-4 text-emerald-500" />
      <span>Coût estimé : {cost.toFixed(4)} €</span>
    </div>
  );
};