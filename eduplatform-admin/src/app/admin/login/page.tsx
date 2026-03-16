"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Lock, Mail } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Hata: " + authError.message);
      setLoading(false);
      return;
    }

    // Check if user is admin (you might want to verify role in profiles table)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user?.id)
      .single();

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut();
      setError("Yetkisiz erişim: Bu sayfa sadece yöneticiler içindir.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-900 overflow-hidden relative">
      {/* Decorative elements for admin page */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-20 blur-[150px] -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600 opacity-20 blur-[150px] -ml-48 -mb-48"></div>
      
      <div className="w-full max-w-md relative z-10">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700 shadow-2xl text-white">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-4 border border-white/20 shadow-xl">
              <ShieldCheck size={32} className="text-primary" />
            </div>
            <CardTitle className="text-3xl font-extrabold tracking-tight">Admin Portal</CardTitle>
            <CardDescription className="text-slate-400">Yönetim paneline erişim için yetkili girişi</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Yönetici E-posta</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input 
                    id="email" 
                    type="email" 
                    className="pl-10 h-12 rounded-xl bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-primary focus:ring-primary/20"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Güvenlik Şifresi</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-10 h-12 rounded-xl bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-primary focus:ring-primary/20"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 text-red-400 text-sm font-medium text-center border border-red-500/20">
                  {error}
                </div>
              )}
              
              <Button type="submit" className="w-full h-12 rounded-xl font-bold btn-primary text-base shadow-indigo-900/40" disabled={loading}>
                {loading ? "Doğrulanıyor..." : "Sisteme Giriş Yap"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="mt-8 text-center text-slate-500 text-xs uppercase tracking-widest">
            Güvenli Yönetim Sistemi v2.0
        </p>
      </div>
    </div>
  );
}
