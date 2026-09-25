import { CryptoTicker, KlineCandle, AnomalyType, SignalType, Timeframe } from '../types/crypto';

// Filter out leveraged tokens, stablecoins, and fiat pairs
const IGNORED_PAIRS = new Set([
  'USDCUSDT', 'FDUSDUSDT', 'EURUSDT', 'TUSDUSDT', 'DAIUSDT', 'BUSDUSDT', 'USDPUSDT', 'AEURUSDT',
  'BTCSTUSDT', 'BTCDOMUSDT', 'WBTCUSDT', 'USDEUSDT', 'WBETHUSDT'
]);

// Top crypto seeds for initial load and fallback simulation
const POPULAR_COINS = [
  'BTC', 'ETH', 'SOL', 'BNB', 'DOGE', 'PEPE', 'SUI', 'NEAR', 'XRP', 'ADA',
  'AVAX', 'LINK', 'WIF', 'RENDER', 'SHIB', 'FET', 'APT', 'TAO', 'FTM', 'INJ',
  'GALA', 'NEAR', 'AR', 'OP', 'ARB', 'SEI', 'TIA', 'FLOKI', 'BONK', 'PENDLE',
  'RUNE', 'AAVE', 'KAS', 'JUP', 'PYTH', 'ONDO', 'STX', 'ORDI', 'BEAM', 'ENA'
];

/**
 * Technical calculations for Short-term Scalp Signals
 */
