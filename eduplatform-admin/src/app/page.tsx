import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  Search, 
  Bell, 
  User, 
  ChevronRight, 
  Code, 
  Palette, 
  Briefcase, 
  Megaphone, 
  Music, 
  Camera,
  Star,
  Clock,
  LayoutDashboard
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { createServerSupabase } from "@/lib/supabase/server"

export default async function LandingPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  
  let isAdmin = false
  let userProfile = null

  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    userProfile = profile
    isAdmin = profile?.role === 'admin'
  }
  
  // Real course fetching
  const { data: realCourses } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .limit(5)
    .order("created_at", { ascending: false })

  const categories = [
    { name: "Programlama", icon: Code, color: "text-blue-500", bg: "bg-blue-50" },
    { name: "Tasarım", icon: Palette, color: "text-purple-500", bg: "bg-purple-50" },
    { name: "İş Dünyası", icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-50" },
    { name: "Pazarlama", icon: Megaphone, color: "text-orange-500", bg: "bg-orange-50" },
    { name: "Müzik", icon: Music, color: "text-red-500", bg: "bg-red-50" },
    { name: "Fotoğrafçılık", icon: Camera, color: "text-teal-500", bg: "bg-teal-50" },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar */}
      <header className="px-8 h-20 flex items-center bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="flex items-center gap-8 w-full">
          <Link className="flex items-center gap-2" href="/">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              <BookOpen size={24} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight italic">ITSO Akademi</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 ml-8">
            <Link className="text-sm font-bold text-slate-600 hover:text-primary transition-colors" href="/home">Eğitimler</Link>
            <Link className="text-sm font-bold text-slate-600 hover:text-primary transition-colors" href="#">Kategoriler</Link>
            <Link className="text-sm font-bold text-slate-600 hover:text-primary transition-colors" href="/certificates">Sertifikalar</Link>
          </nav>

          {/* Auth Actions */}
          <div className="ml-auto flex items-center gap-4">
             {isAdmin && (
                <Button variant="ghost" className="hidden md:flex items-center gap-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl font-bold border-none" asChild>
                    <Link href="/dashboard"><LayoutDashboard size={18} /> Yönetim Paneli</Link>
                </Button>
            )}

            {!session ? (
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="font-bold text-slate-600 rounded-xl hover:bg-slate-50" asChild>
                        <Link href="/login">Giriş Yap</Link>
                    </Button>
                    <Button className="font-bold rounded-xl bg-slate-900 text-white hover:bg-black px-6" asChild>
                        <Link href="/register">Kaydol</Link>
                    </Button>
                </div>
            ) : (
                <Link href={isAdmin ? "/dashboard" : "/profile"} className="flex items-center gap-3 p-1 pr-4 bg-slate-50 rounded-full border border-slate-100 hover:bg-slate-100 transition-colors group">
                    <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-primary font-bold overflow-hidden border border-slate-100">
                        {userProfile?.full_name?.[0] || <User size={18} />}
                        {userProfile?.avatar_url && <img src={userProfile.avatar_url} className="w-full h-full object-cover" />}
                    </div>
                    <span className="text-xs font-bold text-slate-700 max-w-[100px] truncate">{userProfile?.full_name || "Hesabım"}</span>
                </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 px-8 py-8 space-y-16">
        {/* Android Style Hero Banner */}
        <section className="relative w-full h-[400px] rounded-[3rem] overflow-hidden group shadow-2xl shadow-indigo-100">
          <img 
            src="/landing_hero_banner_1773665519997.png" 
            alt="Landing Hero" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 via-indigo-600/40 to-transparent"></div>
          
          <div className="absolute inset-0 flex flex-col justify-center px-16 max-w-2xl space-y-8">
            <Badge className="w-fit bg-sky-400 text-white border-none py-1.5 px-4 rounded-full font-bold uppercase tracking-widest text-[10px]">
                Öğrenmeye Hemen Başla
            </Badge>
            <h1 className="text-6xl font-black text-white leading-tight tracking-tight">
              Geleceği <br /> Uzmanlardan <br /> <span className="text-sky-300 underline decoration-sky-300/30">Keşfedin</span>
            </h1>
            <p className="text-indigo-50 text-xl font-medium opacity-90 leading-relaxed">
              Milyonlarca öğrenciye katılın. Programlama, tasarım ve daha fazlasında uzmanlaşın.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <Button className="h-16 px-10 rounded-2xl bg-white text-indigo-600 font-black text-lg hover:bg-sky-50 shadow-2xl transition-all hover:scale-105" asChild>
                <Link href={session ? "/home" : "/register"}>{session ? "Eğitimlere Git" : "Şimdi Katıl"}</Link>
              </Button>
              <Button variant="outline" className="h-16 px-10 rounded-2xl border-white/20 bg-white/10 backdrop-blur-xl text-white font-bold hover:bg-white/20" asChild>
                <Link href="/home">Kataloğu İncele</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Top Categories */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Popüler Kategoriler</h2>
            <Link href="/home" className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
                Tümünü Gör <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {categories.map((cat, i) => (
              <Link href={`/home?category=${cat.name}`} key={i}>
                <Card className="border-none shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all cursor-pointer rounded-[2.5rem] group bg-slate-50/50 border border-slate-100 hover:bg-white">
                    <CardContent className="p-10 flex flex-col items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl ${cat.bg} ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                        <cat.icon size={28} />
                    </div>
                    <span className="text-sm font-black text-slate-700 uppercase tracking-wider">{cat.name}</span>
                    </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Courses */}
        <section className="space-y-8 pb-20">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sizin İçin Seçtiklerimiz</h2>
            <div className="flex gap-2">
               <button className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-colors shadow-sm active:scale-95">
                <ChevronRight size={20} className="rotate-180" />
               </button>
               <button className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-colors shadow-sm active:scale-95">
                <ChevronRight size={20} />
               </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {realCourses?.map((course) => (
              <Link href={session ? `/courses/${course.id}` : `/login`} key={course.id}>
                <Card className="border-none shadow-sm hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)] transition-all rounded-[2.5rem] overflow-hidden group cursor-pointer bg-white h-full border border-slate-100">
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                    {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <BookOpen size={56} />
                        </div>
                    )}
                    <div className="absolute top-5 left-5">
                        <Badge className="bg-white/90 backdrop-blur-md text-primary border-none rounded-xl font-black text-[10px] px-3 py-1 uppercase tracking-widest shadow-sm">
                        {course.category}
                        </Badge>
                    </div>
                    </div>
                    <CardContent className="p-7 space-y-4">
                        <div className="flex items-center gap-1.5 font-bold text-amber-500 text-[10px] uppercase tracking-wider">
                            <Star size={14} fill="currentColor" /> 4.9 YILDIZ
                        </div>
                        <h3 className="font-bold text-slate-900 text-[15px] line-clamp-2 h-11 leading-snug group-hover:text-primary transition-colors">
                            {course.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Clock size={12} /> {course.duration_minutes || 0} DAKİKA
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="text-xl font-black text-slate-900 italic">Ücretsiz</div>
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1 shadow-inner">
                                <ChevronRight size={20} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
              </Link>
            ))}

            {!realCourses?.length && (
                <div className="col-span-full py-24 text-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-white">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
                        <BookOpen size={40} className="text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-bold italic tracking-wide">Henüz bir eğitim eklenmemiş, çok yakında burada!</p>
                </div>
            )}
          </div>
        </section>
      </main>

      <footer className="px-12 py-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/30">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold">I</div>
            <span className="font-bold text-slate-900">ITSO Akademi</span>
        </div>
        <p className="text-xs text-slate-400 font-medium tracking-wide">© 2026 ITSO Akademi Eğitim Sistemleri. Tüm Hakları Saklıdır.</p>
        <div className="flex items-center gap-6">
            <Link href="#" className="text-xs font-bold text-slate-400 hover:text-primary">Kullanım Şartları</Link>
            <Link href="#" className="text-xs font-bold text-slate-400 hover:text-primary">Gizlilik Politikası</Link>
        </div>
      </footer>
    </div>
  )
}
