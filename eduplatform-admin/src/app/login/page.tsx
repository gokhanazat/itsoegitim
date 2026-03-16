"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  BookOpen,
  ChevronLeft
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Giriş başarısız: " + error.message);
      setLoading(false);
    } else if (session) {
      router.push("/")
      router.refresh()
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Left Side - Image (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden group">
        <img 
          src="/login-bg.png" 
          alt="Login background" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px] mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
        
        <div className="absolute bottom-20 left-16 max-w-lg space-y-6">
          <div className="w-16 h-1 w-20 bg-white rounded-full"></div>
          <h1 className="text-6xl font-black text-white leading-tight tracking-tight">
            Kariyerini <br /> Yükselt
          </h1>
          <p className="text-xl text-indigo-50 font-medium opacity-90 leading-relaxed">
            Teknoloji, tasarım ve iş dünyasında en çok talep edilen yetkinlikleri öğrenen 10.000'den fazla öğrenciye katılın.
          </p>
        </div>

        <div className="absolute top-12 left-16">
            <Link href="/" className="flex items-center gap-2 group-hover:-translate-x-1 transition-transform">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-xl">
                    <BookOpen size={24} />
                </div>
                <span className="text-xl font-bold text-white uppercase tracking-widest hidden md:block">ITSO Akademi</span>
            </Link>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-white relative">
        <div className="absolute top-12 left-8 lg:left-24">
            <Link href="/" className="flex items-center gap-1.5 text-slate-400 hover:text-primary transition-colors font-bold text-sm">
                <ChevronLeft size={18} /> Ana Sayfa
            </Link>
        </div>

        <div className="max-w-md w-full mx-auto space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Tekrar Hoş Geldiniz</h2>
            <p className="text-slate-400 font-medium">Giriş yapmak için lütfen bilgilerinizi girin.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700 ml-1">E-posta Adresi</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <Input 
                  type="email" 
                  placeholder="ornek@itso.org.tr" 
                  className="h-14 pl-12 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-primary/10 transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <Label className="font-bold text-slate-700">Şifre</Label>
                <Link href="#" className="text-xs font-bold text-primary hover:underline">Şifremi unuttum</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="h-14 pl-12 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-primary/10 transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 px-1">
                <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-200 text-primary focus:ring-primary" />
                <label htmlFor="remember" className="text-sm font-bold text-slate-400 cursor-pointer">30 gün boyunca hatırla</label>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold text-center animate-in fade-in zoom-in-95">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg btn-primary shadow-2xl shadow-indigo-100" disabled={loading}>
              {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>

          <div className="relative space-y-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-300 font-black tracking-widest">Veya şununla devam et</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-12 rounded-2xl border-slate-100 gap-2 font-bold hover:bg-slate-50">
                    <img src="https://www.google.com/favicon.ico" className="w-4 h-4" /> Google
                </Button>
                <Button variant="outline" className="h-12 rounded-2xl border-slate-100 gap-2 font-bold hover:bg-slate-50">
                    <Lock size={16} /> SSO
                </Button>
            </div>
          </div>

          <div className="text-center font-bold text-slate-500">
            Hesabınız yok mu?{" "}
            <Link href="/register" className="text-primary hover:underline">Hesap oluştur</Link>
          </div>
        </div>

        <footer className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">© 2026 ITSO Akademi Eğitim Sistemleri. Tüm hakları saklıdır.</p>
        </footer>
      </div>
    </div>
  );
}
