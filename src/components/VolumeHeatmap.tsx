import React from 'react';
import { CryptoTicker } from '../types/crypto';
import { Flame, Sparkles } from 'lucide-react';
import { priceDecimals } from '../services/binanceApi';

interface VolumeHeatmapProps {
  tickers: CryptoTicker[];
  selectedSymbol: string;
  onSelectCoin: (coin: CryptoTicker) => void;
}

export const VolumeHeatmap: React.FC<VolumeHeatmapProps> = ({
  tickers,
  selectedSymbol,
  onSelectCoin
}) => {
  const formatPrice = (p: number) => {
    return p.toLocaleString(undefined, {
      minimumFractionDigits: priceDecimals(p),
      maximumFractionDigits: priceDecimals(p)
    });
  };

  // Sort by forecasted profit potential descending
  const sorted = [...tickers].sort((a, b) => b.projectedProfitPercent - a.projectedProfitPercent);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            Bản Đồ Nhiệt Tiềm Năng Lợi Nhuận Dự Báo (Profit Potential Heatmap)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Xếp hạng từ cao xuống thấp theo tiềm năng lợi nhuận dự báo (% tăng kỳ vọng khi nổ volume).
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-xs bg-emerald-500 ring-2 ring-amber-400"></span>
            Siêu Tiềm Năng (&gt; 10%)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-xs bg-emerald-600"></span>
            Tiềm Năng Tốt (5% - 10%)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-xs bg-rose-600"></span>
            Đang Điều Chỉnh
          </span>
        </div>
      </div>

      {/* Responsive Heatmap Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5">
        {sorted.map((coin) => {
          const isSelected = selectedSymbol === coin.symbol;
          const isSuperSpike = coin.volSpikeMultiplier >= 3.5;
          const isHighPotential = coin.projectedProfitPercent >= 8.0;
          const isBull = coin.priceChangePercent >= 0;

          // Color calculation
          let bgClass = 'bg-slate-800/60 border-slate-700/60 hover:border-slate-500';
          if (isBull) {
            if (isHighPotential) {
              bgClass = 'bg-emerald-950/70 border-amber-400/80 hover:border-amber-300 ring-1 ring-amber-400/50 shadow-lg shadow-amber-500/5';
            } else if (coin.projectedProfitPercent >= 4.0) {
              bgClass = 'bg-emerald-950/50 border-emerald-500/60 hover:border-emerald-400';
            } else {
              bgClass = 'bg-emerald-950/20 border-emerald-900/50 hover:border-emerald-700';
            }
          } else {
            bgClass = 'bg-rose-950/30 border-rose-900/50 hover:border-rose-700';
          }

          return (
            <button
              key={coin.symbol}
              onClick={() => onSelectCoin(coin)}
              className={`p-3 rounded-xl border text-left transition-all duration-150 relative overflow-hidden group flex flex-col justify-between ${bgClass} ${
                isSelected ? 'ring-2 ring-emerald-400 scale-[1.02]' : ''
              }`}
            >
              {isSuperSpike && (
                <div className="absolute top-1 right-1">
                  <Flame className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                </div>
              )}

              <div className="min-w-0">
                <div className="text-sm font-bold text-white tracking-tight flex items-baseline gap-1">
                  {coin.baseAsset}
                  <span className="text-[10px] font-normal text-slate-400">/USDT</span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">
                  ${formatPrice(coin.lastPrice)}
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-white/5 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400 font-sans text-[10px]">Lãi Dự Báo:</span>
                  <span className="font-bold text-emerald-300">
                    +{coin.projectedProfitPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Vol {coin.volSpikeMultiplier.toFixed(1)}x</span>
                  <span>{coin.winProbability}% win</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
