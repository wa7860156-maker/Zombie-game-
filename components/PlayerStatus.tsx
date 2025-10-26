import React from 'react';
import type { Inventory, Base } from '../types';

interface PlayerStatusProps {
  inventory: Inventory;
  base: Base;
}

const PlayerStatus: React.FC<PlayerStatusProps> = ({ inventory, base }) => {
  const inventoryItems = Object.entries(inventory);

  return (
    <div className="mb-8 p-4 bg-zinc-800/50 border border-zinc-600 rounded-lg animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {/* Base Status */}
        <div>
          <h3 className="font-bold text-red-500 tracking-wider mb-2 border-b border-zinc-700 pb-1">BASE STATUS</h3>
          <p><span className="font-semibold text-zinc-400">Location:</span> {base.location}</p>
          <p><span className="font-semibold text-zinc-400">Fortification:</span> {base.fortification}</p>
        </div>

        {/* Inventory */}
        <div>
          <h3 className="font-bold text-red-500 tracking-wider mb-2 border-b border-zinc-700 pb-1">INVENTORY</h3>
          {inventoryItems.length > 0 ? (
            <ul className="list-disc list-inside">
              {inventoryItems.map(([item, count]) => (
                <li key={item} className="capitalize">
                  {item}: {count}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-zinc-500 italic">Empty</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerStatus;