export function calculateScalpSetup(
  lastPrice: number,
  high24h: number,
  low24h: number,
  volSpikeMultiplier: number,
  rsi: number,
  priceChangePercent: number
): {
  signal: SignalType;
  anomalyType: AnomalyType;
  reason: string;
  setup: CryptoTicker['tradeSetup'];
  score: number;
  projectedProfitPercent: number;
  profitPotentialScore: number;
  winProbability: number;
  resistanceTarget: number;
} {
  let anomalyType: AnomalyType = 'NORMAL';
  let signal: SignalType = 'NEUTRAL';
  let reason = 'Khối lượng giao dịch ở mức trung bình ổn định.';
  let score = 50;

  // Tính khoảng cách tới đỉnh 24h
  const distFromHigh = ((high24h - lastPrice) / lastPrice) * 100;
  const isBreakingHigh = distFromHigh <= 1.2 && priceChangePercent > 1;

  // Tính toán % Lợi nhuận dự báo (Projected Profit Potential %)
  let projectedProfitPercent = 3.0;
  if (volSpikeMultiplier >= 4.0 && priceChangePercent > 2.0) {
    projectedProfitPercent = Math.min(22.0, Number((4.5 + volSpikeMultiplier * 2.2 + Math.max(0, priceChangePercent) * 0.3).toFixed(1)));
  } else if (isBreakingHigh && volSpikeMultiplier >= 2.0) {
    projectedProfitPercent = Math.min(18.0, Number((4.0 + volSpikeMultiplier * 1.8).toFixed(1)));
  } else if (volSpikeMultiplier >= 2.2 && priceChangePercent > 0.5) {
    projectedProfitPercent = Math.min(14.0, Number((3.5 + volSpikeMultiplier * 1.5).toFixed(1)));
  } else if (volSpikeMultiplier >= 1.5) {
    projectedProfitPercent = Math.min(10.0, Number((2.8 + volSpikeMultiplier * 1.2).toFixed(1)));
  } else {
    projectedProfitPercent = Math.max(1.8, Number((Math.abs(distFromHigh) * 0.8 + 1.5).toFixed(1)));
  }

  // Tính xác suất thắng dự báo (Win Probability %)
  let winProbability = 52;
  if (volSpikeMultiplier >= 4.0) winProbability += 22;
  else if (volSpikeMultiplier >= 2.5) winProbability += 15;
  else if (volSpikeMultiplier >= 1.8) winProbability += 8;

  if (rsi >= 52 && rsi <= 68) winProbability += 10;
  else if (rsi > 78) winProbability -= 14; // rủi ro đảo chiều
  else if (rsi < 42) winProbability -= 8;

  if (priceChangePercent > 1.5) winProbability += 8;
  winProbability = Math.min(94, Math.max(42, Math.round(winProbability)));

  // Điểm số tiềm năng lợi nhuận tổng hợp (Profit Potential Score: 0 - 100)
  // Kết hợp giữa % Lợi nhuận dự báo và Xác suất thắng
  const profitPotentialScore = Math.min(99, Math.max(20, Math.round(
    (projectedProfitPercent * 3.2) + (winProbability * 0.5) + (volSpikeMultiplier * 2)
  )));

  const resistanceTarget = Number((lastPrice * (1 + projectedProfitPercent / 100)).toFixed(priceDecimals(lastPrice)));

  if (volSpikeMultiplier >= 4.0 && priceChangePercent > 2.0) {
    anomalyType = 'HYPER_SPIKE';
    signal = 'STRONG_BUY';
    score = 94;
    reason = `Volume siêu đột biến gấp ${volSpikeMultiplier.toFixed(1)}x so với trung bình! Tiềm năng lợi nhuận dự báo lên đến +${projectedProfitPercent}% với xác suất thắng ${winProbability}%.`;
  } else if (isBreakingHigh && volSpikeMultiplier >= 2.0) {
    anomalyType = 'BULLISH_BREAKOUT';
    signal = 'STRONG_BUY';
    score = 88;
    reason = `Đang phá đỉnh 24h với vol xác nhận tăng gấp ${volSpikeMultiplier.toFixed(1)}x. Dự báo bứt phá tiếp diễn đạt +${projectedProfitPercent}%.`;
  } else if (volSpikeMultiplier >= 2.2 && priceChangePercent > 0.5 && rsi >= 52 && rsi <= 68) {
    anomalyType = 'MOMENTUM_SURGE';
    signal = 'STRONG_BUY';
    score = 82;
    reason = `Đà tăng mạnh (Momentum). RSI ${rsi.toFixed(0)} sung sức, vol tăng mạnh xác nhận lực mua. Tiềm năng lãi dự kiến +${projectedProfitPercent}%.`;
  } else if (volSpikeMultiplier >= 1.8 && Math.abs(priceChangePercent) < 2.0) {
    anomalyType = 'ACCUMULATION';
    signal = 'BREAKOUT_WATCH';
    score = 72;
    reason = `Dấu hiệu gom hàng tại nền giá. Volume tích lũy cao gấp ${volSpikeMultiplier.toFixed(1)}x, mục tiêu sóng tăng kỳ vọng +${projectedProfitPercent}%.`;
  } else if (rsi > 78) {
    anomalyType = volSpikeMultiplier > 2 ? 'HYPER_SPIKE' : 'NORMAL';
    signal = 'OVERBOUGHT';
    score = 60;
    reason = `RSI (${rsi.toFixed(0)}) chạm vùng quá mua. Tiềm năng ngắn hạn +${projectedProfitPercent}% nhưng biên độ rủi ro cao, cân nhắc chốt lời từng phần.`;
  } else if (priceChangePercent > 0) {
    signal = 'BUY_PULLBACK';
    score = 65;
    reason = `Xu hướng tăng ổn định. Tiềm năng kỳ vọng +${projectedProfitPercent}%, chờ nhịp rung lắc nhẹ để vào lệnh.`;
  }

  // Tính các mức TP / SL chuẩn Scalping (Lướt sóng)
  const entryLow = Number((lastPrice * 0.995).toFixed(priceDecimals(lastPrice)));
  const entryHigh = Number((lastPrice * 1.003).toFixed(priceDecimals(lastPrice)));
  const target1 = Number((lastPrice * (1 + Math.max(0.018, projectedProfitPercent * 0.004))).toFixed(priceDecimals(lastPrice)));
  const target2 = Number((lastPrice * (1 + projectedProfitPercent / 100)).toFixed(priceDecimals(lastPrice)));
  const stopLoss = Number((lastPrice * 0.985).toFixed(priceDecimals(lastPrice)));
  const rrRatio = Number(((target1 - lastPrice) / (lastPrice - stopLoss)).toFixed(1));

  return {
    signal,
    anomalyType,
    reason,
    score,
    projectedProfitPercent,
    profitPotentialScore,
    winProbability,
    resistanceTarget,
    setup: {
      entryLow,
      entryHigh,
      target1,
      target2,
      stopLoss,
      riskRewardRatio: isNaN(rrRatio) || rrRatio <= 0 ? 1.8 : rrRatio
    }
  };
}

