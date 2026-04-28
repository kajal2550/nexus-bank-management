import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CreditCard, Send, History, Wallet,
  Settings, LogOut, Bell, ShieldAlert, ArrowUpRight, ArrowDownRight, QrCode,
  TrendingUp, BarChart3, Gift, ShieldCheck, UserCog, Briefcase, FileText, Smartphone, Lightbulb,
  CheckCircle2, Loader2, AlertCircle, AlertTriangle, Target, Calendar, Sun, Moon, Zap, Plus, Search, X, ArrowLeft, BrainCircuit, Fingerprint, ScanLine, LockKeyhole, Bot, SendHorizontal, Mic, MicOff,
  Activity, Cpu, ArrowRight, Coins,
  Globe, Database, ShoppingBag, Coffee, Plane, Play, UserCheck, Utensils, BarChart as BarChartIcon, MapPin,
  Maximize, Camera
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, LineChart, Line, XAxis, CartesianGrid, BarChart, Bar
} from 'recharts';

const API_BASE_URL = 'http://localhost:5000/api';
const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f43f5e', '#f59e0b'];

// --- TRANSLATIONS ---
const translations = {
  en: {
    dashboard: "Dashboard Overview",
    proAccount: "PRO ACCOUNT",
    home: "Home",
    accounts: "Accounts",
    transactions: "Transactions",
    upiPay: "UPI & Pay",
    cards: "Cards",
    loans: "Loans",
    investments: "Investments",
    rewards: "Rewards",
    analytics: "Analytics",
    security: "Security",
    settings: "Settings",
    signOut: "Sign Out",
    search: "Search Nexus...",
    balance: "Core Balance",
    points: "Nexus Points",
    spending: "Total Spending",
    kyc: "KYC Verified"
  },
  hi: {
    dashboard: "डैशबोर्ड अवलोकन",
    proAccount: "प्रो अकाउंट",
    home: "होम",
    accounts: "खाते",
    transactions: "लेन-देन",
    upiPay: "यूपीआई और भुगतान",
    cards: "कार्ड्स",
    loans: "ऋण (लोन)",
    investments: "निवेश",
    rewards: "पुरस्कार",
    analytics: "विश्लेषण",
    security: "सुरक्षा",
    settings: "सेटिंग्स",
    signOut: "साइन आउट",
    search: "नेक्सस खोजें...",
    balance: "मुख्य बैलेंस",
    points: "नेक्सस पॉइंट्स",
    spending: "कुल खर्च",
    kyc: "केवाईसी प्रमाणित"
  }
};

// --- GLOBAL CONTEXT FOR MOCK DATA ---
const AppContext = createContext();

// --- MAIN APP COMPONENT ---
function App() {
  return (
    <BrowserRouter>
      <MainRouter />
    </BrowserRouter>
  );
}

