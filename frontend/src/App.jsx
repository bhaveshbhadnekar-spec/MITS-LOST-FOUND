import React, { useState, useMemo, useEffect } from "react";
import {
  Search, Bell, User, Menu, X, ArrowRight, MapPin, Calendar, ShieldCheck,
  Package, CheckCircle2, Clock, AlertCircle, LayoutDashboard, FileText,
  PlusCircle, Settings, LogOut, Users, BarChart3, FileWarning, Download,
  Mail, Github, Linkedin, Moon, Sun, Filter, ChevronRight, Sparkles,
  KeyRound, GraduationCap, Building2, TrendingUp, Star
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { loginUser, registerUser, logoutUser, getCurrentUser, googleLogin } from "./api/auth";
import { getLostItems, getFoundItems, createLostItem, createFoundItem } from "./api/items";
import { getAllMatches } from "./api/matches";
import { createClaim, getMyClaims, getAllClaims, decideClaim, getReceivedClaims } from "./api/claims";
import { getMessages, sendMessage } from "./api/chats";
import { createReview, getFinderReviews } from "./api/reviews";
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from "./api/notifications";

// ---------- Static config (not dummy data — these are real dropdown options) ----------
const CATEGORIES = ["Mobile", "Laptop", "Wallet", "ID Card", "Keys", "Books", "Accessories", "Documents", "Others"];

// ---------- Real developer info ----------
const DEVELOPERS = [
  { name: "Bhavesh Bhadnekar", role: "Full Stack Developer", college: "MITS Gwalior", initials: "BB", linkedin: "#", github: "#", email: "bhaveshbhadnekar@mitsgwalior.ac.in" },
  { name: "Kanishk Shakya", role: "Full Stack Developer", college: "MITS Gwalior", initials: "KS", linkedin: "#", github: "#", email: "kanishkshakya@mitsgwalior.ac.in" },
];

const FEATURES = [
  { title: "Report Lost Item", desc: "Log a missing item in under a minute with location and time details.", icon: FileWarning },
  { title: "Report Found Item", desc: "Hand in what you found — we'll notify the owner the moment there's a match.", icon: Package },
  { title: "Secure Claim Process", desc: "Ownership is verified before any item changes hands.", icon: ShieldCheck },
  { title: "Real-Time Notifications", desc: "Get pinged the instant your case status changes.", icon: Bell },
  { title: "Campus Security", desc: "Every report is logged and auditable by the security office.", icon: KeyRound },
  { title: "Search & Tracking", desc: "Filter by building, hostel, department, or date to find a match fast.", icon: Search },
];

// ---------- Theme helpers ----------
function useTheme(dark) {
  return {
    bg: dark ? "bg-slate-950" : "bg-slate-50",
    bgAlt: dark ? "bg-slate-900" : "bg-white",
    text: dark ? "text-slate-100" : "text-slate-900",
    textMuted: dark ? "text-slate-400" : "text-slate-500",
    border: dark ? "border-slate-800" : "border-slate-200",
    cardBg: dark ? "bg-slate-900" : "bg-white",
    hover: dark ? "hover:bg-slate-800" : "hover:bg-slate-100",
    input: dark ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400",
  };
}

function StatusPill({ status }) {
  const map = {
    Active: "bg-amber-100 text-amber-700 border-amber-300",
    Claimed: "bg-sky-100 text-sky-700 border-sky-300",
    Recovered: "bg-emerald-100 text-emerald-700 border-emerald-300",
    "Under Review": "bg-indigo-100 text-indigo-700 border-indigo-300",
    Approved: "bg-emerald-100 text-emerald-700 border-emerald-300",
    Rejected: "bg-rose-100 text-rose-700 border-rose-300",
    Pending: "bg-amber-100 text-amber-700 border-amber-300",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${map[status] || "bg-slate-100 text-slate-700 border-slate-300"}`}>
      {status}
    </span>
  );
}

// ---------- Landing Page ----------
function Landing({ t, dark, goto }) {
  return (
    <div className={`min-h-screen ${t.bg} ${t.text}`}>
      <section className={`relative overflow-hidden border-b ${t.border}`}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "26px 26px" }} />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-24 relative grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className={`inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase px-3 py-1.5 rounded-full border ${t.border} ${t.textMuted} mb-6`}>
              <GraduationCap size={14} /> Madhav Institute of Technology &amp; Science, Gwalior
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              MITS Lost &amp; Found Portal
            </h1>
            <p className={`mt-5 text-lg ${t.textMuted} max-w-xl`}>
              Helping the MITS community reconnect with their belongings — report, search, and claim items across campus in minutes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => goto("login")} className="inline-flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold px-5 py-3 rounded-lg transition-colors">
                Report Lost Item <ArrowRight size={17} />
              </button>
              <button onClick={() => goto("login")} className={`inline-flex items-center gap-2 border ${t.border} ${t.hover} font-semibold px-5 py-3 rounded-lg transition-colors`}>
                Report Found Item
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="mb-10">
          <div className="text-xs font-semibold tracking-wide uppercase text-indigo-600 mb-2">Platform Features</div>
          <h2 className="text-3xl font-bold">Everything the campus needs, in one place</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className={`rounded-xl border ${t.border} ${t.cardBg} p-6 transition-transform hover:-translate-y-1`}>
              <div className="w-10 h-10 rounded-lg bg-indigo-600/10 flex items-center justify-center mb-4">
                <f.icon className="text-indigo-600" size={20} />
              </div>
              <h3 className="font-semibold text-lg mb-1.5">{f.title}</h3>
              <p className={`text-sm ${t.textMuted}`}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`border-t ${t.border} ${t.bgAlt}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 grid sm:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="font-bold text-lg mb-2">MITS Lost &amp; Found</div>
            <p className={t.textMuted}>An official campus utility of Madhav Institute of Technology &amp; Science, Gwalior.</p>
          </div>
          <div>
            <div className="font-semibold mb-2">Quick Links</div>
            <div className="flex flex-col gap-1.5">
              <button onClick={() => goto("login")} className={`text-left ${t.textMuted} hover:text-indigo-600`}>Login</button>
              <button onClick={() => goto("developers")} className={`text-left ${t.textMuted} hover:text-indigo-600`}>Developers</button>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2">Contact</div>
            <p className={t.textMuted}>lostandfound@mitsgwalior.ac.in</p>
            <p className={t.textMuted}>Gola Ka Mandir, Gwalior, MP</p>
          </div>
        </div>
        <div className={`text-center text-xs ${t.textMuted} pb-6`}>© 2026 MITS Gwalior. All rights reserved.</div>
      </section>
    </div>
  );
}

// ---------- Login Page ----------
function Login({ t, dark, setDark, goto, login }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleBtnRef = React.useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      login(data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await registerUser({ name, email, password, department });
      login(data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!window.google || !googleBtnRef.current) return;
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const data = await googleLogin(response.credential);
          login(data.user);
        } catch (err) {
          setError(err.response?.data?.message || "Google sign-in failed.");
        }
      },
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: dark ? "filled_black" : "outline",
      size: "large",
      width: 360,
      text: "continue_with",
    });
  }, [dark]);

  return (
    <div className={`min-h-screen ${t.bg} ${t.text}`}>
      {/* Header */}
      <header className={`border-b ${t.border} ${t.bgAlt}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <button onClick={() => goto("landing")} className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white p-1 shrink-0 overflow-hidden">
              <img src="/logo.png" alt="MITS logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-left">
              <div className="font-bold leading-tight">MITS L&amp;F</div>
              <div className={`text-xs ${t.textMuted} leading-tight`}>MITS Gwalior</div>
            </div>
          </button>
          <nav className="hidden sm:flex items-center gap-8 text-sm font-medium">
            <button onClick={() => goto("landing")} className={`${t.textMuted} hover:text-indigo-600`}>Home</button>
            <button onClick={() => goto("developers")} className={`${t.textMuted} hover:text-indigo-600`}>Developers</button>
          </nav>
          <button onClick={() => setDark(!dark)} className={`p-2 rounded-lg ${t.hover}`}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Hero + sign-in */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid lg:grid-cols-2 gap-14 items-start">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Official Portal · MITS Gwalior
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.05]">
            MITS Lost &amp;{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-emerald-500 bg-clip-text text-transparent">
              Found Portal
            </span>
          </h1>
          <p className={`mt-5 text-lg ${t.textMuted} max-w-xl`}>
            A comprehensive platform for reporting lost and found items, matching reports with AI, and
            reconnecting the MITS community with their belongings.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-10">
            {FEATURES.slice(0, 4).map((f) => (
              <div key={f.title} className={`rounded-xl border ${t.border} ${t.cardBg} p-5`}>
                <div className="w-9 h-9 rounded-lg bg-indigo-600/10 flex items-center justify-center mb-3">
                  <f.icon className="text-indigo-600" size={18} />
                </div>
                <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                <p className={`text-xs ${t.textMuted}`}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl border ${t.border} ${t.cardBg} p-8`}>
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white p-1.5 mb-4 overflow-hidden">
              <img src="/logo.png" alt="MITS logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-xl font-bold">{mode === "login" ? "Sign in to MITS L&F" : "Create your account"}</h2>
            <p className={`text-sm ${t.textMuted} mt-1`}>
              {mode === "login" ? "Access your lost & found dashboard" : "Register with your MITS email to get started"}
            </p>
          </div>

          <div className={`flex rounded-lg border ${t.border} p-1 mb-5`}>
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 text-sm font-medium rounded-md py-1.5 transition-colors ${mode === "login" ? "bg-indigo-700 text-white" : t.textMuted}`}
            >
              Sign in
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 text-sm font-medium rounded-md py-1.5 transition-colors ${mode === "register" ? "bg-indigo-700 text-white" : t.textMuted}`}
            >
              Create account
            </button>
          </div>

          <div ref={googleBtnRef} className="mb-4 flex justify-center" />

          <div className="flex items-center gap-3 my-4">
            <div className={`h-px flex-1 ${t.border} border-t`} />
            <span className={`text-xs ${t.textMuted}`}>or use MITS email</span>
            <div className={`h-px flex-1 ${t.border} border-t`} />
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-3">
              {error && <div className="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{error}</div>}
              <div>
                <label className="text-sm font-medium">MITS Email</label>
                <input required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="yourname@mitsgwalior.ac.in"
                  className={`w-full mt-1 rounded-lg border px-3 py-2.5 text-sm ${t.input}`} />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className={`w-full mt-1 rounded-lg border px-3 py-2.5 text-sm ${t.input}`} />
              </div>
              <div className="flex justify-end">
                <button type="button" className="text-xs text-indigo-600 font-medium hover:underline">Forgot password?</button>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg py-2.5 transition-colors disabled:opacity-60">
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              {error && <div className="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{error}</div>}
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name"
                  className={`w-full mt-1 rounded-lg border px-3 py-2.5 text-sm ${t.input}`} />
              </div>
              <div>
                <label className="text-sm font-medium">MITS Email</label>
                <input required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="yourname@mitsgwalior.ac.in"
                  className={`w-full mt-1 rounded-lg border px-3 py-2.5 text-sm ${t.input}`} />
              </div>
              <div>
                <label className="text-sm font-medium">Department (optional)</label>
                <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. CSE, 3rd Year"
                  className={`w-full mt-1 rounded-lg border px-3 py-2.5 text-sm ${t.input}`} />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters"
                  className={`w-full mt-1 rounded-lg border px-3 py-2.5 text-sm ${t.input}`} />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg py-2.5 transition-colors disabled:opacity-60">
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>
          )}

          <div className={`flex items-start gap-2.5 mt-5 rounded-lg ${t.hover} p-3`}>
            <ShieldCheck size={16} className="text-emerald-600 mt-0.5 shrink-0" />
            <p className={`text-xs ${t.textMuted}`}>Secure authentication powered by Google. Use your institutional email to sign in.</p>
          </div>

          <button onClick={() => goto("landing")} className={`w-full text-center text-xs mt-6 ${t.textMuted} hover:text-indigo-600`}>← Back to Home</button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t ${t.border} ${t.bgAlt}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white p-1 shrink-0 overflow-hidden">
              <img src="/logo.png" alt="MITS logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="font-semibold">MITS Lost &amp; Found Portal</div>
              <div className={`text-xs ${t.textMuted}`}>MITS Gwalior</div>
            </div>
          </div>
          <p className={`text-sm ${t.textMuted} max-w-md`}>
            The official platform of MITS Gwalior for reporting, matching, and recovering lost items on campus.
          </p>
        </div>
        <div className={`border-t ${t.border}`}>
          <div className={`max-w-7xl mx-auto px-6 lg:px-10 py-4 text-center text-xs ${t.textMuted}`}>
            © 2026 MITS Gwalior · Developed by <span className="font-medium">Bhavesh Bhadnekar</span> &amp; <span className="font-medium">Kanishk Shakya</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ---------- Sidebar / Shell ----------