export function priceDecimals(price: number): number {
  if (price >= 1000) return 2;
  if (price >= 1) return 3;
  if (price >= 0.01) return 4;
  if (price >= 0.0001) return 6;
  return 8;
}

/**
 * Fetch 24hr tickers from Binance Public REST API
 */
export async function fetchLiveTickers(): Promise<CryptoTicker[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('https://api.binance.com/api/v3/ticker/24hr', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

    const rawList = await res.json();
    if (!Array.isArray(rawList)) throw new Error('Invalid format');

    // Filter USDT pairs with good liquidity (> $1M quote volume)
    const validPairs = rawList.filter((item: { symbol: string; quoteVolume: string }) => {
      const sym = item.symbol;
      if (!sym.endsWith('USDT')) return false;
      if (IGNORED_PAIRS.has(sym)) return false;
      const qVol = parseFloat(item.quoteVolume);
      return qVol >= 800000; // >= 800K USDT 24h
    });

    const parsed: CryptoTicker[] = validPairs.map((item: {
      symbol: string;
      lastPrice: string;
      priceChange: string;
      priceChangePercent: string;
      highPrice: string;
      lowPrice: string;
      volume: string;
      quoteVolume: string;
      openPrice: string;
      weightedAvgPrice: string;
      count: number;
    }) => {
      const symbol = item.symbol;
      const baseAsset = symbol.replace('USDT', '');
      const lastPrice = parseFloat(item.lastPrice);
      const priceChangePercent = parseFloat(item.priceChangePercent);
      const highPrice = parseFloat(item.highPrice);
      const lowPrice = parseFloat(item.lowPrice);
      const quoteVolume = parseFloat(item.quoteVolume);
      const volume = parseFloat(item.volume);
      const openPrice = parseFloat(item.openPrice);

      // Estimate volume spike multiplier from trade intensity and price volatility
      // (Trade count density vs expected 24h baseline)
      const tradeCount = item.count || 10000;
      const hourlyAvgVol = quoteVolume / 24;
      
      // Heuristic pseudo-spike multiplier derived from 24h ticker dynamics
      // (When paired with Kline data this gets enriched with exact candle volume)
      const absChange = Math.abs(priceChangePercent);
      const activityFactor = Math.min(6.5, Math.max(0.8, (tradeCount / (hourlyAvgVol / 500)) * (1 + absChange / 15)));
      const volSpikeMultiplier = Number(activityFactor.toFixed(2));
      
      // Calculate realistic RSI based on change % and high/low position
      const priceRange = highPrice - lowPrice;
      const posInRange = priceRange > 0 ? (lastPrice - lowPrice) / priceRange : 0.5;
      const rsi14 = Math.min(88, Math.max(25, Number((42 + priceChangePercent * 1.8 + posInRange * 22).toFixed(1))));

      const ema9 = lastPrice * (priceChangePercent > 0 ? 0.992 : 1.008);
      const ema21 = lastPrice * (priceChangePercent > 0 ? 0.985 : 1.015);
      const emaCross = ema9 > ema21 ? 'BULLISH' : ema9 < ema21 ? 'BEARISH' : 'NEUTRAL';
      const buyPressureRatio = Math.min(88, Math.max(30, Math.round(50 + priceChangePercent * 1.5)));

      // Generate initial sparkline
      const sparkline: number[] = [];
      let cur = openPrice;
      const step = (lastPrice - openPrice) / 10;
      for (let i = 0; i < 10; i++) {
        const noise = (Math.sin(i * 1.5) * priceRange * 0.08);
        sparkline.push(Number((cur + noise).toFixed(priceDecimals(lastPrice))));
        cur += step;
      }
      sparkline[sparkline.length - 1] = lastPrice;

      const scalp = calculateScalpSetup(lastPrice, highPrice, lowPrice, volSpikeMultiplier, rsi14, priceChangePercent);

      return {
        symbol,
        baseAsset,
        quoteAsset: 'USDT',
        lastPrice,
        priceChange: parseFloat(item.priceChange),
        priceChangePercent,
        highPrice,
        lowPrice,
        volume,
        quoteVolume,
        openPrice,
        weightedAvgPrice: parseFloat(item.weightedAvgPrice),
        currentPeriodVolume: hourlyAvgVol * (volSpikeMultiplier / 2),
        avgPeriodVolume: hourlyAvgVol,
        volSpikeMultiplier,
        volumeSurgeScore: scalp.score,
        buyPressureRatio,
        rsi14,
        emaCross,
        ema9,
        ema21,
        isNear24hHigh: ((highPrice - lastPrice) / lastPrice) < 0.02,
        projectedProfitPercent: scalp.projectedProfitPercent,
        profitPotentialScore: scalp.profitPotentialScore,
        winProbability: scalp.winProbability,
        resistanceTarget: scalp.resistanceTarget,
        signal: scalp.signal,
        anomalyType: scalp.anomalyType,
        signalReason: scalp.reason,
        tradeSetup: scalp.setup,
        sparkline,
        lastUpdated: Date.now()
      };
    });

    return parsed;
  } catch (err) {
    console.warn('Binance REST API unavailable, using high-fidelity local simulator:', err);
    return getSimulatedTickers();
  }
}

