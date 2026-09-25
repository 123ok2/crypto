import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  CryptoTicker, 
  KlineCandle, 
  VolumeAlert, 
  FilterState, 
  Timeframe 
} from './types/crypto';
import { 
  fetchLiveTickers, 
  fetchKlines, 
  calculateScalpSetup,
  priceDecimals
} from './services/binanceApi';
import { binanceSocket } from './services/binanceSocket';
import { soundService } from './services/soundEffects';
import { Navbar } from './components/Navbar';
import { InteractiveChart } from './components/InteractiveChart';
import { VolumeScannerTable } from './components/VolumeScannerTable';
import { VolumeHeatmap } from './components/VolumeHeatmap';
import { VolumeVisualChart } from './components/VolumeVisualChart';
import { 
  LayoutGrid, 
  ListFilter, 
  Eye, 
  EyeOff, 
  Target, 
  ShieldAlert, 
  Sparkles,
  TrendingUp,
  Flame,
  BarChart3,
  X
} from 'lucide-react';

export default function App() {
  const [tickers, setTickers] = useState<CryptoTicker[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('SOLUSDT');
  const [klines, setKlines] = useState<KlineCandle[]>([]);
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [isLoadingTickers, setIsLoadingTickers] = useState<boolean>(true);
  const [isLoadingKlines, setIsLoadingKlines] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'chart' | 'table' | 'heatmap'>('chart');
  const [showChart, setShowChart] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'POTENTIAL' | 'STRONG_BUY' | 'BREAKOUT' | 'UPTREND_ONLY' | 'WATCHLIST'>('ALL');
  
  // Watchlist stored in localStorage
  const [watchlist, setWatchlist] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('cryptovol_watchlist');
      return saved ? new Set(JSON.parse(saved)) : new Set(['SOLUSDT', 'BTCUSDT', 'ETHUSDT']);
    } catch {
      return new Set(['SOLUSDT', 'BTCUSDT']);
    }
  });

  // Flash indicators for price updates
  const [flashingSymbols, setFlashingSymbols] = useState<Set<string>>(new Set());

  // Filter state (Mặc định xếp theo tiềm năng lợi nhuận dự báo cao nhất)
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    minVolumeUsd: 500000,
    minSpikeMultiplier: 1.0,
    signalFilter: 'ALL',
    sortBy: 'potential_profit',
    sortOrder: 'desc',
    watchlistOnly: false,
    timeframe: '15m'
  });

  // 1. Initial Load of Tickers
  const loadTickers = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const data = await fetchLiveTickers();
      setTickers(data);

      // Default select the highest forecasted profit potential coin
      if (data.length > 0) {
        setSelectedSymbol((prev) => {
          const exists = data.some((d) => d.symbol === prev);
          if (!exists) {
            const topPotential = [...data].sort(
              (a, b) => (b.projectedProfitPercent * 10 + b.profitPotentialScore) - (a.projectedProfitPercent * 10 + a.profitPotentialScore)
            )[0];
            return topPotential ? topPotential.symbol : data[0].symbol;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Failed to load tickers:', err);
    } finally {
      setIsLoadingTickers(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTickers();
  }, [loadTickers]);

  // 2. Fetch Candlesticks (Klines) when selectedSymbol or timeframe changes
  useEffect(() => {
    let isCancelled = false;
    async function loadKlines() {
      setIsLoadingKlines(true);
      try {
        const data = await fetchKlines(selectedSymbol, timeframe, 50);
        if (!isCancelled) {
          setKlines(data);
        }
      } catch (err) {
        console.error('Failed to load klines:', err);
      } finally {
        if (!isCancelled) setIsLoadingKlines(false);
      }
    }

    if (selectedSymbol) {
      loadKlines();
    }

    return () => {
      isCancelled = true;
    };
  }, [selectedSymbol, timeframe]);

  // 3. Connect WebSocket for Real-time Binance Feed
  useEffect(() => {
    const unsubscribe = binanceSocket.subscribe((updates) => {
      setTickers((prevTickers) => {
        if (prevTickers.length === 0) return prevTickers;

        const updatedSet = new Set<string>();

        const nextTickers = prevTickers.map((coin) => {
          const update = updates.get(coin.symbol);
          if (!update) return coin;

          updatedSet.add(coin.symbol);

          let newPrice = update.price > 0 ? update.price : coin.lastPrice * (1 + (update.changePercent || 0) / 1000);
          newPrice = Number(newPrice.toFixed(8));

          const priceDiff = newPrice - coin.lastPrice;
          const direction: 'up' | 'down' | 'flat' = priceDiff > 0 ? 'up' : priceDiff < 0 ? 'down' : 'flat';

          const newChangePercent = update.changePercent !== undefined && update.changePercent !== 0 
            ? coin.priceChangePercent + (update.price === 0 ? update.changePercent / 10 : 0)
            : coin.priceChangePercent;

          const high = Math.max(coin.highPrice, newPrice);
          const low = Math.min(coin.lowPrice, newPrice);
          const scalp = calculateScalpSetup(newPrice, high, low, coin.volSpikeMultiplier, coin.rsi14, newChangePercent);

          return {
            ...coin,
            lastPrice: newPrice,
            priceChangePercent: newChangePercent,
            highPrice: high,
            lowPrice: low,
            priceDirection: direction,
            signal: scalp.signal,
            anomalyType: scalp.anomalyType,
            signalReason: scalp.reason,
            tradeSetup: scalp.setup,
            projectedProfitPercent: scalp.projectedProfitPercent,
            profitPotentialScore: scalp.profitPotentialScore,
            winProbability: scalp.winProbability,
            resistanceTarget: scalp.resistanceTarget,
            lastUpdated: Date.now()
          };
        });

        // Trigger visual flash
        if (updatedSet.size > 0) {
          setFlashingSymbols(updatedSet);
          setTimeout(() => {
            setFlashingSymbols(new Set());
          }, 350);
        }

        return nextTickers;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Watchlist toggle handler
  const handleToggleWatchlist = (symbol: string) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
      } else {
        next.add(symbol);
      }
      try {
        localStorage.setItem('cryptovol_watchlist', JSON.stringify(Array.from(next)));
      } catch {
        // ignore storage error
      }
      return next;
    });
  };

  const handleToggleSound = () => {
    const nextState = !isSoundEnabled;
    setIsSoundEnabled(nextState);
    soundService.setEnabled(nextState);
    if (nextState) {
      soundService.playSpikeAlert();
    }
  };

  const handleFilterChange = (partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  // Currently selected coin object
  const selectedCoin = useMemo(() => {
    const found = tickers.find((t) => t.symbol === selectedSymbol);
    return found || tickers[0] || null;
  }, [tickers, selectedSymbol]);

  // Filtered & Sorted Tickers list (Ordered by Projected Profit Potential)
  const filteredTickers = useMemo(() => {
    let list = [...tickers];

    // Navigation tab filtering
    if (activeTab === 'POTENTIAL') {
      list = list.filter((t) => t.projectedProfitPercent >= 5.0 && t.priceChangePercent >= 0);
    } else if (activeTab === 'STRONG_BUY') {
      list = list.filter((t) => t.signal === 'STRONG_BUY' && t.priceChangePercent > 0);
    } else if (activeTab === 'BREAKOUT') {
      list = list.filter((t) => t.signal === 'STRONG_BUY' || t.signal === 'BREAKOUT_WATCH');
    } else if (activeTab === 'UPTREND_ONLY') {
      list = list.filter((t) => t.priceChangePercent > 0);
    } else if (activeTab === 'WATCHLIST') {
      list = list.filter((t) => watchlist.has(t.symbol));
    }

    // Min Volume USD filter
    if (filters.minVolumeUsd > 0) {
      list = list.filter((t) => t.quoteVolume >= filters.minVolumeUsd);
    }

    // Search query filter
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim().toUpperCase();
      list = list.filter((t) => t.symbol.includes(q) || t.baseAsset.includes(q));
    }

    // Sorting by Profit Potential by default
    list.sort((a, b) => {
      let comp = 0;
      if (filters.sortBy === 'potential_profit') {
        comp = (b.projectedProfitPercent * 10 + b.profitPotentialScore) - (a.projectedProfitPercent * 10 + a.profitPotentialScore);
      } else if (filters.sortBy === 'change') {
        comp = b.priceChangePercent - a.priceChangePercent;
      } else if (filters.sortBy === 'spike') {
        comp = b.volSpikeMultiplier - a.volSpikeMultiplier;
      }
      return filters.sortOrder === 'asc' ? -comp : comp;
    });

    return list;
  }, [tickers, activeTab, filters, watchlist]);

  const spikeCount = useMemo(() => {
    return tickers.filter((t) => t.volSpikeMultiplier >= 2.5).length;
  }, [tickers]);

  const formatPrice = (p: number) => {
    return p.toLocaleString(undefined, {
      minimumFractionDigits: priceDecimals(p),
      maximumFractionDigits: priceDecimals(p)
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isSoundEnabled={isSoundEnabled}
        onToggleSound={handleToggleSound}
        onRefresh={() => loadTickers(true)}
        isRefreshing={isRefreshing}
        watchlistCount={watchlist.size}
        spikeCount={spikeCount}
      />

      {/* Main Focused Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-4 lg:p-6 space-y-4">
        
        {/* Selected Coin Trade Summary & Visual Chart Accordion */}
        {selectedCoin && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            {/* Quick Action Ribbon of Selected Coin */}
            <div className="p-3 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                {/* Coin Name & Price */}
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white tracking-tight">
                    {selectedCoin.baseAsset}
                    <span className="text-xs text-slate-400 font-normal">/USDT</span>
                  </span>
                  <span className="text-base font-bold font-mono text-emerald-400">
                    ${formatPrice(selectedCoin.lastPrice)}
                  </span>
                  <span className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${
                    selectedCoin.priceChangePercent >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {selectedCoin.priceChangePercent >= 0 ? '+' : ''}{selectedCoin.priceChangePercent.toFixed(2)}%
                  </span>
                </div>

                {/* Profit Potential Highlight */}
                <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                  <span className="text-slate-300 text-[11px]">Tiềm Năng Lãi:</span>
                  <span className="font-bold text-emerald-300 font-mono text-sm">
                    +{selectedCoin.projectedProfitPercent.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    (Thắng {selectedCoin.winProbability}%)
                  </span>
                </div>

                {/* Volume Spike Badge */}
                <div className="flex items-center gap-1.5 bg-amber-950/60 border border-amber-500/40 px-2.5 py-1 rounded-lg">
                  <Flame className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                  <span className="text-slate-300 text-[11px]">Vol Đột Biến:</span>
                  <span className="font-bold text-amber-300 font-mono text-sm">
                    {selectedCoin.volSpikeMultiplier.toFixed(1)}x
                  </span>
                  <span className="text-[10px] text-amber-400 font-sans">
                    (Gấp {selectedCoin.volSpikeMultiplier.toFixed(1)} lần TB)
                  </span>
                </div>

                {/* Buy Zone */}
                <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-300">
                  <span className="text-slate-400">Vùng Mua:</span>
                  <span className="font-mono font-bold text-white">
                    ${formatPrice(selectedCoin.tradeSetup.entryLow)} - ${formatPrice(selectedCoin.tradeSetup.entryHigh)}
                  </span>
                </div>

                {/* Take Profit */}
                <div className="hidden md:flex items-center gap-1 text-[11px] text-emerald-400">
                  <Target className="h-3 w-3" />
                  <span>Chốt Lời:</span>
                  <span className="font-mono font-bold">
                    ${formatPrice(selectedCoin.tradeSetup.target1)} (+2.5%)
                  </span>
                </div>

                {/* Stop Loss */}
                <div className="hidden md:flex items-center gap-1 text-[11px] text-rose-400">
                  <ShieldAlert className="h-3 w-3" />
                  <span>Cắt Lỗ:</span>
                  <span className="font-mono font-bold">
                    ${formatPrice(selectedCoin.tradeSetup.stopLoss)} (-1.5%)
                  </span>
                </div>
              </div>

              {/* Toggle Chart Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowChart(!showChart)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    showChart
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                  }`}
                >
                  {showChart ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span>{showChart ? 'Thu Gọn Biểu Đồ' : 'Xem Biểu Đồ Trực Quan'}</span>
                </button>
              </div>
            </div>

            {/* Interactive Candlestick Chart (Shown when expanded) */}
            {showChart && (
              <div className="p-2 sm:p-3 bg-[#080d1a]">
                <InteractiveChart
                  selectedCoin={selectedCoin}
                  klines={klines}
                  timeframe={timeframe}
                  onTimeframeChange={setTimeframe}
                  isLoading={isLoadingKlines}
                />
              </div>
            )}
          </div>
        )}

        {/* View Mode Bar (Bảng Chi Tiết vs Heatmap) */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="font-semibold text-slate-300">Đã tự động xếp hạng theo tiềm năng sinh lời cao nhất</span>
            <span>·</span>
            <span>Chỉ báo đã được thu gọn tối đa</span>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors font-medium ${
                viewMode === 'chart'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5 text-amber-300" />
              <span>Biểu Đồ Trực Quan 📊</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors font-medium ${
                viewMode === 'table'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListFilter className="h-3.5 w-3.5" />
              <span>Danh Sách Bảng</span>
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors font-medium ${
                viewMode === 'heatmap'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Bản Đồ Nhiệt</span>
            </button>
          </div>
        </div>

        {/* Main Potential Coins Content */}
        {isLoadingTickers ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-3">
            <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto"></div>
            <p className="text-sm font-medium text-slate-200">Đang quét lọc danh sách coin tiềm năng nhất...</p>
          </div>
        ) : viewMode === 'chart' ? (
          <VolumeVisualChart
            tickers={filteredTickers}
            selectedSymbol={selectedSymbol}
            onSelectCoin={(coin) => {
              setSelectedSymbol(coin.symbol);
              setShowChart(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : viewMode === 'table' ? (
          <VolumeScannerTable
            tickers={filteredTickers}
            selectedSymbol={selectedSymbol}
            onSelectCoin={(coin) => {
              setSelectedSymbol(coin.symbol);
              setShowChart(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            filters={filters}
            onFilterChange={handleFilterChange}
            onToggleWatchlist={handleToggleWatchlist}
            watchlist={watchlist}
            flashingSymbols={flashingSymbols}
          />
        ) : (
          <VolumeHeatmap
            tickers={filteredTickers}
            selectedSymbol={selectedSymbol}
            onSelectCoin={(coin) => {
              setSelectedSymbol(coin.symbol);
              setShowChart(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>
    </div>
  );
}
