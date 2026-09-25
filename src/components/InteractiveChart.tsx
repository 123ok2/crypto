import React, { useState, useRef, useMemo } from 'react';
import { KlineCandle, Timeframe, CryptoTicker } from '../types/crypto';
import { priceDecimals } from '../services/binanceApi';
import { Maximize2, Minimize2, Eye, EyeOff } from 'lucide-react';

interface InteractiveChartProps {
  selectedCoin: CryptoTicker;
  klines: KlineCandle[];
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  isLoading: boolean;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  selectedCoin,
  klines,
  timeframe,
  onTimeframeChange,
  isLoading
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [showTradeLevels, setShowTradeLevels] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Timeframe choices
  const timeframes: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1d'];

  // Dimensions
  const chartHeight = isExpanded ? 520 : 380;
  const candleAreaHeight = chartHeight * 0.72;
  const volumeAreaHeight = chartHeight * 0.24;
  const volumeAreaTop = chartHeight * 0.76;

  // Compute scale boundaries
  const { minPrice, maxPrice, maxVol, maVolMax } = useMemo(() => {
    if (!klines || klines.length === 0) {
      return { minPrice: 0, maxPrice: 100, maxVol: 100, maVolMax: 100 };
    }

    let min = Infinity;
    let max = -Infinity;
    let mVol = 0;
    let mMaVol = 0;

    klines.forEach((c) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.volume > mVol) mVol = c.volume;
      if (c.maVolume && c.maVolume > mMaVol) mMaVol = c.maVolume;
    });

