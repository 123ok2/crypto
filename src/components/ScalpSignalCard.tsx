import React, { useState } from 'react';
import { CryptoTicker } from '../types/crypto';
import { priceDecimals } from '../services/binanceApi';
import { 
  Target, 
  ShieldAlert, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  XCircle,
  HelpCircle
} from 'lucide-react';

interface ScalpSignalCardProps {
  coin: CryptoTicker;
}

export const ScalpSignalCard: React.FC<ScalpSignalCardProps> = ({ coin }) => {
  const [capitalUsd, setCapitalUsd] = useState<number>(500);
  const [leverage, setLeverage] = useState<number>(5); // Default 5x leverage or Spot 1x

  const formatPrice = (val: number) => {
    return val.toLocaleString(undefined, {
      minimumFractionDigits: priceDecimals(val),
      maximumFractionDigits: priceDecimals(val)
    });
  };

  const setup = coin.tradeSetup;
  const currentPrice = coin.lastPrice;

  // Calculate percentage gains
  const tp1Percent = ((setup.target1 - currentPrice) / currentPrice) * 100;
  const tp2Percent = ((setup.target2 - currentPrice) / currentPrice) * 100;
  const slPercent = Math.abs(((currentPrice - setup.stopLoss) / currentPrice) * 100);

  // Profit/Loss calculations based on capital and leverage
  const positionSize = capitalUsd * leverage;
  const tp1ProfitUsd = positionSize * (tp1Percent / 100);
  const tp2ProfitUsd = positionSize * (tp2Percent / 100);
  const slLossUsd = positionSize * (slPercent / 100);

  // Checklist criteria for short term trading
  const criteria = [
    {
      label: 'Đột biến khối lượng',
      desc: `Vol đạt ${coin.volSpikeMultiplier.toFixed(1)}x so với trung bình`,
      passed: coin.volSpikeMultiplier >= 2.0,
      priority: 'Bắt buộc'
    },
    {
      label: 'Xu hướng giá ngắn hạn',
      desc: coin.priceChangePercent > 0 ? `Tăng +${coin.priceChangePercent.toFixed(2)}% trong 24h` : `Giảm ${coin.priceChangePercent.toFixed(2)}%`,
      passed: coin.priceChangePercent > 0,
      priority: 'Quan trọng'
    },
    {
      label: 'Động lượng RSI (14)',
      desc: `RSI đạt ${coin.rsi14.toFixed(0)} (${coin.rsi14 >= 50 && coin.rsi14 <= 70 ? 'Vùng đà tăng sung sức' : coin.rsi14 > 70 ? 'Cảnh báo quá mua' : 'Động lượng yếu'})`,
      passed: coin.rsi14 >= 50 && coin.rsi14 <= 74,
      priority: 'Kỹ thuật'
    },
    {
      label: 'Cấu trúc EMA ngắn hạn',
      desc: coin.emaCross === 'BULLISH' ? 'EMA 9 > EMA 21 (Uptrend xác nhận)' : 'Chưa giao cắt tăng',
      passed: coin.emaCross === 'BULLISH',
      priority: 'Kỹ thuật'
    },
    {
      label: 'Lực mua chủ động',
      desc: `${coin.buyPressureRatio}% lệnh mua khớp vào giá Ask`,
      passed: coin.buyPressureRatio >= 52,
      priority: 'Dòng tiền'
    }
  ];

  const passedCount = criteria.filter((c) => c.passed).length;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 lg:p-5 space-y-5">
      {/* Header Signal Badge */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Kế hoạch Lướt Sóng Ngắn Hạn</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs font-mono text-emerald-400">
              Độ tin cậy {passedCount}/5 tiêu chí
            </span>
          </div>
          <h2 className="text-base lg:text-lg font-bold text-white mt-0.5 flex items-center gap-2">
            Tín Hiệu Cho {coin.baseAsset}
            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
              coin.signal === 'STRONG_BUY'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : coin.signal === 'BREAKOUT_WATCH'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : coin.signal === 'OVERBOUGHT'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-300'
            }`}>
              {coin.signal === 'STRONG_BUY'
                ? '⚡ MUA MẠNH (LƯỚT SÓNG)'
                : coin.signal === 'BREAKOUT_WATCH'
                ? '🔍 THEO DÕI BỨT PHÁ'
                : coin.signal === 'BUY_PULLBACK'
                ? '⏳ CHỜ HỒI NHẸ ĐỂ VÀO'
                : coin.signal === 'OVERBOUGHT'
                ? '⚠️ QUÁ MUA (CHỐT LỜI)'
                : 'QUAN SÁT'}
            </span>
          </h2>
        </div>

        {/* Profit Potential & Score badge */}
        <div className="text-right">
          <div className="text-[11px] text-emerald-400 font-semibold">Lãi Dự Báo Ngắn Hạn</div>
          <div className="text-xl lg:text-2xl font-bold font-mono text-emerald-300">
            +{coin.projectedProfitPercent.toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Xác suất thắng {coin.winProbability}%
          </div>
        </div>
      </div>

      {/* Signal rationale explanation */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-xs leading-relaxed text-slate-300">
        <p className="flex items-start gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{coin.signalReason}</span>
        </p>
      </div>

      {/* Suggested Trade Setup Coordinates (Entry, TP1, TP2, SL) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Entry Zone */}
        <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-2.5">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
            Vùng Vào Lệnh (Entry)
          </div>
          <div className="text-xs lg:text-sm font-bold font-mono text-slate-100 mt-1">
            ${formatPrice(setup.entryLow)} - ${formatPrice(setup.entryHigh)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Giá hiện tại: ${formatPrice(currentPrice)}</div>
        </div>

        {/* Take Profit 1 */}
        <div className="bg-slate-950/50 border border-emerald-500/20 rounded-lg p-2.5">
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <Target className="h-3 w-3" />
            Chốt Lời 1 (TP1)
          </div>
          <div className="text-xs lg:text-sm font-bold font-mono text-emerald-400 mt-1">
            ${formatPrice(setup.target1)}
          </div>
          <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5">+{tp1Percent.toFixed(1)}% (Khóa 50% vị thế)</div>
        </div>

        {/* Take Profit 2 */}
        <div className="bg-slate-950/50 border border-emerald-500/30 rounded-lg p-2.5">
          <div className="text-[11px] text-emerald-300 flex items-center gap-1">
            <Target className="h-3 w-3" />
            Chốt Lời 2 (TP2)
          </div>
          <div className="text-xs lg:text-sm font-bold font-mono text-emerald-300 mt-1">
            ${formatPrice(setup.target2)}
          </div>
          <div className="text-[10px] text-emerald-300/80 font-mono mt-0.5">+{tp2Percent.toFixed(1)}% (Gồng lãi cản đỉnh)</div>
        </div>

        {/* Stop Loss */}
        <div className="bg-slate-950/50 border border-rose-500/20 rounded-lg p-2.5">
          <div className="text-[11px] text-rose-400 flex items-center gap-1">
            <ShieldAlert className="h-3 w-3" />
            Cắt Lỗ (Stop Loss)
          </div>
          <div className="text-xs lg:text-sm font-bold font-mono text-rose-400 mt-1">
            ${formatPrice(setup.stopLoss)}
          </div>
          <div className="text-[10px] text-rose-400/80 font-mono mt-0.5">-{slPercent.toFixed(1)}% (Tỷ lệ R:R = 1:{setup.riskRewardRatio})</div>
        </div>
      </div>

      {/* Interactive Quick Profit Calculator */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            Máy Tính Ước Lượng Lợi Nhuận / Rủi Ro
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Quy mô vị thế: ${(capitalUsd * leverage).toLocaleString()} USDT
          </span>
        </div>

        {/* Input sliders & controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Vốn */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Vốn giao dịch (USDT):</span>
              <span className="font-mono text-white">${capitalUsd}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="50"
                max="5000"
                step="50"
                value={capitalUsd}
                onChange={(e) => setCapitalUsd(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
            <div className="flex gap-1.5 mt-1.5">
              {[100, 300, 500, 1000, 2000].map((v) => (
                <button
                  key={v}
                  onClick={() => setCapitalUsd(v)}
                  className={`text-[10px] px-2 py-0.5 rounded font-mono transition-colors ${
                    capitalUsd === v
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ${v}
                </button>
              ))}
            </div>
          </div>

          {/* Đòn bẩy */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Chế độ / Đòn bẩy:</span>
              <span className="font-mono text-white">{leverage === 1 ? 'Spot (1x)' : `Futures (${leverage}x)`}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 3, 5, 10].map((lev) => (
                <button
                  key={lev}
                  onClick={() => setLeverage(lev)}
                  className={`text-xs py-1.5 rounded-md font-mono font-medium transition-colors ${
                    leverage === lev
                      ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-300'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {lev === 1 ? 'Spot 1x' : `${lev}x`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result profit outcomes */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center font-mono">
          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg py-2 px-1">
            <div className="text-[10px] text-emerald-400/90 font-sans">Lãi chạm TP1</div>
            <div className="text-xs sm:text-sm font-bold text-emerald-400 mt-0.5">
              +${tp1ProfitUsd.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400 font-sans">
              ~{(tp1ProfitUsd * 25400).toLocaleString('vi-VN')} đ
            </div>
          </div>

          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg py-2 px-1">
            <div className="text-[10px] text-emerald-300 font-sans">Lãi chạm TP2</div>
            <div className="text-xs sm:text-sm font-bold text-emerald-300 mt-0.5">
              +${tp2ProfitUsd.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400 font-sans">
              ~{(tp2ProfitUsd * 25400).toLocaleString('vi-VN')} đ
            </div>
          </div>

          <div className="bg-rose-950/20 border border-rose-500/20 rounded-lg py-2 px-1">
            <div className="text-[10px] text-rose-400/90 font-sans">Rủi ro nếu dính SL</div>
            <div className="text-xs sm:text-sm font-bold text-rose-400 mt-0.5">
              -${slLossUsd.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400 font-sans">
              ~{(slLossUsd * 25400).toLocaleString('vi-VN')} đ
            </div>
          </div>
        </div>
      </div>

      {/* Scalper Pre-Flight Checklist */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300">5 Tiêu Chí Đánh Giá Xu Hướng Tăng:</span>
          <span className="text-[11px] flex items-center gap-1 text-slate-400">
            <HelpCircle className="h-3 w-3" />
            Tối thiểu 3/5 để vào lệnh an toàn
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {criteria.map((item, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 p-2 rounded-lg border ${
                item.passed
                  ? 'bg-slate-900/40 border-slate-800 text-slate-200'
                  : 'bg-slate-950/30 border-slate-800/60 text-slate-400'
              }`}
            >
              {item.passed ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-medium text-slate-200">{item.label}</span>
                  <span className="text-[10px] text-slate-400">{item.priority}</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
