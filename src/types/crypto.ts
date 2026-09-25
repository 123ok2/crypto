export type AnomalyType = 
  | 'HYPER_SPIKE'       // Khối lượng siêu đột biến > 4x
  | 'BULLISH_BREAKOUT'  // Đột phá cản kèm vol lớn > 2.5x
  | 'ACCUMULATION'      // Gom hàng âm thầm vol tăng đều
  | 'MOMENTUM_SURGE'    // Đang tăng mạnh kèm lực mua áp đảo
  | 'NORMAL';           // Bình thường

export type SignalType = 
  | 'STRONG_BUY'        // Mua mạnh (Lướt sóng ngay)
  | 'BUY_PULLBACK'      // Chờ hồi nhẹ để vào lệnh
  | 'BREAKOUT_WATCH'    // Chuẩn bị bứt phá cản
  | 'OVERBOUGHT'        // Quá mua (Cẩn thận điều chỉnh)
  | 'NEUTRAL';          // Trung tính

export interface CryptoTicker {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  lastPrice: number;
  priceChange: number;
  priceChangePercent: number;
  highPrice: number;
  lowPrice: number;
  volume: number;           // Khối lượng coin
  quoteVolume: number;      // Giá trị giao dịch USDT (24h)
  openPrice: number;
  weightedAvgPrice: number;
  
  // Tính toán đột biến khối lượng
  currentPeriodVolume: number; // Volume kỳ hiện tại (ví dụ nến gần nhất)
  avgPeriodVolume: number;     // Volume trung bình 20 kỳ
  volSpikeMultiplier: number;  // Bội số so với trung bình (ví dụ 3.8x)
  volumeSurgeScore: number;    // Điểm số đột biến 0 - 100
  buyPressureRatio: number;    // % Lực mua chủ động (takers buy)
  
  // Chỉ báo xu hướng kỹ thuật
  rsi14: number;
  emaCross: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  ema9: number;
  ema21: number;
  isNear24hHigh: boolean;      // Đang sát đỉnh 24h (< 2% khoảng cách)
  
  // Tiềm năng lợi nhuận dự báo ngắn hạn
  projectedProfitPercent: number; // % Lợi nhuận kỳ vọng ngắn hạn (VD: +8.5%)
  profitPotentialScore: number;   // Điểm số tiềm năng lợi nhuận (0 - 100)
  winProbability: number;         // Xác suất thành công dự báo (VD: 85%)
  resistanceTarget: number;       // Mức cản kháng cự kỳ vọng chạm tới
  
  // Tín hiệu lướt sóng ngắn hạn
  signal: SignalType;
  anomalyType: AnomalyType;
  signalReason: string;
  
  // Kế hoạch giao dịch tham khảo
  tradeSetup: {
    entryLow: number;
    entryHigh: number;
    target1: number;      // TP1 (+1.8% ~ +3%)
    target2: number;      // TP2 (+4% ~ +7%)
    stopLoss: number;     // SL (-1.2% ~ -2%)
    riskRewardRatio: number;
  };
  
  sparkline: number[];        // Chuỗi giá 10 điểm gần nhất để vẽ mini-chart
  isStarred?: boolean;
  lastUpdated: number;
  priceDirection?: 'up' | 'down' | 'flat';
}

export interface KlineCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  quoteVolume: number;
  isSpike?: boolean;
  spikeMultiplier?: number;
  maVolume?: number;
  ema9?: number;
  ema21?: number;
}

export interface VolumeAlert {
  id: string;
  symbol: string;
  timestamp: number;
  price: number;
  priceChangePercent: number;
  multiplier: number;
  type: 'SPIKE' | 'BREAKOUT' | 'MOMENTUM';
  message: string;
}

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export interface FilterState {
  searchQuery: string;
  minVolumeUsd: number;      // Lọc vol tối thiểu (VD: $1,000,000)
  minSpikeMultiplier: number;// Lọc độ đột biến (VD: > 2.0x)
  signalFilter: 'ALL' | 'STRONG_BUY' | 'BREAKOUT' | 'UPTREND_ONLY' | 'POTENTIAL';
  sortBy: 'potential_profit' | 'spike' | 'change' | 'volume' | 'score' | 'rsi';
  sortOrder: 'desc' | 'asc';
  watchlistOnly: boolean;
  timeframe: Timeframe;
}
