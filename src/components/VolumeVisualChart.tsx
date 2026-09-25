import React, { useState, useMemo } from 'react';
import { CryptoTicker } from '../types/crypto';
import { priceDecimals } from '../services/binanceApi';
import { 
  Flame, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  Target, 
  ShieldAlert, 
  TrendingUp, 
  BarChart3, 
  ArrowUpDown, 
  Zap, 
  Award,
  ChevronRight
} from 'lucide-react';

interface VolumeVisualChartProps {
  tickers: CryptoTicker[];
  selectedSymbol: string;
  onSelectCoin: (coin: CryptoTicker) => void;
}

export const VolumeVisualChart: React.FC<VolumeVisualChartProps> = ({
  tickers,
  selectedSymbol,
  onSelectCoin
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'SUPER_SPIKE' | 'STRONG_BUY'>('ALL');
  const [sortBy, setSortBy] = useState<'spike' | 'profit' | 'change'>('spike');

  const formatPrice = (p: number) => {
    return p.toLocaleString(undefined, {
      minimumFractionDigits: priceDecimals(p),
      maximumFractionDigits: priceDecimals(p)
    });
  };

  // Filter & Sort Coins
  const sortedCoins = useMemo(() => {
    let list = [...tickers];

    if (filterMode === 'SUPER_SPIKE') {
      list = list.filter((c) => c.volSpikeMultiplier >= 3.0);
    } else if (filterMode === 'STRONG_BUY') {
      list = list.filter((c) => c.signal === 'STRONG_BUY');
    }

    list.sort((a, b) => {
      if (sortBy === 'spike') {
        return b.volSpikeMultiplier - a.volSpikeMultiplier;
      } else if (sortBy === 'profit') {
        return (b.projectedProfitPercent * 10 + b.profitPotentialScore) - (a.projectedProfitPercent * 10 + a.profitPotentialScore);
      } else {
        return b.priceChangePercent - a.priceChangePercent;
      }
    });

    return list;
  }, [tickers, filterMode, sortBy]);

  // Max volume spike for progress bar scaling (baseline max 6.5x or highest)
  const maxSpike = useMemo(() => {
    const highest = Math.max(...tickers.map((t) => t.volSpikeMultiplier), 6.0);
    return Math.max(5.5, highest);
  }, [tickers]);

  // Top 3 Leaderboard
  const topThree = useMemo(() => {
    return [...tickers]
      .sort((a, b) => b.volSpikeMultiplier - a.volSpikeMultiplier)
      .slice(0, 3);
  }, [tickers]);

  return (
    <div className="space-y-4">
      {/* 1. Top 3 Volume Spike Leaderboard Cards (Top 3 Bùng Nổ Volume) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {topThree.map((coin, index) => {
          const isSelected = selectedSymbol === coin.symbol;
          const medals = ['👑 TOP 1 KHỐI LƯỢNG', '🥈 TOP 2 KHỐI LƯỢNG', '🥉 TOP 3 KHỐI LƯỢNG'];
          const borders = [
            'border-amber-500/50 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900',
            'border-slate-700 bg-slate-900/90',
            'border-slate-800 bg-slate-900/80'
          ];
          const badgeColors = [
            'bg-amber-500/20 text-amber-300 border-amber-500/40',
            'bg-slate-700/50 text-slate-300 border-slate-600',
            'bg-amber-900/30 text-amber-400/80 border-amber-800/40'
          ];

          return (
            <div
              key={coin.symbol}
              onClick={() => onSelectCoin(coin)}
              className={`rounded-xl border p-4 cursor-pointer transition-all duration-200 relative overflow-hidden group shadow-lg ${borders[index]} ${
                isSelected ? 'ring-2 ring-emerald-400 shadow-emerald-500/10' : 'hover:border-slate-600 hover:-translate-y-0.5'
              }`}
            >
              {/* Header Ribbon */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${badgeColors[index]}`}>
                  {medals[index]}
                </span>
                <span className={`text-xs font-mono font-bold flex items-center gap-0.5 ${
                  coin.priceChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {coin.priceChangePercent >= 0 ? '+' : ''}{coin.priceChangePercent.toFixed(2)}%
                </span>
              </div>

              {/* Coin Symbol & Price */}
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
                    {coin.baseAsset}
                    <span className="text-xs text-slate-400 font-normal">/USDT</span>
                  </h3>
                </div>
                <div className="text-right">
                  <span className="font-mono text-base font-bold text-white">
                    ${formatPrice(coin.lastPrice)}
                  </span>
                </div>
              </div>

              {/* Big Volume Spike Stat */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 mb-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Đột Biến Khối Lượng
                  </div>
                  <div className="text-lg font-black font-mono text-amber-400 flex items-center gap-1 mt-0.5">
                    <Flame className="h-4 w-4 text-amber-400 animate-pulse" />
                    <span>{coin.volSpikeMultiplier.toFixed(1)}x Vol</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Tiềm Năng Lãi
                  </div>
                  <div className="text-lg font-black font-mono text-emerald-300 mt-0.5">
                    +{coin.projectedProfitPercent.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Action Prompt */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Vùng Mua: ${formatPrice(coin.tradeSetup.entryLow)}</span>
                <span className="text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Xem Lệnh →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Visual Comparison Chart Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {/* Chart Header & Controls Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Biểu Đồ Trực Quan Độ Đột Biến Khối Lượng
                <span className="text-xs text-amber-300 font-mono font-normal bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded">
                  Thanh càng dài = Dòng tiền đổ vào càng mạnh
                </span>
              </h2>
            </div>
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Buttons */}
            <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterMode === 'ALL'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tất Cả ({tickers.length})
              </button>
              <button
                onClick={() => setFilterMode('SUPER_SPIKE')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                  filterMode === 'SUPER_SPIKE'
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <Flame className="h-3 w-3" />
                Siêu Đột Biến (≥ 3x)
              </button>
              <button
                onClick={() => setFilterMode('STRONG_BUY')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterMode === 'STRONG_BUY'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                MUA NGAY ⚡
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-slate-400 text-[11px]">Xếp theo:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'spike' | 'profit' | 'change')}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="spike" className="bg-slate-900 text-amber-300">
                  🔥 Đột biến Volume cao nhất
                </option>
                <option value="profit" className="bg-slate-900 text-emerald-300">
                  🚀 Tiềm năng lãi cao nhất
                </option>
                <option value="change" className="bg-slate-900 text-white">
                  % Tăng giá 24h
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Visual Benchmark Ruler */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="w-[140px] sm:w-[190px]">ĐỒNG COIN / GIÁ</div>
          <div className="flex-1 px-4 hidden sm:flex items-center justify-between text-[10px] text-slate-500">
            <span>1.0x (MA20 Bình thường)</span>
            <span>2.5x (Bắt đầu gom)</span>
            <span>4.0x (Bứt phá cản)</span>
            <span className="text-amber-400 font-bold">6.0x+ (Siêu đột biến)</span>
          </div>
          <div className="w-[180px] sm:w-[240px] text-right">TIỀM NĂNG LÃI & LỆNH</div>
        </div>

        {/* Visual Bar Rows */}
        <div className="divide-y divide-slate-800/60">
          {sortedCoins.map((coin, idx) => {
            const isSelected = selectedSymbol === coin.symbol;
            const isSuperSpike = coin.volSpikeMultiplier >= 3.5;
            const barWidthPercent = Math.min(100, Math.max(12, (coin.volSpikeMultiplier / maxSpike) * 100));

            return (
              <div
                key={coin.symbol}
                onClick={() => onSelectCoin(coin)}
                className={`p-3 sm:p-3.5 transition-all duration-150 cursor-pointer group flex flex-col sm:flex-row sm:items-center gap-3 ${
                  isSelected
                    ? 'bg-emerald-950/40 ring-1 ring-emerald-500/50'
                    : isSuperSpike
                    ? 'bg-amber-950/10 hover:bg-slate-800/60'
                    : 'hover:bg-slate-800/40'
                }`}
              >
                {/* 1. Left: Rank, Symbol & Price */}
                <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-[190px] shrink-0">
                  <span className="font-mono text-xs font-bold text-slate-400 w-5 text-right">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                      <span>{coin.baseAsset}</span>
                      <span className="text-[10px] text-slate-400 font-normal">/USDT</span>
                      {coin.signal === 'STRONG_BUY' && (
                        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-sans font-bold">
                          MUA ⚡
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs mt-0.5">
                      <span className="font-bold text-white">${formatPrice(coin.lastPrice)}</span>
                      <span className={`text-[11px] font-semibold ${
                        coin.priceChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {coin.priceChangePercent >= 0 ? '+' : ''}{coin.priceChangePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Middle: Visual Interactive Volume Surge Bar */}
                <div className="flex-1 px-0 sm:px-3">
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className={`font-bold flex items-center gap-1 ${
                      isSuperSpike ? 'text-amber-300' : 'text-amber-400'
                    }`}>
                      <Flame className={`h-3.5 w-3.5 ${isSuperSpike ? 'text-amber-400 animate-pulse' : 'text-amber-500'}`} />
                      {coin.volSpikeMultiplier.toFixed(1)}x Volume
                      <span className="text-[10px] text-slate-400 font-sans font-normal ml-1">
                        (Gấp {coin.volSpikeMultiplier.toFixed(1)} lần MA20)
                      </span>
                    </span>

                    <span className="text-[11px] text-slate-400 font-sans hidden md:inline">
                      24h: ${(coin.quoteVolume / 1e6).toFixed(1)}M USDT
                    </span>
                  </div>

                  {/* Visual Progress Bar with Glow */}
                  <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSuperSpike
                          ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 shadow-md shadow-amber-500/30'
                          : 'bg-gradient-to-r from-amber-600 to-amber-400'
                      }`}
                      style={{ width: `${barWidthPercent}%` }}
                    />
                  </div>
                </div>

                {/* 3. Right: Projected Profit & Trade Roadmap */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-[240px] shrink-0 text-right">
                  <div className="space-y-0.5">
                    <div className="flex items-center sm:justify-end gap-1.5">
                      <span className="text-sm font-black text-emerald-300 font-mono">
                        +{coin.projectedProfitPercent.toFixed(1)}%
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold font-sans">
                        LÃI DỰ BÁO
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans">
                      TP: <span className="text-emerald-400 font-mono font-bold">${formatPrice(coin.tradeSetup.target1)}</span> · SL: <span className="text-rose-400 font-mono">${formatPrice(coin.tradeSetup.stopLoss)}</span>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCoin(coin);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white'
                    }`}
                  >
                    <span>{isSelected ? 'Đang Chọn' : 'Xem Biểu Đồ'}</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
