import { createServerSupabase } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
    BookOpen, 
    Clock, 
    Trophy, 
    User, 
    Play, 
    CheckCircle, 
    ArrowLeft,
    Monitor,
    FileText,
    ChevronRight,
    Star
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import EnrollButton from "@/components/course/EnrollButton"

export const dynamic = "force-dynamic"

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", params.id)
    .single()

  if (!course) notFound()

  // Check enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("course_id", params.id)
    .eq("profile_id", session?.user.id)
    .single()

  // Fetch lessons
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, content_type, order_index")
    .eq("course_id", params.id)
    .order("order_index")

  return (
    <div className="space-y-8 pb-20">
      <Link href="/home" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary font-bold transition-all group">
         <div className="p-2 rounded-xl bg-white border border-slate-100 group-hover:border-primary/20 transition-all">
            <ArrowLeft size={18} />
         </div>
         Geri Dön
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Content */}
        <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Badge className="bg-indigo-50 text-indigo-600 border-none font-bold py-1 px-3 rounded-xl shadow-sm">
                        {course.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                        <Star size={14} fill="currentColor" /> 4.9 (250+ Değerlendirme)
                    </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                    {course.title}
                </h1>
                <div className="bg-slate-50/50 border border-slate-100 p-8 rounded-[2.5rem] space-y-4 shadow-sm hover:shadow-indigo-50/50 transition-all">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Star size={18} className="text-primary" /> Eğitim Hakkında
                    </h3>
                    <p className="text-slate-600 text-lg leading-relaxed font-medium">
                        {course.description || "Bu eğitim için henüz bir açıklama eklenmemiş."}
                    </p>
                </div>
            </div>

            {/* Video Placeholder or Intro */}
            <div className="aspect-video bg-slate-900 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
                 {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" alt="Cover" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Monitor size={80} className="text-slate-700" />
                    </div>
                 )}
                 <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 text-white cursor-pointer group-hover:scale-110 transition-transform shadow-2xl">
                        <Play size={32} fill="currentColor" className="ml-1" />
                     </div>
                 </div>
                 <div className="absolute bottom-6 left-6 text-white">
                    <div className="text-xs font-bold uppercase tracking-widest bg-emerald-500/80 backdrop-blur-md px-3 py-1 rounded-lg inline-block mb-2">Tanıtım İzle</div>
                    <div className="text-lg font-bold">Eğitim İçeriğine Kısa Bir Bakış</div>
                 </div>
            </div>

            {/* Curriculum */}
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <BookOpen size={24} className="text-primary" /> Eğitim Müfredatı
                </h3>
                <div className="space-y-3">
                    {lessons?.map((lesson, idx) => (
                        <Link 
                            key={lesson.id} 
                            href={enrollment ? `/courses/${course.id}/watch?lesson=${lesson.id}` : "#"}
                            className={`flex items-center gap-4 p-5 bg-white rounded-3xl border border-slate-100/50 hover:border-primary/20 hover:shadow-lg hover:shadow-indigo-50 transition-all ${!enrollment && "cursor-not-allowed opacity-80"} group`}
                        >
                             <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                {lesson.content_type === 'video' ? <Play size={20} /> : <FileText size={20} />}
                             </div>
                             <div className="flex-1 min-w-0">
                                <div className="text-slate-900 font-bold group-hover:text-primary transition-colors">{lesson.title}</div>
                                <div className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-tighter">Bölüm {idx + 1} • {lesson.content_type === 'video' ? "Video" : "Okuma"}</div>
                             </div>
                             {!enrollment && (
                                <div className="p-1 px-3 rounded-full bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100">Kilitli</div>
                             )}
                        </Link>
                    ))}
                    {(!lessons || lessons.length === 0) && (
                        <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-400 font-medium">
                            Henüz müfredat içeriği eklenmemiş.
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right: Sidebar / Buy Box */}
        <div className="space-y-6">
            <Card className="border-none shadow-2xl shadow-indigo-100/50 rounded-[2.5rem] bg-white overflow-hidden sticky top-28">
                <div className="premium-gradient h-2"></div>
                <CardContent className="p-8 space-y-8">
                    <div className="space-y-2">
                        <div className="text-4xl font-black text-emerald-600">Ücretsiz</div>
                        <div className="text-sm text-slate-400 font-semibold line-through">normal fiyat ₺450</div>
                    </div>

                    <div className="space-y-4">
                        <EnrollButton 
                            courseId={course.id} 
                            userId={session?.user.id} 
                            isEnrolled={!!enrollment}
                            isFree={true} 
                        />
                        <p className="text-[10px] text-center text-slate-400 font-medium uppercase tracking-widest">Ömür Boyu Erişim • Sertifika Garantisi</p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">Bu eğitimde neler var?</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                <Clock size={16} className="text-primary" /> {course.duration_minutes} dakika video içerik
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                <Monitor size={16} className="text-primary" /> Ömür boyu tam erişim
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                <User size={16} className="text-primary" /> {course.instructor_name}
                            </div>
                            {course.has_certificate && (
                                <div className="flex items-center gap-3 text-sm text-amber-600 font-bold">
                                    <Trophy size={16} className="text-amber-500" /> Tamamlama Sertifikası
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                         <div className="flex flex-col">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Paylaş</div>
                            <div className="text-slate-900 font-bold">Arkadaşına öner</div>
                         </div>
                         <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary cursor-pointer transition-all">
                            <ChevronRight size={20} />
                         </div>
                    </div>
                </CardContent>
            </Card>

            {/* Instructor Box */}
            <Card className="border-none rounded-[2rem] bg-indigo-50/50 p-6 flex items-center gap-4">
                 <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary font-bold shadow-sm overflow-hidden">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor_name || "I")}&background=E0E7FF&color=4F46E5`} className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Eğitmen</div>
                    <div className="text-slate-900 font-bold truncate">{course.instructor_name}</div>
                    <div className="text-[10px] text-slate-500 font-medium line-clamp-1">Kıdemli Yazılım Geliştirici & Eğitmen</div>
                 </div>
            </Card>
        </div>
      </div>
    </div>
  )
}
