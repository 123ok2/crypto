import React from 'react';
import { VolumeAlert, CryptoTicker } from '../types/crypto';
import { Bell, Flame, TrendingUp, Sparkles, ChevronRight, Trash2 } from 'lucide-react';

interface LiveAlertFeedProps {
  alerts: VolumeAlert[];
  onSelectSymbol: (symbol: string) => void;
  onClearAlerts: () => void;
  selectedCoin: CryptoTicker;
}

export const LiveAlertFeed: React.FC<LiveAlertFeedProps> = ({
  alerts,
  onSelectSymbol,
  onClearAlerts,
  selectedCoin
}) => {
  const formatTime = (ts: number) => {
    const diffSeconds = Math.max(1, Math.floor((Date.now() - ts) / 1000));
    if (diffSeconds < 60) return `${diffSeconds}s trước`;
    const mins = Math.floor(diffSeconds / 60);
    return `${mins}m trước`;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5 text-emerald-400" />
            Nhật Ký Đột Biến Real-Time
          </span>
          <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">
            {alerts.length}
          </span>
        </div>

        {alerts.length > 0 && (
          <button
            onClick={onClearAlerts}
            title="Xóa danh sách cảnh báo"
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Alert Feed Items */}
      <div className="divide-y divide-slate-800/50 overflow-y-auto max-h-[380px] p-2 space-y-1.5">
        {alerts.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 space-y-1">
            <Sparkles className="h-5 w-5 text-slate-400 mx-auto mb-2" />
            <p>Đang lắng nghe thị trường...</p>
            <p className="text-[11px] text-slate-400">Hệ thống sẽ tự động bắt các tín hiệu bứt phá volume và báo động tại đây.</p>
          </div>
        ) : (
          alerts.slice(0, 15).map((alert) => {
            const isCurrent = selectedCoin.symbol === alert.symbol;
            return (
              <button
                key={alert.id}
                onClick={() => onSelectSymbol(alert.symbol)}
                className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start justify-between gap-2 text-xs group ${
                  isCurrent
                    ? 'bg-slate-800/90 border border-emerald-500/40 shadow-xs'
                    : 'bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/40'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono flex items-center gap-1">
                      {alert.symbol.replace('USDT', '')}
                      <span className="text-[10px] font-normal text-slate-400">/USDT</span>
                    </span>
                    <span className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold flex items-center gap-0.5">
                      <Flame className="h-2.5 w-2.5 text-amber-400" />
                      {alert.multiplier.toFixed(1)}x Vol
                    </span>
                    <span className={`text-[11px] font-mono font-bold ${
                      alert.priceChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {alert.priceChangePercent >= 0 ? '+' : ''}{alert.priceChangePercent.toFixed(1)}%
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {alert.message}
                  </p>

                  <div className="text-[10px] text-slate-400 font-mono">
                    {formatTime(alert.timestamp)}
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
