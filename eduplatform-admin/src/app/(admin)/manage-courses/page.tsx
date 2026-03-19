import { createServerSupabase } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Edit, BookOpen, Trash2, Plus, Search, Filter, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default async function AdminCoursesPage() {
  const supabase = await createServerSupabase()
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Eğitim Yönetimi</h1>
          <p className="text-slate-500">Sistemdeki tüm eğitimleri buradan yönetebilir, yeni kurslar ekleyebilirsiniz.</p>
        </div>
        <Button asChild className="rounded-2xl h-12 px-6 btn-primary font-bold shadow-xl shadow-indigo-100 gap-2">
          <Link href="/manage-courses/new"><Plus size={20} /> Yeni Eğitim Ekle</Link>
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="p-8 pb-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input placeholder="Eğitim başlığı veya kategori ara..." className="pl-10 h-11 rounded-xl bg-slate-50/50 border-slate-100" />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl border-slate-100 gap-2 font-bold h-11">
                        <Filter size={18} /> Filtrele
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="py-5 px-8 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Eğitim Bilgisi</TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Kategori</TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Eğitmen</TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">İstatistik</TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Durum</TableHead>
                <TableHead className="text-right px-8 font-bold text-slate-400 uppercase tracking-widest text-[10px]">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses?.map((course) => (
                <TableRow key={course.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                  <TableCell className="py-6 px-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary font-bold text-lg overflow-hidden shrink-0">
                            {course.thumbnail_url ? <img src={course.thumbnail_url} className="w-full h-full object-cover" /> : course.title[0]}
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 group-hover:text-primary transition-colors">{course.title}</div>
                            <div className="text-xs text-slate-400 font-medium mt-0.5">{course.city || "Tüm Şehirler"}</div>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-lg border-slate-100 bg-white text-slate-500 font-bold px-3 py-1">
                        {course.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-bold text-slate-700">{course.instructor_name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                        <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
                             {course.duration_minutes} Dakika
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-tighter">
                            {course.has_certificate ? "✓ Sertifikalı" : "Sertifikasız"}
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {course.is_published ? (
                        <div className="flex items-center gap-2 text-emerald-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-sm font-bold">Yayında</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                            <span className="text-sm font-bold">Taslak</span>
                        </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-100 text-slate-400 hover:text-primary" asChild>
                        <Link href={`/manage-courses/${course.id || course.course_id}`}><Edit size={16} /></Link>
                      </Button>
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-100 text-slate-400 hover:text-amber-500" asChild>
                        <Link href={`/manage-courses/${course.id || course.course_id}/quiz`}><BookOpen size={16} /></Link>
                      </Button>
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-100 text-red-300 hover:text-red-500 hover:bg-red-50" onClick={async () => {
                        if (confirm("Bu kursu silmek istediğinizden emin misiniz?")) {
                            const supabase = await createServerSupabase()
                            await supabase.from("courses").delete().eq("id", course.id || course.course_id)
                            window.location.reload()
                        }
                      }}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    <div className="group-hover:hidden">
                        <MoreHorizontal size={20} className="ml-auto text-slate-200" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {(!courses || courses.length === 0) && (
            <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                    <BookOpen size={32} />
                </div>
                <div className="text-slate-500 font-medium">Henüz bir eğitim eklenmemiş.</div>
                <Button asChild variant="outline" className="rounded-xl border-slate-200">
                    <Link href="/manage-courses/new">İlk Eğitimi Ekle</Link>
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
