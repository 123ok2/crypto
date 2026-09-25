import { CryptoTicker, KlineCandle } from '../types/crypto';
import { priceDecimals } from './binanceApi';

export interface QuantTradePlan {
  strategyName: string;
  strategyBadge: string;
  safetyScore: number;               // 0 - 100: Điểm an toàn chống thua lỗ
  maxAllowedRiskPercent: number;     // Rủi ro tối đa cho phép (ví dụ 1.5%)
  recommendedPositionSizeUsd: number;// Khối lượng vào lệnh tối ưu theo vốn
  
  // Các mốc hành động cụ thể
  entryZone: {
    idealPrice: number;
    maxBuyPrice: number;
    instruction: string;
  };
  
  breakEvenTrigger: {
    price: number;
    percentGain: number;
    instruction: string;
  };

  takeProfitLevels: {
    tp1: { price: number; percent: number; closeRatio: string; note: string };
    tp2: { price: number; percent: number; closeRatio: string; note: string };
    tp3: { price: number; percent: number; closeRatio: string; note: string };
  };

  stopLossStrict: {
    price: number;
    percent: number;
    atrBuffer: number;
    rule: string;
  };

  executionChecklist: {
    condition: string;
    status: 'PASS' | 'WARNING' | 'FAIL';
    explanation: string;
  }[];

  antiLossWarnings: string[];
}

/**
 * Calculates Average True Range (ATR) to place volatility-safe Stop Loss
 */
export function calculateATR(klines: KlineCandle[], period: number = 14): number {
  if (klines.length < 2) return 0;
  const trueRanges: number[] = [];

  for (let i = 1; i < klines.length; i++) {
    const current = klines[i];
    const prev = klines[i - 1];
    const tr = Math.max(
      current.high - current.low,
      Math.abs(current.high - prev.close),
      Math.abs(current.low - prev.close)
    );
    trueRanges.push(tr);
  }

  const recentTr = trueRanges.slice(-period);
  const sum = recentTr.reduce((acc, val) => acc + val, 0);
  return sum / recentTr.length;
}

/**
 * Smart Anti-Loss Quant Engine: Automatically designs optimal trade plan
 */
