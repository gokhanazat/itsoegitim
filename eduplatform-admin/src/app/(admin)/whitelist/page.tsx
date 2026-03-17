"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Plus, FileUp, Trash2, Power, PowerOff, UserCheck, MapPin, Mail, Hash, CheckCircle2 } from "lucide-react"

import { adminChangeUserPassword } from "@/app/actions/admin-actions"
import { KeyRound, ShieldAlert } from "lucide-react"

type WhitelistEntry = { 
  id: string; 
  email: string; 
  sicil_no: string; 
  city: string; 
  is_active: boolean; 
  added_at: string; 
  notes: string;
  profile_id?: string; // Optinal profile id
}

export default function WhitelistPage() {
  const [entries, setEntries] = useState<WhitelistEntry[]>([])
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<WhitelistEntry | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newSicil, setNewSicil] = useState("")
  const [newCity, setNewCity] = useState("")
  const [newNotes, setNewNotes] = useState("")
  const [loading, setLoading] = useState(false)

  async function load() {
    let q = supabase.from("whitelist").select("*").order("added_at", { ascending: false })
    if (search) q = q.or(`email.ilike.%${search}%,sicil_no.ilike.%${search}%`)
    const { data: whitelistData } = await q
    
    // Check which ones have profiles
    if (whitelistData) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email")
      
      const mapped = whitelistData.map(w => ({
        ...w,
        profile_id: profiles?.find(p => p.email.toLowerCase() === w.email?.toLowerCase())?.id
      }))
      setEntries(mapped)
    } else {
      setEntries([])
    }
  }

  useEffect(() => { load() }, [search])

  async function handlePasswordChange() {
    if (!selectedUser?.profile_id || !newPassword) return
    setLoading(true)
    
    const result = await adminChangeUserPassword(selectedUser.profile_id, newPassword)
    
    if (result.success) {
      alert("Şifre başarıyla güncellendi.")
      setShowPasswordModal(false)
      setNewPassword("")
    } else {
      alert("Hata: " + result.error)
    }
    setLoading(false)
  }

  async function addEntry() {
    if (!newEmail && !newSicil) return
    setLoading(true)
    const { error } = await supabase.from("whitelist").insert({ 
      email: newEmail || null, 
      sicil_no: newSicil || null,
      city: newCity, 
      notes: newNotes 
    })
    
    if (error) {
      alert("Hata: " + error.message)
      setLoading(false)
      return
    }

    setNewEmail(""); setNewSicil(""); setNewCity(""); setNewNotes(""); setShowAdd(false); setLoading(false)
    load()
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from("whitelist").update({ is_active: !current }).eq("id", id)
    load()
  }

  async function deleteEntry(id: string) {
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return
    await supabase.from("whitelist").delete().eq("id", id)
    load()
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
             <UserCheck className="text-primary" size={32} /> Beyaz Liste 
             <Badge variant="secondary" className="ml-2 bg-indigo-50 text-indigo-600 border-none font-bold">
                {entries.length} Kayıt
             </Badge>
          </h1>
          <p className="text-slate-500 mt-1">Sisteme kayıt olabilecek yetkili kullanıcıları yönetin.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none h-11 rounded-xl bg-white gap-2 border-slate-200">
            <FileUp size={18} /> CSV Yükle
          </Button>
          <Button onClick={() => setShowAdd(true)} className="flex-1 md:flex-none h-11 rounded-xl btn-primary gap-2">
            <Plus size={18} /> Yeni Ekle
          </Button>
        </div>
      </div>

      <Card className="border-none glass-card p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-white/30 flex flex-col md:flex-row gap-4 justify-between">
           <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="E-posta veya Sicil No ara..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="pl-10 h-10 rounded-xl bg-white border-slate-200 focus:ring-primary/20" 
              />
           </div>
           <div className="flex items-center text-xs text-slate-400 font-medium italic">
                * Mavi ikonlu kullanıcılar kayıtlıdır. Şifrelerini değiştirebilirsiniz.
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Kullanıcı Bilgileri</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Bölge/Şehir</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Durum</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Kayıt Durumu</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map(e => (
                <tr key={e.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 font-bold text-slate-700">
                            <Mail size={14} className="text-slate-300" /> {e.email || "-"}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                            <Hash size={12} className="text-slate-200" /> Sicil: {e.sicil_no || "-"}
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <MapPin size={14} className="text-primary/50" /> {e.city}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Badge className={`rounded-xl border-none font-bold px-3 py-1 ${
                        e.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                    }`}>
                      {e.is_active ? "Aktif" : "Pasif"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {e.profile_id ? (
                      <Badge className="bg-blue-50 text-blue-600 border-none font-bold px-3 py-1 gap-1">
                        <CheckCircle2 size={12} /> Kayıtlı
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-300 font-medium">Bekliyor</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {e.profile_id && (
                        <Button size="icon" variant="ghost" className="rounded-xl text-blue-500 hover:bg-blue-50"
                          onClick={() => { setSelectedUser(e); setShowPasswordModal(true); }} title="Şifre Değiştir">
                          <KeyRound size={18} />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className={`rounded-xl ${e.is_active ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                        onClick={() => toggleActive(e.id, e.is_active)} title={e.is_active ? "Pasif Yap" : "Aktif Yap"}>
                        {e.is_active ? <PowerOff size={18} /> : <Power size={18} />}
                      </Button>
                      <Button size="icon" variant="ghost" className="rounded-xl text-red-500 hover:bg-red-50"
                        onClick={() => deleteEntry(e.id)} title="Kaydı Sil">
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {entries.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <Search size={32} />
                </div>
                <div className="text-slate-400 font-medium">Aradığınız kriterlere uygun kayıt bulunamadı.</div>
            </div>
          )}
        </div>
      </Card>

      {/* Şifre Değiştirme Modalı */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="rounded-3xl border-none shadow-2xl p-0 max-w-md">
          <div className="bg-blue-600 h-2"></div>
          <DialogHeader className="p-6 pb-0 text-center">
            <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <KeyRound size={24} />
            </div>
            <DialogTitle className="text-2xl font-bold">Şifre Güncelle</DialogTitle>
            <p className="text-sm text-slate-400">
                <span className="font-bold text-slate-600">{selectedUser?.email}</span> kullanıcısı için yeni bir şifre tanımlayın.
            </p>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
                <Label>Yeni Şifre</Label>
                <Input 
                    type="password"
                    placeholder="En az 6 karakter" 
                    className="h-11 rounded-xl bg-slate-50 border-slate-200" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                />
            </div>
            <div className="flex gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-700 text-[11px] leading-snug">
                <ShieldAlert size={20} className="shrink-0" />
                <span>Bu işlem kullanıcının mevcut şifresini hemen geçersiz kılacaktır. Lütfen yeni şifreyi kullanıcıya bildirmeyi unutmayın.</span>
            </div>
            <div className="flex gap-3">
                <Button variant="ghost" className="flex-1 rounded-xl border border-slate-200 font-bold" onClick={() => setShowPasswordModal(false)}>İptal</Button>
                <Button className="flex-[2] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold" onClick={handlePasswordChange} disabled={loading || newPassword.length < 6}>
                {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Yeni Kayıt Modalı */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="rounded-3xl border-none shadow-2xl overflow-hidden p-0 max-w-md">
          <div className="premium-gradient h-2 px-0"></div>
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-bold">Yeni Kayıt</DialogTitle>
            <p className="text-sm text-slate-400">Üye girişine izin verilecek kişiyi tanımlayın.</p>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
                <Label>E-posta Adresi</Label>
                <Input placeholder="ornek@itso.gov.tr" className="h-11 rounded-xl bg-slate-50 border-slate-200" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label>Sicil Numarası</Label>
                <Input placeholder="12345" className="h-11 rounded-xl bg-slate-50 border-slate-200" value={newSicil} onChange={e => setNewSicil(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label>Şehir / Bölge *</Label>
                <Input placeholder="Isparta" className="h-11 rounded-xl bg-slate-50 border-slate-200" value={newCity} onChange={e => setNewCity(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label>İç Not (Opsiyonel)</Label>
                <Input placeholder="Örn: Yönetim Üyesi" className="h-11 rounded-xl bg-slate-50 border-slate-200" value={newNotes} onChange={e => setNewNotes(e.target.value)} />
            </div>
            <Button className="w-full h-12 rounded-xl btn-primary font-bold mt-2" onClick={addEntry} disabled={loading || (!newEmail && !newSicil) || !newCity}>
              {loading ? "Ekleniyor..." : "Kayıt Listesine Ekle"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