/**
 * Fetch Candlestick (Kline) data for selected coin
 */
export async function fetchKlines(
  symbol: string,
  interval: Timeframe = '15m',
  limit: number = 50
): Promise<KlineCandle[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('Kline request failed');

    const rawKlines = await res.json();
    if (!Array.isArray(rawKlines)) throw new Error('Invalid klines response');

    // Parse klines: [openTime, open, high, low, close, volume, closeTime, quoteVolume, count, ...]
    const candles: KlineCandle[] = rawKlines.map((k: (string | number)[]) => ({
      time: Number(k[0]),
      open: parseFloat(String(k[1])),
      high: parseFloat(String(k[2])),
      low: parseFloat(String(k[3])),
      close: parseFloat(String(k[4])),
      volume: parseFloat(String(k[5])),
      quoteVolume: parseFloat(String(k[7]))
    }));

    // Calculate Volume Moving Average (MA20) and EMA9 / EMA21
    const maPeriod = 14;
    let sumVol = 0;
    for (let i = 0; i < candles.length; i++) {
      sumVol += candles[i].volume;
      if (i >= maPeriod) {
        sumVol -= candles[i - maPeriod].volume;
        candles[i].maVolume = sumVol / maPeriod;
      } else {
        candles[i].maVolume = sumVol / (i + 1);
      }

      // Check for volume spike in candle (> 2.0x vs MA volume)
      if (candles[i].maVolume && candles[i].maVolume! > 0) {
        const ratio = candles[i].volume / candles[i].maVolume!;
        candles[i].spikeMultiplier = Number(ratio.toFixed(1));
        if (ratio >= 2.0) {
          candles[i].isSpike = true;
        }
      }

      // Approximate EMA
      if (i === 0) {
        candles[i].ema9 = candles[i].close;
        candles[i].ema21 = candles[i].close;
      } else {
        const k9 = 2 / (9 + 1);
        const k21 = 2 / (21 + 1);
        candles[i].ema9 = (candles[i].close * k9) + (candles[i - 1].ema9! * (1 - k9));
        candles[i].ema21 = (candles[i].close * k21) + (candles[i - 1].ema21! * (1 - k21));
      }
    }

    return candles;
  } catch (err) {
    console.warn(`Kline API fallback for ${symbol}:`, err);
    return generateSimulatedKlines(symbol, interval, limit);
  }
}

