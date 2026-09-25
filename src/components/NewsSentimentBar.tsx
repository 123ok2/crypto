import React, { useState } from 'react';
import { 
  CURRENT_MACRO_SENTIMENT, 
  INITIAL_NEWS_ITEMS, 
  CryptoNewsItem 
} from '../services/marketNews';
import { 
  Newspaper, 
  Globe2, 
  ShieldCheck, 
  ChevronRight, 
  X,
  ExternalLink,
  Flame,
  ArrowUpRight
} from 'lucide-react';

interface NewsSentimentBarProps {
  onSelectAsset?: (symbol: string) => void;
}

export const NewsSentimentBar: React.FC<NewsSentimentBarProps> = ({ onSelectAsset }) => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [activeNews, setActiveNews] = useState<CryptoNewsItem>(INITIAL_NEWS_ITEMS[0]);

  const sentiment = CURRENT_MACRO_SENTIMENT;

  return (
    <>
      {/* Top Banner Ticker */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Macro Indices Strip */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <Globe2 className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-[11px] text-slate-400">Tâm Lý Thị Trường:</span>
            <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 rounded text-[11px]">
              {sentiment.fearAndGreedIndex} · {sentiment.sentimentLabel}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <span>ETF Ròng:</span>
            <span className="text-emerald-400 font-bold">{sentiment.etfNetInflowUsd}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <span>BTC.D:</span>
            <span className="text-slate-200 font-bold">{sentiment.btcDominance}%</span>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-slate-400 text-[11px]">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-300 font-medium">Bảo Vệ Vốn (Capital Shield): Kích Hoạt</span>
          </div>
        </div>

        {/* Right: Latest News Snippet Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpenModal(true)}
            className="flex items-center gap-2 text-left hover:text-white transition-colors group"
          >
            <span className="flex items-center gap-1 text-[11px] text-amber-400 font-bold bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded">
              <Newspaper className="h-3 w-3" />
              TIN NÓNG
            </span>
            <span className="text-slate-300 truncate max-w-[240px] sm:max-w-[340px] text-[11px] font-medium group-hover:text-emerald-300">
              {activeNews.title}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </div>

      {/* News Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-emerald-400" />
                <h3 className="font-bold text-white text-base">
                  Bản Tin Dòng Tiền & Xúc Tác Thị Trường
                </h3>
              </div>
              <button
                onClick={() => setIsOpenModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 divide-y divide-slate-800/60">
              {INITIAL_NEWS_ITEMS.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.sentiment === 'BULLISH'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {item.sentiment === 'BULLISH' ? 'TÍCH CỰC CHO GIÁ' : 'THEO DÕI RỦI RO'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {item.source} · {item.timeAgo}
                      </span>
                    </div>

                    {/* Affected assets */}
                    <div className="flex items-center gap-1">
                      {item.affectedAssets.map((asset) => (
                        <button
                          key={asset}
                          onClick={() => {
                            if (onSelectAsset) {
                              onSelectAsset(`${asset}USDT`);
                              setIsOpenModal(false);
                            }
                          }}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white text-[10px] font-mono font-bold transition-colors"
                        >
                          {asset} →
                        </button>
                      ))}
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold text-white leading-snug">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                    {item.summary}
                  </p>

                  {item.riskNotice && (
                    <div className="text-[11px] text-amber-300/90 bg-amber-950/30 border border-amber-800/40 p-2 rounded flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                      <span>{item.riskNotice}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
              <span>Hệ thống tự động đồng bộ tin tức với thuật toán Quant</span>
              <button
                onClick={() => setIsOpenModal(false)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              >
                Đã Hiểu & Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
