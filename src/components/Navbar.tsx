import React from 'react';
import { Volume2, VolumeX, RefreshCw, Zap, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'ALL' | 'POTENTIAL' | 'STRONG_BUY' | 'BREAKOUT' | 'UPTREND_ONLY' | 'WATCHLIST';
  onSelectTab: (tab: 'ALL' | 'POTENTIAL' | 'STRONG_BUY' | 'BREAKOUT' | 'UPTREND_ONLY' | 'WATCHLIST') => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  watchlistCount: number;
  spikeCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  isSoundEnabled,
  onToggleSound,
  onRefresh,
  isRefreshing,
  watchlistCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0b0f19]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-3">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single clean brand title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Zap className="h-4 w-4" />
            </span>
            <span className="text-base lg:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              CryptoVol
              <span className="text-xs font-normal text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Coin Tiềm Năng
              </span>
            </span>
          </div>
        </div>

        {/* Zone 2: Focused Filter Tabs */}
        <nav className="hidden sm:flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          <button
            onClick={() => onSelectTab('ALL')}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tất Cả Tiềm Năng
          </button>
          <button
            onClick={() => onSelectTab('POTENTIAL')}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'POTENTIAL'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Lãi Cao Nhất (&gt; 5%)
          </button>
          <button
            onClick={() => onSelectTab('STRONG_BUY')}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors whitespace-nowrap ${
              activeTab === 'STRONG_BUY'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            MUA NGAY ⚡
          </button>
          <button
            onClick={() => onSelectTab('WATCHLIST')}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'WATCHLIST'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Yêu Thích</span>
            {watchlistCount > 0 && (
              <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded text-[10px] font-mono">
                {watchlistCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2">
          {/* Sound Alert Toggle */}
          <button
            onClick={onToggleSound}
            title={isSoundEnabled ? 'Tắt âm báo' : 'Bật âm báo'}
            className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs ${
              isSoundEnabled
                ? 'bg-slate-800 border-slate-700 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            {isSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Làm mới danh sách"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
