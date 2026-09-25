import React from 'react';
import { CryptoTicker, FilterState } from '../types/crypto';
import { priceDecimals } from '../services/binanceApi';
import { 
  Star, 
  Search, 
  ArrowUpDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Flame,
  Sparkles,
  BarChart2,
  Zap
} from 'lucide-react';

interface VolumeScannerTableProps {
  tickers: CryptoTicker[];
  selectedSymbol: string;
  onSelectCoin: (coin: CryptoTicker) => void;
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onToggleWatchlist: (symbol: string) => void;
  watchlist: Set<string>;
  flashingSymbols: Set<string>;
}

export const VolumeScannerTable: React.FC<VolumeScannerTableProps> = ({
  tickers,
  selectedSymbol,
  onSelectCoin,
  filters,
  onFilterChange,
  onToggleWatchlist,
  watchlist,
  flashingSymbols
}) => {
  const formatPrice = (p: number) => {
    return p.toLocaleString(undefined, {
      minimumFractionDigits: priceDecimals(p),
      maximumFractionDigits: priceDecimals(p)
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
      {/* Informative Banner confirming Volume Spike detection */}
      <div className="px-4 py-2 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-b border-slate-800/80 flex items-center justify-between text-xs text-amber-300/90">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-amber-400 shrink-0 animate-pulse" />
          <span>
            <strong>Đã kích hoạt quét Khối Lượng Đột Biến:</strong> Tất cả các đồng coin trong danh sách đều đang có mức volume tăng vọt từ <span className="font-mono text-amber-300 font-bold underline">1.8x đến hơn 7.0x</span> so với mức trung bình 20 kỳ!
          </span>
        </div>
        <div className="hidden md:flex items-center gap-1 font-mono text-[11px] text-slate-400">
          <span>Binance Real-Time</span>
        </div>
      </div>

      {/* Minimal Header & Search Toolbar */}
      <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Title & Coin Count */}
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            Danh Sách Coin Tiềm Năng (Theo Đột Biến Volume)
          </h2>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded font-bold">
            {tickers.length} Coin
          </span>
        </div>

        {/* Right: Quick Search and Sort */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[180px] sm:min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              placeholder="Tìm coin (BTC, SOL, SUI...)"
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/70 border border-amber-500/30 rounded-lg px-2.5 py-1 text-xs">
            <ArrowUpDown className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-amber-400 text-[11px] font-bold">Xếp theo:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as FilterState['sortBy'] })}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer font-bold"
            >
              <option value="potential_profit" className="bg-slate-900 text-emerald-300">
                🚀 Tiềm năng lãi cao nhất
              </option>
              <option value="spike" className="bg-slate-900 text-amber-300">
                🔥 Khối lượng đột biến nhất (Cao nhất)
              </option>
              <option value="change" className="bg-slate-900 text-white">% Tăng giá 24h</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clean, Focused Potential Coins Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] text-slate-400 font-semibold">
              <th className="py-3 px-3 w-8 text-center">⭐</th>
              <th className="py-3 px-3"># Đồng Coin</th>
              <th className="py-3 px-3 text-right">Giá Hiện Tại</th>
              <th className="py-3 px-3 text-right">Biến Động 24h</th>

              {/* ĐỘT BIẾN KHỐI LƯỢNG (VOLUME SPIKE) - CỐT LÕI */}
              <th 
                className="py-3 px-3 text-left cursor-pointer hover:text-amber-300 transition-colors bg-amber-950/20 text-amber-400 font-bold"
                onClick={() => {
                  if (filters.sortBy === 'spike') {
                    onFilterChange({ sortOrder: filters.sortOrder === 'desc' ? 'asc' : 'desc' });
                  } else {
                    onFilterChange({ sortBy: 'spike', sortOrder: 'desc' });
                  }
                }}
                title="Nhấn để xếp theo khối lượng đột biến nhất"
              >
                <div className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                  <span>Đột Biến Khối Lượng</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              
              {/* Tiềm Năng Lãi Dự Báo Column */}
              <th 
                className="py-3 px-3 text-right cursor-pointer hover:text-emerald-300 transition-colors bg-emerald-950/30 text-emerald-400 font-bold"
                onClick={() => {
                  if (filters.sortBy === 'potential_profit') {
                    onFilterChange({ sortOrder: filters.sortOrder === 'desc' ? 'asc' : 'desc' });
                  } else {
                    onFilterChange({ sortBy: 'potential_profit', sortOrder: 'desc' });
                  }
                }}
                title="Nhấn để đảo chiều xếp theo tiềm năng lãi"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Tiềm Năng Lãi</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>

              {/* Actionable Trade Execution Levels */}
              <th className="py-3 px-3 text-right hidden sm:table-cell">Vùng Mua An Toàn</th>
              <th className="py-3 px-3 text-right">Chốt Lời (TP)</th>
              <th className="py-3 px-3 text-right hidden md:table-cell">Cắt Lỗ (SL)</th>
              <th className="py-3 px-3 text-center">Tín Hiệu</th>
              <th className="py-3 px-3 text-right">Xem Biểu Đồ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {tickers.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <BarChart2 className="h-8 w-8 text-slate-400" />
                    <p className="text-sm font-sans font-medium text-slate-300">Không có đồng coin nào phù hợp</p>
                    <p className="text-xs font-sans text-slate-400">Hãy thử tìm theo tên coin khác</p>
                  </div>
                </td>
              </tr>
            ) : (
              tickers.map((coin, index) => {
                const isSelected = selectedSymbol === coin.symbol;
                const isFlashing = flashingSymbols.has(coin.symbol);
                const isStarred = watchlist.has(coin.symbol);
                const isBullish = coin.priceChangePercent >= 0;
                const isSuperSpike = coin.volSpikeMultiplier >= 3.5;

                return (
                  <tr
                    key={coin.symbol}
                    onClick={() => onSelectCoin(coin)}
                    className={`cursor-pointer transition-all duration-150 group ${
                      isSelected
                        ? 'bg-emerald-950/40 ring-1 ring-emerald-500/40'
                        : isSuperSpike
                        ? 'bg-amber-950/10 hover:bg-slate-800/60'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Star Favorite */}
                    <td
                      className="py-3 px-3 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(coin.symbol);
                      }}
                    >
                      <button
                        title={isStarred ? 'Bỏ theo dõi' : 'Thêm vào yêu thích'}
                        className="text-slate-600 hover:text-amber-400 transition-colors"
                      >
                        <Star
                          className={`h-4 w-4 ${
                            isStarred ? 'fill-amber-400 text-amber-400' : ''
                          }`}
                        />
                      </button>
                    </td>

                    {/* Rank & Coin Symbol */}
                    <td className="py-3 px-3 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-400 w-5 text-right">
                          #{index + 1}
                        </span>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-1.5">
                            <span>{coin.baseAsset}</span>
                            <span className="text-[10px] font-normal text-slate-400">/USDT</span>
                            {index === 0 && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                                TOP 1 👑
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price with Live Flash */}
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded transition-colors duration-200 font-bold text-xs sm:text-sm ${
                          isFlashing
                            ? 'bg-emerald-500/30 text-emerald-200 ring-1 ring-emerald-400'
                            : 'text-white'
                        }`}
                      >
                        ${formatPrice(coin.lastPrice)}
                      </span>
                    </td>

                    {/* 24h Change % */}
                    <td className="py-3 px-3 text-right">
                      <div className={`flex items-center justify-end gap-0.5 font-bold ${
                        isBullish ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isBullish ? (
                          <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span>
                          {isBullish ? '+' : ''}
                          {coin.priceChangePercent.toFixed(2)}%
                        </span>
                      </div>
                    </td>

                    {/* ĐỘT BIẾN KHỐI LƯỢNG (HIỂN THỊ RÕ RÀNG ĐỘ ĐỘT BIẾN) */}
                    <td className="py-3 px-3 bg-amber-950/15 min-w-[125px]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold font-mono">
                          <span className={`flex items-center gap-1 ${
                            isSuperSpike ? 'text-amber-300' : 'text-amber-400'
                          }`}>
                            <Flame className={`h-3.5 w-3.5 ${isSuperSpike ? 'text-amber-400 animate-pulse' : 'text-amber-500'}`} />
                            {coin.volSpikeMultiplier.toFixed(1)}x Vol
                          </span>
                          <span className="text-[10px] text-slate-400 font-sans font-normal">
                            {coin.volSpikeMultiplier >= 3.5 ? 'Rất mạnh' : 'Đột biến'}
                          </span>
                        </div>
                        {/* Progress visual bar */}
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isSuperSpike
                                ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                                : 'bg-amber-500'
                            }`}
                            style={{
                              width: `${Math.min(100, (coin.volSpikeMultiplier / 6.0) * 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Tiềm Năng Lãi Dự Báo Cell */}
                    <td className="py-3 px-3 text-right bg-emerald-950/30">
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-sm font-extrabold text-emerald-300 font-mono">
                            +{coin.projectedProfitPercent.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans flex items-center justify-end gap-1">
                          <span>Thắng:</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {coin.winProbability}%
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Safe Entry Zone */}
                    <td className="py-3 px-3 text-right hidden sm:table-cell">
                      <div className="text-xs font-semibold text-slate-200">
                        ${formatPrice(coin.tradeSetup.entryLow)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        đến ${formatPrice(coin.tradeSetup.entryHigh)}
                      </div>
                    </td>

                    {/* Take Profit Target */}
                    <td className="py-3 px-3 text-right">
                      <div className="text-xs font-bold text-emerald-400">
                        ${formatPrice(coin.tradeSetup.target1)}
                      </div>
                      <div className="text-[10px] text-emerald-300/80 font-mono">
                        TP2: ${formatPrice(coin.tradeSetup.target2)}
                      </div>
                    </td>

                    {/* Stop Loss Level */}
                    <td className="py-3 px-3 text-right hidden md:table-cell">
                      <div className="text-xs font-bold text-rose-400">
                        ${formatPrice(coin.tradeSetup.stopLoss)}
                      </div>
                      <div className="text-[10px] text-rose-400/80 font-sans">
                        Cắt lỗ -1.5%
                      </div>
                    </td>

                    {/* Actionable Signal Recommendation */}
                    <td className="py-3 px-3 text-center font-sans">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-extrabold tracking-tight ${
                        coin.signal === 'STRONG_BUY'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-xs'
                          : coin.signal === 'BREAKOUT_WATCH'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : coin.signal === 'BUY_PULLBACK'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {coin.signal === 'STRONG_BUY'
                          ? 'MUA NGAY ⚡'
                          : coin.signal === 'BREAKOUT_WATCH'
                          ? 'ĐỘT PHÁ 🚀'
                          : coin.signal === 'BUY_PULLBACK'
                          ? 'CHỜ HỒI ⏳'
                          : 'QUAN SÁT'}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-3 text-right font-sans">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCoin(coin);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white'
                        }`}
                      >
                        {isSelected ? 'Đang Xem' : 'Biểu Đồ →'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