const STUDENT_NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "reportLost", label: "Report Lost Item", icon: FileWarning },
  { key: "reportFound", label: "Report Found Item", icon: Package },
  { key: "myReports", label: "My Reports", icon: FileText },
  { key: "matches", label: "AI Matches", icon: Sparkles },
  { key: "myClaims", label: "My Claims", icon: ShieldCheck },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "profile", label: "Profile", icon: User },
  { key: "settings", label: "Settings", icon: Settings },
];
const ADMIN_NAV = [
  { key: "admin", label: "Admin Dashboard", icon: LayoutDashboard },
  { key: "adminUsers", label: "User Management", icon: Users },
  { key: "adminClaims", label: "Claims Management", icon: ShieldCheck },
  { key: "adminAnalytics", label: "Analytics", icon: BarChart3 },
];

function Shell({ t, dark, setDark, page, setPage, role, user, logout, children, sidebarOpen, setSidebarOpen }) {
  const nav = role === "admin" ? ADMIN_NAV : STUDENT_NAV;
  const initials = user?.name ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : (role === "admin" ? "AD" : "ST");
  return (
    <div className={`min-h-screen ${t.bg} ${t.text} flex`}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-0 lg:w-20"} transition-all duration-200 border-r ${t.border} ${t.bgAlt} overflow-hidden shrink-0`}>
        <div className="p-5 flex items-center gap-2">
          <img src="/logo.png" alt="MITS logo" className="w-8 h-8 rounded-full object-contain shrink-0 bg-white p-0.5" />
          {sidebarOpen && <span className="font-bold whitespace-nowrap">MITS L&amp;F</span>}
        </div>
        <nav className="px-3 space-y-1">
          {nav.map((n) => (
            <button key={n.key} onClick={() => setPage(n.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${page === n.key ? "bg-indigo-700 text-white" : `${t.hover} ${t.textMuted}`}`}>
              <n.icon size={18} className="shrink-0" />
              {sidebarOpen && <span className="whitespace-nowrap">{n.label}</span>}
            </button>
          ))}
          {role === "admin" && (
            <button onClick={() => setPage("developers")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${page === "developers" ? "bg-indigo-700 text-white" : `${t.hover} ${t.textMuted}`}`}>
              <Sparkles size={18} className="shrink-0" />
              {sidebarOpen && <span>Developers</span>}
            </button>
          )}
          <button onClick={logout} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${t.hover} text-rose-500 mt-4`}>
            <LogOut size={18} className="shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </nav>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className={`h-16 border-b ${t.border} ${t.bgAlt} flex items-center gap-4 px-4 lg:px-6 shrink-0`}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`p-2 rounded-lg ${t.hover}`}>
            <Menu size={18} />
          </button>
          <div className="flex-1" />
          <button onClick={() => setDark(!dark)} className={`p-2 rounded-lg ${t.hover}`}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setPage("notifications")} className={`relative p-2 rounded-lg ${t.hover}`}>
            <Bell size={18} />
          </button>
          <div className="flex items-center gap-2 pl-2">
            <div className="w-9 h-9 rounded-full bg-indigo-700 text-white flex items-center justify-center text-sm font-semibold">
              {initials}
            </div>
            <div className="hidden md:block text-sm">
              <div className="font-medium leading-tight">{user?.name || (role === "admin" ? "Admin User" : "Student")}</div>
              <div className={`text-xs ${t.textMuted} leading-tight`}>{user?.department || (role === "admin" ? "Security Office" : "")}</div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function Widget({ t, label, value, icon: Icon, tint }) {
  return (
    <div className={`rounded-xl border ${t.border} ${t.cardBg} p-5`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${tint}`}>
        <Icon size={17} className="text-white" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className={`text-sm mt-0.5 ${t.textMuted}`}>{label}</div>
    </div>
  );
}

function PageHeader({ t, title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      {subtitle && <p className={`text-sm mt-1 ${t.textMuted}`}>{subtitle}</p>}
    </div>
  );
}

// ---------- Dashboard ----------
function Dashboard({ t, dark, user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showClaimForm, setShowClaimForm] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([getLostItems(), getFoundItems()])
      .then(([lostRes, foundRes]) => {
        const lost = (lostRes.items || []).map((it) => ({ ...it, type: "lost", date: it.dateLost }));
        const found = (foundRes.items || []).map((it) => ({ ...it, type: "found", date: it.dateFound }));
        setItems([...lost, ...found].sort((a, b) => new Date(b.date) - new Date(a.date)));
      })
      .catch((err) => console.error("Failed to load dashboard data", err))
      .finally(() => setLoading(false));
  };
  useEffect(() => { loadData(); }, []);

  const activeCount = items.filter((i) => i.status === "Active").length;
  const recoveredCount = items.filter((i) => i.status === "Recovered").length;

  // Report count for each of the last 6 months, for the dashboard graph
  const monthlyData = useMemo(() => {
    const now = new Date();
    const buckets = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        month: d.toLocaleString("en-US", { month: "short" }),
        reports: 0,
      });
    }
    const bucketMap = Object.fromEntries(buckets.map((b) => [b.key, b]));
    items.forEach((it) => {
      if (!it.date) return;
      const d = new Date(it.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (bucketMap[key]) bucketMap[key].reports += 1;
    });
    return buckets;
  }, [items]);
  const thisMonthCount = monthlyData[monthlyData.length - 1]?.reports || 0;

  return (
    <div>
      <PageHeader t={t} title="Dashboard" subtitle="Overview of campus-wide lost & found activity" />
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Widget t={t} label="Active Reports" value={loading ? "..." : activeCount} icon={Clock} tint="bg-amber-500" />
        <Widget t={t} label="Recovered Items" value={loading ? "..." : recoveredCount} icon={CheckCircle2} tint="bg-emerald-600" />
        <Widget t={t} label="Total Reports" value={loading ? "..." : items.length} icon={TrendingUp} tint="bg-sky-600" />
        <Widget t={t} label="Reports This Month" value={loading ? "..." : thisMonthCount} icon={Sparkles} tint="bg-violet-600" />
      </div>
      <div className={`rounded-xl border ${t.border} ${t.cardBg} p-5 mb-6`}>
        <h3 className="font-semibold mb-4">Reports This Month (Last 6 Months)</h3>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" stroke={dark ? "#94a3b8" : "#64748b"} fontSize={12} />
              <YAxis allowDecimals={false} stroke={dark ? "#94a3b8" : "#64748b"} fontSize={12} />
              <Tooltip contentStyle={{ background: dark ? "#1e293b" : "#fff", border: "none", borderRadius: 8 }} />
              <Line type="monotone" dataKey="reports" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className={`rounded-xl border ${t.border} ${t.cardBg} p-5`}>
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-1">
          {loading && <p className={`text-sm ${t.textMuted}`}>Loading...</p>}
          {!loading && items.length === 0 && <p className={`text-sm ${t.textMuted}`}>No reports yet.</p>}
          {items.slice(0, 5).map((it) => (
            <button
              key={it._id}
              onClick={() => setSelected(it)}
              className={`w-full flex items-center justify-between py-2 px-2 -mx-2 rounded-lg border-b ${t.border} last:border-0 ${t.hover} text-left`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${it.type === "lost" ? "bg-rose-500/10" : "bg-emerald-500/10"}`}>
                  {it.type === "lost" ? <FileWarning size={15} className="text-rose-500" /> : <Package size={15} className="text-emerald-600" />}
                </div>
                <div>
                  <div className="text-sm font-medium">{it.itemName}</div>
                  <div className={`text-xs ${t.textMuted}`}>{it.location} · {it.date?.slice(0, 10)}</div>
                </div>
              </div>
              <StatusPill status={it.status} />
            </button>
          ))}
        </div>
      </div>

      {selected && !showClaimForm && (
        <ItemDetailModal
          t={t}
          item={selected}
          user={user}
          onClose={() => setSelected(null)}
          onClaim={() => setShowClaimForm(true)}
        />
      )}
      {selected && showClaimForm && (
        <ClaimFormModal
          t={t}
          item={selected}
          onClose={() => { setShowClaimForm(false); setSelected(null); }}
          onSubmitted={() => { setShowClaimForm(false); setSelected(null); loadData(); }}
        />
      )}
    </div>
  );
}

// ---------- Report Forms ----------
function ReportForm({ t, mode }) {
  const isLost = mode === "lost";
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", category: CATEGORIES[0], desc: "", date: "", location: "", contact: "", notes: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = isLost ? await createLostItem(form, imageFile) : await createFoundItem(form, imageFile);
      setReportId(res.data?._id?.slice(-6).toUpperCase() || "");
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed. Please check the form and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={`max-w-lg mx-auto text-center rounded-xl border ${t.border} ${t.cardBg} p-10 mt-10`}>
        <CheckCircle2 className="mx-auto text-emerald-600 mb-4" size={40} />
        <h2 className="text-xl font-bold mb-2">Report submitted</h2>
        <p className={`text-sm ${t.textMuted} mb-6`}>Report ID <span className="font-mono">LF-{reportId}</span> has been created. You'll be notified of any updates.</p>
        <button onClick={() => { setSubmitted(false); setForm({ name: "", category: CATEGORIES[0], desc: "", date: "", location: "", contact: "", notes: "" }); setImageFile(null); }} className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg px-5 py-2.5">Submit another</button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader t={t} title={isLost ? "Report Lost Item" : "Report Found Item"}
        subtitle={isLost ? "Give as much detail as possible to help identify your item." : "Thank you for helping a fellow MITS member — fill in what you found."} />
      <form onSubmit={handleSubmit} className={`rounded-xl border ${t.border} ${t.cardBg} p-6 max-w-2xl space-y-4`}>
        {error && <div className="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{error}</div>}
        <div>
          <label className="text-sm font-medium">Item Name</label>
          <input required value={form.name} onChange={set("name")} placeholder="e.g. Black Dell Laptop" className={`w-full mt-1 rounded-lg border px-3 py-2.5 text-sm ${t.input}`} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Category</label>
            <select value={form.category} onChange={set("category")} className={`w-full mt-1 rounded-lg border px-3 py-2.5 text-sm ${t.input}`}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">{isLost ? "Date Lost" : "Date Found"}</label>
            <input required type="date" value={form.date} onChange={set("date")} className={`w-full mt-1 rounded-lg border px-3 py-2.5 text-sm ${t.input}`} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea required value={form.desc} onChange={set("desc")} rows={3} placeholder="Color, brand, distinguishing marks..." className={`w-full mt-1 rounded-lg border px-3 py-2.5 text-sm ${t.input}`} />
        </div>
        <div>
          <label className="text-sm font-medium">{isLost ? "Location Lost" : "Found Location"}</label>
          <input
            required
            type="text"
            value={form.location}
            onChange={set("location")}
            placeholder="e.g. Library, Hostel H2, Block A near Room 204"
            className={`w-full mt-1 rounded-lg border px-3 py-2.5 text-sm ${t.input}`}
          />
        </div>
        {isLost ? (
          <div>
            <label className="text-sm font-medium">Contact Information</label>
            <input required value={form.contact} onChange={set("contact")} placeholder="Phone or MITS email" className={`w-full mt-1 rounded-lg border px-3 py-2.5 text-sm ${t.input}`} />
          </div>
        ) : (
          <div>
            <label className="text-sm font-medium">Additional Notes</label>
            <textarea value={form.notes} onChange={set("notes")} rows={2} placeholder="Where you handed it in, condition, etc." className={`w-full mt-1 rounded-lg border px-3 py-2.5 text-sm ${t.input}`} />
          </div>
        )}
        <div>
          <label className="text-sm font-medium">{isLost ? "Optional Image Upload" : "Image Upload"}</label>
          <label className={`mt-1 block rounded-lg border-2 border-dashed ${t.border} p-6 text-center ${t.textMuted} text-sm cursor-pointer hover:border-indigo-500`}>
            {imageFile ? imageFile.name : "Click to browse an image (stored securely via Cloudinary)"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files[0] || null)} />
          </label>
        </div>
        <button type="submit" disabled={submitting} className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg py-2.5 disabled:opacity-60">
          {submitting ? "Submitting..." : `Submit ${isLost ? "Lost" : "Found"} Report`}
        </button>
      </form>
    </div>
  );
}

// ---------- Search / My Reports ----------
function ItemsSearch({ t, title, user }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [status, setStatus] = useState("All");
  const [sortLatest, setSortLatest] = useState(true);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // the item currently open in the details modal
  const [showClaimForm, setShowClaimForm] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([getLostItems(), getFoundItems()])
      .then(([lostRes, foundRes]) => {
        const lost = (lostRes.items || []).map((it) => ({ ...it, type: "lost", date: it.dateLost }));
        const found = (foundRes.items || []).map((it) => ({ ...it, type: "found", date: it.dateFound }));
        setAllItems([...lost, ...found]);
      })
      .catch((err) => console.error("Failed to load items", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let items = allItems.filter((it) =>
      it.itemName.toLowerCase().includes(q.toLowerCase()) &&
      (cat === "All" || it.category === cat) &&
      (status === "All" || it.status === status)
    );
    items.sort((a, b) => sortLatest ? new Date(b.date) - new Date(a.date) : a.category.localeCompare(b.category));
    return items;
  }, [allItems, q, cat, status, sortLatest]);

  return (
    <div>
      <PageHeader t={t} title={title} subtitle="Search and filter across all campus reports" />
      <div className={`rounded-xl border ${t.border} ${t.cardBg} p-4 mb-5 flex flex-wrap gap-3 items-center`}>
        <div className={`flex items-center gap-2 rounded-lg border ${t.border} px-3 py-2 flex-1 min-w-[200px]`}>
          <Search size={15} className={t.textMuted} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by item name..." className={`bg-transparent outline-none text-sm w-full ${t.text}`} />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className={`rounded-lg border px-3 py-2 text-sm ${t.input}`}>
          <option>All</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={`rounded-lg border px-3 py-2 text-sm ${t.input}`}>
          <option>All</option>
          <option>Active</option><option>Claimed</option><option>Recovered</option><option>Under Review</option>
        </select>
        <button onClick={() => setSortLatest(!sortLatest)} className={`flex items-center gap-1.5 rounded-lg border ${t.border} ${t.hover} px-3 py-2 text-sm`}>
          <Filter size={14} /> {sortLatest ? "Latest first" : "By category"}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((it) => (
          <div key={it._id} className={`rounded-xl border ${t.border} ${t.cardBg} overflow-hidden`}>
            {it.image ? (
              <img src={it.image} alt={it.itemName} className="w-full h-36 object-cover" />
            ) : (
              <div className={`w-full h-36 flex items-center justify-center ${t.hover}`}>
                <Package size={28} className={t.textMuted} />
              </div>
            )}
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-semibold uppercase tracking-wide ${it.type === "lost" ? "text-rose-500" : "text-emerald-600"}`}>{it.type}</span>
                <StatusPill status={it.status} />
              </div>
              <h3 className="font-semibold">{it.itemName}</h3>
              <p className={`text-xs mt-1 ${t.textMuted}`}>{it.category} · {it._id.slice(-6).toUpperCase()}</p>
              <div className={`mt-3 space-y-1 text-xs ${t.textMuted}`}>
                <div className="flex items-center gap-1.5"><MapPin size={12} /> {it.location}</div>
                <div className="flex items-center gap-1.5"><Calendar size={12} /> {it.date?.slice(0, 10)}</div>
              </div>
              <button onClick={() => setSelected(it)} className="mt-4 w-full text-sm font-medium text-indigo-600 flex items-center justify-center gap-1 border border-indigo-600/30 rounded-lg py-2 hover:bg-indigo-600/10">
                View details <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
        {loading && <p className={`col-span-full text-center py-10 text-sm ${t.textMuted}`}>Loading...</p>}
        {!loading && filtered.length === 0 && <p className={`col-span-full text-center py-10 text-sm ${t.textMuted}`}>No items match your filters.</p>}
      </div>

      {selected && !showClaimForm && (
        <ItemDetailModal
          t={t}
          item={selected}
          user={user}
          onClose={() => setSelected(null)}
          onClaim={() => setShowClaimForm(true)}
        />
      )}
      {selected && showClaimForm && (
        <ClaimFormModal
          t={t}
          item={selected}
          onClose={() => { setShowClaimForm(false); setSelected(null); }}
          onSubmitted={() => { setShowClaimForm(false); setSelected(null); load(); }}
        />
      )}
    </div>
  );
}

// ---------- Item Detail Modal ----------
function ItemDetailModal({ t, item, user, onClose, onClaim }) {
  const isOwnItem = item.reportedBy?._id === user?.id || item.reportedBy?._id === user?._id;
  const canClaim = item.type === "found" && item.status === "Active" && !isOwnItem;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className={`w-full max-w-lg rounded-xl border ${t.border} ${t.cardBg} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {item.image ? (
          <img src={item.image} alt={item.itemName} className="w-full h-56 object-cover" />
        ) : (
          <div className={`w-full h-40 flex items-center justify-center ${t.hover}`}>
            <Package size={36} className={t.textMuted} />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className={`text-xs font-semibold uppercase tracking-wide ${item.type === "lost" ? "text-rose-500" : "text-emerald-600"}`}>{item.type} item</span>
              <h2 className="text-lg font-bold mt-0.5">{item.itemName}</h2>
            </div>
            <button onClick={onClose} className={`p-1.5 rounded-lg ${t.hover}`}><X size={18} /></button>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <StatusPill status={item.status} />
            <span className={`text-xs ${t.textMuted}`}>{item.category}</span>
          </div>
          <p className={`text-sm mb-4 ${t.textMuted}`}>{item.description}</p>
          <div className={`grid grid-cols-2 gap-3 text-xs ${t.textMuted} mb-4`}>
            <div className="flex items-center gap-1.5"><MapPin size={13} /> {item.location}</div>
            <div className="flex items-center gap-1.5"><Calendar size={13} /> {item.date?.slice(0, 10)}</div>
            {item.reportedBy?.name && (
              <div className="flex items-center gap-1.5 col-span-2"><User size={13} /> Reported by {item.reportedBy.name}</div>
            )}
          </div>
          {canClaim && (
            <button onClick={onClaim} className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg py-2.5 text-sm">
              This is mine — Claim this item
            </button>
          )}
          {isOwnItem && (
            <p className={`text-xs text-center ${t.textMuted}`}>This is your own report.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Claim Form Modal ----------
function ClaimFormModal({ t, item, onClose, onSubmitted }) {
  const [ownershipDescription, setOwnershipDescription] = useState("");
  const [identificationDetails, setIdentificationDetails] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await createClaim({ itemId: item._id, ownershipDescription, identificationDetails }, proofFile);
      onSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit claim. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className={`w-full max-w-lg rounded-xl border ${t.border} ${t.cardBg} max-h-[90vh] overflow-y-auto p-6`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-bold">Claim "{item.itemName}"</h2>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${t.hover}`}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{error}</div>}
          <div>
            <label className="text-sm font-medium">Describe how you know this is yours</label>
            <textarea required minLength={10} rows={3} value={ownershipDescription} onChange={(e) => setOwnershipDescription(e.target.value)}
              placeholder="E.g. brand, when/where you lost it, distinguishing marks..."
              className={`w-full mt-1 rounded-lg border px-3 py-2.5 text-sm ${t.input}`} />
          </div>
          <div>
            <label className="text-sm font-medium">Identification details</label>
            <input required minLength={5} value={identificationDetails} onChange={(e) => setIdentificationDetails(e.target.value)}
              placeholder="E.g. serial number, unique sticker, initials engraved..."
              className={`w-full mt-1 rounded-lg border px-3 py-2.5 text-sm ${t.input}`} />
          </div>
          <div>
            <label className="text-sm font-medium">Optional proof (photo/receipt)</label>
            <label className={`mt-1 block rounded-lg border-2 border-dashed ${t.border} p-4 text-center ${t.textMuted} text-sm cursor-pointer hover:border-indigo-500`}>
              {proofFile ? proofFile.name : "Click to upload"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setProofFile(e.target.files[0] || null)} />
            </label>
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg py-2.5 text-sm disabled:opacity-60">
            {submitting ? "Submitting..." : "Submit claim"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ---------- Notifications ----------
function NotificationsPage({ t }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    getMyNotifications()
      .then((res) => setNotifs(res.notifications || []))
      .catch((err) => setError(err.response?.data?.message || "Could not load notifications."))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const iconFor = (type) => {
    if (type === "claim_approved" || type === "item_returned") return { Icon: CheckCircle2, color: "text-emerald-600" };
    if (type === "claim_rejected") return { Icon: AlertCircle, color: "text-rose-500" };
    if (type === "new_claim") return { Icon: ShieldCheck, color: "text-indigo-600" };
    return { Icon: Bell, color: "text-sky-600" };
  };

  const handleClick = async (n) => {
    if (n.read) return;
    try {
      await markNotificationRead(n._id);
      setNotifs((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotifs((prev) => prev.map((x) => ({ ...x, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <div>
      <div className="flex items-start justify-between">
        <PageHeader t={t} title="Notifications" subtitle="Claim updates and administrative messages" />
        {unreadCount > 0 && (
          <button onClick={handleMarkAll} className="text-xs font-medium text-indigo-600 hover:underline">Mark all as read</button>
        )}
      </div>
      {error && <div className="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2 mb-4">{error}</div>}
      <div className={`rounded-xl border ${t.border} ${t.cardBg} divide-y ${t.border}`}>
        {loading && <p className={`text-sm p-4 ${t.textMuted}`}>Loading...</p>}
        {!loading && notifs.length === 0 && <p className={`text-sm p-4 ${t.textMuted}`}>No notifications yet.</p>}
        {notifs.map((n) => {
          const { Icon, color } = iconFor(n.type);
          return (
            <button key={n._id} onClick={() => handleClick(n)} className={`w-full flex items-start gap-3 p-4 text-left ${t.hover} ${!n.read ? "bg-indigo-600/5" : ""}`}>
              <Icon size={18} className={`mt-0.5 shrink-0 ${color}`} />
              <div className="flex-1">
                <p className="text-sm">{n.message}</p>
                <p className={`text-xs mt-1 ${t.textMuted}`}>{n.createdAt?.slice(0, 10)}</p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- AI Matches ----------
// Rule-based smart matching (category + description keyword overlap + location +
// date proximity), scored 0-100 by the backend. Not a generative AI model, but a
// deterministic "AI-style" matching engine that runs without needing an external API key.
function MatchesPage({ t, user }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [claiming, setClaiming] = useState(null); // the foundItem being claimed

  useEffect(() => {
    getAllMatches()
      .then((res) => setMatches(res.matches || []))
      .catch((err) => setError(err.response?.data?.message || "Could not load matches."))
      .finally(() => setLoading(false));
  }, []);

  const scoreColor = (score) =>
    score >= 70 ? "text-emerald-600 bg-emerald-500/10 border-emerald-300"
      : score >= 50 ? "text-amber-600 bg-amber-500/10 border-amber-300"
      : "text-slate-500 bg-slate-500/10 border-slate-300";

  return (
    <div>
      <PageHeader t={t} title="AI Matches" subtitle="Smart matching between lost and found reports, ranked by similarity score" />
      {loading && <p className={`text-sm ${t.textMuted}`}>Scanning reports for possible matches...</p>}
      {error && <div className="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2 mb-4">{error}</div>}
      {!loading && !error && matches.length === 0 && (
        <p className={`text-sm ${t.textMuted}`}>No likely matches found right now. Check back after more reports come in.</p>
      )}
      <div className="grid gap-4">
        {matches.map((m, idx) => {
          const isMyLostReport = m.lostItem.reportedBy?._id === user?.id || m.lostItem.reportedBy?._id === user?._id;
          const canClaim = isMyLostReport && m.foundItem.status === "Active";
          return (
          <div key={idx} className={`rounded-xl border ${t.border} ${t.cardBg} p-5`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-600" />
                <span className="text-sm font-semibold">Possible Match</span>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${scoreColor(m.score)}`}>
                {m.score}% match
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
                  <FileWarning size={15} className="text-rose-500" />
                </div>
                <div>
                  <div className="text-xs font-medium text-rose-500 mb-0.5">LOST {isMyLostReport && "· your report"}</div>
                  <div className="text-sm font-medium">{m.lostItem.itemName}</div>
                  <div className={`text-xs ${t.textMuted}`}>{m.lostItem.location} · {m.lostItem.dateLost?.slice(0, 10)}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Package size={15} className="text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-emerald-600 mb-0.5">FOUND</div>
                  <div className="text-sm font-medium">{m.foundItem.itemName}</div>
                  <div className={`text-xs ${t.textMuted}`}>{m.foundItem.location} · {m.foundItem.dateFound?.slice(0, 10)}</div>
                </div>
              </div>
            </div>
            {canClaim && (
              <button onClick={() => setClaiming(m.foundItem)} className="mt-4 w-full bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg py-2 text-sm">
                This looks like mine — Claim it
              </button>
            )}
          </div>
          );
        })}
      </div>
      {claiming && (
        <ClaimFormModal
          t={t}
          item={claiming}
          onClose={() => setClaiming(null)}
          onSubmitted={() => setClaiming(null)}
        />
      )}
    </div>
  );
}

// ---------- Profile / Settings ----------
function ProfilePage({ t, user }) {
  const initials = user?.name ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "ST";
  return (
    <div>
      <PageHeader t={t} title="Profile" />
      <div className={`rounded-xl border ${t.border} ${t.cardBg} p-6 max-w-lg`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-indigo-700 text-white flex items-center justify-center text-xl font-semibold">{initials}</div>
          <div>
            <div className="font-semibold">{user?.name || "Student"}</div>
            <div className={`text-sm ${t.textMuted}`}>{user?.email}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><div className={t.textMuted}>Department</div><div className="font-medium">{user?.department || "—"}</div></div>
        </div>
      </div>
    </div>
  );
}
function SettingsPage({ t, dark, setDark }) {
  return (
    <div>
      <PageHeader t={t} title="Settings" />
      <div className={`rounded-xl border ${t.border} ${t.cardBg} p-6 max-w-lg space-y-4`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">Dark mode</div>
            <div className={`text-xs ${t.textMuted}`}>Switch between light and dark theme</div>
          </div>
          <button onClick={() => setDark(!dark)} className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors ${dark ? "bg-indigo-700 justify-end" : "bg-slate-300 justify-start"}`}>
            <div className="w-5 h-5 rounded-full bg-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Admin ----------
function AdminDashboard({ t, dark }) {
  // TODO: connect to real backend admin stats/reports API when available
  const reports = [];
  return (
    <div>
      <PageHeader t={t} title="Admin Dashboard" subtitle="Campus-wide lost & found oversight" />
      <div className={`rounded-xl border ${t.border} ${t.cardBg} p-5`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Reports</h3>
          <button className={`text-sm flex items-center gap-1.5 border ${t.border} ${t.hover} rounded-lg px-3 py-1.5`}><Download size={14} /> Export</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`text-left ${t.textMuted} border-b ${t.border}`}>
                <th className="pb-2 font-medium">ID</th><th className="pb-2 font-medium">Item</th><th className="pb-2 font-medium">Type</th><th className="pb-2 font-medium">Status</th><th className="pb-2 font-medium">Reported By</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 && (
                <tr><td colSpan={5} className={`py-6 text-center ${t.textMuted}`}>No reports yet.</td></tr>
              )}
              {reports.map((it) => (
                <tr key={it.id} className={`border-b ${t.border} last:border-0`}>
                  <td className="py-2.5 font-mono text-xs">{it.id}</td>
                  <td className="py-2.5">{it.name}</td>
                  <td className="py-2.5 capitalize">{it.type}</td>
                  <td className="py-2.5"><StatusPill status={it.status} /></td>
                  <td className={`py-2.5 ${t.textMuted}`}>{it.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminUsers({ t }) {
  // TODO: connect to real backend user list API (e.g. GET /api/admin/users) when ready
  const users = [];
  return (
    <div>
      <PageHeader t={t} title="User Management" subtitle="View, verify, and moderate portal users" />
      <div className={`rounded-xl border ${t.border} ${t.cardBg} overflow-x-auto`}>
        <table className="w-full text-sm">
          <thead>
            <tr className={`text-left ${t.textMuted} border-b ${t.border}`}>
              <th className="p-4 font-medium">Name</th><th className="p-4 font-medium">Email</th><th className="p-4 font-medium">Role</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={5} className={`p-6 text-center ${t.textMuted}`}>No users found.</td></tr>
            )}
            {users.map((u) => (
              <tr key={u.email} className={`border-b ${t.border} last:border-0`}>
                <td className="p-4 font-medium">{u.name}</td>
                <td className={`p-4 ${t.textMuted}`}>{u.email}</td>
                <td className="p-4">{u.role}</td>
                <td className="p-4"><StatusPill status={u.status === "Active" ? "Recovered" : "Rejected"} /></td>
                <td className="p-4"><button className="text-rose-500 text-xs font-semibold hover:underline">Suspend</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminClaims({ t }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    getAllClaims()
      .then((res) => setClaims(res.claims || []))
      .catch((err) => setError(err.response?.data?.message || "Could not load claims."))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleDecision = async (id, decision) => {
    setBusyId(id);
    try {
      await decideClaim(id, decision);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update claim.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader t={t} title="Claims Management" subtitle="Review and resolve ownership claims" />
      {error && <div className="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2 mb-4">{error}</div>}
      <div className="grid gap-4">
        {loading && <p className={`text-sm ${t.textMuted}`}>Loading claims...</p>}
        {!loading && claims.length === 0 && <p className={`text-sm ${t.textMuted}`}>No claims yet.</p>}
        {claims.map((c) => (
          <div key={c._id} className={`rounded-xl border ${t.border} ${t.cardBg} p-5`}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
              <div>
                <div className="font-mono text-xs text-indigo-600">{c._id.slice(-8).toUpperCase()}</div>
                <div className="font-semibold">{c.item?.itemName}</div>
                <div className={`text-xs ${t.textMuted}`}>Claimed by {c.user?.name} ({c.user?.email}) · {c.createdAt?.slice(0, 10)}</div>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill status={c.status} />
                {c.status === "Pending" || c.status === "Under Review" ? (
                  <>
                    <button disabled={busyId === c._id} onClick={() => handleDecision(c._id, "Approved")}
                      className="text-xs font-semibold text-emerald-600 border border-emerald-600/30 rounded-lg px-3 py-1.5 hover:bg-emerald-600/10 disabled:opacity-50">
                      Approve
                    </button>
                    <button disabled={busyId === c._id} onClick={() => handleDecision(c._id, "Rejected")}
                      className="text-xs font-semibold text-rose-500 border border-rose-500/30 rounded-lg px-3 py-1.5 hover:bg-rose-500/10 disabled:opacity-50">
                      Reject
                    </button>
                  </>
                ) : null}
              </div>
            </div>
            <p className={`text-xs ${t.textMuted} mb-1`}><span className="font-medium">Ownership description:</span> {c.ownershipDescription}</p>
            <p className={`text-xs ${t.textMuted}`}><span className="font-medium">Identification:</span> {c.identificationDetails}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- My Claims (student side, with reviews) ----------
function ChatModal({ t, claimId, itemName, otherPartyName, user, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = React.useRef(null);

  const load = () => {
    getMessages(claimId)
      .then((data) => setMessages(data.messages || []))
      .catch((err) => setError(err.response?.data?.message || "Could not load messages."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // Poll every 4s while the chat is open so both sides see new messages
    // without needing a full websocket setup.
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claimId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      await sendMessage(claimId, text.trim());
      setText("");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className={`w-full max-w-md rounded-xl border ${t.border} ${t.cardBg} flex flex-col h-[70vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between p-4 border-b ${t.border}`}>
          <div>
            <div className="font-semibold text-sm">{itemName}</div>
            <div className={`text-xs ${t.textMuted}`}>
              Chat with {otherPartyName || "the other person"} · numbers stay private, everything happens here
            </div>
          </div>
          <button onClick={onClose} className={`text-sm ${t.textMuted} hover:opacity-70`}>✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading && <p className={`text-sm ${t.textMuted}`}>Loading conversation...</p>}
          {!loading && messages.length === 0 && (
            <p className={`text-sm ${t.textMuted}`}>No messages yet. Say hello and sort out the handover here — no need to share your phone number.</p>
          )}
          {messages.map((m) => {
            const fromMe = String(m.sender) === String(user._id);
            return (
              <div key={m._id} className={`flex ${fromMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    fromMe ? "bg-indigo-600 text-white" : `${t.border} border ${t.cardBg}`
                  }`}
                >
                  {m.text}
                  <div className={`text-[10px] mt-1 opacity-70`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {error && <div className="text-xs text-rose-500 px-4 pb-1">{error}</div>}

        <form onSubmit={handleSend} className={`p-3 border-t ${t.border} flex gap-2`}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            maxLength={2000}
            className={`flex-1 rounded-lg border ${t.border} ${t.cardBg} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

function MyClaims({ t, user }) {
  const [tab, setTab] = useState("made"); // "made" | "received"
  const [claims, setClaims] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewFor, setReviewFor] = useState(null); // claim being reviewed
  const [chatFor, setChatFor] = useState(null); // claim being chatted about
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([getMyClaims(), getReceivedClaims()])
      .then(([mine, recv]) => {
        setClaims(mine.claims || []);
        setReceived(recv.claims || []);
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load claims."))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleDecision = async (id, decision) => {
    setBusyId(id);
    try {
      await decideClaim(id, decision);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update claim.");
    } finally {
      setBusyId(null);
    }
  };

  const pendingReceivedCount = received.filter((c) => c.status === "Pending" || c.status === "Under Review").length;

  return (
    <div>
      <PageHeader t={t} title="My Claims" subtitle="Claims you've made, and claims on items you've found" />
      {error && <div className="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2 mb-4">{error}</div>}

      <div className={`flex gap-2 mb-5 border-b ${t.border}`}>
        <button onClick={() => setTab("made")} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === "made" ? "border-indigo-600 text-indigo-600" : "border-transparent " + t.textMuted}`}>
          Claims I made
        </button>
        <button onClick={() => setTab("received")} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center gap-1.5 ${tab === "received" ? "border-indigo-600 text-indigo-600" : "border-transparent " + t.textMuted}`}>
          Claims on my found items
          {pendingReceivedCount > 0 && <span className="text-xs bg-amber-500 text-white rounded-full px-1.5 py-0.5">{pendingReceivedCount}</span>}
        </button>
      </div>

      {tab === "made" && (
        <div className="grid gap-4">
          {loading && <p className={`text-sm ${t.textMuted}`}>Loading...</p>}
          {!loading && claims.length === 0 && <p className={`text-sm ${t.textMuted}`}>You haven't submitted any claims yet. Find your item under "AI Matches" or "My Reports" and claim it there.</p>}
          {claims.map((c) => (
            <div key={c._id} className={`rounded-xl border ${t.border} ${t.cardBg} p-5 flex flex-wrap items-center justify-between gap-4`}>
              <div>
                <div className="font-semibold">{c.item?.itemName}</div>
                <div className={`text-xs ${t.textMuted}`}>Submitted {c.createdAt?.slice(0, 10)}</div>
                {c.adminNote && <div className={`text-xs mt-1 ${t.textMuted}`}>Note: {c.adminNote}</div>}
              </div>
              <div className="flex items-center gap-3">
                <StatusPill status={c.status} />
                <button onClick={() => setChatFor({ id: c._id, itemName: c.item?.itemName, otherName: c.item?.reportedBy?.name })}
                  className="text-xs font-semibold text-indigo-600 border border-indigo-600/30 rounded-lg px-3 py-1.5 hover:bg-indigo-600/10">
                  💬 Chat
                </button>
                {c.status === "Approved" && (
                  <button onClick={() => setReviewFor(c)} className="text-xs font-semibold text-indigo-600 border border-indigo-600/30 rounded-lg px-3 py-1.5 hover:bg-indigo-600/10">
                    Leave a review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "received" && (
        <div className="grid gap-4">
          {loading && <p className={`text-sm ${t.textMuted}`}>Loading...</p>}
          {!loading && received.length === 0 && <p className={`text-sm ${t.textMuted}`}>No one has claimed any of your found item reports yet.</p>}
          {received.map((c) => (
            <div key={c._id} className={`rounded-xl border ${t.border} ${t.cardBg} p-5`}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <div>
                  <div className="font-semibold">{c.item?.itemName}</div>
                  <div className={`text-xs ${t.textMuted}`}>Claimed by {c.user?.name} ({c.user?.email}) · {c.createdAt?.slice(0, 10)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={c.status} />
                  <button onClick={() => setChatFor({ id: c._id, itemName: c.item?.itemName, otherName: c.user?.name })}
                    className="text-xs font-semibold text-indigo-600 border border-indigo-600/30 rounded-lg px-3 py-1.5 hover:bg-indigo-600/10">
                    💬 Chat
                  </button>
                  {(c.status === "Pending" || c.status === "Under Review") && (
                    <>
                      <button disabled={busyId === c._id} onClick={() => handleDecision(c._id, "Approved")}
                        className="text-xs font-semibold text-emerald-600 border border-emerald-600/30 rounded-lg px-3 py-1.5 hover:bg-emerald-600/10 disabled:opacity-50">
                        Approve
                      </button>
                      <button disabled={busyId === c._id} onClick={() => handleDecision(c._id, "Rejected")}
                        className="text-xs font-semibold text-rose-500 border border-rose-500/30 rounded-lg px-3 py-1.5 hover:bg-rose-500/10 disabled:opacity-50">
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
              <p className={`text-xs ${t.textMuted} mb-1`}><span className="font-medium">Ownership description:</span> {c.ownershipDescription}</p>
              <p className={`text-xs ${t.textMuted}`}><span className="font-medium">Identification:</span> {c.identificationDetails}</p>
            </div>
          ))}
        </div>
      )}
      {reviewFor && (
        <ReviewFormModal
          t={t}
          claim={reviewFor}
          onClose={() => setReviewFor(null)}
          onSubmitted={() => { setReviewFor(null); load(); }}
        />
      )}
      {chatFor && (
        <ChatModal
          t={t}
          user={user}
          claimId={chatFor.id}
          itemName={chatFor.itemName}
          otherPartyName={chatFor.otherName}
          onClose={() => setChatFor(null)}
        />
      )}
    </div>
  );
}

// ---------- Review Form Modal ----------
function ReviewFormModal({ t, claim, onClose, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await createReview({ claimId: claim._id, rating, comment });
      onSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className={`w-full max-w-md rounded-xl border ${t.border} ${t.cardBg} p-6`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-bold">Review the finder</h2>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${t.hover}`}><X size={18} /></button>
        </div>
        <p className={`text-sm mb-4 ${t.textMuted}`}>How was your experience getting "{claim.item?.itemName}" back?</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{error}</div>}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} onClick={() => setRating(n)}>
                <Star size={26} className={n <= rating ? "fill-amber-400 text-amber-400" : `${t.textMuted}`} />
              </button>
            ))}
          </div>
          <div>
            <label className="text-sm font-medium">Comment (optional)</label>
            <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder="Thank the finder or share your experience..."
              className={`w-full mt-1 rounded-lg border px-3 py-2.5 text-sm ${t.input}`} />
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg py-2.5 text-sm disabled:opacity-60">
            {submitting ? "Submitting..." : "Submit review"}
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminAnalytics({ t, dark }) {
  // TODO: connect to real backend analytics API when available
  return (
    <div>
      <PageHeader t={t} title="Analytics" subtitle="Security logs and campus-wide trends" />
      <div className={`rounded-xl border ${t.border} ${t.cardBg} p-5`}>
        <p className={`text-sm ${t.textMuted}`}>Analytics will appear here once connected to the backend reporting API.</p>
      </div>
    </div>
  );
}

// ---------- Developers ----------
function DevelopersPage({ t }) {
  return (
    <div>
      <PageHeader t={t} title="Developers" subtitle="The team behind the MITS Lost & Found Portal" />
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        {DEVELOPERS.map((d) => (
          <div key={d.name} className={`rounded-xl border ${t.border} ${t.cardBg} p-6 text-center`}>
            <div className="w-20 h-20 mx-auto rounded-full bg-indigo-700 text-white flex items-center justify-center text-2xl font-bold mb-4">{d.initials}</div>
            <h3 className="font-semibold text-lg">{d.name}</h3>
            <p className={`text-sm ${t.textMuted}`}>{d.role}</p>
            <p className={`text-xs ${t.textMuted} mb-4 flex items-center justify-center gap-1`}><Building2 size={12} /> {d.college}</p>
            <div className="flex justify-center gap-3">
              <a href={d.linkedin} className={`p-2 rounded-lg border ${t.border} ${t.hover}`}><Linkedin size={16} /></a>
              <a href={d.github} className={`p-2 rounded-lg border ${t.border} ${t.hover}`}><Github size={16} /></a>
              <a href={`mailto:${d.email}`} className={`p-2 rounded-lg border ${t.border} ${t.hover}`}><Mail size={16} /></a>
            </div>
          </div>
        ))}
      </div>
      <div className={`rounded-xl border ${t.border} ${t.cardBg} p-6`}>
        <h3 className="font-semibold mb-2">Project Vision</h3>
        <p className={`text-sm ${t.textMuted} mb-4`}>To make sure no MITS student, faculty, or staff member loses a valuable item to campus chaos again — by giving the community a fast, secure, and transparent way to report and recover belongings.</p>
        <h3 className="font-semibold mb-2">Mission Statement</h3>
        <p className={`text-sm ${t.textMuted} mb-4`}>Built by students, for students — a trustworthy digital layer over campus security, connecting the person who lost something with the person who found it.</p>
        <h3 className="font-semibold mb-2">Technology Stack</h3>
        <div className="flex flex-wrap gap-2">
          {["React.js", "Tailwind CSS", "Node.js", "Express.js", "MongoDB Atlas", "JWT Auth", "Google OAuth", "Cloudinary"].map((tech) => (
            <span key={tech} className={`text-xs font-medium px-3 py-1.5 rounded-full border ${t.border}`}>{tech}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Root App ----------
export default function App() {
  const [dark, setDark] = useState(false);
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null); // { id, name, email, role, profileImage }
  const [checkingSession, setCheckingSession] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const t = useTheme(dark);
  const role = user?.role || null;

  const goto = (p) => setPage(p);
  const login = (userObj) => { setUser(userObj); setPage(userObj.role === "admin" ? "admin" : "dashboard"); };
  const logout = async () => {
    try { await logoutUser(); } catch (err) { console.error(err); }
    setUser(null);
    setPage("landing");
  };

  // Page refresh hone par bhi session bani rahe, isliye cookie se current user check karo
  useEffect(() => {
    getCurrentUser()
      .then((res) => { setUser(res.user); setPage(res.user.role === "admin" ? "admin" : "dashboard"); })
      .catch(() => {})
      .finally(() => setCheckingSession(false));
    // Agar kahin bhi API 401 de (session expire), auto-logout kar do
    const onExpire = () => { setUser(null); setPage("landing"); };
    window.addEventListener("auth-expired", onExpire);
    return () => window.removeEventListener("auth-expired", onExpire);
  }, []);

  if (checkingSession) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">Loading...</div>;
  }

  if (!role) {
    if (page === "developers") {
      return (
        <Shell t={t} dark={dark} setDark={setDark} page={page} setPage={setPage} role="student" logout={() => setPage("landing")} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
          <DevelopersPage t={t} />
        </Shell>
      );
    }
    if (page === "login") return <Login t={t} dark={dark} setDark={setDark} goto={goto} login={login} />;
    return <Landing t={t} dark={dark} goto={goto} />;
  }

  const pages = {
    dashboard: <Dashboard t={t} dark={dark} user={user} />,
    reportLost: <ReportForm t={t} mode="lost" />,
    reportFound: <ReportForm t={t} mode="found" />,
    myReports: <ItemsSearch t={t} title="My Reports" user={user} />,
    matches: <MatchesPage t={t} user={user} />,
    myClaims: <MyClaims t={t} user={user} />,
    notifications: <NotificationsPage t={t} />,
    profile: <ProfilePage t={t} user={user} />,
    settings: <SettingsPage t={t} dark={dark} setDark={setDark} />,
    developers: <DevelopersPage t={t} />,
    admin: <AdminDashboard t={t} dark={dark} />,
    adminUsers: <AdminUsers t={t} />,
    adminClaims: <AdminClaims t={t} />,
    adminAnalytics: <AdminAnalytics t={t} dark={dark} />,
  };

  return (
    <Shell t={t} dark={dark} setDark={setDark} page={page} setPage={setPage} role={role} user={user} logout={logout} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      {pages[page] || <Dashboard t={t} dark={dark} />}
    </Shell>
  );
}