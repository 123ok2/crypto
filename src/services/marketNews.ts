export interface CryptoNewsItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  impactCategory: 'MACRO' | 'WHALE' | 'CATALYST' | 'ETF';
  affectedAssets: string[];
  summary: string;
  riskNotice?: string;
}

export interface MacroSentiment {
  fearAndGreedIndex: number;
  sentimentLabel: 'Cực Kỳ Tham Lam' | 'Tham Lam' | 'Trung Lập' | 'Sợ Hãi' | 'Cực Kỳ Sợ Hãi';
  btcDominance: number;
  etfNetInflowUsd: string;
  whaleAccumulationTrend: 'MUA_GOM_MANH' | 'ON_DINH' | 'XA_HANG';
  capitalShieldStatus: 'AN_TOAN' | 'CAN_THAN' | 'RUI_RO_CAO';
}

export const CURRENT_MACRO_SENTIMENT: MacroSentiment = {
  fearAndGreedIndex: 68,
  sentimentLabel: 'Tham Lam',
  btcDominance: 57.4,
  etfNetInflowUsd: '+$428.5M',
  whaleAccumulationTrend: 'MUA_GOM_MANH',
  capitalShieldStatus: 'AN_TOAN'
};

export const INITIAL_NEWS_ITEMS: CryptoNewsItem[] = [
  {
    id: 'news-1',
    title: 'Dòng vốn ròng Spot ETF Bitcoin & Ethereum tiếp tục dương $428M trong 24h qua',
    source: 'Bloomberg Crypto',
    timeAgo: '12 phút trước',
    sentiment: 'BULLISH',
    impactCategory: 'ETF',
    affectedAssets: ['BTC', 'ETH'],
    summary: 'Dòng tiền tổ chức từ phố Wall gia tăng giải ngân vào nhóm coin vốn hóa lớn, tạo lực đỡ vững chắc cho toàn bộ thị trường Altcoin.'
  },
  {
    id: 'news-2',
    title: 'Cá mập vừa gom hơn 45,000 SOL và rút khỏi sàn giao dịch tập trung',
    source: 'Whale Alert',
    timeAgo: '28 phút trước',
    sentiment: 'BULLISH',
    impactCategory: 'WHALE',
    affectedAssets: ['SOL'],
    summary: 'Áp lực bán trên sàn giảm mạnh khi các ví lớn chuyển tài sản về ví lạnh staking, dự báo xu hướng khan hiếm nguồn cung ngắn hạn.'
  },
  {
    id: 'news-3',
    title: 'Hệ sinh thái Sui & Aptos ghi nhận TVL tăng trưởng kỷ lục trong quý',
    source: 'DefiLlama News',
    timeAgo: '45 phút trước',
    sentiment: 'BULLISH',
    impactCategory: 'CATALYST',
    affectedAssets: ['SUI', 'APT'],
    summary: 'Lượng giao dịch on-chain bùng nổ, khối lượng DEX tăng hơn 250% là động lực cốt lõi thúc đẩy các đợt nổ volume.'
  },
  {
    id: 'news-4',
    title: 'Fed phát tín hiệu chu kỳ hạ lãi suất thuận lợi cho tài sản rủi ro',
    source: 'Reuters Financial',
    timeAgo: '1 giờ trước',
    sentiment: 'BULLISH',
    impactCategory: 'MACRO',
    affectedAssets: ['BTC', 'ETH', 'SOL', 'NEAR'],
    summary: 'Thanh khoản thị trường toàn cầu mở rộng, môi trường lãi suất giảm hỗ trợ đắc lực cho các chiến lược lướt sóng ngắn hạn.'
  },
  {
    id: 'news-5',
    title: 'Cảnh báo: Lịch mở khóa token (Token Unlock) tuần tới của một số Altcoin vốn hóa nhỏ',
    source: 'TokenUnlocks',
    timeAgo: '2 giờ trước',
    sentiment: 'NEUTRAL',
    impactCategory: 'CATALYST',
    affectedAssets: ['ARB', 'OP'],
    riskNotice: 'Hệ thống đã tự động lọc bớt các đồng coin chịu áp lực pha loãng để tránh rủi ro cho người dùng.',
    summary: 'Thuật toán Quản Trị Rủi Ro sẽ đánh dấu cảnh báo nếu bạn mở lệnh vào các đồng coin sắp đối mặt đợt unlock lớn.'
  }
];