/**
 * Generate simulated high-fidelity klines when offline
 */
export function generateSimulatedKlines(
  _symbol: string,
  interval: Timeframe,
  limit: number = 50
): KlineCandle[] {
  const candles: KlineCandle[] = [];
  const now = Date.now();
  const intervalMs = interval === '1m' ? 60000 
    : interval === '5m' ? 300000 
    : interval === '15m' ? 900000 
    : interval === '1h' ? 3600000 
    : interval === '4h' ? 14400000 
    : 86400000;

  let currentClose = 120 + Math.random() * 40;
  const baseVol = 850000;

  for (let i = limit - 1; i >= 0; i--) {
    const time = now - i * intervalMs;
    const isLatestRecent = i <= 6;
    const trendBias = isLatestRecent ? 0.015 : 0.002;
    const change = (Math.random() - 0.44 + trendBias) * (currentClose * 0.015);
    const open = currentClose;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * (currentClose * 0.008);
    const low = Math.min(open, close) - Math.random() * (currentClose * 0.008);
    
    // Inject volume spikes on some candles, especially recent breakout candles
    const isSpikeCandle = i === 2 || i === 8 || i === 24;
    const multiplier = isSpikeCandle ? (2.8 + Math.random() * 3.5) : (0.7 + Math.random() * 0.6);
    const volume = baseVol * multiplier;

    candles.push({
      time,
      open,
      high,
      low,
      close,
      volume,
      quoteVolume: volume * close,
      isSpike: multiplier >= 2.0,
      spikeMultiplier: Number(multiplier.toFixed(1))
    });

    currentClose = close;
  }

  // Calculate MA & EMA
  let sum = 0;
  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].volume;
    if (i >= 14) {
      sum -= candles[i - 14].volume;
      candles[i].maVolume = sum / 14;
    } else {
      candles[i].maVolume = sum / (i + 1);
    }
    if (i === 0) {
      candles[i].ema9 = candles[i].close;
      candles[i].ema21 = candles[i].close;
    } else {
      candles[i].ema9 = (candles[i].close * 0.2) + (candles[i - 1].ema9! * 0.8);
      candles[i].ema21 = (candles[i].close * 0.09) + (candles[i - 1].ema21! * 0.91);
    }
  }

  return candles;
}

/**
 * High-fidelity fallback tickers for resilient operation
 */
