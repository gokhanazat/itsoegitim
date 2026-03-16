"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  BookOpen,
  ChevronLeft,
  CheckCircle2
} from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    // Whitelist check
    const { data: whitelistEntry, error: whitelistError } = await supabase
      .from("whitelist")
      .select("*")
      .eq("email", email)
      .eq("is_active", true)
      .single();

    if (whitelistError || !whitelistEntry) {
      setError("Registration not found in whitelist or account inactive. Please contact admin.");
      setLoading(false);
      return;
    }

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'student'
        }
      }
    });

    if (signUpError) {
      setError("Registration failed: " + signUpError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Left Side - Image (Desktop Only) - Reuse login image or similar style */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden group">
        <img 
          src="/login-bg.png" 
          alt="Register background" 
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-20 transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-primary/90 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-indigo-600 to-purple-800"></div>
        
        <div className="absolute bottom-20 left-16 max-w-lg space-y-8">
          <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md px-4 py-1.5 text-xs font-bold rounded-full">ÖĞRENCİ KAYDI</Badge>
          <h1 className="text-6xl font-black text-white leading-tight tracking-tight">
            Yolculuğun <br /> Bugün Başlıyor
          </h1>
          <p className="text-xl text-indigo-50 font-medium opacity-80 leading-relaxed">
            Hesabınızı oluşturun, uzman eğitimlerine erişin ve profesyonel geleceğinizi dönüştürün.
          </p>
          
          <div className="space-y-4 pt-4">
              {[
                  "5.000+ premium eğitime erişim",
                  "Dünya çapında uzman eğitmenler",
                  "Sektörde tanınan sertifikalar",
                  "İçeriklere ömür boyu erişim"
              ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-white/90 font-bold">
                      <CheckCircle2 size={20} className="text-emerald-400" />
                      <span>{feature}</span>
                  </div>
              ))}
          </div>
        </div>

        <div className="absolute top-12 left-16">
            <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-xl">
                    <BookOpen size={24} />
                </div>
                <span className="text-xl font-bold text-white uppercase tracking-widest">ITSO Akademi</span>
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
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Hesap Oluştur</h2>
            <p className="text-slate-400 font-medium">Topluluğumuza katılın ve öğrenmeye başlayın.</p>
          </div>

          {success ? (
            <div className="space-y-6 text-center py-10 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-500 mx-auto shadow-xl shadow-emerald-100/50">
                    <CheckCircle2 size={48} />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900">Başarılı!</h3>
                    <p className="text-slate-400 font-medium">Hesabınız oluşturuldu. <br /> Giriş sayfasına yönlendiriliyorsunuz...</p>
                </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                <Label className="font-bold text-slate-700 ml-1">Ad Soyad</Label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    <Input 
                    placeholder="Adınız Soyadınız" 
                    className="h-14 pl-12 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-primary/10 transition-all font-medium"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    />
                </div>
                </div>

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
                <Label className="font-bold text-slate-700 ml-1 text-sm">Şifre</Label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-14 pl-12 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-primary/10 transition-all font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    />
                </div>
                </div>

                {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold text-center">
                    {error === "Registration not found in whitelist or account inactive. Please contact admin." 
                        ? "E-posta adresi beyaz listede bulunamadı veya hesap aktif değil. Lütfen yönetici ile iletişime geçin." 
                        : error}
                </div>
                )}

                <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg btn-primary shadow-2xl shadow-indigo-100 mt-4" disabled={loading}>
                {loading ? "Hesap Oluşturuluyor..." : "Hesap Oluştur"}
                </Button>
            </form>
          )}

          {!success && (
            <div className="text-center font-bold text-slate-500">
                Zaten hesabınız var mı?{" "}
                <Link href="/login" className="text-primary hover:underline">Giriş Yap</Link>
            </div>
          )}
        </div>

        <footer className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">© 2026 ITSO Akademi Eğitim Sistemleri. Tüm hakları saklıdır.</p>
        </footer>
      </div>
    </div>
  );
}
