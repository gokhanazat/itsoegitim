"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Trash2, Plus, GripVertical, FileText, Video as VideoIcon, ArrowLeft, Save, Layout, ListOrdered, BookOpen } from "lucide-react"
import Link from "next/link"

export default function CourseEditPage() {
  const params = useParams()
  const router = useRouter()
  
  // Robust ID detection from multiple sources
  const idStr = Array.isArray(params.id) ? params.id[0] : params.id
  const urlPath = typeof window !== 'undefined' ? window.location.pathname : ''
  const idFromPath = urlPath.split('/').pop()
  
  const id = idStr || (idFromPath === 'new' ? 'new' : idFromPath) || "undefined"
  const isNew = id === "new"
  
  const { toast } = useToast()

  // Safety Redirect
  useEffect(() => {
    if (id === "undefined" || id === "null") {
        console.error("Geçersiz ID tespit edildi, listeye yönlendiriliyor.")
        router.push("/manage-courses")
    }
  }, [id, router])

  const [loading, setLoading] = useState(false)
  const [course, setCourse] = useState({
    title: "",
    description: "",
    category: "Programlama",
    city: "",
    instructor_name: "",
    duration_minutes: 0,
    has_certificate: false,
    is_published: false,
    thumbnail_url: ""
  })

  const [lessons, setLessons] = useState<any[]>([])
  const [editingLesson, setEditingLesson] = useState<any>(null)
  const [showLessonForm, setShowLessonForm] = useState(false)

  useEffect(() => {
    if (!isNew && id) {
      loadCourse()
      loadLessons()
    }
  }, [id, isNew])

  async function loadCourse() {
    if (!id || id === "new") return
    const { data, error } = await supabase.from("courses").select("*").eq("id", id).single()
    if (error) {
      console.error("Kurs yükleme hatası:", error)
      return
    }
    if (data) setCourse(data)
  }

  async function loadLessons() {
    if (!id || id === "new") return
    const { data, error } = await supabase.from("lessons").select("*").eq("course_id", id).order("order_index")
    if (error) {
       console.error("Ders yükleme hatası:", error)
       return
    }
    setLessons(data || [])
  }

  async function deleteLesson(lessonId: string) {
    if (!confirm("Bu dersi silmek istediğinize emin misiniz?")) return
    const { error } = await supabase.from("lessons").delete().eq("id", lessonId)
    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Başarılı", description: "Ders silindi." })
      loadLessons()
    }
  }

  async function saveCourse() {
    if (!course.title) {
        toast({ title: "Hata", description: "Lütfen eğitim başlığını girin.", variant: "destructive" })
        return
    }

    setLoading(true)
    const payload = { ...course, city: course.city || null }

    try {
      let res
      if (isNew) {
        res = await supabase.from("courses").insert(payload).select().single()
      } else {
        if (!id || id === "undefined" || id === "null") {
            throw new Error(`Geçerli bir kurs ID'si bulunamadı (Görülen ID: ${id}). Lütfen sayfayı yenileyip tekrar deneyin.`)
        }
        res = await supabase.from("courses").update(payload).eq("id", id).select().single()
      }

      if (res.error) {
        toast({ title: "Hata", description: res.error.message, variant: "destructive" })
      } else {
        toast({ title: "Başarılı", description: "Kurs başarıyla kaydedildi." })
        if (isNew && res.data) {
          router.push(`/manage-courses/${res.data.id}`)
        } else {
          router.refresh()
        }
      }
    } catch (e: any) {
      toast({ title: "Hata", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function saveLesson(lessonData: any) {
    if (!id || id === "new") {
        toast({ title: "Hata", description: "Ders eklemeden önce eğitimi kaydetmelisiniz.", variant: "destructive" })
        return
    }

    const payload = {
      ...lessonData,
      course_id: id,
      order_index: lessonData.order_index ?? lessons.length
    }
    
    const { error } = await supabase.from("lessons").upsert(payload)
    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" })
    } else {
      setShowLessonForm(false)
      toast({ title: "Ders Kaydedildi", description: "Müfredat güncellendi." })
      loadLessons()
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Link href="/manage-courses" className="p-3 rounded-2xl bg-white border border-slate-100 hover:bg-slate-50 transition-colors text-slate-400">
                <ArrowLeft size={20} />
            </Link>
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {isNew ? "Yeni Eğitim Oluştur" : "Eğitimi Düzenle"}
                </h1>
                <p className="text-sm text-slate-500 font-medium">İçerik, video ve müfredat yönetimi</p>
            </div>
        </div>
        <Button onClick={saveCourse} disabled={loading} className="rounded-2xl h-12 px-8 btn-primary font-bold shadow-xl shadow-indigo-100 gap-2">
          {loading ? "Kaydediliyor..." : <><Save size={20} /> Değişiklikleri Kaydet</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="p-8 pb-4 flex flex-row items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-primary flex items-center justify-center">
                        <Layout size={20} />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Genel Bilgiler</CardTitle>
                        <CardDescription>Eğitimin başlığı, açıklaması ve temel detayları.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="grid gap-3">
                        <Label className="font-bold text-slate-500 ml-1">Eğitim Başlığı</Label>
                        <Input value={course.title} onChange={e => setCourse({...course, title: e.target.value})} placeholder="Örn: Sıfırdan İleri Seviye Kotlin" className="h-12 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white" />
                    </div>
                    <div className="grid gap-3">
                        <Label className="font-bold text-slate-500 ml-1">Eğitim Açıklaması</Label>
                        <Textarea rows={4} value={course.description} onChange={e => setCourse({...course, description: e.target.value})} placeholder="Eğitim hakkında detaylı bilgi verin..." className="rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                         <div className="grid gap-3">
                            <Label className="font-bold text-slate-500 ml-1">Kategori</Label>
                            <div className="relative">
                                <Input 
                                    list="category-list"
                                    value={course.category} 
                                    onChange={e => setCourse({...course, category: e.target.value})} 
                                    placeholder="Kategori seçin veya yazın..." 
                                    className="h-12 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white" 
                                />
                                <datalist id="category-list">
                                    {["Yazılım", "Tasarım", "Kişisel Gelişim", "Yabancı Dil", "Sınav Hazırlık"].map(c => (
                                        <option key={c} value={c} />
                                    ))}
                                </datalist>
                            </div>
                        </div>
                        <div className="grid gap-3">
                            <Label className="font-bold text-slate-500 ml-1">Şehir Kısıtlaması</Label>
                            <Input value={course.city || ""} onChange={e => setCourse({...course, city: e.target.value})} placeholder="Tüm Şehirler" className="h-12 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {!isNew && (
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
                    <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                                <ListOrdered size={20} />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Müfredat & Dersler</CardTitle>
                                <CardDescription>Video ve metin içeriklerini buradan ekleyin.</CardDescription>
                            </div>
                        </div>
                        <Button size="sm" onClick={() => { setEditingLesson({ title: "", content_type: "text", content_markdown: "", video_url: "" }); setShowLessonForm(true) }} className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 h-10 gap-2">
                        <Plus size={18} /> Ders Ekle
                        </Button>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-3">
                        {lessons.map((lesson, idx) => (
                            <div key={lesson.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-primary/20 hover:bg-white transition-all">
                                <GripVertical size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
                                <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400 group-hover:text-primary transition-colors">{idx + 1}</div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-700">{lesson.title}</div>
                                    <div className="text-[10px] uppercase font-black text-slate-300 flex items-center gap-1 mt-0.5 tracking-widest">
                                        {lesson.content_type === "video" ? <><VideoIcon size={12} /> Video İçerik</> : <><FileText size={12} /> Okuma Parçası</>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="sm" onClick={() => { setEditingLesson(lesson); setShowLessonForm(true) }} className="text-primary font-bold">Düzenle</Button>
                                    <Button variant="ghost" size="sm" onClick={() => deleteLesson(lesson.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={16} /></Button>
                                </div>
                            </div>
                        ))}
                        {lessons.length === 0 && (
                             <div className="text-center py-10 text-slate-400 font-medium italic">Henüz bir ders eklenmemiş.</div>
                        )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>

        <div className="space-y-8">
            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden h-fit">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-lg">Yayın Ayarları</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                            <div className="space-y-0.5">
                                <Label className="font-bold text-slate-700">Canlı Yayına Al</Label>
                                <p className="text-[10px] text-slate-400">Tüm kullanıcılar görebilir</p>
                            </div>
                            <Switch checked={course.is_published} onCheckedChange={v => setCourse({...course, is_published: v})} />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                            <div className="space-y-0.5">
                                <Label className="font-bold text-slate-700">Sertifika Ver</Label>
                                <p className="text-[10px] text-slate-400">Bitirene başarı belgesi</p>
                            </div>
                            <Switch checked={course.has_certificate} onCheckedChange={v => setCourse({...course, has_certificate: v})} />
                        </div>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-50 space-y-4">
                        <div className="grid gap-3">
                            <Label className="font-bold text-slate-500 ml-1">Eğitmen İsmi</Label>
                            <Input value={course.instructor_name} onChange={e => setCourse({...course, instructor_name: e.target.value})} className="h-11 rounded-xl bg-slate-50/50 border-slate-100" />
                        </div>
                        <div className="grid gap-3">
                            <Label className="font-bold text-slate-500 ml-1">Toplam Süre (Dakika)</Label>
                            <Input type="number" value={course.duration_minutes} onChange={e => setCourse({...course, duration_minutes: parseInt(e.target.value)})} className="h-11 rounded-xl bg-slate-50/50 border-slate-100" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {!isNew && (
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-amber-500 text-white overflow-hidden p-8 h-fit">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                            <BookOpen size={24} />
                        </div>
                        <h3 className="font-bold text-lg leading-tight text-white">Sınav & Sorular</h3>
                    </div>
                    <p className="text-amber-50 text-sm leading-relaxed mb-6 opacity-90">
                        Bu eğitim için hazırlanan sınav sorularını yönetin, yeni sorular ekleyin veya mevcut olanları düzenleyin.
                    </p>
                    <Button asChild className="w-full h-12 rounded-xl bg-white text-amber-600 hover:bg-amber-50 font-bold shadow-lg shadow-amber-900/20 gap-2 border-none">
                        <Link href={`/manage-courses/${id}/quiz`}>
                            <ListOrdered size={18} /> Sınavı Yönet
                        </Link>
                    </Button>
                </Card>
            )}

            <Card className="border-none shadow-sm rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-primary text-white overflow-hidden p-8 h-fit">
                <h3 className="font-bold text-lg mb-2">Profesyonel İpucu</h3>
                <p className="text-indigo-100 text-sm leading-relaxed opacity-90">
                    Eğitimlerinizi daha ilgi çekici hale getirmek için ders açıklamalarında Markdown kullanabilirsiniz. Videolarınızın Vimeo veya YouTube linki olmasına dikkat edin.
                </p>
            </Card>
        </div>
      </div>

      <Sheet open={showLessonForm} onOpenChange={setShowLessonForm}>
        <SheetContent className="sm:max-w-xl overflow-y-auto rounded-l-[3rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="p-10 bg-slate-50 border-b border-slate-100">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Ders Detayları</h2>
                <p className="text-slate-500 text-sm mt-1">İçerik tipini seçin ve materyalleri yükleyin.</p>
            </div>
            
            <div className="flex-1 p-10 space-y-8 overflow-y-auto">
                <div className="grid gap-3">
                    <Label className="font-bold text-slate-600">Ders Başlığı</Label>
                    <Input value={editingLesson?.title} onChange={e => setEditingLesson({...editingLesson, title: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-100" />
                </div>
                
                <div className="grid gap-3">
                    <Label className="font-bold text-slate-600">İçerik Tipi</Label>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => setEditingLesson({...editingLesson, content_type: "text"})}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${editingLesson?.content_type === "text" ? "border-primary bg-indigo-50 text-primary" : "border-slate-100 text-slate-400"}`}
                        >
                            <FileText size={24} /> <span className="text-xs font-bold uppercase tracking-widest">Metin</span>
                        </button>
                        <button 
                            onClick={() => setEditingLesson({...editingLesson, content_type: "video"})}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${editingLesson?.content_type === "video" ? "border-primary bg-indigo-50 text-primary" : "border-slate-100 text-slate-400"}`}
                        >
                            <VideoIcon size={24} /> <span className="text-xs font-bold uppercase tracking-widest">Video</span>
                        </button>
                    </div>
                </div>

                {editingLesson?.content_type === "text" ? (
                    <div className="grid gap-3">
                        <Label className="font-bold text-slate-600">İçerik (Markdown)</Label>
                        <Textarea rows={12} value={editingLesson?.content_markdown} onChange={e => setEditingLesson({...editingLesson, content_markdown: e.target.value})} className="rounded-2xl bg-slate-50 border-slate-100 resize-none" />
                    </div>
                ) : (
                    <div className="grid gap-3">
                        <Label className="font-bold text-slate-600">Video Linki (URL)</Label>
                        <Input value={editingLesson?.video_url} onChange={e => setEditingLesson({...editingLesson, video_url: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-100" placeholder="https://youtube.com/..." />
                    </div>
                )}
            </div>

            <div className="p-10 bg-white border-t border-slate-50">
                <Button onClick={() => saveLesson(editingLesson)} className="w-full h-14 rounded-2xl btn-primary font-bold text-lg shadow-xl shadow-indigo-100">
                    Dersi Kaydet
                </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