// --- ROUTER COMPONENT ---
function MainRouter() {
  const [token, setToken] = useState(localStorage.getItem('jwtToken') || '');
  const navigate = useNavigate();

  // Global Mock State
  const [theme, setTheme] = useState(localStorage.getItem('nexus_theme') || 'dark');
  const [balance, setBalance] = useState(0);
  const [goldWeight, setGoldWeight] = useState(0);
  const [ppfBalance, setPpfBalance] = useState(0);
  const [dematValue, setDematValue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [points, setPoints] = useState(0);
  const [isKycVerified, setIsKycVerified] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const [loadingData, setLoadingData] = useState(true);
  const [lang, setLang] = useState(localStorage.getItem('nexus_lang') || 'en');
  const [showScanner, setShowScanner] = useState(false);
  const [showMyQR, setShowMyQR] = useState(false);
  const [showKyc, setShowKyc] = useState(false);
  const [kycStep, setKycStep] = useState(0);

  const t = (key) => translations[lang][key] || key;

  useEffect(() => {
    localStorage.setItem('nexus_lang', lang);
  }, [lang]);

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 2000);
  };

  useEffect(() => {
    localStorage.setItem('nexus_theme', theme);
  }, [theme]);

  const [livePrices, setLivePrices] = useState({ btc: 64200, eth: 3250, sol: 145 });

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
        if (res.data) {
          setLivePrices({
            btc: res.data.bitcoin.usd,
            eth: res.data.ethereum.usd,
            sol: res.data.solana.usd
          });
        }
      } catch (err) {
        console.error('Market data sync failed, using fallback.');
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sync state to backend automatically
  useEffect(() => {
    if (token && !loadingData) {
      const delay = setTimeout(() => {
        axios.post(`${API_BASE_URL}/user/update`, {
          balance,
          goldWeight,
          ppfBalance,
          dematValue,
          points,
          theme,
          isKycVerified,
          transactions
        }).catch(err => console.error('Error syncing data:', err));
      }, 1000);
      return () => clearTimeout(delay);
    }
  }, [balance, goldWeight, ppfBalance, dematValue, points, theme, isKycVerified, transactions, token, loadingData]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('jwtToken', token);

      // --- DEMO MODE: Skip backend, load mock data ---
      const isDemoMode = token.startsWith('DEMO_MODE_TOKEN_');
      if (isDemoMode) {
        setBalance(125000.00);
        setGoldWeight(2.450);
        setPpfBalance(50000);
        setDematValue(75000);
        setPoints(4820);
        setIsKycVerified(false);
        setTransactions([
          { id: '1', date: 'Apr 27, 2026', desc: 'Salary Credit - Tech Corp', cat: 'Income', stat: 'Success', amt: 85000 },
          { id: '2', date: 'Apr 27, 2026', desc: 'Amazon.in Shopping', cat: 'Shopping', stat: 'Success', amt: -3299 },
          { id: '3', date: 'Apr 26, 2026', desc: 'Netflix Subscription', cat: 'Bills', stat: 'Success', amt: -649 },
          { id: '4', date: 'Apr 26, 2026', desc: 'Zomato: Dinner Order', cat: 'Food', stat: 'Success', amt: -850 },
          { id: '5', date: 'Apr 25, 2026', desc: 'UPI Transfer - Alice', cat: 'Transfer', stat: 'Success', amt: -5000 },
          { id: '6', date: 'Apr 25, 2026', desc: 'Starbucks Coffee', cat: 'Food', stat: 'Success', amt: -450 },
          { id: '7', date: 'Apr 24, 2026', desc: 'Apple iCloud Storage', cat: 'Bills', stat: 'Success', amt: -75 },
          { id: '8', date: 'Apr 24, 2026', desc: 'Shell Petrol Pump', cat: 'Bills', stat: 'Success', amt: -2500 },
          { id: '9', date: 'Apr 23, 2026', desc: 'Investment - SIP Index Fund', cat: 'Investment', stat: 'Success', amt: -10000 },
          { id: '10', date: 'Apr 23, 2026', desc: 'Nexus Points Redemption', cat: 'Income', stat: 'Success', amt: 500 },
          { id: '11', date: 'Apr 22, 2026', desc: 'Urban Company Service', cat: 'Shopping', stat: 'Success', amt: -1200 },
          { id: '12', date: 'Apr 22, 2026', desc: 'Rent Payment - May', cat: 'Bills', stat: 'Success', amt: -25000 },
          { id: '13', date: 'Apr 21, 2026', desc: 'BigBasket Grocery', cat: 'Shopping', stat: 'Success', amt: -3400 },
          { id: '14', date: 'Apr 21, 2026', desc: 'Steam Games Purchase', cat: 'Entertainment', stat: 'Success', amt: -1499 },
          { id: '15', date: 'Apr 20, 2026', desc: 'Uber Ride - Office', cat: 'Travel', stat: 'Success', amt: -350 },
          { id: '16', date: 'Apr 20, 2026', desc: 'Dividend Credit - Reliance', cat: 'Income', stat: 'Success', amt: 1250 },
          { id: '17', date: 'Apr 19, 2026', desc: 'Swiggy: Lunch', cat: 'Food', stat: 'Success', amt: -420 },
          { id: '18', date: 'Apr 19, 2026', desc: 'Pharmacy - Apollo', cat: 'Health', stat: 'Success', amt: -890 },
          { id: '19', date: 'Apr 18, 2026', desc: 'PVR Cinemas - Movie', cat: 'Entertainment', stat: 'Success', amt: -1100 },
          { id: '20', date: 'Apr 18, 2026', desc: 'Gym Membership Fee', cat: 'Health', stat: 'Success', amt: -2000 },
          { id: '21', date: 'Apr 17, 2026', desc: 'Airtel Broadband Bill', cat: 'Bills', stat: 'Success', amt: -999 },
          { id: '22', date: 'Apr 17, 2026', desc: 'Flipkart - Electronics', cat: 'Shopping', stat: 'Success', amt: -12500 },
          { id: '23', date: 'Apr 16, 2026', desc: 'Freelance Payout - UX', cat: 'Income', stat: 'Success', amt: 15000 },
          { id: '24', date: 'Apr 16, 2026', desc: 'BlueTokai Coffee', cat: 'Food', stat: 'Success', amt: -320 },
          { id: '25', date: 'Apr 15, 2026', desc: 'Tata Power Bill', cat: 'Bills', stat: 'Success', amt: -3450 },
          { id: '26', date: 'Apr 15, 2026', desc: 'Myntra - Clothes', cat: 'Shopping', stat: 'Success', amt: -2100 },
          { id: '27', date: 'Apr 14, 2026', desc: 'Mutual Fund Switch', cat: 'Investment', stat: 'Success', amt: -5000 },
          { id: '28', date: 'Apr 14, 2026', desc: 'BookMyShow', cat: 'Entertainment', stat: 'Success', amt: -450 },
          { id: '29', date: 'Apr 13, 2026', desc: 'H&M Shopping', cat: 'Shopping', stat: 'Success', amt: -4500 },
          { id: '30', date: 'Apr 13, 2026', desc: 'Uber Ride - Home', cat: 'Travel', stat: 'Success', amt: -380 },
          { id: '31', date: 'Apr 12, 2026', desc: 'Refund - Amazon', cat: 'Income', stat: 'Success', amt: 1200 },
          { id: '32', date: 'Apr 12, 2026', desc: 'Dominos Pizza', cat: 'Food', stat: 'Success', amt: -1250 },
          { id: '33', date: 'Apr 11, 2026', desc: 'Google Play Subscription', cat: 'Bills', stat: 'Success', amt: -150 },
          { id: '34', date: 'Apr 11, 2026', desc: 'Society Maintenance', cat: 'Bills', stat: 'Success', amt: -4500 },
          { id: '35', date: 'Apr 10, 2026', desc: 'Stock Profit Booking', cat: 'Income', stat: 'Success', amt: 7200 },
          { id: '36', date: 'Apr 10, 2026', desc: 'Nike Shoes Store', cat: 'Shopping', stat: 'Success', amt: -8500 },
          { id: '37', date: 'Apr 09, 2026', desc: 'Spotify Premium', cat: 'Bills', stat: 'Success', amt: -129 },
          { id: '38', date: 'Apr 09, 2026', desc: 'McDonalds Order', cat: 'Food', stat: 'Success', amt: -650 },
          { id: '39', date: 'Apr 08, 2026', desc: 'Credit Card Payment', cat: 'Bills', stat: 'Success', amt: -15000 },
          { id: '40', date: 'Apr 08, 2026', desc: 'Gift for Family', cat: 'Shopping', stat: 'Success', amt: -3000 },
        ]);
        setLoadingData(false);
        return;
      }

      // --- REAL MODE: Fetch from backend ---
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get(`${API_BASE_URL}/user/data`).then(res => {
        const { user, transactions: txs } = res.data;
        setBalance(user.balance);
        setGoldWeight(user.goldWeight);
        setPpfBalance(user.ppfBalance);
        setDematValue(user.dematValue);
        setPoints(user.points);
        setIsKycVerified(user.isKycVerified);
        if (user.theme) setTheme(user.theme);
        setTransactions(txs.map(t => ({ ...t, id: t._id })));
        setLoadingData(false);
      }).catch(err => {
        console.error('Error fetching user data:', err);
        if (err.response?.status === 401) {
          setToken('');
        }
        setLoadingData(false);
      });
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('nexus_demo_mode');
      setLoadingData(false);
      navigate('/auth');
    }
  }, [token, navigate]);

  if (loadingData && token) return <div className="h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>;
  if (!token) return <AuthScreen setToken={setToken} />;

  return (
    <AppContext.Provider value={{
      balance, setBalance,
      goldWeight, setGoldWeight,
      ppfBalance, setPpfBalance,
      dematValue, setDematValue,
      transactions, setTransactions,
      points, setPoints,
      isKycVerified, setIsKycVerified,
      showToast, theme, setTheme, lang, setLang, t,
      livePrices,
      showScanner, setShowScanner,
      showMyQR, setShowMyQR,
      showKyc, setShowKyc,
      kycStep, setKycStep
    }}>
      {theme === 'light' && (
        <style>{`
          html { filter: invert(1) hue-rotate(180deg); background: white; }
          img, video, iframe, .recharts-surface { filter: invert(1) hue-rotate(180deg); }
        `}</style>
      )}
      <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
        <Sidebar setToken={setToken} />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <TopNav />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

          <main className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar">
            {toast.show && (
              <div className={`fixed top-24 right-8 px-10 py-5 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] z-[2000] flex items-center gap-6 animate-in slide-in-from-right-20 fade-in duration-500 border border-white/20 backdrop-blur-3xl ${toast.type === 'error' ? 'bg-rose-950/90 border-rose-500/50' : 'bg-emerald-950/90 border-emerald-500/50'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${toast.type === 'error' ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-emerald-500 text-white shadow-emerald-500/30'} animate-pulse`}>
                  {toast.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-0.5">{toast.type === 'success' ? 'Protocol Success' : 'System Alert'}</span>
                  <span className="font-black text-white text-sm tracking-tight">{toast.msg}</span>
                </div>
              </div>
            )}

            <Routes>
              <Route path="/" element={<DashboardView />} />
              <Route path="/accounts" element={<AccountsView />} />
              <Route path="/transactions" element={<TransactionsView />} />
              <Route path="/upi" element={<UpiView />} />
              <Route path="/cards" element={<CardsView />} />
              <Route path="/loans" element={<LoansView />} />
              <Route path="/investments" element={<InvestmentsView />} />
              <Route path="/rewards" element={<RewardsView />} />
              <Route path="/analytics" element={<AnalyticsView />} />
              <Route path="/security" element={<SecurityView />} />
              <Route path="/admin" element={<AdminView />} />
              <Route path="/settings" element={<SettingsView />} />
            </Routes>
          </main>
        </div>
      </div>
      <NexusAssistant />

      {/* --- GLOBAL QR MODALS --- */}
      {showMyQR && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-3xl z-[500] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.1)] animate-in zoom-in-95 duration-500 border border-slate-200">
            <div className="p-10 text-center">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white"><QrCode size={16} /></div>
                  <span className="text-slate-950 font-black text-xl tracking-tighter">Nexus Pay</span>
                </div>
                <button onClick={() => setShowMyQR(false)} className="text-slate-400 hover:text-slate-950 transition-all"><X size={24} /></button>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] mb-8 relative group border border-slate-100 shadow-inner">
                <img
                  src="/nexus_qr.png"
                  alt="My QR"
                  className="w-full aspect-square object-contain relative z-10"
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-slate-950 font-black text-2xl tracking-tight">Kajal Kumari</h4>
                <p className="text-slate-500 text-sm font-bold tracking-widest opacity-60">KAJAL7295I@NEXUS</p>
              </div>

              <div className="mt-10 pt-10 border-t border-slate-100 flex items-center justify-center gap-6">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo.png/1200px-UPI-Logo.png" className="h-6 object-contain" alt="UPI" />
                <div className="h-4 w-px bg-slate-200"></div>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Neural Encryption Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showScanner && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl z-[500] flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-cyan-500/30 w-full max-w-lg rounded-[4rem] overflow-hidden shadow-[0_0_150px_rgba(34,211,238,0.2)] animate-in zoom-in-95 duration-500 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

            <div className="p-12 text-center">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-500/20"><ScanLine size={20} /></div>
                  <h3 className="text-white font-black text-2xl tracking-tighter">Neural Scanner</h3>
                </div>
                <button onClick={() => setShowScanner(false)} className="text-slate-500 hover:text-white transition-all"><X size={24} /></button>
              </div>

              <div className="relative aspect-square bg-slate-950 rounded-[3rem] border border-white/5 overflow-hidden mb-12 group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#0f172a,black)]"></div>
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                <div className="absolute inset-0 flex items-center justify-center p-20">
                  <div className="w-full h-full border-2 border-cyan-500/20 rounded-3xl flex items-center justify-center relative overflow-hidden">
                    <img
                      src="/nexus_qr.png"
                      alt="Nexus QR"
                      className="w-full h-full object-contain opacity-50 group-hover:opacity-100 transition-opacity animate-pulse"
                    />
                    <div className="absolute inset-0 bg-cyan-500/5 animate-pulse rounded-3xl"></div>
                  </div>
                </div>

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.1),transparent)] pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border-2 border-cyan-500/40 rounded-[3rem] pointer-events-none">
                  <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-cyan-400 rounded-tl-[2rem]"></div>
                  <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-cyan-400 rounded-tr-[2rem]"></div>
                  <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-cyan-400 rounded-bl-[2rem]"></div>
                  <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-cyan-400 rounded-br-[2rem]"></div>
                </div>

                <div className="absolute top-0 left-0 w-full h-1.5 bg-cyan-400 shadow-[0_0_25px_#22d3ee] animate-neural-scan pointer-events-none"></div>
                <p className="absolute bottom-10 left-0 w-full text-[9px] font-black text-cyan-400/60 uppercase tracking-[0.6em] animate-pulse">Synchronizing Neural Grid...</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <button onClick={() => setShowScanner(false)} className="py-6 bg-slate-800 text-slate-500 rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-700 transition-all">Abort Sync</button>
                <button
                  onClick={() => {
                    const merchants = ['Starbucks Neural Hub', 'Cyber Cafe 2077', 'Nexus Mart', 'Tesla Supercharger'];
                    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
                    showToast(`Identity Matched: ${merchant}`, 'success');
                    setTimeout(() => {
                      setShowScanner(false);
                      const amt = Math.floor(Math.random() * 2000) + 500;
                      setBalance(p => p - amt);
                      setTransactions(p => [{ id: Date.now(), date: 'Just now', desc: `QR Pay: ${merchant}`, cat: 'Shopping', stat: 'Success', amt: -amt }, ...p]);
                      showToast(`Transaction Dispatched: ₹${amt}`, 'success');
                    }, 1500);
                  }}
                  className="py-6 bg-cyan-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-cyan-500 transition-all shadow-[0_20px_40px_rgba(34,211,238,0.2)] active:scale-95"
                >
                  Simulate Scan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
         @keyframes neural-scan {
           0% { transform: translateY(0); opacity: 0; }
           10% { opacity: 1; }
           90% { opacity: 1; }
           100% { transform: translateY(400px); opacity: 0; }
         }
         .animate-neural-scan {
           animation: neural-scan 3s infinite;
         }
      `}</style>
    </AppContext.Provider>
  );
}

// --- SIDEBAR ---
const Sidebar = ({ setToken }) => {
  const { t } = useContext(AppContext);
  const menuItems = [
    { name: t('home'), icon: <LayoutDashboard size={18} />, path: '/' },
    { name: t('accounts'), icon: <Briefcase size={18} />, path: '/accounts' },
    { name: t('transactions'), icon: <History size={18} />, path: '/transactions' },
    { name: t('upiPay'), icon: <Send size={18} />, path: '/upi' },
    { name: t('cards'), icon: <CreditCard size={18} />, path: '/cards' },
    { name: t('loans'), icon: <Wallet size={18} />, path: '/loans' },
    { name: t('investments'), icon: <TrendingUp size={18} />, path: '/investments' },
    { name: t('rewards'), icon: <Gift size={18} />, path: '/rewards' },
    { name: t('analytics'), icon: <BarChart3 size={18} />, path: '/analytics' },
    { name: t('security'), icon: <ShieldCheck size={18} />, path: '/security' },
    { name: t('settings'), icon: <Settings size={18} />, path: '/settings' },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-20">
      <div className="p-6 pb-2">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tighter">NEXUS</h1>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Super App</p>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map(item => (
          <Link key={item.name} to={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${location.pathname === item.path ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
            {item.icon}
            {item.name}
            {item.name === 'Fraud Center' && <span className="ml-auto w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <button onClick={() => setToken('')} className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors text-sm font-medium">
          <LogOut size={18} /> {t('signOut')}
        </button>
      </div>
    </div>
  );
};

// --- TOP NAV ---
const TopNav = () => {
  const [showNotif, setShowNotif] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast, theme, setTheme, transactions, lang, setLang, t, setShowKyc, isKycVerified } = useContext(AppContext);
  const navigate = useNavigate();

  const globalActions = [
    { name: 'Home Dashboard', path: '/', type: 'Page', keywords: 'home main overview' },
    { name: 'Accounts & Balances', path: '/accounts', type: 'Page', keywords: 'savings current fd rd' },
    { name: 'Transaction History', path: '/transactions', type: 'Page', keywords: 'statement passbook' },
    { name: 'UPI & Bank Transfers', path: '/upi', type: 'Page', keywords: 'send money pay neft imps qr' },
    { name: 'Virtual Cards & Limits', path: '/cards', type: 'Page', keywords: 'debit credit atm pin freeze' },
    { name: 'Apply for Loan', path: '/loans', type: 'Page', keywords: 'emi personal credit score borrow' },
    { name: 'Investments & Market', path: '/investments', type: 'Page', keywords: 'stocks sip mutual funds trading' },
    { name: 'Nexus Rewards', path: '/rewards', type: 'Page', keywords: 'points cashback offers redeem' },
    { name: 'Analytics & Budget', path: '/analytics', type: 'Page', keywords: 'chart spend track pie expenses' },
    { name: 'Security Center', path: '/security', type: 'Page', keywords: '2fa password login auth' },
    { name: 'Fraud Center (Admin)', path: '/admin', type: 'Admin', keywords: 'kyc approvals logs suspicious' },
    { name: 'App Settings', path: '/settings', type: 'Page', keywords: 'profile preferences' },
  ];

  const pageResults = globalActions.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.keywords.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const txResults = transactions.filter(t =>
    t.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.cat.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalResults = pageResults.length + txResults.length;

  return (
    <header className="h-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur-2xl flex justify-between items-center px-8 z-30 sticky top-0 shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-black text-white tracking-tight">{t('dashboard')}</h2>
        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)] uppercase tracking-widest">{t('proAccount')}</span>
        {!isKycVerified && (
          <button
            onClick={() => { navigate('/upi'); setTimeout(() => setShowKyc(true), 500); }}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[9px] font-black uppercase tracking-widest animate-pulse hover:bg-amber-500 hover:text-white transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] ml-2"
          >
            <ShieldAlert size={12} /> Verify Identity
          </button>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Language Toggle */}
        <button
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-blue-500 transition-all text-xs font-bold tracking-tighter"
        >
          <span className={lang === 'en' ? 'text-blue-400' : 'text-slate-500'}>EN</span>
          <div className="w-[1px] h-3 bg-slate-700 mx-1"></div>
          <span className={lang === 'hi' ? 'text-emerald-400' : 'text-slate-500'}>हिन्दी</span>
        </button>
        {/* Global Search Bar */}
        <div className="relative">
          <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-full px-4 py-2 w-72 focus-within:border-blue-500 transition-colors shadow-inner shadow-black/20">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search')}
              className="bg-transparent border-none outline-none text-sm text-slate-200 w-full placeholder-slate-500"
            />
          </div>

          {searchQuery && (
            <div className="absolute top-12 left-0 w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-3 bg-slate-950 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-widest flex justify-between">
                <span>Global Search</span>
                <span className="text-blue-400">{totalResults} Found</span>
              </div>
              <div className="max-h-80 overflow-y-auto custom-scrollbar">

                {pageResults.length > 0 && (
                  <div className="py-2 border-b border-slate-800">
                    <div className="px-4 py-1 text-[10px] font-bold text-blue-400 uppercase tracking-widest">Navigation & Pages</div>
                    {pageResults.map((page, i) => (
                      <div key={i} onClick={() => { setSearchQuery(''); navigate(page.path); }} className="px-4 py-3 hover:bg-slate-800/80 cursor-pointer flex justify-between items-center transition-colors group">
                        <span className="text-sm font-bold text-slate-200 group-hover:text-blue-400">{page.name}</span>
                        <span className="text-xs bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-400">{page.type}</span>
                      </div>
                    ))}
                  </div>
                )}

                {txResults.length > 0 && (
                  <div className="py-2">
                    <div className="px-4 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Transactions</div>
                    {txResults.map(tx => (
                      <div key={tx.id} onClick={() => { setSearchQuery(''); showToast(`Viewing details for: ${tx.desc}`); }} className="px-4 py-3 hover:bg-slate-800/80 cursor-pointer flex justify-between items-center transition-colors group">
                        <div>
                          <div className="text-sm font-bold text-slate-200 group-hover:text-emerald-400">{tx.desc}</div>
                          <div className="text-xs text-slate-500">{tx.cat} • {tx.date}</div>
                        </div>
                        <div className={`text-sm font-bold ₹{tx.amt > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {tx.amt > 0 ? '+' : '-'}₹{Math.abs(tx.amt).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {totalResults === 0 && (
                  <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center">
                    <span className="text-3xl mb-3 opacity-50">🔍</span>
                    No results found for "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="mt-4 text-blue-400 hover:underline">Clear Search</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <div onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="cursor-pointer p-2 rounded-full bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-amber-400 transition-colors shadow-inner shadow-black/20">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </div>

        {/* Notifications */}
        <div className="relative z-50">
          <div onClick={() => setShowNotif(!showNotif)} className={`relative cursor-pointer p-2.5 rounded-full transition-all ${showNotif ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full"></span>
          </div>

          {showNotif && (
            <div className="absolute right-0 mt-4 w-80 lg:w-96 bg-slate-900/95 backdrop-blur-3xl border border-slate-700/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4">
              <div className="p-5 border-b border-slate-800/80 flex justify-between items-center bg-slate-950/80">
                <h3 className="font-black text-slate-100 text-lg tracking-tight">Notifications</h3>
                <span className="text-xs bg-rose-500 text-white px-2.5 py-1 rounded-full font-bold shadow-[0_0_10px_rgba(244,63,94,0.4)]">2 New</span>
              </div>

              <div className="max-h-96 overflow-y-auto custom-scrollbar p-3 space-y-2">
                <div className="p-4 rounded-2xl hover:bg-slate-800/80 cursor-pointer transition-all bg-gradient-to-r from-rose-500/10 to-transparent border border-rose-500/20 group">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-lg shadow-rose-500/20">
                      <ShieldAlert size={18} />
                    </div>
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-bold text-slate-200">Security Alert</span>
                        <span className="text-xs text-rose-400 font-medium">Just now</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">New login detected from Windows PC (Chrome) in Mumbai.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl hover:bg-slate-800/80 cursor-pointer transition-all bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 group">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-lg shadow-emerald-500/20">
                      <Wallet size={18} />
                    </div>
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-bold text-slate-200">Salary Credited</span>
                        <span className="text-xs text-emerald-400 font-medium">2 hrs ago</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">Tech Corp deposited <strong className="text-emerald-400">₹4,250.00</strong> to your Salary Account.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl hover:bg-slate-800/80 cursor-pointer transition-all border border-transparent hover:border-slate-700/50 group">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 group-hover:scale-110 transition-transform">
                      <Settings size={18} />
                    </div>
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-bold text-slate-300">System Update</span>
                        <span className="text-xs text-slate-500 font-medium">1 day ago</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">Scheduled maintenance on Sunday 2 AM - 4 AM. App may be unavailable.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div onClick={() => { setShowNotif(false); showToast('All notifications cleared'); }} className="p-4 text-center border-t border-slate-800/80 bg-slate-950/80 hover:bg-slate-900 text-sm font-bold text-blue-400 hover:text-blue-300 cursor-pointer transition-colors backdrop-blur-md">
                Mark all as read
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-800"></div>

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer group hover:bg-slate-900 py-1.5 px-3 rounded-xl transition-colors">
          <div className="text-right hidden md:block">
            <div className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{localStorage.getItem('userName') || 'John Doe'}</div>
            <div className="text-xs text-slate-500">{localStorage.getItem('userEmail') || 'john@nexus.com'}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-400 p-[2px] shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-sm font-bold text-white">{(localStorage.getItem('userName') || 'JD').substring(0, 2).toUpperCase()}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

const DashboardView = () => {
  const { balance, setBalance, transactions, setTransactions, showToast, livePrices, showScanner, setShowScanner, showMyQR, setShowMyQR } = useContext(AppContext);
  const [sendAmount, setSendAmount] = useState('');
  const [selectedContact, setSelectedContact] = useState('Alice');
  const [netflixPaid, setNetflixPaid] = useState(false);
  const [tripProgress, setTripProgress] = useState(70);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Camera logic removed for privacy
  }, [showScanner]);

  const handleQuickSend = () => {
    if (!sendAmount || parseFloat(sendAmount) <= 0) return showToast('Enter valid amount', 'error');
    if (balance < parseFloat(sendAmount)) return showToast('Insufficient funds', 'error');
    setBalance(prev => prev - parseFloat(sendAmount));
    setTransactions(prev => [{ id: Date.now(), date: 'Just now', desc: `Nexus QuickPay: ${selectedContact}`, cat: 'Transfer', stat: 'Success', amt: -parseFloat(sendAmount) }, ...prev]);
    showToast(`₹${sendAmount} dispatched to ${selectedContact}`, 'success');
    setSendAmount('');
  };

  const handlePayBill = (billName, amt) => {
    if (netflixPaid && billName === 'Netflix') return showToast('Already paid', 'error');
    if (balance < amt) return showToast('Insufficient liquidity', 'error');
    setBalance(prev => prev - amt);
    setTransactions(prev => [{ id: Date.now(), date: 'Just now', desc: `${billName} Execution`, cat: 'Bills', stat: 'Success', amt: -amt }, ...prev]);
    showToast(`${billName} bill of ₹${amt} paid`, 'success');
    if (billName === 'Netflix') setNetflixPaid(true);
  };

  const chartData = [
    { name: 'Jan', value: balance * 0.7 },
    { name: 'Feb', value: balance * 0.75 },
    { name: 'Mar', value: balance * 0.8 },
    { name: 'Apr', value: balance * 0.9 },
    { name: 'May', value: balance },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Cinematic Balance Card */}
        <div className="xl:col-span-2 bg-gradient-to-br from-blue-700 via-indigo-900 to-slate-950 rounded-[3.5rem] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden group border border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.3),transparent)] opacity-50"></div>
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] group-hover:bg-blue-500/20 transition-all duration-1000"></div>

          <div className="relative z-10 flex flex-col justify-between h-full min-h-[300px]">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xl border border-white/10"><Wallet className="text-white" size={20} /></div>
                <span className="text-white/60 text-xs font-black uppercase tracking-[0.4em]">Available Liquidity</span>
              </div>
              <div className="text-white text-7xl font-black tracking-tighter mb-4 animate-in slide-in-from-left duration-700">
                ₹{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-emerald-500/20 rounded-full flex items-center gap-2 border border-emerald-500/30">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">+12.5% Growth</span>
                </div>
                <div className="px-4 py-2 bg-white/5 rounded-full flex items-center gap-2 border border-white/10">
                  <span className="text-white/40 text-[10px] font-black uppercase tracking-widest italic">NX-01 Prime Node</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-12">
              <div className="h-40 w-full opacity-60 hover:opacity-100 transition-opacity duration-700">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="balanceFlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={5} fillOpacity={1} fill="url(#balanceFlow)" animationDuration={2000} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute bottom-12 right-12 flex gap-4">
                <button
                  onClick={() => setShowMyQR(true)}
                  className="bg-slate-900 text-white border border-white/10 px-8 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-2xl flex items-center gap-3"
                >
                  <QrCode size={18} /> My QR
                </button>
                <button
                  onClick={() => setShowScanner(true)}
                  className="bg-white text-slate-950 px-8 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:scale-110 transition-all shadow-2xl flex items-center gap-3 group"
                >
                  <Maximize size={18} className="group-hover:rotate-90 transition-transform" /> Scan & Pay
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* My UPI QR Modal */}
        {/* Neural Widgets */}
        <div className="space-y-10">
          <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] -mr-16 -mt-16"></div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400"><Target size={24} /></div>
              <div>
                <h3 className="text-white font-black text-xl tracking-tight">Mission Goal</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Europe Expedition</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-3xl font-black text-white">{tripProgress}%</span>
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">₹35k / ₹50k</span>
              </div>
              <div className="relative h-3 bg-slate-950 rounded-full border border-white/5 overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all duration-1000" style={{ width: `${tripProgress}%` }}></div>
              </div>
              <button onClick={() => setTripProgress(prev => Math.min(prev + 5, 100))} className="w-full bg-slate-800 hover:bg-white hover:text-slate-950 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Boost Progression</button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] -mr-16 -mt-16"></div>
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400"><TrendingUp size={24} /></div>
                <div>
                  <h3 className="text-white font-black text-xl tracking-tight">Market Pulse</h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Global Asset Nodes</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-emerald-500/10 rounded-lg flex items-center gap-2 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-500 text-[8px] font-black uppercase tracking-widest">Live</span>
              </div>
            </div>
            <div className="space-y-6">
              {[
                { l: 'Bitcoin', v: `₹${(livePrices?.btc * 83.5 || 64200 * 83.5).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, c: 'text-amber-400' },
                { l: 'Ethereum', v: `₹${(livePrices?.eth * 83.5 || 3250 * 83.5).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, c: 'text-blue-400' },
                { l: 'Solana', v: `₹${(livePrices?.sol * 83.5 || 145 * 83.5).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, c: 'text-purple-400' }
              ].map(m => (
                <div key={m.l} className="flex justify-between items-center bg-slate-950/50 p-4 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{m.l}</span>
                  <span className={`text-sm font-black ${m.c} tracking-tight`}>{m.v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-400"><Calendar size={24} /></div>
              <h3 className="text-white font-black text-xl tracking-tight">Financial Pulses</h3>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Netflix', amt: 15.99, paid: netflixPaid, color: 'rose' },
                { name: 'Electricity', amt: 84.50, paid: false, color: 'amber' }
              ].map(bill => (
                <div key={bill.name} onClick={() => handlePayBill(bill.name, bill.amt)} className={`flex justify-between items-center bg-slate-950 p-5 rounded-[2rem] border border-white/5 transition-all cursor-pointer hover:border-${bill.color}-500/50 ${bill.paid ? 'opacity-40 grayscale' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-${bill.color}-500/10 flex items-center justify-center text-${bill.color}-400 font-black`}>{bill.name[0]}</div>
                    <div className="text-sm font-black text-white">{bill.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-white">₹{bill.amt}</div>
                    <div className={`text-[9px] font-black uppercase tracking-widest text-${bill.color}-400`}>{bill.paid ? 'Secured' : 'Execute'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Global Activity Hub */}
      <div className="bg-slate-900 border border-slate-800 p-12 rounded-[4rem] shadow-[0_40px_80px_rgba(0,0,0,0.4)]">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400"><History size={28} /></div>
            <h3 className="text-3xl font-black text-white tracking-tighter">Global Ledger</h3>
          </div>
          <button onClick={() => navigate('/transactions')} className="bg-slate-950 border border-white/10 px-8 py-3 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">Explore Archives</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4">Neural Quick-Pay</h4>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {['Alice', 'Bob', 'Charlie', 'Diana'].map(name => (
                <button key={name} onClick={() => setSelectedContact(name)} className={`flex flex-col items-center gap-3 shrink-0 group transition-all ${selectedContact === name ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}>
                  <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-slate-800 to-slate-950 flex items-center justify-center text-2xl font-black text-white border border-white/10 shadow-2xl">{name[0]}</div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{name}</span>
                </button>
              ))}
            </div>
            <div className="relative mt-8 group">
              <input value={sendAmount} onChange={e => setSendAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 text-white outline-none focus:border-blue-500 font-black text-4xl tracking-tighter transition-all placeholder:text-slate-800" />
              <button onClick={handleQuickSend} className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white p-5 rounded-3xl shadow-xl shadow-blue-500/20 active:scale-90 transition-all">
                <ArrowRight size={32} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4">Latest Syncs</h4>
            {transactions.slice(0, 3).map(tx => (
              <div key={tx.id} className="flex justify-between items-center bg-slate-950/50 p-6 rounded-[2.5rem] border border-white/5 group hover:bg-slate-950 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/5 text-xl">🚀</div>
                  <div>
                    <div className="text-white font-black text-sm">{tx.desc}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{tx.date}</div>
                  </div>
                </div>
                <div className={`text-lg font-black tracking-tight ${tx.amt < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {tx.amt < 0 ? '-' : '+'}₹{Math.abs(tx.amt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AccountsView = () => {
  const { balance, setBalance, transactions, setTransactions, goldWeight, setGoldWeight, ppfBalance, setPpfBalance, dematValue, setDematValue, showToast } = useContext(AppContext);
  const [fds, setFds] = useState([]);
  const [showFdForm, setShowFdForm] = useState(false);
  const [fdAmount, setFdAmount] = useState('');
  const [fdTenure, setFdTenure] = useState(1);
  const [activeModal, setActiveModal] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLogAcc, setSelectedLogAcc] = useState(null);

  const handleAction = () => {
    const amt = parseFloat(inputVal);
    if (!amt || amt <= 0) return showToast('Enter valid magnitude', 'error');

    if (activeModal === 'gold') {
      if (amt > balance) return showToast('Insufficient liquidity', 'error');
      setBalance(p => p - amt);
      const addedWeight = amt / 6200;
      setGoldWeight(p => p + addedWeight);
      setTransactions(p => [{ id: Date.now(), date: 'Just now', desc: `Nexus Vault: digital_gold_sync`, cat: 'Investment', stat: 'Success', amt: -amt }, ...p]);
      showToast(`${addedWeight.toFixed(3)}g added to Gold Vault`, 'success');
    } else if (activeModal === 'ppf') {
      if (amt > balance) return showToast('Insufficient liquidity', 'error');
      setBalance(p => p - amt);
      setPpfBalance(p => p + amt);
      setTransactions(p => [{ id: Date.now(), date: 'Just now', desc: 'Neural PPF Contribution', cat: 'Investment', stat: 'Success', amt: -amt }, ...p]);
      showToast(`₹${amt} synced to PPF node`, 'success');
    } else if (activeModal === 'demat') {
      if (amt > balance) return showToast('Insufficient liquidity', 'error');
      setBalance(p => p - amt);
      setDematValue(p => p + amt);
      setTransactions(p => [{ id: Date.now(), date: 'Just now', desc: 'Demat Node Acquisition', cat: 'Investment', stat: 'Success', amt: -amt }, ...p]);
      showToast(`₹${amt} invested in market nodes`, 'success');
    }
    setActiveModal(null); setInputVal('');
  };

  const viewNeuralLog = (acc) => {
    setSelectedLogAcc(acc);
    setShowViewModal(true);
    showToast('Neural Grid Synced', 'info');
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 pb-20">
      {/* --- IN-APP NEURAL LOG VIEWER --- */}
      {showViewModal && selectedLogAcc && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-[300] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/30 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(34,211,238,0.2)] animate-in zoom-in-95 duration-500 relative">
            {/* Design Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]"></div>

            <button onClick={() => setShowViewModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all scale-150 z-10"><X size={20} /></button>

            <div className="p-12 md:p-16">
              <div className="flex justify-between items-start mb-16">
                <div>
                  <h2 className="text-4xl font-black text-white tracking-tighter mb-2">NEXUS CORE</h2>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                    <p className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.4em]">Neural Encryption Active</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-600 text-[9px] font-black uppercase tracking-widest mb-1">Archive ID</div>
                  <div className="text-white font-mono text-xs">LOG-NX-{Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
                </div>
              </div>

              <div className="space-y-10">
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-1">
                    <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest">Identity Holder</p>
                    <p className="text-white font-black text-lg">{localStorage.getItem('userName') || 'Kajal Kumari'}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest">Registry Node</p>
                    <p className="text-white font-black text-sm italic">{localStorage.getItem('userEmail') || 'kajal7295i@gmail.com'}</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-10 rounded-[2.5rem] border border-white/5 relative group">
                  <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex justify-between items-end relative z-10">
                    <div>
                      <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-4">Vault Class Telemetry</p>
                      <h3 className="text-white font-black text-2xl tracking-tight mb-2">{selectedLogAcc.label}</h3>
                      <p className="text-cyan-500/60 font-mono text-xs">{selectedLogAcc.acc}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest mb-2">Validated Liquidity</p>
                      <p className="text-4xl font-black text-cyan-400 tracking-tighter italic">₹{selectedLogAcc.val.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {[
                    { l: 'TEMPORAL TS', v: new Date().toLocaleDateString() },
                    { l: 'ENCRYPTION', v: 'AES-256' },
                    { l: 'NODE STATUS', v: 'OPTIMIZED' }
                  ].map(i => (
                    <div key={i.l} className="text-center p-4 rounded-2xl bg-slate-800/30 border border-white/5">
                      <p className="text-slate-600 text-[8px] font-black uppercase tracking-tighter mb-1">{i.l}</p>
                      <p className="text-white text-[10px] font-black">{i.v}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-16 pt-10 border-t border-white/5 flex justify-between items-center opacity-40">
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.5em]">Nexus Neural Grid V4.2 Protocol</p>
                <div className="flex gap-2">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Neural Interaction Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-3xl z-[200] flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-white/10 p-12 rounded-[3.5rem] w-full max-w-xl shadow-[0_40px_120px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">{activeModal} Protocol</h3>
            <p className="text-slate-500 text-sm mb-10 font-bold italic">Initialize node synchronization for your {activeModal} assets.</p>

            <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-white/5 focus-within:border-blue-500 transition-all mb-10">
              <span className="text-slate-700 text-3xl font-black mr-4">₹</span>
              <input autoFocus type="number" value={inputVal} onChange={e => setInputVal(e.target.value)} placeholder="0.00" className="bg-transparent border-none outline-none text-white font-black text-5xl tracking-tighter w-full placeholder:text-slate-900" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <button onClick={() => setActiveModal(null)} className="py-6 rounded-3xl font-black text-[10px] uppercase tracking-widest text-slate-500 bg-slate-800 hover:bg-slate-700 transition-all">Abort Sync</button>
              <button onClick={handleAction} className="py-6 rounded-3xl font-black text-[10px] uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 shadow-2xl shadow-blue-600/20 transition-all active:scale-95">Initiate Sync</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h2 className="text-5xl font-black text-white tracking-tighter">Nexus Vaults</h2>
          <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em]">Neural Asset Management</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Cumulative Value</div>
          <div className="text-4xl font-black text-blue-400 tracking-tighter">₹{balance.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {[
          { id: 'savings', label: 'Savings Core', val: balance * 0.68, icon: <Wallet size={24} />, color: 'blue', acc: 'NX-1029-482' },
          { id: 'salary', label: 'Salary Node', val: balance * 0.32, icon: <Zap size={24} />, color: 'emerald', acc: 'NX-9921-110' },
          { id: 'reserve', label: 'Reserve Tank', val: balance * 0.15, icon: <ShieldCheck size={24} />, color: 'indigo', acc: 'NX-8820-334' },
        ].map(acc => (
          <div key={acc.id} className={`bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 p-10 rounded-[3.5rem] relative overflow-hidden group hover:border-${acc.color}-500/30 transition-all duration-700`}>
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${acc.color}-500/5 rounded-bl-[100px] blur-2xl group-hover:scale-150 transition-transform duration-1000`}></div>
            <div className="flex justify-between items-start mb-10">
              <div className={`w-14 h-14 rounded-2xl bg-${acc.color}-500/10 flex items-center justify-center text-${acc.color}-400 border border-${acc.color}-500/20`}>{acc.icon}</div>
              <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{acc.acc}</div>
            </div>
            <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">{acc.label}</h3>
            <div className="text-4xl font-black text-white tracking-tighter mb-10">₹{acc.val.toLocaleString()}</div>
            <button
              onClick={() => viewNeuralLog(acc)}
              className="w-full bg-slate-950 border border-white/5 hover:border-blue-500/30 hover:bg-blue-600 hover:text-white text-slate-500 font-black text-[9px] uppercase tracking-[0.3em] py-5 rounded-2xl transition-all"
            >
              View Neural Log
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="bg-slate-900/50 backdrop-blur-3xl border border-white/5 p-12 rounded-[4rem] space-y-10">
          <h3 className="text-2xl font-black text-white tracking-tighter flex items-center gap-4"><Coins className="text-amber-500" /> Digital Assets</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { id: 'gold', label: 'Neural Gold', val: `${goldWeight.toFixed(3)}g`, icon: '✨', color: 'amber' },
              { id: 'demat', label: 'Market Nodes', val: `₹${dematValue.toLocaleString()}`, icon: '📈', color: 'blue' },
              { id: 'ppf', label: 'Neural PPF', val: `₹${ppfBalance.toLocaleString()}`, icon: '🛡️', color: 'emerald' },
              { id: 'fd', label: 'Fixed Protocol', val: `${fds.length} Active`, icon: '💎', color: 'indigo' },
            ].map(i => (
              <div key={i.id} onClick={() => i.id !== 'fd' && setActiveModal(i.id)} className="bg-slate-950 p-8 rounded-[2.5rem] border border-white/5 hover:border-white/20 transition-all cursor-pointer group">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-3xl">{i.icon}</span>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                </div>
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{i.label}</div>
                <div className="text-2xl font-black text-white tracking-tight">{i.val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-3xl border border-white/5 p-12 rounded-[4rem]">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black text-white tracking-tighter">Fixed Protocol (FD)</h3>
            <button onClick={() => setShowFdForm(!showFdForm)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Deploy Node</button>
          </div>

          {showFdForm && (
            <div className="bg-slate-950 p-10 rounded-[3rem] border border-blue-500/20 mb-10 animate-in zoom-in-95 duration-500">
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-2">Magnitude (₹)</label>
                  <input type="number" value={fdAmount} onChange={e => setFdAmount(e.target.value)} placeholder="5000.00" className="w-full bg-slate-900 p-6 rounded-2xl border border-white/5 text-white font-black outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-2">Temporal Duration ({fdTenure} Solar Cycles)</label>
                  <input type="range" min="1" max="10" value={fdTenure} onChange={e => setFdTenure(e.target.value)} className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500" />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setShowFdForm(false)} className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase text-slate-500 bg-slate-800">Abort</button>
                  <button onClick={() => {
                    const amt = parseFloat(fdAmount);
                    if (amt > 0 && amt <= balance) {
                      setBalance(p => p - amt);
                      setFds(p => [...p, { id: Date.now(), amount: amt, tenure: fdTenure, rate: 7.5 }]);
                      setTransactions(p => [{ id: Date.now(), date: 'Just now', desc: 'FD Node Deployment', cat: 'Investment', stat: 'Success', amt: -amt }, ...p]);
                      showToast('FD Node Deployed Successfully', 'success');
                      setShowFdForm(false); setFdAmount('');
                    } else {
                      showToast('Invalid Magnitude', 'error');
                    }
                  }} className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase text-white bg-blue-600">Deploy</button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
            {fds.length > 0 ? fds.map(fd => (
              <div key={fd.id} className="bg-slate-950 p-6 rounded-[2.5rem] border border-white/5 flex justify-between items-center group hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 font-black text-xs">FD</div>
                  <div>
                    <div className="text-white font-black text-sm">₹{fd.amount.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{fd.tenure} Cycles • 7.5% Yield</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Active</span>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center space-y-4 opacity-20">
                <Database size={48} className="mx-auto" />
                <p className="text-xs font-black uppercase tracking-widest">No Active Nodes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TransactionsView = () => {
  const { transactions, showToast } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [selectedTx, setSelectedTx] = useState(null);

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.desc.toLowerCase().includes(searchTerm.toLowerCase()) || t.cat.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCat === 'All' || t.cat === filterCat;
    return matchesSearch && matchesFilter;
  });

  const handleExport = () => {
    const csv = "Date,Description,Category,Status,Amount\n" + transactions.map(t => `${t.date},\"${t.desc}\",${t.cat},${t.stat},${t.amt}`).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Nexus_Ledger_Sync.csv`;
    a.click();
    showToast('Ledger Archive Synchronized', 'success');
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-3xl rounded-[3.5rem] p-12 border border-white/5 animate-in fade-in slide-in-from-bottom-10 duration-1000 h-full flex flex-col relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

      {/* Cinematic Neural Receipt */}
      {selectedTx && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-3xl z-[200] flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[3.5rem] overflow-hidden animate-in zoom-in-95 duration-500 shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16"></div>
            <button onClick={() => setSelectedTx(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all scale-125"><X size={24} /></button>

            <div className="p-12 text-center pt-20">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-500 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <CheckCircle2 size={40} className="animate-in zoom-in duration-700" />
              </div>
              <h3 className="text-emerald-400 font-black uppercase tracking-[0.4em] text-[10px] mb-4">Sync Confirmed</h3>
              <div className="text-5xl font-black text-white mb-4 tracking-tighter italic">₹{Math.abs(selectedTx.amt).toLocaleString()}</div>
              <p className="text-slate-400 text-sm font-bold opacity-60 tracking-tight">{selectedTx.desc}</p>
            </div>

            <div className="px-12 pb-12">
              <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                {[
                  { l: 'Temporal Marker', v: selectedTx.date },
                  { l: 'Node Reference', v: `NX-${Math.random().toString(36).substr(2, 8).toUpperCase()}`, mono: true },
                  { l: 'Asset Class', v: selectedTx.cat },
                ].map(row => (
                  <div key={row.l} className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-600 uppercase font-black tracking-widest">{row.l}</span>
                    <span className={`text-xs text-slate-200 font-black ${row.mono ? 'font-mono text-blue-400' : ''}`}>{row.v}</span>
                  </div>
                ))}
                <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[10px] text-slate-600 uppercase font-black tracking-widest">Authorized By</span>
                  <span className="text-xs text-white font-black italic tracking-widest">NEXUS_CORE</span>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button onClick={() => showToast('Statement Dispatched', 'success')} className="flex-1 bg-white text-slate-950 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all active:scale-95">Fetch Archive</button>
                <button className="w-16 bg-slate-800 text-white rounded-2xl flex items-center justify-center hover:bg-slate-700 transition-all border border-white/5"><Send size={20} /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 mb-12">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-white tracking-tighter">Nexus Ledger</h2>
          <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em]">Historical Node Synchronization</p>
        </div>
        <button onClick={handleExport} className="bg-slate-950 border border-blue-500/30 text-blue-400 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl">Ledger Export</button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-12">
        <div className="flex-1 bg-slate-950 border border-white/5 rounded-2xl px-6 py-5 flex items-center focus-within:border-blue-500 transition-all group">
          <Search size={24} className="text-slate-700 group-focus-within:text-blue-500 mr-4 transition-colors" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search ledger nodes..." className="bg-transparent border-none outline-none text-white w-full text-sm font-black placeholder:text-slate-900 tracking-tight" />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {['All', 'Income', 'Transfer', 'Investment', 'Shopping', 'Loan'].map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterCat === cat ? 'bg-white text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-slate-950 text-slate-600 border border-white/5 hover:border-white/10'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto flex-1 no-scrollbar">
        <table className="w-full text-left min-w-[800px]">
          <thead className="text-slate-600 border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em]">
            <tr>
              <th className="pb-6 px-4">Timestamp</th>
              <th className="pb-6 px-4">Node Description</th>
              <th className="pb-6 px-4">Classification</th>
              <th className="pb-6 px-4">Integrity</th>
              <th className="pb-6 px-4 text-right">Magnitude</th>
            </tr>
          </thead>
          <tbody className="text-slate-300">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((t) => (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer group" onClick={() => setSelectedTx(t)}>
                  <td className="py-6 px-4 text-[11px] font-black text-slate-500 tracking-widest">{t.date}</td>
                  <td className="py-6 px-4 font-black text-white text-sm group-hover:text-blue-400 transition-colors">{t.desc}</td>
                  <td className="py-6 px-4">
                    <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${t.cat === 'Income' ? 'bg-emerald-500/10 text-emerald-400' :
                        t.cat === 'Investment' ? 'bg-indigo-500/10 text-indigo-400' :
                          t.cat === 'Transfer' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-500'
                      }`}>
                      {t.cat}
                    </span>
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified</span>
                    </div>
                  </td>
                  <td className={`py-6 px-4 text-right font-black text-xl tracking-tighter ${t.amt > 0 ? 'text-emerald-400' : 'text-slate-100'}`}>
                    {t.amt > 0 ? '+' : '-'}₹{Math.abs(t.amt).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-32 text-center">
                  <div className="flex flex-col items-center gap-6 opacity-20">
                    <Search size={64} />
                    <p className="text-xs font-black uppercase tracking-[0.4em]">Zero Ledger Matches</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CardsView = () => {
  const { showToast } = useContext(AppContext);
  const [isFrozen, setIsFrozen] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const [onlineEnabled, setOnlineEnabled] = useState(true);
  const [atmEnabled, setAtmEnabled] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(50000);
  const [spentAmount, setSpentAmount] = useState(12450);

  const cards = [
    { id: 0, name: 'NEXUS BLACK', tier: 'Guardian Tier', number: '4111 2222 3333 4829', expiry: '12 / 28', gradient: 'from-slate-800 via-slate-950 to-blue-950', accent: 'blue' },
    { id: 1, name: 'NEXUS SAPPHIRE', tier: 'Elite Tier', number: '4555 6666 7777 9210', expiry: '08 / 29', gradient: 'from-blue-900 via-indigo-950 to-purple-950', accent: 'indigo' },
    { id: 2, name: 'NEXUS GOLD', tier: 'Wealth Tier', number: '4999 0000 1111 5543', expiry: '05 / 27', gradient: 'from-amber-700 via-amber-950 to-orange-950', accent: 'amber' }
  ];

  const activeCard = cards[activeCardIndex];

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 20, y: y * -20 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const toggleFreeze = () => {
    setIsFrozen(!isFrozen);
    showToast(isFrozen ? 'Nexus Card Reactivated' : 'Card Lockdown Active', isFrozen ? 'success' : 'error');
  };

  const handleViewPin = () => {
    if (showPin) {
      setShowPin(false);
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setShowPin(true);
      showToast('Neural PIN Decrypted', 'success');
      setTimeout(() => setShowPin(false), 15000);
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      {/* Verification Overlay */}
      {isVerifying && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-[200] flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_50px_rgba(59,130,246,0.3)]"></div>
            <p className="text-white font-black tracking-[0.5em] uppercase text-[10px] animate-pulse">Authenticating Neural Link</p>
          </div>
        </div>
      )}

      <div className="bg-slate-900/50 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="flex justify-between items-center mb-10">
          <div className="flex gap-2">
            {cards.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setActiveCardIndex(i)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeCardIndex === i ? 'bg-white text-slate-950 scale-110' : 'bg-slate-950 text-slate-500'}`}
              >
                {c.name.split(' ')[1]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
            <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">{activeCard.tier}</span>
          </div>
        </div>

        {/* 3D TILT CARD */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
            transition: 'transform 0.1s ease-out'
          }}
          className={`w-full aspect-[1.6/1] rounded-[3rem] p-10 relative overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)] group/card ${isFrozen ? '' : `bg-gradient-to-br ${activeCard.gradient}`}`}
        >
          {/* Holographic Mesh */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.05),transparent)] group-hover:scale-150 transition-transform duration-1000"></div>

          {/* ICY LOCKDOWN OVERLAY */}
          {isFrozen && (
            <div className="absolute inset-0 z-50 backdrop-blur-md bg-white/10 flex items-center justify-center animate-in zoom-in-125 duration-700 overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-20 rotate-45"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-transparent to-blue-500/20"></div>
              <div className="absolute inset-0 [mask-image:radial-gradient(circle_at_50%_50%,transparent_40%,black_100%)] bg-slate-950/40"></div>

              {/* Frost Cracks simulation */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
                <div className="absolute top-10 left-20 w-1 h-32 bg-white/30 rotate-12 blur-sm"></div>
                <div className="absolute bottom-20 right-10 w-1 h-40 bg-white/30 -rotate-45 blur-sm"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white/10 rounded-full animate-pulse"></div>
              </div>

              <div className="text-center relative z-10">
                <LockKeyhole size={64} className="text-white mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] mx-auto animate-bounce" />
                <div className="text-white font-black text-xs uppercase tracking-[0.6em] drop-shadow-lg">LOCKDOWN ACTIVE</div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-start mb-16 relative z-10">
            <div className="space-y-1">
              <div className="text-white font-black tracking-[0.4em] text-xs opacity-60">{activeCard.name}</div>
              {!isFrozen && <div className="text-emerald-400 text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-2 w-fit"><Activity size={10} /> Active Signal</div>}
            </div>
            <div className="flex gap-1.5">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg"></div>
              <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-xl -ml-8 border border-white/10 shadow-lg"></div>
            </div>
          </div>

          <div className="text-white text-4xl font-mono tracking-[0.3em] mb-12 relative z-10 drop-shadow-2xl">
            {showPin ? activeCard.number : `•••• •••• •••• ${activeCard.number.split(' ')[3]}`}
          </div>

          <div className="flex justify-between items-end relative z-10">
            <div className="space-y-2">
              <div className="text-[9px] text-white/40 uppercase font-black tracking-[0.3em]">{activeCard.tier}</div>
              <div className="text-white font-black tracking-widest text-base uppercase drop-shadow-md">{localStorage.getItem('userName') || 'NEXUS USER'}</div>
            </div>
            <div className="text-right space-y-2">
              <div className="text-[9px] text-white/40 uppercase font-black tracking-[0.3em]">Valid Thru</div>
              <div className="text-white font-black tracking-widest text-base drop-shadow-md">{activeCard.expiry}</div>
            </div>
          </div>

          {/* Micro-chip */}
          <div className="absolute top-1/2 right-12 -translate-y-1/2 w-16 h-12 bg-gradient-to-br from-amber-200 via-amber-500 to-amber-800 rounded-xl opacity-80 border border-white/20 shadow-inner flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-[linear-gradient(90deg,transparent_25%,rgba(0,0,0,0.2)_25%,rgba(0,0,0,0.2)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.2)_75%)] bg-[length:8px_100%] opacity-40"></div>
            <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_25%,rgba(0,0,0,0.2)_25%,rgba(0,0,0,0.2)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.2)_75%)] bg-[length:100%_8px] opacity-40"></div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-6">
          <button
            onClick={toggleFreeze}
            className={`rounded-3xl py-6 font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 border ${isFrozen ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white shadow-2xl'}`}
          >
            {isFrozen ? 'Emergency Unlock' : 'Trigger Lockdown'}
          </button>
          <button
            onClick={handleViewPin}
            className="bg-slate-950 hover:bg-slate-800 border border-white/5 rounded-3xl py-6 font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 hover:text-white transition-all active:scale-95 shadow-2xl"
          >
            {showPin ? 'Obfuscate Signal' : 'Reveal Identity'}
          </button>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/5 shadow-2xl space-y-12">
        <h3 className="text-2xl font-black text-white tracking-tighter mb-4 flex items-center gap-4">
          <ShieldAlert className="text-blue-500" /> Defense Configuration
        </h3>

        <div className="space-y-10">
          {[
            { id: 'online', label: 'Neural Mesh Payment', desc: 'Secure digital gateway authorized', icon: <Globe size={24} />, state: onlineEnabled, setter: setOnlineEnabled, color: 'blue' },
            { id: 'atm', label: 'Atmosphere Withdrawal', desc: 'Physical liquidity point access', icon: <Zap size={24} />, state: atmEnabled, setter: setAtmEnabled, color: 'emerald' },
          ].map(s => (
            <div key={s.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center transition-all border border-white/5 ${s.state ? `bg-${s.color}-500/10 text-${s.color}-400` : 'bg-slate-950 text-slate-600'}`}>
                  {s.icon}
                </div>
                <div>
                  <div className="font-black text-white text-lg tracking-tight">{s.label}</div>
                  <div className="text-[10px] text-slate-500 font-medium italic mt-1">{s.desc}</div>
                </div>
              </div>
              <button
                onClick={() => { s.setter(!s.state); showToast(`${s.label} Updated`, 'success') }}
                className={`w-16 h-8 rounded-full relative transition-all duration-500 ${s.state ? `bg-${s.color}-600 shadow-lg shadow-${s.color}-600/20` : 'bg-slate-800'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500 ${s.state ? 'left-9' : 'left-1'}`}></div>
              </button>
            </div>
          ))}

          <div className="space-y-6 pt-10 border-t border-white/5">
            <div className="flex justify-between items-end">
              <div>
                <div className="font-black text-white text-xl tracking-tight">Cap Velocity</div>
                <div className="text-[10px] text-slate-500 font-medium italic mt-1">Maximum daily liquidity outflow</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-blue-400 tracking-tighter">₹{dailyLimit.toLocaleString()}</div>
                <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1">₹{spentAmount.toLocaleString()} Depleted</div>
              </div>
            </div>
            <div className="relative h-4 bg-slate-950 rounded-full border border-white/5 p-1">
              <input
                type="range"
                min="5000"
                max="200000"
                step="5000"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(parseInt(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                style={{ width: `${((dailyLimit - 5000) / (200000 - 5000)) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[9px] text-slate-700 font-black uppercase tracking-[0.2em]">
              <span>5k (Min)</span>
              <span>100k (Mid)</span>
              <span>200k (Max)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UpiView = () => {
  const { showToast, setBalance, setTransactions, isKycVerified, setIsKycVerified, setShowScanner, showKyc, setShowKyc, kycStep, setKycStep } = useContext(AppContext);
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankTransferAmt, setBankTransferAmt] = useState('');
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  const videoCallbackRef = React.useCallback((node) => {
    if (node && stream) {
      node.srcObject = stream;
    }
  }, [stream]);

  const initCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(s);
      setCameraActive(true);
      showToast('Neural Camera Linked', 'success');
    } catch (err) {
      setCameraActive(false);
      showToast('Secure Simulation Active', 'info');
    }
  };

  const initMic = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(s);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 32;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setMicLevel(avg);
        requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (err) {
      console.error('Mic access denied');
    }
  };

  useEffect(() => {
    if (kycStep === 1 && showKyc) initCamera();
    if (kycStep === 2 && showKyc) initMic();
    return () => {
      stream?.getTracks().forEach(t => t.stop());
      audioContextRef.current?.close();
    };
  }, [kycStep, showKyc]);

  const handlePay = () => {
    if (!upiId || !amount) return showToast('Identity Required', 'error');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setBalance(prev => prev - parseFloat(amount));
      setTransactions(prev => [{ id: Date.now(), date: 'Just now', desc: `Nexus UPI: ${upiId}`, cat: 'Transfer', stat: 'Success', amt: -parseFloat(amount) }, ...prev]);
      showToast(`₹${amount} dispatched to ${upiId}`);
      setUpiId(''); setAmount('');
    }, 1500);
  };

  const contacts = [
    { name: 'Alice', id: 'alice@nexus', color: 'blue' },
    { name: 'Bob', id: 'bob@nexus', color: 'emerald' },
    { name: 'Charlie', id: 'charlie@nexus', color: 'purple' },
    { name: 'Diana', id: 'diana@nexus', color: 'rose' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Neural KYC Overlay */}
      {showKyc && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl z-[200] flex items-center justify-center p-8 animate-in fade-in duration-500">
          <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[4rem] overflow-hidden shadow-[0_0_100px_rgba(59,130,246,0.2)] relative">
            <button onClick={() => setShowKyc(false)} className="absolute top-10 right-10 text-slate-500 hover:text-white transition-all z-20"><X size={32} /></button>
            <div className="p-16 text-center">
              {kycStep === 0 ? (
                <div className="space-y-10 animate-in slide-in-from-bottom-10">
                  <div className="w-24 h-24 bg-blue-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-blue-400 border border-blue-500/20 shadow-lg"><UserCheck size={48} /></div>
                  <div className="space-y-4">
                    <h3 className="text-4xl font-black text-white tracking-tighter">Identity Protocol</h3>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">Authorize Video KYC to unlock global liquidity nodes and unrestricted wealth transfers.</p>
                  </div>
                  <button onClick={() => setKycStep(1)} className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)]">Initialize Scan</button>
                </div>
              ) : kycStep === 1 ? (
                <div className="space-y-10 animate-in zoom-in-95">
                  <div className="relative aspect-square max-w-sm mx-auto bg-slate-950 rounded-[3rem] overflow-hidden border-4 border-blue-500/50 flex items-center justify-center group shadow-2xl">
                    {cameraActive ? (
                      <video ref={videoCallbackRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center space-y-6">
                        <Fingerprint size={64} className="text-blue-500/20 animate-pulse mx-auto" />
                        <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Neural Link Encrypted</p>
                      </div>
                    )}

                    {/* Neural Facial Mesh Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      <svg className="w-full h-full opacity-30" viewBox="0 0 100 100">
                        <circle cx="50" cy="40" r="25" fill="none" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2 2" />
                        <path d="M30 40 Q 50 20 70 40" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
                        <path d="M40 60 Q 50 70 60 60" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
                      </svg>
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent"></div>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-80 border-2 border-dashed border-white/20 rounded-[4rem] relative">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-400 shadow-[0_0_20px_#3b82f6] animate-scan-slow"></div>
                      </div>
                    </div>

                    <div className="absolute bottom-10 left-0 w-full px-10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Face Analysis</span>
                        <span className="text-[9px] font-black text-blue-400">88%</span>
                      </div>
                      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[88%] animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Position face within the neural frame</div>
                    <button onClick={() => setKycStep(2)} className="w-full bg-emerald-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-emerald-500/20 shadow-2xl transition-all active:scale-95">Verify Facial ID</button>
                  </div>
                </div>
              ) : kycStep === 2 ? (
                <div className="space-y-12 animate-in zoom-in-95">
                  <div className="w-32 h-32 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto border-2 border-blue-500/20 relative group">
                    <Mic size={48} className="text-blue-400 animate-pulse" />
                    <div className="absolute -inset-4 border border-blue-500/10 rounded-full animate-ping"></div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Voice Identity</h3>
                    <p className="text-slate-500 text-sm italic">"My identity is my key, Nexus is my vault."</p>
                  </div>

                  {/* Neural Waveform Linked to Real Mic */}
                  <div className="flex items-end justify-center gap-2 h-24">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(i => (
                      <div
                        key={i}
                        className="w-2 bg-blue-500 rounded-full transition-all duration-75"
                        style={{
                          height: `${Math.min(100, Math.max(10, micLevel * (0.5 + Math.random())))}%`,
                          opacity: 0.3 + (micLevel / 100)
                        }}
                      ></div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setLoading(true);
                      setTimeout(() => {
                        setIsKycVerified(true);
                        setKycStep(3);
                        setLoading(false);
                        showToast('Voice Identity Synchronized', 'success');
                      }, 500);
                    }}
                    disabled={loading}
                    className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center justify-center gap-4 relative z-50 shadow-2xl ${isKycVerified ? 'bg-emerald-600 shadow-emerald-500/40 text-white' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/40 text-white'}`}
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : isKycVerified ? <CheckCircle2 size={20} /> : <ShieldCheck size={20} />}
                    {loading ? 'Authenticating...' : isKycVerified ? 'Identity Secured' : 'Authorize Voice Key'}
                  </button>
                </div>
              ) : (
                <div className="py-20 space-y-10 animate-in slide-in-from-top-10">
                  <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto text-white animate-bounce shadow-[0_20px_50px_rgba(16,185,129,0.3)] border-4 border-white/20"><ShieldCheck size={48} /></div>
                  <div className="space-y-4">
                    <h3 className="text-4xl font-black text-white tracking-tighter">Identity Verified</h3>
                    <p className="text-slate-500 text-sm">Full access to Nexus financial grid restored.</p>
                  </div>
                  <button onClick={() => setShowKyc(false)} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-xs border border-white/10 transition-all">Return to Hub</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan-slow {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(320px); opacity: 0; }
        }
        .animate-scan-slow {
          animation: scan-slow 4s infinite linear;
        }
        @keyframes waveform {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
        .animate-waveform {
          animation: waveform 0.8s infinite ease-in-out;
        }
      `}</style>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {/* UPI Terminal */}
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-[4rem] shadow-2xl space-y-10 group hover:border-blue-500/20 transition-all">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-3xl font-black text-white tracking-tighter flex items-center gap-4">
              <Zap className="text-blue-500" /> Neural Transfer
            </h3>
            <span className="bg-slate-950 px-5 py-2 rounded-xl text-[10px] font-black text-blue-400 border border-white/5 uppercase tracking-widest">Live Node</span>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {contacts.map(c => (
                <button key={c.name} onClick={() => setUpiId(c.id)} className="flex flex-col items-center gap-3 shrink-0 group/c">
                  <div className={`w-16 h-16 rounded-[1.5rem] bg-${c.color}-500/10 flex items-center justify-center text-${c.color}-400 font-black text-xl border border-${c.color}-500/20 group-hover/c:scale-110 transition-all shadow-lg`}>
                    {c.name[0]}
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{c.name}</span>
                </button>
              ))}
              <button className="flex flex-col items-center gap-3 shrink-0">
                <div className="w-16 h-16 rounded-[1.5rem] bg-slate-950 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 hover:text-white hover:border-white transition-all">
                  <Plus size={24} />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">New</span>
              </button>
            </div>

            <div className="space-y-6 bg-slate-950/50 p-8 rounded-[3rem] border border-white/5 shadow-inner">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4">Recipient Identity</label>
                <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="address@nexus" className="w-full bg-slate-950 p-6 rounded-[2rem] border border-slate-800 text-white outline-none focus:border-blue-500 transition-all font-bold text-lg shadow-inner" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4">Capital Flow (₹)</label>
                <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-950 p-6 rounded-[2rem] border border-slate-800 text-white outline-none focus:border-blue-500 transition-all font-black text-4xl tracking-tighter shadow-inner" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setShowScanner(true)}
              className="w-full bg-slate-950 border border-white/10 hover:border-blue-500/50 text-white py-6 rounded-[2.5rem] font-black transition-all active:scale-95 flex items-center justify-center gap-4 uppercase tracking-[0.4em] text-[10px] shadow-2xl"
            >
              <ScanLine size={24} className="text-blue-500" />
              Scan Neural QR
            </button>

            <button onClick={handlePay} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-7 rounded-[2.5rem] font-black shadow-[0_20px_50px_rgba(37,99,235,0.3)] transition-all active:scale-95 flex items-center justify-center gap-4 uppercase tracking-[0.4em] text-xs">
              {loading ? <Loader2 className="animate-spin" size={24} /> : <ShieldCheck size={24} />}
              Execute Secure Dispatched
            </button>
          </div>
        </div>

        {/* Global Transfer */}
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-[4rem] shadow-2xl space-y-10 group hover:border-emerald-500/20 transition-all flex flex-col justify-between">
          <div>
            <h3 className="text-3xl font-black text-white tracking-tighter flex items-center gap-4 mb-10">
              <Globe className="text-emerald-500" /> Swift Core Bank
            </h3>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4">Target Institution</label>
                <select className="w-full bg-slate-950 p-6 rounded-[2rem] border border-slate-800 text-white outline-none appearance-none font-bold cursor-pointer">
                  <option>Nexus Global Custody</option>
                  <option>Standard Chartered (Bridge)</option>
                  <option>J.P. Morgan (Alliance)</option>
                  <option>Swiss Heritage Bank</option>
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4">Account Node</label>
                  <input value={bankAccount} onChange={e => setBankAccount(e.target.value)} placeholder="98XXXXXXXX" className="w-full bg-slate-950 p-6 rounded-[2rem] border border-slate-800 text-white outline-none focus:border-emerald-500 transition-all font-bold text-sm" />
                </div>
                <div className="w-40 space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4">Routing</label>
                  <input value={ifsc} onChange={e => setIfsc(e.target.value)} placeholder="NEX-01" className="w-full bg-slate-950 p-6 rounded-[2rem] border border-slate-800 text-white outline-none focus:border-emerald-500 transition-all font-bold text-sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[3rem] flex items-center justify-between mb-4">
            <div>
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Transfer Limit</p>
              <p className="text-white font-black text-xl tracking-tight">₹1,00,00,000</p>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(i => <div key={i} className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 150}ms` }}></div>)}
            </div>
          </div>

          <button onClick={() => showToast('Bank Gateway Initiated', 'success')} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-7 rounded-[2.5rem] font-black shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all active:scale-95 flex items-center justify-center gap-4 uppercase tracking-[0.4em] text-xs">
            Initiate Wire Protocol
          </button>
        </div>
      </div>

      {!isKycVerified ? (
        <div className="bg-gradient-to-r from-amber-600/10 via-slate-900 to-amber-600/10 border border-amber-500/20 p-12 rounded-[4rem] flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] animate-pulse"></div>
          <div className="flex items-center gap-8 relative z-10">
            <div className="w-20 h-20 bg-amber-500/10 rounded-[2rem] flex items-center justify-center text-amber-500 border border-amber-500/20"><ShieldAlert size={36} /></div>
            <div>
              <h4 className="text-2xl font-black text-white tracking-tight mb-2">Liquidity Lock Detected</h4>
              <p className="text-slate-500 text-sm max-w-md">Your current node is restricted to transfers below ₹10,000. Authorize Identity to unlock the global liquidity mesh.</p>
            </div>
          </div>
          <button onClick={() => setShowKyc(true)} className="bg-amber-600 hover:bg-amber-500 text-white px-12 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-2xl shadow-amber-600/30 active:scale-95 relative z-10">Complete Identity Scan</button>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[4rem] flex items-center gap-6 justify-center shadow-inner">
          <CheckCircle2 className="text-emerald-500" size={24} />
          <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.5em]">High-Velocity Liquidity Mesh Enabled</p>
        </div>
      )}
    </div>
  );
};

const LoansView = () => {
  const { showToast } = useContext(AppContext);
  const [amount, setAmount] = useState(250000);
  const [months, setMonths] = useState(24);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);

  const [showAnalysis, setShowAnalysis] = useState(false);

  // Dynamic Score Animation
  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const end = 782;
      const duration = 2000;
      const increment = end / (duration / 16);
      const interval = setInterval(() => {
        start += increment;
        if (start >= end) {
          setScore(end);
          clearInterval(interval);
        } else {
          setScore(Math.floor(start));
        }
      }, 16);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const emi = ((amount * 0.105) / 12 * Math.pow(1 + 0.105 / 12, months)) / (Math.pow(1 + 0.105 / 12, months) - 1);

  const handleApply = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
      showToast(`Loan application for ₹${amount.toLocaleString()} submitted!`, 'success');
    }, 2500);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Credit Analysis Modal */}
      {showAnalysis && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[150] flex items-center justify-center p-4 animate-in fade-in duration-500">
          <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.1)] relative">
            <button onClick={() => setShowAnalysis(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>

            <div className="p-12">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400"><TrendingUp size={32} /></div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight">Neuro-Score Analysis</h3>
                  <p className="text-slate-500 text-sm font-medium">Real-time credit health breakdown</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {[
                  { label: 'Payment History', val: '100%', status: 'Perfect', color: 'emerald' },
                  { label: 'Credit Utilization', val: '12.4%', status: 'Low', color: 'blue' },
                  { label: 'Credit Age', val: '4.5 Years', status: 'Healthy', color: 'purple' },
                  { label: 'Hard Enquiries', val: '2', status: 'Normal', color: 'amber' }
                ].map((item, i) => (
                  <div key={i} className="bg-slate-950/50 p-6 rounded-3xl border border-white/5 group hover:border-emerald-500/30 transition-all">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300">{item.label}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded bg-${item.color}-500/10 text-${item.color}-400`}>{item.status}</span>
                    </div>
                    <div className="text-2xl font-black text-white">{item.val}</div>
                    <div className="mt-3 h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div className={`h-full bg-${item.color}-500 transition-all duration-1000 delay-500`} style={{ width: i === 0 ? '100%' : i === 1 ? '30%' : '70%' }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-500/5 p-8 rounded-[2rem] border border-emerald-500/20 mb-10">
                <div className="flex items-start gap-4">
                  <ShieldCheck className="text-emerald-400 shrink-0" size={24} />
                  <p className="text-xs text-emerald-200/80 font-medium leading-relaxed">
                    "Your credit profile shows exceptional stability. The lack of defaults and low utilization ratio makes you a prime candidate for high-limit corporate credit lines with zero processing fees."
                  </p>
                </div>
              </div>

              <button onClick={() => setShowAnalysis(false)} className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-emerald-50 transition-all">Close Report</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* EMI Calculator */}
        <div className="bg-slate-900 p-10 rounded-[3.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group transition-all duration-500 hover:border-purple-500/30">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 blur-[120px] -mr-32 -mt-32 group-hover:bg-purple-600/20 transition-all duration-700 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/5 blur-[100px] -ml-20 -mb-20"></div>

          {step === 1 && (
            <div className="space-y-10 relative z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight mb-1">Loan Hub</h2>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Live Markets</span>
                  </div>
                </div>
                <div className="bg-slate-950 border border-white/10 px-6 py-2.5 rounded-2xl">
                  <span className="text-purple-400 text-xs font-black tracking-widest">10.5% P.A.</span>
                </div>
              </div>

              <div className="space-y-12">
                <div className="relative group/slider">
                  <div className="flex justify-between mb-6 items-end">
                    <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover/slider:text-purple-400 transition-colors">Capital Required</label>
                    <div className="text-right">
                      <span className="text-white font-black text-3xl">₹{amount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="relative">
                    <input type="range" min="50000" max="1000000" step="10000" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full h-3 bg-slate-950 rounded-full appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all border border-white/5" />
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full pointer-events-none" style={{ width: `${((amount - 50000) / (1000000 - 50000)) * 100}%` }}></div>
                  </div>
                  <div className="flex justify-between mt-4 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                    <span>min 50k</span>
                    <span>max 10L</span>
                  </div>
                </div>

                <div className="relative group/slider">
                  <div className="flex justify-between mb-6 items-end">
                    <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover/slider:text-purple-400 transition-colors">Tenure Window</label>
                    <div className="text-right">
                      <span className="text-white font-black text-3xl">{months} <span className="text-sm text-slate-500">Months</span></span>
                    </div>
                  </div>
                  <div className="relative">
                    <input type="range" min="12" max="84" step="12" value={months} onChange={e => setMonths(Number(e.target.value))} className="w-full h-3 bg-slate-950 rounded-full appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all border border-white/5" />
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full pointer-events-none" style={{ width: `${((months - 12) / (84 - 12)) * 100}%` }}></div>
                  </div>
                  <div className="flex justify-between mt-4 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                    <span>1 year</span>
                    <span>7 years</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/80 p-10 rounded-[3rem] border border-white/5 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden group/emi">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/5 to-transparent opacity-0 group-hover/emi:opacity-100 transition-opacity duration-700"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4 relative z-10">Calculated Monthly Installment</p>
                <div className="text-7xl font-black text-white mb-4 tracking-tighter relative z-10 transition-transform group-hover/emi:scale-110 duration-500">
                  ₹{isNaN(emi) ? 0 : emi.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="inline-flex items-center gap-3 bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-6 py-2 rounded-full border border-emerald-500/20 relative z-10 animate-bounce">
                  <Zap size={14} fill="currentColor" />
                  INSTANT DISBURSEMENT ELIGIBLE
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-[length:200%_auto] animate-gradient-x hover:scale-[1.02] active:scale-[0.98] text-white py-7 rounded-[2rem] font-black shadow-[0_20px_50px_rgba(147,51,234,0.3)] hover:shadow-[0_25px_60px_rgba(147,51,234,0.5)] transition-all uppercase tracking-[0.3em] text-xs relative overflow-hidden group/btn"
              >
                <span className="relative z-10">Proceed to Verification</span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 skew-x-[-20deg]"></div>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in slide-in-from-right duration-700 relative z-10">
              <div className="flex items-center gap-6">
                <button onClick={() => setStep(1)} className="w-14 h-14 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center text-white hover:bg-slate-800 hover:border-purple-500/50 transition-all group/back shadow-xl"><ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" /></button>
                <h2 className="text-3xl font-black text-white tracking-tight">Identity Vault</h2>
              </div>
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Deployment Purpose</label>
                  <div className="relative">
                    <select className="w-full bg-slate-950 p-6 rounded-[2rem] border border-slate-800 text-white outline-none focus:border-purple-500 text-sm font-bold appearance-none cursor-pointer shadow-inner">
                      <option>Venture Capital / Business</option>
                      <option>Estate Modernization</option>
                      <option>Academic Advancement</option>
                      <option>Emergency Liquidity</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><ArrowDownRight size={20} /></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Certified Monthly Revenue</label>
                  <div className="relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</div>
                    <input placeholder="e.g. 1,50,000" className="w-full bg-slate-950 p-6 pl-12 rounded-[2rem] border border-slate-800 text-white outline-none focus:border-purple-500 text-sm font-bold shadow-inner" />
                  </div>
                </div>
                <div className="p-8 bg-gradient-to-br from-purple-600/10 to-indigo-600/5 rounded-[2.5rem] border border-purple-500/20 flex items-start gap-5 shadow-2xl">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center text-purple-400 shrink-0"><ShieldCheck size={28} /></div>
                  <p className="text-xs text-purple-200/80 font-medium leading-relaxed">By confirming, you authorize the Nexus Neural Engine to perform a real-time deep-scan of your credit profile (782) and bank telemetry.</p>
                </div>
              </div>
              <button
                onClick={handleApply}
                disabled={loading}
                className="w-full bg-white text-slate-950 py-7 rounded-[2rem] font-black shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:bg-purple-50 transition-all active:scale-95 uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-4 group/final"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} className="group-hover:animate-pulse" />}
                {loading ? 'Authenticating Documents...' : 'Execute Disbursement'}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-20 animate-in zoom-in-95 duration-1000 relative z-10">
              <div className="relative inline-block mb-12">
                <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-30 animate-pulse scale-150"></div>
                <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center relative text-white shadow-2xl border-4 border-white/20">
                  <CheckCircle2 size={64} className="animate-in slide-in-from-bottom-2" />
                </div>
              </div>
              <h2 className="text-5xl font-black text-white mb-6 tracking-tighter">Mission Accomplished</h2>
              <p className="text-slate-400 text-sm mb-16 px-12 leading-relaxed font-medium">Your request for <span className="text-emerald-400 font-black">₹{amount.toLocaleString()}</span> has been authorized. The digital assets will be credited to your account within 120 minutes.</p>
              <button onClick={() => setStep(1)} className="bg-slate-800 hover:bg-slate-700 text-white px-16 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all shadow-xl hover:shadow-purple-500/10">Back to Command Center</button>
            </div>
          )}
        </div>

        {/* Reputation Engine Widget */}
        <div className="space-y-10">
          <div className="bg-slate-900 p-12 rounded-[4rem] border border-slate-800 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden h-full min-h-[500px] group transition-all duration-700 hover:border-emerald-500/30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.15),transparent)]"></div>
            <div className="absolute top-12 left-12 flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400"><TrendingUp size={18} /></div>
              <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-[0.4em]">Reputation Engine</h3>
            </div>

            <div className="relative w-72 h-72 mb-12 group/gauge">
              <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-1000 group-hover/gauge:scale-105" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="#0f172a" strokeWidth="8" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="url(#emeraldGradient)" strokeWidth="8" strokeDasharray="276" strokeDashoffset={276 - (score / 1000 * 276)} strokeLinecap="round" className="transition-all duration-[3s] ease-out" />
                <defs>
                  <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
                {/* Tick marks */}
                {[...Array(20)].map((_, i) => (
                  <line key={i} x1="50" y1="6" x2="50" y2="10" stroke={i * 50 < score ? "#10b981" : "#1e293b"} strokeWidth="1" transform={`rotate(${i * 18} 50 50)`} className="transition-colors duration-1000" />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-8xl font-black text-white tracking-tighter animate-in zoom-in duration-1000">{score}</span>
                <div className="bg-emerald-500 text-slate-950 text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.2em] mt-6 shadow-[0_10px_20px_rgba(16,185,129,0.4)] animate-bounce">EXCELLENT</div>
              </div>
            </div>

            <div className="space-y-4 mb-14 relative z-10">
              <p className="text-white font-black text-2xl tracking-tight">Status: Elite Borrower</p>
              <p className="text-slate-500 text-xs px-12 leading-relaxed font-medium">You are in the top <span className="text-emerald-400 font-black">2%</span> of Nexus users globally. Your account is pre-approved for all premium lines of credit.</p>
            </div>

            <button
              onClick={() => setShowAnalysis(true)}
              className="w-full bg-slate-950/80 border border-white/5 py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 hover:bg-slate-800 hover:text-white hover:border-emerald-500/30 transition-all shadow-inner relative overflow-hidden group/ana"
            >
              <span className="relative z-10">Detailed Analysis</span>
              <div className="absolute inset-0 bg-emerald-500/5 translate-y-[100%] group-hover/ana:translate-y-0 transition-transform duration-500"></div>
            </button>
          </div>

          {/* Active Obligations Tracker */}
          <div className="bg-slate-950/50 border border-white/5 p-10 rounded-[3.5rem] backdrop-blur-3xl relative overflow-hidden group/tracker">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] opacity-0 group-hover/tracker:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Active Telemetry</h4>
              <span className="text-[9px] text-blue-400 font-black tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">1/3 USED</span>
            </div>
            <div className="flex items-center justify-between p-8 bg-slate-900/40 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all group/item">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-400 group-hover/item:scale-110 transition-transform"><History size={28} /></div>
                <div>
                  <div className="text-white font-black text-lg tracking-tight">Personal Line</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Next Cycle: 15 May 2026</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-black text-xl tracking-tighter">₹45,200</div>
                <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1">Remaining</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InvestmentsView = () => {
  const { showToast, balance, setBalance, setTransactions, dematValue, setDematValue, goldWeight, livePrices } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('Stocks');
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipDuration, setSipDuration] = useState(5);
  const [isBuying, setIsBuying] = useState(true);

  const stocks = [
    { id: 1, name: 'Nexus Tech', sym: 'NXT', price: 1542.50, chg: '+4.2%', trend: 'up', color: '#3b82f6' },
    { id: 2, name: 'Emerald Power', sym: 'EMP', price: 824.30, chg: '+2.1%', trend: 'up', color: '#10b981' },
    { id: 3, name: 'Royal Steel', sym: 'RSL', price: 450.80, chg: '-1.2%', trend: 'down', color: '#f43f5e' },
    { id: 4, name: 'Future AI', sym: 'FAI', price: 2140.20, chg: '+8.7%', trend: 'up', color: '#8b5cf6' },
  ];

  const mutualFunds = [
    { id: 1, name: 'Nexus Bluechip', sym: 'NBX', price: 142.50, chg: '+1.4%', trend: 'up', color: '#3b82f6' },
    { id: 2, name: 'Global Tech Fund', sym: 'GTF', price: 820.30, chg: '+3.2%', trend: 'up', color: '#10b981' },
  ];

  const cryptoAssets = [
    { id: 1, name: 'Bitcoin', sym: 'BTC', price: livePrices.btc * 83.5, chg: '+0.8%', trend: 'up', color: '#f59e0b' },
    { id: 2, name: 'Ethereum', sym: 'ETH', price: livePrices.eth * 83.5, chg: '+1.2%', trend: 'up', color: '#3b82f6' },
    { id: 3, name: 'Solana', sym: 'SOL', price: livePrices.sol * 83.5, chg: '+2.5%', trend: 'up', color: '#8b5cf6' },
  ];

  const currentList = activeTab === 'Stocks' ? stocks : activeTab === 'Mutual Funds' ? mutualFunds : cryptoAssets;

  const allocationData = [
    { name: 'Savings', value: balance || 1000, color: '#3b82f6' },
    { name: 'Stocks', value: dematValue || 0, color: '#10b981' },
    { name: 'Gold', value: (goldWeight || 0) * 6500, color: '#f59e0b' },
    { name: 'Funds', value: 25000, color: '#8b5cf6' }
  ];

  const executeTrade = () => {
    if (!selectedStock) return;
    const total = selectedStock.price * quantity;
    if (isBuying && total > balance) return showToast('Insufficient funds', 'error');
    if (!isBuying && total > dematValue) return showToast('Insufficient demat balance', 'error');

    setLoading(true);
    setTimeout(() => {
      const factor = isBuying ? -1 : 1;
      setBalance(prev => prev + (total * factor));
      setDematValue(prev => prev - (total * factor));
      setTransactions(prev => [{
        id: Date.now(),
        date: 'Just now',
        desc: `${isBuying ? 'Bought' : 'Sold'} ${quantity} units of ${selectedStock.sym}`,
        cat: 'Investment',
        stat: 'Success',
        amt: total * factor
      }, ...prev]);
      setLoading(false);
      setSelectedStock(null);
      showToast(`${isBuying ? 'Investment' : 'Sale'} successful!`, 'success');
    }, 1500);
  };

  const estimatedReturns = Math.floor(sipAmount * Math.pow(1.12, sipDuration));

  const chartData = [
    { name: 'Jan', p: 45000 }, { name: 'Feb', p: 52000 }, { name: 'Mar', p: 48000 },
    { name: 'Apr', p: 61000 }, { name: 'May', p: 65000 }, { name: 'Jun', p: 72000 }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Wealth', val: `₹${(balance + dematValue + (goldWeight * 6500) + 25000).toLocaleString()}`, icon: <Wallet className="text-blue-400" /> },
          { label: 'Demat Value', val: `₹${dematValue.toLocaleString()}`, icon: <TrendingUp className="text-emerald-400" /> },
          { label: 'Gold Reserves', val: `${goldWeight}g`, icon: <Gift className="text-amber-400" /> },
          { label: 'Market Status', val: 'OPEN', icon: <Zap className="text-purple-400" /> },
        ].map((card, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl hover:border-white/10 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">{card.icon}</div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{card.label}</div>
            <div className="text-2xl font-black text-white tracking-tight">{card.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-10 relative z-10">
            <div>
              <h3 className="text-white font-black text-2xl tracking-tight">Wealth Trajectory</h3>
              <p className="text-slate-500 text-xs font-medium mt-1">Portfolio performance over time</p>
            </div>
            <div className="flex gap-4">
              {['1M', '6M', '1Y'].map(t => (
                <button key={t} className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${t === '6M' ? 'bg-white text-slate-950 border-white' : 'bg-slate-950 text-slate-500 border-white/5'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="h-80 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="p" stroke="#3b82f6" strokeWidth={5} fillOpacity={1} fill="url(#wealthGradient)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3.5rem] shadow-2xl flex flex-col justify-between">
          <h3 className="text-white font-black text-xl tracking-tight mb-8">Asset Allocation</h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={allocationData} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                  {allocationData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Diversified</span>
              <span className="text-2xl font-black text-white">PRO</span>
            </div>
          </div>
          <div className="space-y-4 mt-8">
            {allocationData.map(item => (
              <div key={item.name} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div><span className="text-slate-400">{item.name}</span></div>
                <span className="text-white">{item.value > 0 ? 'ACTIVE' : 'EMPTY'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-10 rounded-[3.5rem] shadow-2xl">
          <h3 className="text-white font-black text-2xl tracking-tight mb-10 flex items-center gap-4">
            <Target className="text-blue-400" /> Smart SIP Calculator
          </h3>
          <div className="space-y-12">
            <div className="space-y-4">
              <div className="flex justify-between text-[11px] font-black uppercase tracking-widest"><span className="text-slate-500">Monthly Contribution</span><span className="text-white">₹{sipAmount.toLocaleString()}</span></div>
              <input type="range" min="500" max="100000" step="500" value={sipAmount} onChange={(e) => setSipAmount(Number(e.target.value))} className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-full cursor-pointer" />
            </div>
            <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-[2.5rem] flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Maturity Value</div>
                <div className="text-3xl font-black text-white">₹{estimatedReturns.toLocaleString()}</div>
              </div>
              <button onClick={() => showToast('SIP Plan activated!', 'success')} className="bg-white text-slate-950 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]">Activate</button>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3.5rem] shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-white font-black text-2xl tracking-tight">Marketplace</h3>
            <div className="flex gap-2">
              {['Stocks', 'Mutual Funds', 'Crypto'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-500 bg-slate-950'}`}>{tab}</button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {currentList.map(stock => (
              <div key={stock.id} onClick={() => setSelectedStock(stock)} className="bg-slate-950 p-6 rounded-[2.5rem] border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all cursor-pointer">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-xl font-black text-white" style={{ color: stock.color }}>{stock.sym[0]}</div>
                  <div>
                    <h4 className="text-white font-black text-lg tracking-tight">{stock.name}</h4>
                    <p className="text-[10px] text-slate-500 font-black tracking-widest">{stock.sym}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-black text-lg">₹{stock.price.toLocaleString()}</div>
                  <div className={`text-[10px] font-black ${stock.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>{stock.chg}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedStock && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-3xl z-[200] flex items-center justify-center p-8">
          <div className="bg-slate-900 border border-white/10 w-full max-w-xl rounded-[4rem] p-12 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setSelectedStock(null)} className="absolute top-10 right-10 text-slate-500 hover:text-white transition-all active:scale-75"><X size={32} /></button>
            <div className="text-center mb-12">
              <div className="w-24 h-24 bg-slate-950 border border-white/10 rounded-[2.5rem] flex items-center justify-center text-4xl font-black mx-auto mb-8" style={{ color: selectedStock.color }}>{selectedStock.sym[0]}</div>
              <h3 className="text-4xl font-black text-white tracking-tight mb-2">{selectedStock.name}</h3>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{selectedStock.sym}</p>
            </div>

            <div className="bg-slate-950 p-8 rounded-[3rem] border border-white/5 mb-10">
              <div className="flex justify-between mb-8">
                <button onClick={() => setIsBuying(true)} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isBuying ? 'bg-white text-slate-950' : 'text-slate-500'}`}>Buy</button>
                <button onClick={() => setIsBuying(false)} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${!isBuying ? 'bg-white text-slate-950' : 'text-slate-500'}`}>Sell</button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Quantity</span>
                <div className="flex items-center gap-6">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 bg-slate-800 rounded-xl text-white">-</button>
                  <span className="text-2xl font-black text-white">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 bg-slate-800 rounded-xl text-white">+</button>
                </div>
              </div>
            </div>

            <button
              onClick={executeTrade}
              disabled={loading}
              className={`w-full py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center justify-center gap-4 ${isBuying ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-rose-600 text-white shadow-lg shadow-rose-500/20'}`}
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (isBuying ? 'Confirm Purchase' : 'Confirm Sale')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const RewardsView = () => {
  const { points, setPoints, setBalance, setTransactions, showToast } = useContext(AppContext);
  const [showRedeem, setShowRedeem] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Shopping', 'Dining', 'Tech', 'Travel'];

  const coupons = [
    { brand: 'Amazon Premium', discount: '₹1,000 Off', cost: 5000, category: 'Shopping', color: 'from-amber-400 to-orange-600', icon: <ShoppingBag size={24} /> },
    { brand: 'Starbucks Reserve', discount: 'Free Beverage', cost: 1500, category: 'Dining', color: 'from-emerald-600 to-teal-900', icon: <Coffee size={24} /> },
    { brand: 'Apple Store', discount: '₹2,500 Off', cost: 12000, category: 'Tech', color: 'from-slate-600 to-slate-900', icon: <Smartphone size={24} /> },
    { brand: 'Zomato Gold', discount: '3 Month Membership', cost: 2000, category: 'Dining', color: 'from-rose-500 to-rose-700', icon: <Utensils size={24} /> },
    { brand: 'Indigo Air', discount: '₹1,500 Off', cost: 7500, category: 'Travel', color: 'from-blue-600 to-blue-800', icon: <Plane size={24} /> },
    { brand: 'Netflix UHD', discount: '1 Month Free', cost: 3000, category: 'Tech', color: 'from-red-600 to-red-900', icon: <Play size={24} /> },
  ];

  const filteredCoupons = activeCategory === 'All' ? coupons : coupons.filter(c => c.category === activeCategory);

  const handleRedeem = (e) => {
    e.stopPropagation();
    if (points < redeemAmount) return showToast('Insufficient points!', 'error');
    setLoading(true);
    setTimeout(() => {
      const cashValue = redeemAmount / 10;
      setPoints(prev => prev - redeemAmount);
      setBalance(prev => prev + cashValue);
      setTransactions(prev => [{
        id: Date.now(), date: 'Just now', desc: `Redeemed ${redeemAmount} Points`, cat: 'Rewards', stat: 'Success', amt: cashValue
      }, ...prev]);
      showToast(`₹${cashValue} added to your wallet!`, 'success');
      setLoading(false);
      setShowRedeem(false);
    }, 1500);
  };

  const handleDailyCheckin = (e) => {
    e.stopPropagation();
    setPoints(prev => prev + 50);
    showToast(`Daily Reward: +50 points added!`, 'success');
  };

  return (
    <>
      {showRedeem && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-[2000] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[3.5rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowRedeem(false)} className="absolute top-10 right-10 text-slate-500 hover:text-white transition-all active:scale-75"><X size={32} /></button>
            <h3 className="text-4xl font-black text-white mb-2 tracking-tighter">Liquidate Pts</h3>
            <p className="text-slate-400 text-sm mb-10 font-medium">Instant conversion to digital currency.</p>

            <div className="bg-slate-950 p-10 rounded-[2.5rem] border border-white/5 mb-10 text-center shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4">Maturity Value</div>
              <div className="text-7xl font-black text-white tracking-tighter mb-2">₹{(redeemAmount / 10).toLocaleString()}</div>
              <div className="inline-block bg-amber-500/10 text-amber-500 text-[10px] font-black px-6 py-2 rounded-full border border-amber-500/20 tracking-[0.2em]">COST: {redeemAmount} PTS</div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-10">
              {[1000, 2500, 5000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setRedeemAmount(amt)}
                  className={`p-5 rounded-3xl border text-[10px] font-black uppercase tracking-widest transition-all active:scale-90 ${redeemAmount === amt ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-xl scale-110 z-10' : 'bg-slate-800/50 border-white/5 text-slate-500 hover:bg-slate-800'}`}
                >
                  {amt / 1000}K
                </button>
              ))}
            </div>

            <button
              onClick={handleRedeem}
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-7 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-[0_25px_60px_rgba(245,158,11,0.3)] transition-all active:scale-95 flex items-center justify-center gap-4"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} />}
              {loading ? 'Processing...' : 'Authorize Redemption'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        {/* Elite Rewards Banner */}
        <div className="bg-slate-900 border border-slate-800 p-16 rounded-[4.5rem] text-center relative overflow-hidden shadow-2xl group">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-50%,rgba(245,158,11,0.2),transparent)]"></div>
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-500/10 blur-[120px] group-hover:scale-150 transition-transform duration-1000"></div>

          <div className="relative z-10 mb-12">
            <div className="inline-block p-6 bg-slate-950 rounded-[2.5rem] border border-white/10 mb-10 shadow-2xl relative group/icon">
              <Gift size={64} className="text-amber-400 group-hover/icon:scale-110 group-hover/icon:rotate-6 transition-all duration-500" />
              <div className="absolute inset-0 bg-amber-500 blur-3xl opacity-0 group-hover/icon:opacity-30 transition-opacity"></div>
            </div>
            <h2 className="text-[12px] font-black text-amber-500 uppercase tracking-[0.8em] mb-6">Total Reserve Balance</h2>
            <div className="text-9xl font-black text-white tracking-tighter mb-4 inline-flex items-end gap-4">
              {points.toLocaleString()}
              <span className="text-4xl text-slate-600 mb-4">PTS</span>
            </div>
          </div>

          <div className="max-w-2xl mx-auto mb-16 px-10">
            <div className="flex justify-between text-[11px] font-black uppercase text-slate-500 mb-4 tracking-[0.4em]">
              <span>Tier: Platinum Elite</span>
              <span>Next Reward: 15,000 Pts</span>
            </div>
            <div className="h-6 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 p-1.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200 rounded-full transition-all duration-1000 shadow-[0_0_30px_rgba(245,158,11,0.6)] relative"
                style={{ width: `${Math.min(100, (points / 15000 * 100))}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-8 relative z-10">
            <button onClick={handleDailyCheckin} className="bg-slate-950 border border-white/10 text-white px-12 py-6 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] hover:border-amber-500/50 transition-all flex items-center justify-center gap-4 active:scale-95 group/btn shadow-2xl">
              <Calendar size={22} className="text-amber-400 group-hover/btn:scale-125 transition-transform" /> Daily Check-in
            </button>
            <button onClick={() => setShowRedeem(true)} className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-16 py-6 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] hover:shadow-[0_25px_60px_rgba(245,158,11,0.4)] transition-all active:scale-95 shadow-2xl">
              Instant Liquidation
            </button>
            <button className="bg-slate-800 text-white px-12 py-6 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] hover:bg-slate-700 transition-all active:scale-95 shadow-2xl">
              Referral Hub
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-10 py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] transition-all whitespace-nowrap border ${activeCategory === cat ? 'bg-white text-slate-950 border-white' : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dynamic Vouchers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredCoupons.map((c, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 p-10 rounded-[4rem] group hover:border-white/20 transition-all shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${c.color} opacity-0 group-hover:opacity-10 blur-[60px] transition-opacity duration-700`}></div>

              <div className="relative z-10">
                <div className={`w-20 h-20 bg-gradient-to-br ${c.color} rounded-[2rem] mb-10 flex items-center justify-center text-white shadow-[0_15px_40px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-500`}>
                  {c.icon}
                </div>
                <h4 className="text-white font-black text-3xl mb-3 tracking-tighter">{c.brand}</h4>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-8">{c.category}</p>
                <div className="text-2xl font-black text-emerald-400 mb-10 tracking-tight">{c.discount}</div>
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{c.cost} Pts Required</span>
                  </div>
                </div>
                <button
                  onClick={() => points >= c.cost ? showToast(`${c.brand} Voucher Claimed!`, 'success') : showToast('Insufficient Points!', 'error')}
                  className={`w-full py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] transition-all shadow-xl active:scale-95 ${points >= c.cost ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-slate-950 text-slate-700 border border-white/5 cursor-not-allowed'}`}
                >
                  {points >= c.cost ? 'Redeem Voucher' : 'Locked'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const AnalyticsView = () => {
  const [timePeriod, setTimePeriod] = useState('Month');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { showToast } = useContext(AppContext);

  const monthData = [
    { name: 'Housing', value: 45000, color: '#3b82f6', trend: 'stable' },
    { name: 'Shopping', value: 12000, color: '#8b5cf6', trend: 'up' },
    { name: 'Food', value: 8500, color: '#10b981', trend: 'down' },
    { name: 'Travel', value: 5000, color: '#f59e0b', trend: 'up' },
    { name: 'Utilities', value: 4200, color: '#06b6d4', trend: 'stable' },
  ];

  const yearData = [
    { name: 'Housing', value: 540000, color: '#3b82f6', trend: 'stable' },
    { name: 'Shopping', value: 144000, color: '#8b5cf6', trend: 'up' },
    { name: 'Food', value: 102000, color: '#10b981', trend: 'down' },
    { name: 'Travel', value: 60000, color: '#f59e0b', trend: 'up' },
    { name: 'Utilities', value: 50400, color: '#06b6d4', trend: 'stable' },
  ];

  const currentPieData = timePeriod === 'Month' ? monthData : yearData;

  const forecastData = [
    { day: 'Mon', spend: 1200, forecast: 1100 },
    { day: 'Tue', spend: 800, forecast: 950 },
    { day: 'Wed', spend: 2400, forecast: 1800 },
    { day: 'Thu', spend: 1500, forecast: 1600 },
    { day: 'Fri', spend: 3200, forecast: 2800 },
    { day: 'Sat', spend: 3900, forecast: 4200 },
    { day: 'Sun', spend: 2100, forecast: 3500 },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Detail Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-[2000] flex items-center justify-center p-8">
          <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[4rem] p-12 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setSelectedCategory(null)} className="absolute top-10 right-10 text-slate-500 hover:text-white transition-all active:scale-75"><X size={32} /></button>

            <div className="flex items-center gap-8 mb-12">
              <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl" style={{ backgroundColor: selectedCategory.color }}>{selectedCategory.name[0]}</div>
              <div>
                <h3 className="text-4xl font-black text-white tracking-tighter">{selectedCategory.name} Analysis</h3>
                <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em] mt-2">Telemetry Record • {timePeriod}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-12">
              <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-white/5">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Total Outflow</div>
                <div className="text-3xl font-black text-white tracking-tight">₹{selectedCategory.value.toLocaleString()}</div>
              </div>
              <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-white/5">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Trend Status</div>
                <div className={`text-3xl font-black tracking-tight ${selectedCategory.trend === 'up' ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {selectedCategory.trend === 'up' ? '▲ High' : '▼ Healthy'}
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-12 max-h-64 overflow-y-auto pr-4 no-scrollbar">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-slate-950/50 p-6 rounded-[1.5rem] border border-white/5 flex justify-between items-center group hover:bg-slate-800 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-slate-600 group-hover:text-white transition-colors"><Zap size={20} /></div>
                    <div>
                      <p className="text-white font-black text-sm">Nexus Transaction-0{i}XF</p>
                      <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Processed Just now</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black text-lg">-₹{(selectedCategory.value / 6).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setSelectedCategory(null)} className="w-full bg-white text-slate-950 py-6 rounded-[2rem] font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">Dismiss Analysis</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Financial Scoreboard */}
        <div className="xl:col-span-1 bg-slate-900 border border-slate-800 p-12 rounded-[4.5rem] flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent"></div>
          <h3 className="text-slate-500 text-[11px] font-black uppercase tracking-[0.5em] mb-16 w-full text-left relative z-10">Neural Credit Score</h3>

          <div className="relative w-64 h-64 mb-12 group/gauge">
            <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_40px_rgba(59,130,246,0.3)]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#0f172a" strokeWidth="8" />
              <circle cx="50" cy="50" r="44" fill="none" stroke="url(#analyticsBlue)" strokeWidth="8" strokeDasharray="276" strokeDashoffset={276 - (89 / 100 * 276)} strokeLinecap="round" className="transition-all duration-[2.5s] ease-in-out" />
              <defs>
                <linearGradient id="analyticsBlue" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-8xl font-black text-white tracking-tighter">89</span>
              <div className="bg-emerald-500 text-slate-950 text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest mt-6 shadow-[0_15px_30px_rgba(16,185,129,0.3)]">PRIME ELITE</div>
            </div>
          </div>

          <div className="space-y-6 relative z-10 bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              "Your financial trajectory is <span className="text-emerald-400 font-black">94% optimized</span>. By reducing food spend by ₹1.2k, you can reach Tier-1 status by next month."
            </p>
            <div className="flex justify-center gap-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-150"></div>
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse delay-300"></div>
            </div>
          </div>
        </div>

        {/* Categories Matrix */}
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 p-12 rounded-[4.5rem] shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-16 relative z-10">
            <div>
              <h3 className="text-white font-black text-2xl tracking-tighter uppercase tracking-[0.1em]">Allocation Matrix</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Live spending telemetry</p>
            </div>
            <div className="flex bg-slate-950 p-2 rounded-[2rem] border border-white/5 shadow-inner">
              {['Month', 'Year'].map(t => (
                <button
                  key={t}
                  onClick={() => setTimePeriod(t)}
                  className={`px-10 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${timePeriod === t ? 'bg-white text-slate-950 shadow-2xl scale-105' : 'text-slate-600 hover:text-white'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
            <div className="h-80 group/pie relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={currentPieData} innerRadius={85} outerRadius={115} paddingAngle={10} dataKey="value" animationDuration={2000}>
                    {currentPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" className="hover:opacity-80 transition-opacity cursor-pointer outline-none" onClick={() => setSelectedCategory(entry)} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', padding: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-2">Total Out</div>
                <div className="text-3xl font-black text-white tracking-tighter">₹{currentPieData.reduce((a, b) => a + b.value, 0).toLocaleString()}</div>
              </div>
            </div>

            <div className="space-y-8">
              {currentPieData.map(item => (
                <div key={item.name} className="group cursor-pointer space-y-3" onClick={() => setSelectedCategory(item)}>
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: item.color }}></div>
                      <span className="text-white font-black text-sm tracking-tight group-hover:translate-x-2 transition-transform">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-black text-lg tracking-tighter">₹{item.value.toLocaleString()}</div>
                      <div className={`text-[9px] font-black uppercase tracking-widest ${item.trend === 'up' ? 'text-rose-500' : item.trend === 'down' ? 'text-emerald-500' : 'text-slate-600'}`}>
                        {item.trend === 'up' ? '+8.4%' : item.trend === 'down' ? '-12.2%' : 'STABLE'}
                      </div>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 p-0.5">
                    <div className="h-full rounded-full transition-all duration-[2s] ease-in-out shadow-2xl" style={{ width: `${(item.value / currentPieData.reduce((a, b) => a + b.value, 0)) * 100}%`, backgroundColor: item.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Spends Pulse Chart */}
      <div className="bg-slate-900 border border-slate-800 p-12 rounded-[4.5rem] shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
          <div>
            <h3 className="text-white font-black text-2xl tracking-tighter uppercase tracking-[0.1em]">Spending Pulse</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Neural Prediction vs Actual</p>
          </div>
          <div className="flex gap-10 bg-slate-950/50 p-6 rounded-[2rem] border border-white/5">
            <div className="flex items-center gap-3"><div className="w-4 h-4 bg-blue-500 rounded-[0.5rem] shadow-lg shadow-blue-500/20"></div><span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Reality</span></div>
            <div className="flex items-center gap-3"><div className="w-4 h-4 bg-slate-800 rounded-[0.5rem] border border-white/20"></div><span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">AI Forecast</span></div>
          </div>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecastData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barGap={12}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: 'black' }} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }} />
              <Bar dataKey="spend" fill="#3b82f6" radius={[12, 12, 0, 0]} animationDuration={2000} />
              <Bar dataKey="forecast" fill="#1e293b" radius={[12, 12, 0, 0]} animationDuration={2500} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const SecurityView = () => {
  const { showToast } = useContext(AppContext);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState(0);
  const [protocols, setProtocols] = useState({
    quantum: true,
    geo: true,
    merchant: false,
    mfa: true,
    biometric: true
  });

  const [devices, setDevices] = useState([
    { id: 1, name: 'Nexus Node • Windows 11', loc: 'Delhi, IN • Active Now', active: true, icon: <LayoutDashboard /> },
    { id: 2, name: 'Mobile Node • iPhone 15', loc: 'Mumbai, IN • 2 Hours Ago', active: false, icon: <Smartphone /> },
    { id: 3, name: 'Backup Node • MacBook Pro', loc: 'London, UK • Yesterday', active: false, icon: <Zap /> },
  ]);

  const auditSteps = [
    'Initializing Neural Firewall...',
    'Decrypting Quantum Keys...',
    'Scanning Biometric Nodes...',
    'Syncing Merchant Whitelist...',
    'Reinforcing Global Shield...'
  ];

  const runAudit = () => {
    setIsAuditing(true);
    setAuditStep(0);
    const interval = setInterval(() => {
      setAuditStep(prev => {
        if (prev >= auditSteps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setIsAuditing(false);
            showToast('Shield Integrity: 100% Secure', 'success');
          }, 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  };

  const toggleProtocol = (key) => {
    setProtocols(prev => ({ ...prev, [key]: !prev[key] }));
    showToast(`${key.toUpperCase()} Protocol Updated`, 'success');
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {isAuditing && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl z-[3000] flex items-center justify-center p-8">
          <div className="text-center max-w-xl w-full">
            <div className="relative inline-block mb-16">
              <div className="absolute inset-0 bg-blue-500 blur-[100px] opacity-20 animate-pulse"></div>
              <div className="w-48 h-48 border-4 border-white/5 rounded-[3.5rem] flex items-center justify-center relative z-10 overflow-hidden">
                <ShieldCheck size={80} className="text-blue-400 animate-bounce" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent"></div>
              </div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500/30 rounded-[3.5rem] animate-ping"></div>
            </div>
            <h3 className="text-5xl font-black text-white mb-6 tracking-tighter uppercase">Neural Shield Audit</h3>
            <div className="h-3 w-full bg-slate-900 rounded-full mb-10 overflow-hidden border border-white/5 p-1 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-700 shadow-[0_0_30px_rgba(59,130,246,0.6)]"
                style={{ width: `${((auditStep + 1) / auditSteps.length) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center px-4">
              <span className="text-blue-400 text-xs font-black uppercase tracking-[0.4em] animate-pulse">{auditSteps[auditStep]}</span>
              <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">{Math.round(((auditStep + 1) / auditSteps.length) * 100)}% COMPLETE</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        {/* Fortress Overview */}
        <div className="xl:col-span-1 bg-slate-900 border border-slate-800 p-12 rounded-[4.5rem] flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.1),transparent)]"></div>
          <div className="w-24 h-24 bg-slate-950 rounded-[2.5rem] border border-white/10 flex items-center justify-center mb-10 shadow-2xl group-hover:border-blue-500/50 transition-all">
            <ShieldCheck size={48} className="text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">Nexus Shield</h2>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] mb-12">v4.0 Protocol Active</p>

          <div className="w-full space-y-4 mb-12">
            {[
              { l: 'Neural Key', v: 'RSA-8192', s: 'Secure' },
              { l: 'Audit Status', v: 'Verified', s: 'Ok' },
              { l: 'Threat Map', v: '0 Active', s: 'Clear' }
            ].map((st, i) => (
              <div key={i} className="flex justify-between items-center p-6 bg-slate-950/50 rounded-[2rem] border border-white/5 group/stat hover:border-blue-500/30 transition-all">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{st.l}</span>
                <span className="text-blue-400 font-black text-[10px] tracking-widest uppercase">{st.v}</span>
              </div>
            ))}
          </div>

          <button onClick={runAudit} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-7 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4">
            <Zap size={22} /> Execute Master Audit
          </button>
        </div>

        {/* Global Node Management */}
        <div className="xl:col-span-3 bg-slate-900 border border-slate-800 p-12 rounded-[4.5rem] shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-16 relative z-10">
            <div>
              <h3 className="text-white font-black text-3xl tracking-tighter uppercase tracking-[0.1em]">Access Nodes</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Authorized terminals currently synced</p>
            </div>
            <div className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-4 shadow-xl">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
              <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Quantum Monitoring Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {devices.map(dev => (
              <div key={dev.id} className="bg-slate-950/60 border border-white/5 p-8 rounded-[3rem] flex items-center justify-between group hover:border-white/20 transition-all relative">
                <div className="flex items-center gap-8">
                  <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl border border-white/5 ${dev.active ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-900 text-slate-600'}`}>
                    {dev.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <h4 className="text-white font-black text-xl tracking-tight">{dev.name}</h4>
                      {dev.active && <span className="px-3 py-1 bg-blue-500 text-white text-[9px] font-black rounded-full shadow-lg">PRIMARY</span>}
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{dev.loc}</p>
                  </div>
                </div>
                {!dev.active && (
                  <button onClick={() => showToast('Node terminated', 'success')} className="p-5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white shadow-2xl">
                    <ShieldAlert size={24} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 flex justify-between items-center px-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-600/10 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-500/20"><ShieldAlert size={24} /></div>
              <button onClick={() => showToast('EMERGENCY KILL-SWITCH ACTIVATED (Simulated)', 'error')} className="text-rose-500 text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all">Emergency Account Kill-Switch</button>
            </div>
            <button onClick={() => showToast('Rotating all access keys...', 'success')} className="px-10 py-5 bg-slate-950 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all flex items-center gap-3 border border-white/5">
              <Zap size={18} className="text-blue-400" /> Rotate Neural Tokens
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Defensive Protocols */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {[
          { k: 'quantum', l: 'Quantum Mesh', d: 'Anti-Bruteforce AI', i: <Zap />, c: 'blue' },
          { k: 'geo', l: 'Geo-Fence', d: 'Location Lock', i: <MapPin />, c: 'emerald' },
          { k: 'merchant', l: 'Store Shield', d: 'Whitelist Only', i: <ShoppingBag />, c: 'amber' },
          { k: 'biometric', l: 'Face Neural', d: 'Always-On Bio', i: <Target />, c: 'purple' },
        ].map(item => (
          <div key={item.k} className="bg-slate-900 border border-slate-800 p-10 rounded-[3.5rem] shadow-2xl group hover:border-white/10 transition-all">
            <div className={`w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-500 mb-8 border border-blue-500/20 group-hover:scale-110 transition-transform`}>
              {item.i}
            </div>
            <h4 className="text-white font-black text-2xl mb-2 tracking-tighter">{item.l}</h4>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-10">{item.d}</p>
            <button
              onClick={() => toggleProtocol(item.k)}
              className={`w-full py-4 rounded-2xl relative overflow-hidden transition-all duration-500 ${protocols[item.k] ? `bg-blue-600 text-white shadow-xl` : 'bg-slate-950 text-slate-500 border border-white/5'}`}
            >
              <span className="relative z-10 font-black text-[10px] uppercase tracking-widest">{protocols[item.k] ? 'Enabled' : 'Disabled'}</span>
              {protocols[item.k] && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- FRAUD CENTER / ADMIN VIEW ---
const AdminView = () => {
  const { showToast, setIsKycVerified } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('fraud');
  const [fraudAlerts, setFraudAlerts] = useState([
    { id: 1, time: '10:42:01', acc: 'NX-98234711', amt: '₹1,05,000.00', rule: 'VELOCITY_LIMIT_EXCEEDED', risk: 'High' },
    { id: 2, time: '09:15:22', acc: 'NX-12345678', amt: '₹0.00', rule: 'BRUTEFORCE_ATTEMPT', risk: 'Critical' },
    { id: 3, time: '08:45:10', acc: 'NX-77211090', amt: '₹45,000.00', rule: 'GEO_ANOMALY', risk: 'Medium' },
  ]);

  const [kycRequests, setKycRequests] = useState([
    { id: 1, name: 'Rahul Sharma', doc: 'Neural Scan + Aadhaar', status: 'Pending' },
    { id: 2, name: 'Priya Patel', doc: 'Biometric Passport', status: 'In Review' },
  ]);

  const handleKycApproval = (id, name) => {
    setKycRequests(prev => prev.filter(r => r.id !== id));
    setIsKycVerified(true);
    showToast(`KYC Authorized for ${name}`, 'success');
  };

  const handleFraudAction = (id, action) => {
    setFraudAlerts(prev => prev.filter(a => a.id !== id));
    showToast(`Alert-0${id} Status: ${action}`, 'success');
  };

  return (
    <div className="bg-slate-950 p-12 rounded-[4.5rem] border border-rose-500/20 shadow-[0_0_150px_rgba(244,63,94,0.15)] animate-in fade-in zoom-in-95 duration-1000 relative overflow-hidden min-h-[850px] flex flex-col">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[150px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] animate-pulse delay-1000"></div>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-16 gap-10 relative z-10">
        <div className="flex items-center gap-10">
          <div className="w-24 h-24 bg-rose-500/10 rounded-[2.5rem] flex items-center justify-center text-rose-500 shadow-[0_0_60px_rgba(244,63,94,0.3)] border border-rose-500/30 group">
            <ShieldAlert size={48} className="animate-pulse group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase">Nexus Command Hub</h2>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-white/5 rounded-full">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Watch v4.2</span>
              </div>
              <span className="text-slate-700 text-[10px] font-black uppercase tracking-widest">• 1,024 Nodes Online</span>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="text-right">
            <div className="text-rose-500 text-[10px] font-black uppercase tracking-[0.4em] mb-1">Defense Level</div>
            <div className="text-white font-black text-2xl tracking-tighter">OMNICHANNEL-S</div>
          </div>
          <div className="w-px h-12 bg-white/10"></div>
          <div className="text-right">
            <div className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-1">Response Time</div>
            <div className="text-white font-black text-2xl tracking-tighter">1.2ms</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16 relative z-10">
        {[
          { id: 'fraud', label: 'Threat Intelligence', val: fraudAlerts.length, color: 'rose', icon: <AlertCircle /> },
          { id: 'kyc', label: 'Identity Verification', val: kycRequests.length, color: 'blue', icon: <UserCog /> },
          { id: 'loans', label: 'Asset Allocation', val: '14', color: 'emerald', icon: <Briefcase /> },
          { id: 'sys', label: 'Core Integrity', val: '100%', color: 'blue', icon: <TrendingUp /> }
        ].map(stat => (
          <div
            key={stat.id}
            onClick={() => stat.id !== 'sys' && setActiveTab(stat.id)}
            className={`p-10 rounded-[3rem] border transition-all cursor-pointer relative overflow-hidden group ${activeTab === stat.id ? `bg-slate-900 border-${stat.color}-500/50 shadow-2xl scale-[1.02]` : 'bg-slate-900/40 border-white/5 hover:border-white/20'}`}
          >
            <div className={`text-6xl font-black mb-4 tracking-tighter text-${stat.color}-400 group-hover:scale-110 transition-transform duration-500`}>{stat.val}</div>
            <div className="text-[11px] text-slate-500 uppercase font-black tracking-[0.2em] flex items-center gap-3">
              {stat.icon} {stat.label}
            </div>
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 blur-3xl -mr-16 -mt-16`}></div>
          </div>
        ))}
      </div>

      <div className="flex-1 bg-slate-900/60 rounded-[4rem] border border-white/10 p-12 overflow-hidden flex flex-col relative z-10 backdrop-blur-3xl shadow-inner">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-6">
            <div className={`w-4 h-4 rounded-full animate-ping ${activeTab === 'fraud' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
            <h3 className="text-3xl font-black text-white capitalize tracking-tighter">Live {activeTab} Telemetry</h3>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-2 bg-slate-950 border border-white/5 rounded-full text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest">Filter: Latest</button>
            <button className="px-6 py-2 bg-slate-950 border border-white/5 rounded-full text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest">Export Logs</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-4 no-scrollbar">
          {activeTab === 'fraud' && (
            <div className="space-y-6">
              {fraudAlerts.map(alert => (
                <div key={alert.id} className="bg-slate-950/50 border border-white/5 p-8 rounded-[2.5rem] flex items-center justify-between group hover:bg-slate-800/50 transition-all">
                  <div className="flex items-center gap-10">
                    <div className="text-center">
                      <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">UTC-Time</div>
                      <div className="text-white font-black text-xs font-mono">{alert.time}</div>
                    </div>
                    <div className="w-px h-10 bg-white/5"></div>
                    <div>
                      <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Subject Node</div>
                      <div className="text-rose-400 font-bold font-mono text-sm">{alert.acc}</div>
                    </div>
                    <div className="w-px h-10 bg-white/5"></div>
                    <div>
                      <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Magnitude</div>
                      <div className="text-white font-black text-sm">{alert.amt}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${alert.risk === 'Critical' ? 'bg-rose-500/20 text-rose-500 border-rose-500/30 animate-pulse' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                      {alert.rule}
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => handleFraudAction(alert.id, 'QUARANTINED')} className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Quarantine</button>
                      <button onClick={() => handleFraudAction(alert.id, 'RESOLVED')} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Dismiss</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'kyc' && (
            <div className="space-y-6">
              {kycRequests.map(kyc => (
                <div key={kyc.id} className="bg-slate-950/50 border border-white/5 p-8 rounded-[2.5rem] flex items-center justify-between group hover:bg-slate-800/50 transition-all">
                  <div className="flex items-center gap-10">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 font-black text-2xl">{kyc.name[0]}</div>
                    <div>
                      <h4 className="text-white font-black text-xl tracking-tight mb-1">{kyc.name}</h4>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{kyc.doc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <div className="text-slate-600 text-[9px] font-black uppercase tracking-widest mb-1">Status Protocol</div>
                      <div className="text-blue-400 font-black text-[10px] tracking-widest uppercase">{kyc.status}</div>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => handleKycApproval(kyc.id, kyc.name)} className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Authorize Identity</button>
                      <button onClick={() => showToast('Entity Flagged for Deletion', 'error')} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Deny</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'loans' && (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-6 animate-bounce"><Briefcase size={40} /></div>
              <h4 className="text-white font-black text-2xl tracking-tighter mb-2">Portfolio Management</h4>
              <p className="text-slate-500 text-sm font-medium">All loan allocations are currently in equilibrium.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsView = () => {
  const { showToast, isKycVerified } = useContext(AppContext);
  const [settings, setSettings] = useState({
    dark: true,
    notifications: true,
    biometrics: true,
    marketing: false,
    stealth: false
  });

  const toggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    if (key === 'dark') document.body.classList.toggle('light-mode');
    showToast(`${key.toUpperCase()} Status Updated`, 'success');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 pb-20">
      {/* Profile Master Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-[5rem] shadow-2xl relative overflow-hidden group">
        <div className="h-64 bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-600 relative">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.1),transparent)]"></div>
        </div>

        <div className="px-16 pb-16 -mt-24 relative z-10">
          <div className="flex flex-col md:flex-row items-end gap-12 mb-16">
            <div className="relative group/avatar">
              <div className="w-48 h-48 bg-slate-900 rounded-[4rem] p-3 border-[10px] border-slate-950 shadow-2xl overflow-hidden relative">
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-800 rounded-[3rem] flex items-center justify-center text-6xl font-black text-white">
                  {localStorage.getItem('userName')?.[0]?.toUpperCase() || 'K'}
                </div>
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/avatar:opacity-100 transition-all flex items-center justify-center">
                  <Zap size={40} className="text-white" />
                </div>
              </div>
              <div className="absolute bottom-4 right-4 bg-emerald-500 w-12 h-12 rounded-full border-4 border-slate-950 flex items-center justify-center text-slate-950 shadow-2xl">
                <ShieldCheck size={24} />
              </div>
            </div>

            <div className="flex-1 mb-4">
              <h2 className="text-6xl font-black text-white tracking-tighter mb-3 leading-none">{localStorage.getItem('userName') || 'Kajal Singh'}</h2>
              <div className="flex items-center gap-4">
                <p className="text-slate-500 text-xs font-black uppercase tracking-[0.5em]">{localStorage.getItem('userEmail') || 'KAJAL7295I@GMAIL.COM'}</p>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Active State</span>
              </div>
            </div>

            <div className="flex gap-8 mb-6 bg-slate-950/50 p-8 rounded-[3rem] border border-white/5">
              <div className="text-center">
                <div className="text-blue-400 text-3xl font-black tracking-tighter">NX-01</div>
                <div className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Node Class</div>
              </div>
              <div className="w-px h-10 bg-white/10 mt-2"></div>
              <div className="text-center">
                <div className="text-emerald-400 text-3xl font-black tracking-tighter">98.4</div>
                <div className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Trust Score</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* System Controls */}
            <div className="space-y-12 bg-slate-950/30 p-12 rounded-[4rem] border border-white/5 shadow-inner">
              <h3 className="text-white font-black text-2xl tracking-tighter flex items-center gap-4">
                <LayoutDashboard className="text-blue-500" /> Interface Protocol
              </h3>
              <div className="space-y-10">
                {[
                  { id: 'dark', label: 'Neural Adaptive Theme', desc: 'Auto-adjust luminance based on context', icon: <Moon />, color: 'blue' },
                  { id: 'stealth', label: 'Ghost Protocol (Stealth)', desc: 'Obfuscate transaction metadata', icon: <ShieldAlert />, color: 'rose' },
                ].map(s => (
                  <div key={s.id} className="flex items-center justify-between group cursor-pointer" onClick={() => toggle(s.id)}>
                    <div className="flex items-center gap-8">
                      <div className={`w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-600 group-hover:text-${s.color}-400 transition-all border border-white/5`}>
                        {s.icon}
                      </div>
                      <div>
                        <div className="font-black text-white text-xl tracking-tight">{s.label}</div>
                        <div className="text-[10px] text-slate-500 font-medium italic mt-1">{s.desc}</div>
                      </div>
                    </div>
                    <div className={`w-16 h-8 rounded-full relative transition-all duration-500 ${settings[s.id] ? `bg-${s.color}-600 shadow-lg shadow-${s.color}-600/30` : 'bg-slate-800'}`}>
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500 ${settings[s.id] ? 'left-9' : 'left-1'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Controls */}
            <div className="space-y-12 bg-slate-950/30 p-12 rounded-[4rem] border border-white/5 shadow-inner">
              <h3 className="text-white font-black text-2xl tracking-tighter flex items-center gap-4">
                <ShieldCheck className="text-emerald-500" /> Security Intelligence
              </h3>
              <div className="space-y-10">
                {[
                  { id: 'notifications', label: 'Cognitive Alerts', desc: 'AI-driven push notifications', icon: <Bell />, color: 'emerald' },
                  { id: 'biometrics', label: 'Face Neural ID', desc: 'Quantum biometric verification', icon: <Fingerprint />, color: 'blue' },
                ].map(s => (
                  <div key={s.id} className="flex items-center justify-between group cursor-pointer" onClick={() => toggle(s.id)}>
                    <div className="flex items-center gap-8">
                      <div className={`w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-600 group-hover:text-${s.color}-400 transition-all border border-white/5`}>
                        {s.icon}
                      </div>
                      <div>
                        <div className="font-black text-white text-xl tracking-tight">{s.label}</div>
                        <div className="text-[10px] text-slate-500 font-medium italic mt-1">{s.desc}</div>
                      </div>
                    </div>
                    <div className={`w-16 h-8 rounded-full relative transition-all duration-500 ${settings[s.id] ? `bg-${s.color}-600 shadow-lg shadow-${s.color}-600/30` : 'bg-slate-800'}`}>
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500 ${settings[s.id] ? 'left-9' : 'left-1'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-20 pt-16 border-t border-white/10 flex flex-col xl:flex-row justify-between items-center gap-12">
            <div className="flex gap-12">
              <button onClick={() => showToast('Account data archived', 'success')} className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] hover:text-white transition-all flex items-center gap-3"><FileText size={18} /> Repository Archive</button>
              <button onClick={() => showToast('Memory purged', 'success')} className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] hover:text-white transition-all flex items-center gap-3"><Zap size={18} /> Cache Purge</button>
            </div>
            <div className="flex gap-6">
              <button onClick={() => showToast('Neural State Persisted', 'success')} className="bg-white text-slate-950 px-12 py-6 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 shadow-2xl">Synchronize State</button>
              <button onClick={() => window.location.reload()} className="bg-rose-500/10 text-rose-500 px-12 py-6 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-rose-500 hover:text-white border border-rose-500/20">System Termination</button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 opacity-20 mt-12">
        <div className="flex gap-6">
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce delay-200"></div>
        </div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[1em]">Nexus Neural Core Settings Vector</p>
      </div>
    </div>
  );
};

// --- AUTH SCREEN ---
const AuthScreen = ({ setToken }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const scanSteps = [
    'Initializing Neural Mesh...',
    'Scanning Retinal Nodes...',
    'Verifying DNA Sequence...',
    'Decrypting Identity Kernel...',
    'Nexus Link Established!'
  ];

  const startScan = (callback) => {
    setScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setScanning(false);
            callback();
          }, 1000);
          return 100;
        }
        return prev + 4;
      });
    }, 60);
  };

  const handleDemoLogin = (e) => {
    e.preventDefault();
    startScan(() => {
      localStorage.setItem('userEmail', 'kajal7295i@gmail.com');
      localStorage.setItem('userName', 'Kajal Kumari');
      localStorage.setItem('nexus_demo_mode', 'true');
      const demoToken = 'DEMO_MODE_TOKEN_' + Date.now();
      setToken(demoToken);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    startScan(async () => {
      setLoading(true);
      try {
        const endpoint = isLogin ? '/auth/login' : '/auth/register';
        const payload = isLogin ? { email, password } : { email, password, fullName };
        const res = await axios.post(`${API_BASE_URL}${endpoint}`, payload);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', !isLogin ? fullName : email.split('@')[0]);
        setToken(res.data.token);
      } catch (err) {
        if (err.message === 'Network Error') {
          setError('Backend Offline: Using Demo Gateway is recommended.');
        } else {
          setError(err.response?.data?.error || 'Authentication Failed');
        }
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8 relative overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Cinematic Background */}
      <div className="absolute top-[-30%] left-[-20%] w-[1000px] h-[1000px] bg-blue-600/5 rounded-full blur-[180px] animate-pulse"></div>
      <div className="absolute bottom-[-30%] right-[-20%] w-[1000px] h-[1000px] bg-indigo-600/5 rounded-full blur-[180px] animate-pulse delay-1000"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent)] pointer-events-none"></div>

      <div className="max-w-xl w-full relative z-10 animate-in fade-in zoom-in-95 duration-1000">

        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[3.5rem] bg-slate-900 border border-white/5 shadow-2xl mb-8 relative group">
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl group-hover:bg-blue-500/40 transition-all"></div>
            <ShieldCheck size={40} className="text-blue-400 relative z-10" />
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter mb-4 leading-none uppercase">Nexus Hub</h1>
          <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.6em]">Secure Identity Gateway v4.2</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 p-12 rounded-[4.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">

          {scanning ? (
            <div className="py-20 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
              <div className="relative mb-16">
                <div
                  className="absolute left-[-20px] right-[-20px] h-1.5 bg-blue-400 shadow-[0_0_30px_#3b82f6] z-20 transition-all duration-75 rounded-full"
                  style={{ top: `${scanProgress}%` }}
                ></div>
                <div className="w-32 h-32 bg-slate-950 rounded-[2.5rem] flex items-center justify-center border border-white/5 shadow-inner">
                  <Fingerprint size={80} className={`transition-all duration-500 ${scanProgress > 50 ? 'text-blue-400 scale-110' : 'text-slate-700'}`} strokeWidth={1} />
                </div>
                <div className="absolute inset-0 bg-blue-500 blur-[80px] opacity-10 animate-pulse"></div>
              </div>
              <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Biometric Scan</h3>
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse h-4">{scanSteps[Math.min(Math.floor(scanProgress / 20), 4)]}</p>

              <div className="w-full h-3 bg-slate-950 rounded-full mt-16 overflow-hidden border border-white/5 p-1">
                <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-75 shadow-[0_0_20px_rgba(59,130,246,0.5)]" style={{ width: `${scanProgress}%` }}></div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-3xl flex items-start gap-4 animate-in slide-in-from-top-4">
                  <AlertCircle size={22} className="text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-rose-400 text-xs font-bold leading-relaxed">{error}</p>
                </div>
              )}

              <div className="space-y-8">
                {!isLogin && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Full Identity</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-950/50 p-6 rounded-[2rem] border border-white/5 text-white outline-none focus:border-blue-500/50 transition-all text-sm font-bold shadow-inner placeholder:text-slate-800"
                      placeholder="Enter legal name"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Neural Address (Email)</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/50 p-6 rounded-[2rem] border border-white/5 text-white outline-none focus:border-blue-500/50 transition-all text-sm font-bold shadow-inner placeholder:text-slate-800"
                    placeholder="name@nexus.io"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Neural Key (Password)</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/50 p-6 rounded-[2rem] border border-white/5 text-white outline-none focus:border-blue-500/50 transition-all text-sm font-bold shadow-inner placeholder:text-slate-800"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-7 rounded-[2rem] font-black shadow-[0_20px_50px_rgba(37,99,235,0.3)] transition-all active:scale-95 uppercase tracking-[0.4em] text-[11px] flex justify-center items-center gap-4 mt-10"
              >
                {loading ? <Loader2 className="animate-spin" size={22} /> : <Zap size={22} />}
                {isLogin ? 'Establish Link' : 'Register Identity'}
              </button>

              <div className="relative flex items-center py-6">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink-0 mx-6 text-slate-700 text-[10px] font-black uppercase tracking-widest">Quantum Gateway</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              <button
                onClick={handleDemoLogin}
                type="button"
                className="w-full bg-slate-950 hover:bg-slate-800 border border-white/5 text-slate-400 py-6 rounded-[2rem] font-black transition-all active:scale-95 uppercase tracking-[0.3em] text-[10px] flex justify-center items-center gap-4 shadow-xl"
              >
                <Fingerprint size={20} className="text-blue-500" />
                Fingerprint Access
              </button>

              <div className="text-center mt-10">
                <button
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setError(''); }}
                  className="text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest transition-all"
                >
                  {isLogin ? "No Identity? Create Nexus ID →" : "← Already Linked? Return to Hub"}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-16 text-center opacity-30">
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.8em]">Neural Encrypted Nexus Kernel v4.2</p>
        </div>
      </div>
    </div>
  );
};

// --- NEXUS AI ASSISTANT ---
const NexusAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'ai', text: 'Identity verified. I am Nexus AI. Ready for financial execution.' }]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const { balance, points, transactions, setBalance, setTransactions, showToast } = useContext(AppContext);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { label: 'Check Health', icon: <Activity size={12} /> },
    { label: 'Market Pulse', icon: <TrendingUp size={12} /> },
    { label: 'Asset Map', icon: <BarChart3 size={12} /> }
  ];

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice Interface Offline', 'error');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setTimeout(() => handleSend(transcript), 400);
    };

    recognition.start();
  };

  const handleSend = async (overrideInput = null) => {
    const textToSend = typeof overrideInput === 'string' ? overrideInput : input;
    if (!textToSend.trim()) return;
    const userMsg = textToSend.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');

    const query = userMsg.toLowerCase();

    if (query.includes('transfer') || query.includes('send') || query.includes('pay')) {
      const words = query.split(' ');
      const amtStr = words.find(w => !isNaN(w.replace('₹', '').replace(',', '')) && parseFloat(w.replace('₹', '').replace(',', '')) > 0);
      const amount = amtStr ? parseFloat(amtStr.replace('₹', '').replace(',', '')) : null;
      let toIndex = words.indexOf('to');
      if (toIndex === -1) toIndex = words.indexOf('send') + 1;
      const recipient = toIndex !== -1 && words[toIndex + 1] ? words[toIndex + 1] : 'Unknown Node';

      if (amount && recipient !== 'Unknown Node') {
        if (balance >= amount) {
          setBalance(prev => prev - amount);
          setTransactions(prev => [{ id: Date.now().toString(), date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), desc: `AI Core Transfer: ${recipient}`, cat: 'Transfer', stat: 'Success', amt: -amount }, ...prev]);
          showToast(`Execution Success: sent ₹${amount} to ${recipient}`, 'success');
          setMessages(prev => [...prev, { role: 'ai', text: `Transaction Authorized. Dispatched ₹${amount} to ${recipient}. Ledger synchronized.` }]);
          return;
        } else {
          setMessages(prev => [...prev, { role: 'ai', text: `Authorization Failed. Insufficient liquidity in current node cluster.` }]);
          return;
        }
      }
    }

    try {
      setIsThinking(true);
      const contextData = { balance, points, transactions };
      const res = await axios.post(`${API_BASE_URL}/user/chat`, { message: userMsg, context: contextData });
      setMessages(prev => [...prev, { role: 'ai', text: res.data.reply }]);
    } catch (err) {
      // --- ROBUST LOCAL FALLBACK ---
      let localReply = "Neural link interference detected. Fallback intelligence active.";

      if (/bal|money|fund|how much/.test(query)) {
        localReply = `Local Cache Synced: Your Nexus Balance is ₹${balance.toLocaleString()}. Assets are secure.`;
      } else if (/spend|kharcha|spent/.test(query)) {
        const totalSpent = transactions.filter(t => t.amt < 0).reduce((acc, curr) => acc + Math.abs(curr.amt), 0);
        localReply = `Ledger Scan Complete: You have spent ₹${totalSpent.toLocaleString()} across recent nodes.`;
      } else if (/hello|hi|hey|kaise ho/.test(query)) {
        localReply = "Greetings. I am Nexus AI. System status: Optimized. How can I assist your financial execution today?";
      } else {
        localReply = "Primary Neural Core is offline. I can still assist with balance, spending, and local transfers.";
      }

      setMessages(prev => [...prev, { role: 'ai', text: localReply }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      <div
        className="fixed bottom-10 right-10 w-20 h-20 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-white cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:scale-110 hover:shadow-blue-500/20 transition-all z-50 group border border-white/5 overflow-hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={`absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isOpen ? 'opacity-100' : ''}`}></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] group-hover:animate-pulse"></div>
        {isOpen ? <X size={32} className="relative z-10" /> : <Bot size={36} className="relative z-10" />}
      </div>

      {isOpen && (
        <div className="fixed bottom-36 right-10 w-[420px] bg-slate-950/90 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] z-50 overflow-hidden flex flex-col animate-in slide-in-from-bottom-12 zoom-in-95 duration-700">
          <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 relative border border-blue-500/30">
                <Cpu size={28} className="animate-pulse" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-slate-950 shadow-lg"></div>
              </div>
              <div>
                <h3 className="font-black text-white text-xl tracking-tighter">Nexus Core</h3>
                <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.3em]">Neural Interface v4.2</p>
              </div>
            </div>
            <button className="text-slate-500 hover:text-white transition-colors"><Settings size={20} /></button>
          </div>

          <div className="flex-1 h-[450px] p-8 overflow-y-auto custom-scrollbar space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] p-5 rounded-[2rem] text-sm font-bold leading-relaxed shadow-2xl ${msg.role === 'ai' ? 'bg-slate-900 text-slate-300 rounded-tl-none border border-white/5' : 'bg-blue-600 text-white rounded-tr-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start animate-in fade-in">
                <div className="bg-slate-900 border border-white/5 p-4 rounded-3xl flex gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-8 bg-black/40 border-t border-white/5 space-y-6">
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {quickActions.map((action, i) => (
                <button key={i} onClick={() => handleSend(action.label)} className="whitespace-nowrap px-5 py-2.5 bg-slate-900 border border-white/5 rounded-full text-[10px] font-black text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2 uppercase tracking-widest">
                  {action.icon} {action.label}
                </button>
              ))}
            </div>

            <div className="relative flex items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder={isListening ? "Listening to Signal..." : "Execute Command..."}
                  disabled={isListening}
                  className={`w-full bg-slate-900/50 p-6 pr-12 rounded-[2rem] border ${isListening ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-white/5'} text-white outline-none focus:border-blue-500 transition-all text-sm font-bold placeholder:text-slate-700`}
                />
                <button
                  onClick={startListening}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-600 hover:text-white'}`}
                >
                  {isListening ? <div className="flex gap-0.5"><div className="w-1 h-3 bg-white animate-bounce"></div><div className="w-1 h-3 bg-white animate-bounce delay-75"></div><div className="w-1 h-3 bg-white animate-bounce delay-150"></div></div> : <Mic size={22} />}
                </button>
              </div>
              <button
                onClick={() => handleSend()}
                className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white hover:bg-blue-500 transition-all shadow-[0_10px_30px_rgba(37,99,235,0.4)] active:scale-90"
              >
                <SendHorizontal size={24} />
              </button>
            </div>

            <div className="text-center">
              <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3">
                <div className="w-8 h-px bg-slate-800"></div> Quantum Encrypted Channel <div className="w-8 h-px bg-slate-800"></div>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