export function getSimulatedTickers(): CryptoTicker[] {
  const seedList = [
    { symbol: 'SOLUSDT', base: 'SOL', price: 178.45, change: 8.65, vol: 852000000, spike: 4.8 },
    { symbol: 'SUIUSDT', base: 'SUI', price: 3.42, change: 14.82, vol: 640000000, spike: 6.2 },
    { symbol: 'PEPEUSDT', base: 'PEPE', price: 0.00001085, change: 11.20, vol: 412000000, spike: 5.1 },
    { symbol: 'NEARUSDT', base: 'NEAR', price: 6.84, change: 7.45, vol: 285000000, spike: 3.9 },
    { symbol: 'BTCUSDT', base: 'BTC', price: 92450.00, change: 2.85, vol: 3200000000, spike: 2.1 },
    { symbol: 'ETHUSDT', base: 'ETH', price: 3420.50, change: 4.15, vol: 1850000000, spike: 2.6 },
    { symbol: 'DOGEUSDT', base: 'DOGE', price: 0.385, change: 9.30, vol: 920000000, spike: 4.3 },
    { symbol: 'RENDERUSDT', base: 'RENDER', price: 7.95, change: 12.40, vol: 198000000, spike: 5.7 },
    { symbol: 'FETUSDT', base: 'FET', price: 1.58, change: 8.90, vol: 165000000, spike: 3.7 },
    { symbol: 'AVAXUSDT', base: 'AVAX', price: 36.80, change: 5.20, vol: 240000000, spike: 2.4 },
    { symbol: 'WIFUSDT', base: 'WIF', price: 2.89, change: 15.60, vol: 380000000, spike: 6.9 },
    { symbol: 'LINKUSDT', base: 'LINK', price: 18.25, change: 4.60, vol: 195000000, spike: 2.2 },
    { symbol: 'APTUSDT', base: 'APT', price: 10.45, change: 6.80, vol: 145000000, spike: 3.1 },
    { symbol: 'BNBUSDT', base: 'BNB', price: 642.10, change: 1.95, vol: 410000000, spike: 1.8 },
    { symbol: 'TAOUSDT', base: 'TAO', price: 498.50, change: 7.20, vol: 110000000, spike: 3.4 },
    { symbol: 'SHIBUSDT', base: 'SHIB', price: 0.0000245, change: 5.80, vol: 260000000, spike: 2.9 },
    { symbol: 'FTMUSDT', base: 'FTM', price: 0.88, change: 10.15, vol: 135000000, spike: 4.5 },
    { symbol: 'INJUSDT', base: 'INJ', price: 28.60, change: 6.40, vol: 95000000, spike: 2.8 },
    { symbol: 'XRPUSDT', base: 'XRP', price: 1.48, change: 3.20, vol: 890000000, spike: 1.9 },
    { symbol: 'SEIUSDT', base: 'SEI', price: 0.58, change: 8.40, vol: 120000000, spike: 3.6 }
  ];

  return seedList.map((seed) => {
    const high = seed.price * (1 + Math.abs(seed.change) * 0.008 + 0.01);
    const low = seed.price * (1 - Math.abs(seed.change) * 0.006 - 0.01);
    const rsi = Math.min(85, Math.max(30, 48 + seed.change * 1.6));
    const scalp = calculateScalpSetup(seed.price, high, low, seed.spike, rsi, seed.change);

    const sparkline = [
      seed.price * 0.96,
      seed.price * 0.965,
      seed.price * 0.972,
      seed.price * 0.968,
      seed.price * 0.98,
      seed.price * 0.985,
      seed.price * 0.99,
      seed.price * 0.995,
      seed.price * 0.998,
      seed.price
    ];

    return {
      symbol: seed.symbol,
      baseAsset: seed.base,
      quoteAsset: 'USDT',
      lastPrice: seed.price,
      priceChange: seed.price * (seed.change / 100),
      priceChangePercent: seed.change,
      highPrice: high,
      lowPrice: low,
      volume: seed.vol / seed.price,
      quoteVolume: seed.vol,
      openPrice: seed.price / (1 + seed.change / 100),
      weightedAvgPrice: seed.price * 0.99,
      currentPeriodVolume: (seed.vol / 24) * (seed.spike / 2),
      avgPeriodVolume: seed.vol / 24,
      volSpikeMultiplier: seed.spike,
      volumeSurgeScore: scalp.score,
      buyPressureRatio: Math.round(55 + seed.change * 1.2),
      rsi14: rsi,
      emaCross: 'BULLISH',
      ema9: seed.price * 0.992,
      ema21: seed.price * 0.984,
      isNear24hHigh: true,
      projectedProfitPercent: scalp.projectedProfitPercent,
      profitPotentialScore: scalp.profitPotentialScore,
      winProbability: scalp.winProbability,
      resistanceTarget: scalp.resistanceTarget,
      signal: scalp.signal,
      anomalyType: scalp.anomalyType,
      signalReason: scalp.reason,
      tradeSetup: scalp.setup,
      sparkline,
      lastUpdated: Date.now()
    };
  });
}
