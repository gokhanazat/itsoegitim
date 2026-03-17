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
    
    const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      if (authError.message === "Invalid login credentials") {
        // Check if user is in whitelist but not yet registered
        const { data: whitelistUser } = await supabase
          .from("whitelist")
          .select("is_active")
          .ilike("email", email)
          .single();

        const { data: profileUser } = await supabase
          .from("profiles")
          .select("id")
          .ilike("email", email)
          .single();

        if (whitelistUser && !profileUser) {
          setError("E-postanız beyaz listede kayıtlı ancak henüz hesap oluşturmamışsınız. Lütfen 'Create an account' linkine tıklayarak kayıt olun.");
        } else if (whitelistUser && profileUser && !whitelistUser.is_active) {
            setError("Hesabınız yönetici tarafından pasif hale getirilmiş.");
        } else {
          setError("Giriş başarısız: E-posta veya şifre hatalı.");
        }
      } else {
        setError("Giriş başarısız: " + authError.message);
      }
      setLoading(false);
    } else if (session) {
      router.push("/")
      router.refresh()
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/30 flex flex-col font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="w-full h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                <BookOpen size={18} />
            </div>
            <span className="text-lg font-bold text-slate-900">ITSO Akademi</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link href="/courses" className="hover:text-blue-600 transition-colors">Courses</Link>
            <Link href="/about" className="hover:text-blue-600 transition-colors">About</Link>
        </nav>

        <Link href="/register">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 font-bold text-sm h-10 shadow-sm transition-all">
                Sign Up
            </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-5xl bg-white rounded-[1.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-slate-100">
          
          {/* Left Side - Visual */}
          <div className="md:w-5/12 relative overflow-hidden hidden md:block">
            <img 
              src="/login-bg.png" 
              alt="Login background" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-blue-600/60 backdrop-blur-[1px]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-16 left-12 right-12 space-y-4">
              <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
                Elevate Your Career
              </h2>
              <p className="text-base text-blue-50/90 font-medium leading-relaxed">
                Join over 10,000 students learning the most in-demand skills in tech, design, and business.
              </p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-7/12 flex flex-col justify-center p-10 md:px-16 lg:px-20 relative bg-white">
            <div className="max-w-md w-full mx-auto space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
                <p className="text-slate-500 text-sm font-medium">Please enter your details to sign in.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[13px] font-bold text-slate-700">Email Address</Label>
                  <Input 
                    type="email" 
                    placeholder="name@university.edu" 
                    className="h-12 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500/10 transition-all font-medium text-slate-900"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[13px] font-bold text-slate-700">Password</Label>
                    <Link href="#" className="text-[12px] font-bold text-blue-600 hover:text-blue-700">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="h-12 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500/10 transition-all font-medium pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                    <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="remember" className="text-sm font-medium text-slate-500 cursor-pointer">Remember me for 30 days</label>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[13px] font-bold text-center">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full h-12 rounded-lg font-bold text-base bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 transition-all" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-100"></span>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-12 rounded-lg border-slate-200 gap-2 font-bold text-slate-700 hover:bg-slate-50 text-sm">
                      <img src="https://www.google.com/favicon.ico" className="w-4 h-4" /> Google
                  </Button>
                  <Button variant="outline" className="h-12 rounded-lg border-slate-200 gap-2 font-bold text-slate-700 hover:bg-slate-50 text-sm">
                      <Lock size={16} /> SSO
                  </Button>
              </div>

              <div className="text-center font-bold text-slate-500 text-[13px]">
                Don't have an account?{" "}
                <Link href="/register" className="text-blue-600 hover:text-blue-700">Create an account</Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center bg-white md:bg-transparent">
          <p className="text-[11px] text-slate-400 font-medium">
            © 2026 ITSO Akademi Eğitim Sistemleri. Professional tools for professional learners.
          </p>
      </footer>
    </div>
  );
}
