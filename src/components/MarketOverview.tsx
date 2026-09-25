import React from 'react';
import { Flame, TrendingUp, BarChart3, AlertCircle, Sparkles } from 'lucide-react';
import { CryptoTicker } from '../types/crypto';

interface MarketOverviewProps {
  tickers: CryptoTicker[];
  onSelectCoin: (coin: CryptoTicker) => void;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({ tickers, onSelectCoin }) => {
  if (tickers.length === 0) return null;

  const totalMonitored = tickers.length;
  const spikeTickers = tickers.filter((t) => t.volSpikeMultiplier >= 2.0);
  const gainers = tickers.filter((t) => t.priceChangePercent > 0);
  const gainersRatio = Math.round((gainers.length / totalMonitored) * 100);

  // Find top volume spiker with positive momentum
  const topSpike = [...tickers].sort((a, b) => b.volSpikeMultiplier - a.volSpikeMultiplier)[0];
  const topGainer = [...tickers].sort((a, b) => b.priceChangePercent - a.priceChangePercent)[0];
  const topPotential = [...tickers].sort((a, b) => b.projectedProfitPercent - a.projectedProfitPercent)[0];

  return (
    <section className="mb-6 space-y-3">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Metric 1: Top Tiềm Năng Lợi Nhuận Dự Báo */}
        {topPotential ? (
          <button
            onClick={() => onSelectCoin(topPotential)}
            className="text-left bg-emerald-950/40 border border-emerald-500/50 hover:border-emerald-400 rounded-xl p-3.5 transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-xs text-emerald-400 mb-1">
              <span className="flex items-center gap-1.5 font-bold">
                <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                Tiềm Năng Lãi Dự Báo #1
              </span>
              <span className="text-[10px] text-emerald-300 group-hover:underline">Xem ngay →</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-white tracking-tight">
                {topPotential.baseAsset}
              </span>
              <span className="text-xl font-bold text-emerald-300 font-mono">
                +{topPotential.projectedProfitPercent.toFixed(1)}%
              </span>
            </div>
            <p className="text-[11px] text-emerald-400/90 mt-1 font-mono">
              Xác suất {topPotential.winProbability}% · Vol {topPotential.volSpikeMultiplier.toFixed(1)}x
            </p>
          </button>
        ) : (
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5">
            <span className="text-xs text-slate-400">Đang quét tiềm năng...</span>
          </div>
        )}

        {/* Metric 2: Coins có đột biến khối lượng */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              Đột Biến Khối Lượng (≥ 2x)
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400 font-mono">
              {spikeTickers.length}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ {totalMonitored} cặp USDT</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Dòng tiền lớn đang đổ dồn vào</p>
        </div>

        {/* Metric 2: Top Siêu Đột Biến */}
        {topSpike && (
          <button
            onClick={() => onSelectCoin(topSpike)}
            className="text-left bg-slate-900/80 border border-emerald-500/30 hover:border-emerald-500/60 rounded-xl p-3.5 transition-all group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                Đột Biến Cao Nhất
              </span>
              <span className="text-[10px] text-slate-400 group-hover:text-emerald-400 transition-colors">Xem biểu đồ →</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-white tracking-tight">
                {topSpike.baseAsset}
              </span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {topSpike.volSpikeMultiplier.toFixed(1)}x Vol
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              {topSpike.priceChangePercent >= 0 ? '+' : ''}
              {topSpike.priceChangePercent.toFixed(2)}% · RSI {topSpike.rsi14.toFixed(0)}
            </p>
          </button>
        )}

        {/* Metric 3: Top Tăng Trưởng 24h */}
        {topGainer && (
          <button
            onClick={() => onSelectCoin(topGainer)}
            className="text-left bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3.5 transition-all group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 font-medium">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                Tăng Mạnh Nhất
              </span>
              <span className="text-[10px] text-slate-400 group-hover:text-slate-300 transition-colors">Xem biểu đồ →</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-white tracking-tight">
                {topGainer.baseAsset}
              </span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                +{topGainer.priceChangePercent.toFixed(2)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              ${topGainer.lastPrice.toLocaleString()} · {topGainer.volSpikeMultiplier}x Vol
            </p>
          </button>
        )}

        {/* Metric 4: Độ rộng thị trường */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
              Độ Rộng Xu Hướng
            </span>
            <span className="text-[11px] font-mono text-emerald-400">{gainersRatio}% Tăng</span>
          </div>
          <div className="w-full bg-rose-950/60 rounded-full h-2 mt-2 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${gainersRatio}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
            <span>{gainers.length} mã tăng</span>
            <span>{totalMonitored - gainers.length} mã giảm</span>
          </div>
        </div>
      </div>

      {/* Scalping Pro Tip Banner */}
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-emerald-300 font-semibold">Bí quyết Lướt Sóng Ngắn Hạn:</strong> Khi phát hiện đồng coin có <span className="text-amber-300 font-medium">Volume Đột Biến &gt; 2.5x</span> kèm <span className="text-emerald-300 font-medium">Nến Xanh đóng vượt cản</span> và RSI từ 50-68, đó là điểm vàng để vào lệnh với tỷ lệ thắng (Winrate) cao nhất!
          </span>
        </div>
        <div className="text-[11px] text-slate-400 shrink-0 font-mono">
          Cập nhật trực tiếp WebSocket Binance
        </div>
      </div>
    </section>
  );
};