    // Add 2% padding on price
    const padding = (max - min) * 0.04 || 1;
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      maxVol: Math.max(mVol, mMaVol * 1.5),
      maVolMax: mMaVol
    };
  }, [klines]);

  const activeCandle = hoverIndex !== null && klines[hoverIndex] ? klines[hoverIndex] : klines[klines.length - 1];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || klines.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const chartWidth = rect.width - 60; // 60px right axis margin
    const candleWidth = chartWidth / klines.length;
    const index = Math.floor(x / candleWidth);
    if (index >= 0 && index < klines.length) {
      setHoverIndex(index);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Helper coordinate converters
  const priceToY = (price: number): number => {
    if (maxPrice === minPrice) return candleAreaHeight / 2;
    return candleAreaHeight - ((price - minPrice) / (maxPrice - minPrice)) * (candleAreaHeight - 15);
  };

  const volToY = (vol: number): number => {
    if (maxVol === 0) return chartHeight;
    const h = (vol / maxVol) * volumeAreaHeight;
    return chartHeight - h;
  };

  const formatPrice = (p: number) => {
    return p.toLocaleString(undefined, {
      minimumFractionDigits: priceDecimals(p),
      maximumFractionDigits: priceDecimals(p)
    });
  };

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    if (timeframe === '1d') {
      return `${d.getDate()}/${d.getMonth() + 1}`;
    }
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className={`bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col transition-all duration-200 ${
        isExpanded ? 'fixed inset-4 z-50 shadow-2xl bg-[#0b0f19]' : 'relative'
      }`}
    >
      {/* Chart Top Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-white tracking-tight">
              {selectedCoin.baseAsset}
              <span className="text-xs text-slate-400 font-normal">/USDT</span>
            </span>
            <span className={`text-base font-bold font-mono ${
              selectedCoin.priceChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              ${formatPrice(selectedCoin.lastPrice)}
            </span>
            <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
              selectedCoin.priceChangePercent >= 0
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {selectedCoin.priceChangePercent >= 0 ? '+' : ''}
              {selectedCoin.priceChangePercent.toFixed(2)}%
            </span>
          </div>

          {/* Spike multiplier badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-medium">
            <span>🔥 Vol {selectedCoin.volSpikeMultiplier.toFixed(1)}x</span>
          </div>
        </div>

        {/* Timeframe & Overlays Controls */}
        <div className="flex items-center gap-2">
          {/* Timeframe segmented buttons */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/50">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  timeframe === tf
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Toggle EMA Lines */}
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            title="Bật/Tắt đường chỉ báo EMA 9/21"
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              showOverlays
                ? 'bg-slate-800 border-slate-700 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            {showOverlays ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span className="hidden md:inline text-[11px]">EMA 9/21</span>
          </button>

          {/* Toggle Scalp Target Lines */}
          <button
            onClick={() => setShowTradeLevels(!showTradeLevels)}
            title="Bật/Tắt đường giá chốt lời TP & cắt lỗ SL"
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              showTradeLevels
                ? 'bg-slate-800 border-slate-700 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <span className="hidden md:inline text-[11px]">TP/SL</span>
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Thu nhỏ' : 'Mở rộng biểu đồ'}
            className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white"
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Active Candle Inspection Ribbon */}
      {activeCandle && (
        <div className="px-4 py-1.5 bg-slate-950/40 border-b border-slate-800/50 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-slate-400">
          <span>Thời gian: <span className="text-slate-200">{new Date(activeCandle.time).toLocaleString('vi-VN')}</span></span>
          <span>Mở: <span className="text-slate-200">${formatPrice(activeCandle.open)}</span></span>
          <span>Cao: <span className="text-emerald-400">${formatPrice(activeCandle.high)}</span></span>
          <span>Thấp: <span className="text-rose-400">${formatPrice(activeCandle.low)}</span></span>
          <span>Đóng: <span className={activeCandle.close >= activeCandle.open ? 'text-emerald-400' : 'text-rose-400'}>${formatPrice(activeCandle.close)}</span></span>
          <span>Vol: <span className="text-slate-200">{Math.round(activeCandle.volume).toLocaleString()}</span></span>
          {activeCandle.spikeMultiplier && (
            <span className="text-amber-400 font-semibold">
              Bội số Vol: {activeCandle.spikeMultiplier}x {activeCandle.spikeMultiplier >= 2.0 ? '🔥' : ''}
            </span>
          )}
          {showOverlays && (
            <>
              <span className="text-cyan-400">EMA9: ${activeCandle.ema9 ? formatPrice(activeCandle.ema9) : '--'}</span>
              <span className="text-amber-400">EMA21: ${activeCandle.ema21 ? formatPrice(activeCandle.ema21) : '--'}</span>
            </>
          )}
        </div>
      )}

      {/* Main SVG Candlestick & Volume Chart */}
      <div className="relative flex-1 w-full bg-[#080d1a] overflow-hidden select-none">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs">
            <div className="flex items-center gap-2 text-sm text-emerald-400 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              Đang tải nến {timeframe} từ Binance...
            </div>
          </div>
        )}

        <svg
          className="w-full cursor-crosshair"
          style={{ height: `${chartHeight}px` }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Grid line pattern */}
            <linearGradient id="volSpikeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="volBullGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="volBearGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines & price levels */}
          {[0.15, 0.35, 0.55, 0.72].map((ratio, idx) => {
            const y = chartHeight * ratio;
            const price = maxPrice - (ratio / 0.72) * (maxPrice - minPrice);
            return (
              <g key={idx}>
                <line
                  x1="0"
                  y1={y}
                  x2="100%"
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x="99%"
                  y={y - 4}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="10"
                  className="font-mono select-none"
                >
                  ${formatPrice(price)}
                </text>
              </g>
            );
          })}

          {/* Volume Section Separator Line */}
          <line
            x1="0"
            y1={volumeAreaTop}
            x2="100%"
            y2={volumeAreaTop}
            stroke="#334155"
            strokeWidth="1"
          />
          <text
            x="10"
            y={volumeAreaTop + 14}
            fill="#64748b"
            fontSize="10"
            className="font-mono font-medium"
          >
            KHỐI LƯỢNG (VOLUME & MA20)
          </text>

          {/* Render EMA Lines if enabled */}
          {showOverlays && klines.length > 1 && (
            <>
              {/* EMA 9 Line */}
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                points={klines
                  .map((c, i) => {
                    if (!c.ema9) return '';
                    const chartW = 920; // approximate internal
                    // We'll calculate proportional X in loop below
                    const xPercent = (i + 0.5) / klines.length;
                    return `${xPercent * 100}%,${priceToY(c.ema9)}`;
                  })
                  .filter(Boolean)
                  .join(' ')}
              />
              {/* EMA 21 Line */}
              <polyline
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1.5"
                points={klines
                  .map((c, i) => {
                    if (!c.ema21) return '';
                    const xPercent = (i + 0.5) / klines.length;
                    return `${xPercent * 100}%,${priceToY(c.ema21)}`;
                  })
                  .filter(Boolean)
                  .join(' ')}
              />
            </>
          )}

          {/* Render Trade Setup Lines (TP1, TP2, SL) if enabled */}
          {showTradeLevels && selectedCoin.tradeSetup && (
            <g>
              {/* Take Profit 2 Line */}
              <line
                x1="0"
                y1={priceToY(selectedCoin.tradeSetup.target2)}
                x2="100%"
                y2={priceToY(selectedCoin.tradeSetup.target2)}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="6 3"
              />
              <text
                x="98%"
                y={priceToY(selectedCoin.tradeSetup.target2) - 4}
                textAnchor="end"
                fill="#10b981"
                fontSize="10"
                className="font-mono font-bold"
              >
                TP2: ${formatPrice(selectedCoin.tradeSetup.target2)} (+5.5%)
              </text>

              {/* Take Profit 1 Line */}
              <line
                x1="0"
                y1={priceToY(selectedCoin.tradeSetup.target1)}
                x2="100%"
                y2={priceToY(selectedCoin.tradeSetup.target1)}
                stroke="#34d399"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <text
                x="98%"
                y={priceToY(selectedCoin.tradeSetup.target1) - 4}
                textAnchor="end"
                fill="#34d399"
                fontSize="10"
                className="font-mono font-bold"
              >
                TP1: ${formatPrice(selectedCoin.tradeSetup.target1)} (+2.5%)
              </text>

              {/* Stop Loss Line */}
              <line
                x1="0"
                y1={priceToY(selectedCoin.tradeSetup.stopLoss)}
                x2="100%"
                y2={priceToY(selectedCoin.tradeSetup.stopLoss)}
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="6 3"
              />
              <text
                x="98%"
                y={priceToY(selectedCoin.tradeSetup.stopLoss) + 12}
                textAnchor="end"
                fill="#f43f5e"
                fontSize="10"
                className="font-mono font-bold"
              >
                SL (Cắt lỗ): ${formatPrice(selectedCoin.tradeSetup.stopLoss)} (-1.5%)
              </text>
            </g>
          )}

          {/* Candlesticks and Volume Bars */}
          {klines.map((candle, idx) => {
            const count = klines.length;
            // X coordinate as percentage or computed width
            const leftPct = (idx / count) * 100;
            const widthPct = (1 / count) * 100 * 0.75;
            const centerPct = ((idx + 0.5) / count) * 100;

            const isBull = candle.close >= candle.open;
            const openY = priceToY(candle.open);
            const closeY = priceToY(candle.close);
            const highY = priceToY(candle.high);
            const lowY = priceToY(candle.low);
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(2, Math.abs(closeY - openY));

            const volY = volToY(candle.volume);
            const volHeight = Math.max(2, chartHeight - volY);
            const isSpike = candle.isSpike || (candle.spikeMultiplier && candle.spikeMultiplier >= 2.0);

            return (
              <g key={idx} className="transition-opacity hover:opacity-80">
                {/* Candle Wick line */}
                <line
                  x1={`${centerPct}%`}
                  y1={highY}
                  x2={`${centerPct}%`}
                  y2={lowY}
                  stroke={isBull ? '#10b981' : '#f43f5e'}
                  strokeWidth="1.2"
                />

                {/* Candle Body rectangle */}
                <rect
                  x={`${centerPct - widthPct / 2}%`}
                  y={bodyTop}
                  width={`${widthPct}%`}
                  height={bodyHeight}
                  fill={isBull ? '#10b981' : '#f43f5e'}
                  rx="0.5"
                />

                {/* Volume Bar */}
                <rect
                  x={`${centerPct - widthPct / 2}%`}
                  y={volY}
                  width={`${widthPct}%`}
                  height={volHeight}
                  fill={
                    isSpike
                      ? 'url(#volSpikeGrad)'
                      : isBull
                      ? 'url(#volBullGrad)'
                      : 'url(#volBearGrad)'
                  }
                  stroke={isSpike ? '#f59e0b' : 'none'}
                  strokeWidth={isSpike ? '1' : '0'}
                  rx="1"
                />

                {/* Volume Spike Marker Callout */}
                {isSpike && (
                  <g>
                    <circle
                      cx={`${centerPct}%`}
                      cy={highY - 14}
                      r="9"
                      fill="#f59e0b"
                      className="animate-pulse"
                    />
                    <text
                      x={`${centerPct}%`}
                      y={highY - 10}
                      textAnchor="middle"
                      fill="#0b0f19"
                      fontSize="9"
                      fontWeight="bold"
                      className="font-mono"
                    >
                      {candle.spikeMultiplier ? `${candle.spikeMultiplier}x` : '⚡'}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Volume MA20 Line */}
          {klines.length > 2 && (
            <polyline
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.2"
              strokeDasharray="2 2"
              points={klines
                .map((c, i) => {
                  if (!c.maVolume) return '';
                  const xPercent = ((i + 0.5) / klines.length) * 100;
                  const y = volToY(c.maVolume);
                  return `${xPercent}%,${y}`;
                })
                .filter(Boolean)
                .join(' ')}
            />
          )}

          {/* Interactive Crosshair */}
          {hoverIndex !== null && klines[hoverIndex] && (
            <g>
              {/* Vertical guideline */}
              <line
                x1={`${((hoverIndex + 0.5) / klines.length) * 100}%`}
                y1="0"
                x2={`${((hoverIndex + 0.5) / klines.length) * 100}%`}
                y2={chartHeight}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Horizontal price guideline */}
              <line
                x1="0"
                y1={priceToY(klines[hoverIndex].close)}
                x2="100%"
                y2={priceToY(klines[hoverIndex].close)}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Price badge on right axis */}
              <rect
                x="91%"
                y={priceToY(klines[hoverIndex].close) - 10}
                width="60"
                height="20"
                fill="#1e293b"
                stroke="#475569"
                rx="4"
              />
              <text
                x="95%"
                y={priceToY(klines[hoverIndex].close) + 4}
                fill="#f8fafc"
                fontSize="10"
                className="font-mono font-bold"
              >
                ${formatPrice(klines[hoverIndex].close)}
              </text>
            </g>
          )}
        </svg>

        {/* Legend strip at bottom */}
        <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500"></span>
              Nến Tăng
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-rose-500"></span>
              Nến Giảm
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-amber-500"></span>
              Đột Biến Vol (&gt; 2x MA20)
            </span>
            {showOverlays && (
              <>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="h-0.5 w-3 bg-cyan-400"></span>
                  EMA 9 (Đường lướt sóng)
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="h-0.5 w-3 bg-amber-400"></span>
                  EMA 21 (Xu hướng chủ đạo)
                </span>
              </>
            )}
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            {formatTime(klines[0]?.time || 0)} - {formatTime(klines[klines.length - 1]?.time || Date.now())}
          </div>
        </div>
      </div>
    </div>
  );
};
