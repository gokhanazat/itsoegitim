"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { 
  User, 
  Mail, 
  MapPin, 
  Save, 
  ChevronLeft,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  const [fullName, setFullName] = useState("")
  const [city, setCity] = useState("")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/login")
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (data) {
        setProfile(data)
        setFullName(data.full_name || "")
        setCity(data.city || "")
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        city: city
      })
      .eq('id', profile.id)

    if (error) {
      setMessage({ type: 'error', text: "Güncellenirken bir hata oluştu: " + error.message })
    } else {
      setMessage({ type: 'success', text: "Profiliniz başarıyla güncellendi!" })
      setTimeout(() => setMessage(null), 3000)
    }
    setSaving(false)
  }

  if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-primary tracking-widest uppercase">Ayarlar Yükleniyor...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
          <div className="space-y-1">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Profil Ayarları</h1>
              <p className="text-slate-500 font-medium">Kişisel bilgilerinizi ve profil görünümünüzü yönetin.</p>
          </div>
          <Link href="/profile">
              <Button variant="outline" className="rounded-2xl h-12 px-6 border-slate-100 font-bold gap-2 hover:bg-white transition-all">
                  <ChevronLeft size={18} /> Profilime Dön
              </Button>
          </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
              <div className="h-32 bg-indigo-50 relative">
                  <div className="absolute -bottom-12 left-12">
                      <div className="relative group">
                          <div className="w-28 h-28 rounded-[2rem] bg-indigo-50 border-4 border-white shadow-xl flex items-center justify-center text-primary font-black text-3xl overflow-hidden relative">
                              {fullName?.[0] || <User size={40} />}
                          </div>
                      </div>
                  </div>
              </div>

              <CardContent className="pt-20 px-12 pb-12 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                          <Label className="font-bold text-slate-700 ml-1">E-posta Adresi</Label>
                          <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                              <Input 
                                value={profile?.email} 
                                disabled 
                                className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-bold text-slate-400 cursor-not-allowed"
                              />
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">E-posta adresi değiştirilemez</p>
                      </div>

                      <div className="space-y-2">
                          <Label className="font-bold text-slate-700 ml-1">Ad Soyad</Label>
                          <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                              <Input 
                                value={fullName} 
                                onChange={(e) => setFullName(e.target.value)}
                                className="h-14 pl-12 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-primary/10 transition-all font-bold"
                              />
                          </div>
                      </div>

                      <div className="space-y-2">
                          <Label className="font-bold text-slate-700 ml-1">Şehir</Label>
                          <div className="relative">
                              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                              <Input 
                                value={city} 
                                onChange={(e) => setCity(e.target.value)}
                                className="h-14 pl-12 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-primary/10 transition-all font-bold"
                                placeholder="Örn: Isparta"
                              />
                          </div>
                      </div>
                  </div>

                  {message && (
                      <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold animate-in slide-in-from-top-2 ${
                          message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                          {message.text}
                      </div>
                  )}

                  <div className="pt-4 flex justify-end">
                      <Button type="submit" disabled={saving} className="h-14 px-10 rounded-2xl btn-primary font-black text-lg shadow-xl shadow-indigo-100 gap-2">
                          {saving ? "Kaydediliyor..." : <><Save size={20} /> Değişiklikleri Kaydet</>}
                      </Button>
                  </div>
              </CardContent>
          </Card>
      </form>

      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-slate-900">Hesap Güvenliği</h3>
                  <p className="text-sm text-slate-500 font-medium">Şifrenizi güncellemek veya hesabınızı yönetmek mi istiyorsunuz?</p>
              </div>
              <Button variant="outline" className="h-12 px-8 rounded-2xl border-slate-100 font-bold hover:bg-slate-50">
                  Şifre Değiştir
              </Button>
          </div>
      </Card>
    </div>
  )
}