export function generateQuantTradePlan(
  coin: CryptoTicker,
  klines: KlineCandle[],
  totalPortfolioUsd: number = 1000
): QuantTradePlan {
  const currentPrice = coin.lastPrice;
  const atr = calculateATR(klines, 14) || currentPrice * 0.015;
  const decimals = priceDecimals(currentPrice);

  // Strategy selection based on technical dynamics
  let strategyName = 'Bứt Phá Nổ Khối Lượng (Breakout Alpha)';
  let strategyBadge = 'ĐỘT PHÁ CẢN';
  if (coin.volSpikeMultiplier >= 3.5 && coin.isNear24hHigh) {
    strategyName = 'Bứt Phá Nổ Khối Lượng (Breakout Alpha)';
    strategyBadge = 'SIÊU XUNG LỰC';
  } else if (coin.rsi14 <= 55 && coin.volSpikeMultiplier >= 2.0) {
    strategyName = 'Bắt Sóng Hồi EMA (Pullback Sniper)';
    strategyBadge = 'SÓNG HỒI AN TOÀN';
  } else if (coin.volSpikeMultiplier >= 2.5) {
    strategyName = 'Bám Sát Cá Mập (Whale Flow Tracker)';
    strategyBadge = 'THEO DÒNG TIỀN';
  }

  // 1. Dynamic Stop Loss via 1.6x ATR to avoid getting wicked out by fakeouts
  const rawSlDistance = Math.max(currentPrice * 0.012, atr * 1.5);
  const strictSlPrice = Number((currentPrice - rawSlDistance).toFixed(decimals));
  const strictSlPercent = Number((((currentPrice - strictSlPrice) / currentPrice) * 100).toFixed(2));

  // 2. Break-Even Trigger: When price rises by 1.5% or touches TP1, move SL to entry!
  const breakEvenPrice = Number((currentPrice * 1.015).toFixed(decimals));

  // 3. Take Profit Tranches (Chốt lời 3 nấc để luôn khóa chặt lợi nhuận vào túi)
  const tp1Price = Number((currentPrice * (1 + Math.max(0.02, strictSlPercent * 1.2 / 100))).toFixed(decimals));
  const tp2Price = Number((currentPrice * (1 + Math.max(0.045, coin.projectedProfitPercent * 0.007))).toFixed(decimals));
  const tp3Price = Number((currentPrice * (1 + coin.projectedProfitPercent / 100)).toFixed(decimals));

  const tp1Percent = Number((((tp1Price - currentPrice) / currentPrice) * 100).toFixed(1));
  const tp2Percent = Number((((tp2Price - currentPrice) / currentPrice) * 100).toFixed(1));
  const tp3Percent = Number((((tp3Price - currentPrice) / currentPrice) * 100).toFixed(1));

  // 4. Optimal Position Size (Quy tắc 2% rủi ro tối đa của Quỹ đầu tư)
  // Max loss on trade = 1.5% of total portfolio
  const maxAllowedRiskDollar = totalPortfolioUsd * 0.015;
  const slDecimal = strictSlPercent / 100;
  const recommendedPositionSizeUsd = Math.round(
    Math.min(totalPortfolioUsd * 0.6, maxAllowedRiskDollar / slDecimal)
  );

  // 5. Anti-Loss Safety Score Calculation (0 - 100)
  let safetyScore = 70;
  if (coin.volSpikeMultiplier >= 2.5) safetyScore += 12;
  if (coin.buyPressureRatio >= 55) safetyScore += 8;
  if (coin.rsi14 >= 50 && coin.rsi14 <= 68) safetyScore += 8;
  if (coin.rsi14 > 76) safetyScore -= 18; // overbought risk
  if (coin.priceChangePercent < 0) safetyScore -= 10;
  if (coin.quoteVolume >= 10000000) safetyScore += 5;
  safetyScore = Math.min(98, Math.max(35, safetyScore));

  // 6. Execution Checklist
  const executionChecklist: QuantTradePlan['executionChecklist'] = [
    {
      condition: 'Xác nhận Khối lượng đột biến (Volume Surge)',
      status: coin.volSpikeMultiplier >= 2.0 ? 'PASS' : 'WARNING',
      explanation: `Vol hiện tại gấp ${coin.volSpikeMultiplier.toFixed(1)}x trung bình. Lực mua áp đảo.`
    },
    {
      condition: 'Vùng đệm RSI An Toàn (Không dính đỉnh FOMO)',
      status: coin.rsi14 <= 70 ? 'PASS' : 'WARNING',
      explanation: coin.rsi14 <= 70 
        ? `RSI ở mức ${coin.rsi14.toFixed(0)} - Đang có đà tăng tốt, chưa bị quá mua.` 
        : `RSI ${coin.rsi14.toFixed(0)} đang chạm ngưỡng quá mua. Khuyên chỉ lướt sóng nhanh.`
    },
    {
      condition: 'Cấu trúc Xu Hướng EMA 9 / EMA 21',
      status: coin.emaCross === 'BULLISH' ? 'PASS' : 'WARNING',
      explanation: coin.emaCross === 'BULLISH' 
        ? 'EMA 9 nằm trên EMA 21. Cấu trúc giá hình thành đỉnh đáy cao dần (Uptrend).' 
        : 'Giá đang tích lũy đi ngang chờ xác nhận bứt phá.'
    },
    {
      condition: 'Thanh khoản đảm bảo chống trượt giá (Liquidity Shield)',
      status: coin.quoteVolume >= 2000000 ? 'PASS' : 'WARNING',
      explanation: `Khối lượng 24h đạt $${(coin.quoteVolume / 1e6).toFixed(1)}M USDT. Khớp lệnh mượt mà, không sợ kẹt vốn.`
    }
  ];

  // 7. Anti-Loss Warnings
  const antiLossWarnings: string[] = [
    `Bảo toàn vốn tuyệt đối: Nếu giá chạm ${breakEvenPrice} (+1.5%), hãy kéo lệnh Stop Loss về ngay giá vào lệnh để triệt tiêu 100% rủi ro thua lỗ.`,
    `Chốt lời từng phần: Bán 50% khối lượng khi chạm TP1 (${tp1Price}) để đút tiền vào túi, gồng tiếp 50% còn lại theo TP2 và TP3.`,
    `Kỷ luật thép: Không bao giờ dời Stop Loss ra xa hơn mốc ${strictSlPrice}. Cắt lỗ đúng kế hoạch chỉ mất tối đa $${maxAllowedRiskDollar.toFixed(1)} (1.5% tài khoản).`
  ];

  return {
    strategyName,
    strategyBadge,
    safetyScore,
    maxAllowedRiskPercent: 1.5,
    recommendedPositionSizeUsd,
    entryZone: {
      idealPrice: currentPrice,
      maxBuyPrice: Number((currentPrice * 1.004).toFixed(decimals)),
      instruction: `Khớp lệnh trong khoảng $${(currentPrice * 0.997).toFixed(decimals)} - $${(currentPrice * 1.004).toFixed(decimals)}. Không mua đuổi khi giá đã chạy quá 1.5%.`
    },
    breakEvenTrigger: {
      price: breakEvenPrice,
      percentGain: 1.5,
      instruction: `Dời SL về hòa vốn ngay khi giá chạm $${breakEvenPrice}.`
    },
    takeProfitLevels: {
      tp1: {
        price: tp1Price,
        percent: tp1Percent,
        closeRatio: 'Đóng 50% vị thế',
        note: 'Khóa chặt 50% tiền lãi vào túi'
      },
      tp2: {
        price: tp2Price,
        percent: tp2Percent,
        closeRatio: 'Đóng 30% vị thế',
        note: 'Gặt hái sóng tăng mở rộng'
      },
      tp3: {
        price: tp3Price,
        percent: tp3Percent,
        closeRatio: 'Đóng 20% còn lại',
        note: 'Gồng hết biên độ kháng cự'
      }
    },
    stopLossStrict: {
      price: strictSlPrice,
      percent: strictSlPercent,
      atrBuffer: Number((atr).toFixed(decimals)),
      rule: 'Cắt lỗ tự động bằng lệnh Stop-Market, tuyệt đối không gồng lỗ!'
    },
    executionChecklist,
    antiLossWarnings
  };
}
