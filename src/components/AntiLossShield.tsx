import React, { useState } from 'react';
import { CryptoTicker, KlineCandle } from '../types/crypto';
import { generateQuantTradePlan, QuantTradePlan } from '../services/quantEngine';
import { priceDecimals } from '../services/binanceApi';
import { 
  ShieldCheck, 
  Target, 
  AlertOctagon, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Compass, 
  Percent, 
  DollarSign,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AntiLossShieldProps {
  coin: CryptoTicker;
  klines: KlineCandle[];
}

export const AntiLossShield: React.FC<AntiLossShieldProps> = ({ coin, klines }) => {
  const [userPortfolio, setUserPortfolio] = useState<number>(1000);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const plan: QuantTradePlan = generateQuantTradePlan(coin, klines, userPortfolio);

  const formatPrice = (p: number) => {
    return p.toLocaleString(undefined, {
      minimumFractionDigits: priceDecimals(p),
      maximumFractionDigits: priceDecimals(p)
    });
  };

  return (
    <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl overflow-hidden shadow-lg">
      {/* Header Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border-b border-slate-800/80 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                Thuật Toán Quant Tối Ưu Lợi Nhuận & Chống Thua Lỗ
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.2 rounded text-[10px] font-mono font-bold">
                {plan.strategyBadge}
              </span>
            </div>
            <h3 className="text-sm lg:text-base font-bold text-white flex items-center gap-2">
              Phương Án Tự Động Cho {coin.baseAsset}
              <span className="text-xs text-slate-400 font-normal font-sans">
                (Điểm an toàn: <span className="text-emerald-400 font-mono font-bold">{plan.safetyScore}/100</span>)
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="text-slate-400 hover:text-white p-1">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 lg:p-5 space-y-5 text-xs">
          {/* Step-by-Step Execution Playbook */}
          <div>
            <div className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-emerald-400" />
              Quy Trình 4 Bước Đã Tối Ưu Hóa (Vào Lệnh - Dời SL Hòa Vốn - Chốt Lời)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Step 1: Entry */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1 relative">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span className="font-bold text-blue-400">BƯỚC 1: VÙNG MUA</span>
                  <span className="h-5 w-5 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-[10px]">1</span>
                </div>
                <div className="text-sm font-bold font-mono text-white">
                  ${formatPrice(plan.entryZone.idealPrice)}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  {plan.entryZone.instruction}
                </div>
              </div>

              {/* Step 2: Break-Even Stop Trigger (Chống thua lỗ tuyệt đối) */}
              <div className="bg-slate-950/60 border border-emerald-500/30 rounded-xl p-3 space-y-1 relative ring-1 ring-emerald-500/20">
                <div className="flex items-center justify-between text-emerald-400 text-[11px]">
                  <span className="font-bold flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    BƯỚC 2: KHÓA HÒA VỐN
                  </span>
                  <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[10px]">2</span>
                </div>
                <div className="text-sm font-bold font-mono text-emerald-300">
                  ${formatPrice(plan.breakEvenTrigger.price)} (+1.5%)
                </div>
                <div className="text-[10px] text-emerald-400/90 leading-tight">
                  {plan.breakEvenTrigger.instruction} Kéo SL về giá mua để triệt tiêu 100% rủi ro!
                </div>
              </div>

              {/* Step 3: Take Profit Tranches */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1 relative">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span className="font-bold text-emerald-400">BƯỚC 3: CHỐT LỜI TP1 / TP2</span>
                  <span className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">3</span>
                </div>
                <div className="text-sm font-bold font-mono text-emerald-400">
                  TP1: ${formatPrice(plan.takeProfitLevels.tp1.price)} (+{plan.takeProfitLevels.tp1.percent}%)
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  TP2: ${formatPrice(plan.takeProfitLevels.tp2.price)} (+{plan.takeProfitLevels.tp2.percent}%). Bán từng phần để tối đa lợi nhuận.
                </div>
              </div>

              {/* Step 4: Strict Stop Loss (ATR Adjusted) */}
              <div className="bg-slate-950/60 border border-rose-500/20 rounded-xl p-3 space-y-1 relative">
                <div className="flex items-center justify-between text-rose-400 text-[11px]">
                  <span className="font-bold">BƯỚC 4: CẮT LỖ (ATR SL)</span>
                  <span className="h-5 w-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-[10px]">4</span>
                </div>
                <div className="text-sm font-bold font-mono text-rose-400">
                  ${formatPrice(plan.stopLossStrict.price)} (-{plan.stopLossStrict.percent}%)
                </div>
                <div className="text-[10px] text-rose-400/80 leading-tight">
                  Đặt lệnh Stop-Market cứng dưới biên độ dao động ATR (${plan.stopLossStrict.atrBuffer}).
                </div>
              </div>
            </div>
          </div>

          {/* Position Sizing & Capital Allocation Calculator */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                Quản Trị Rủi Ro Chuẩn Quỹ Đầu Tư (Quy Tắc Rủi Ro Tối Đa 1.5% Vốn)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Bảo vệ tài khoản không bao giờ bị cháy
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Tổng vốn giao dịch của bạn (USDT):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="100"
                    max="100000"
                    step="100"
                    value={userPortfolio}
                    onChange={(e) => setUserPortfolio(Math.max(50, Number(e.target.value)))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Recommended size */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
                <div className="text-[10px] text-slate-400">Khối lượng vào lệnh tối ưu khuyên dùng:</div>
                <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                  ${plan.recommendedPositionSizeUsd.toLocaleString()} USDT
                </div>
                <div className="text-[10px] text-slate-400">
                  (~{Math.round((plan.recommendedPositionSizeUsd / userPortfolio) * 100)}% tổng vốn)
                </div>
              </div>

              {/* Max Risk Amount */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
                <div className="text-[10px] text-slate-400">Thua lỗ tối đa nếu dính SL:</div>
                <div className="text-sm font-bold font-mono text-rose-400 mt-0.5">
                  -${(userPortfolio * 0.015).toFixed(1)} USDT
                </div>
                <div className="text-[10px] text-rose-400/80">
                  (Đúng 1.5% vốn, tuyệt đối không ảnh hưởng tới tâm lý)
                </div>
              </div>
            </div>
          </div>

          {/* Execution Checklist & Warning Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Checklist */}
            <div className="space-y-2">
              <div className="font-bold text-slate-300 text-xs">
                Kiểm Tra Điều Kiện Kích Hoạt Lệnh:
              </div>
              <div className="space-y-1.5">
                {plan.executionChecklist.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-2 rounded-lg bg-slate-950/40 border border-slate-800 flex items-start gap-2"
                  >
                    {item.status === 'PASS' ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-medium text-slate-200 text-[11px]">{item.condition}</div>
                      <div className="text-[10px] text-slate-400">{item.explanation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3 Golden Anti-Loss Rules */}
            <div className="space-y-2">
              <div className="font-bold text-amber-300 text-xs flex items-center gap-1">
                <AlertOctagon className="h-3.5 w-3.5 text-amber-400" />
                3 Quy Tắc Sắt Giúp Bạn Ít Bị Thua Lỗ Nhất:
              </div>
              <div className="space-y-1.5">
                {plan.antiLossWarnings.map((rule, idx) => (
                  <div 
                    key={idx} 
                    className="p-2 rounded-lg bg-amber-950/20 border border-amber-800/40 text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2"
                  >
                    <span className="font-mono font-bold text-amber-400 shrink-0">#{idx + 1}</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
