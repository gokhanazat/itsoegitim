import { createServerSupabase } from "@/lib/supabase/server"
import { GraduationCap, BookOpen, Clock, PlayCircle, Trophy, MoreVertical, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { Input } from "@/components/ui/input"

export const dynamic = "force-dynamic"

export default async function MyCoursesPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, courses(*)")
    .eq("profile_id", session?.user.id)
    .order("enrolled_at", { ascending: false })

  // Decorate enrollments with real progress
  const enrollmentsWithProgress = enrollments ? await Promise.all(
    enrollments.map(async (item: any) => {
      const courseId = item.course_id
      
      // Get total lessons
      const { count: totalLessons } = await supabase
        .from("lessons")
        .select("*", { count: "exact", head: true })
        .eq("course_id", courseId)
      
      // Get completed lessons for this course
      const { data: completedLessons } = await supabase
        .from("lesson_completions")
        .select("lesson_id, lessons!inner(course_id)")
        .eq("profile_id", session?.user.id)
        .eq("lessons.course_id", courseId)
      
      const finishedCount = completedLessons?.length || 0
      const totalCount = totalLessons || 0
      const progress = totalCount > 0 ? Math.floor((finishedCount / totalCount) * 100) : 0

      return {
        ...item,
        progress,
        finishedCount,
        totalCount
      }
    })
  ) : []

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                <GraduationCap className="text-primary" size={32} /> Eğitimlerim
            </h1>
            <p className="text-slate-500 mt-1">Kayıt olduğunuz eğitimleri buradan takip edebilir ve devam edebilirsiniz.</p>
        </div>
        
        <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input placeholder="Kurslarımda ara..." className="pl-10 h-12 rounded-2xl bg-white border-slate-100 shadow-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {enrollmentsWithProgress.map((item: any) => {
          const course = item.courses
          const progress = item.progress
          
          return (
            <Card key={item.id} className="border-none bg-white rounded-[2.5rem] overflow-hidden card-hover group shadow-sm flex flex-col h-full">
              <div className="relative aspect-video">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={course.title} />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <BookOpen size={48} className="text-slate-200" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
                    <Link href={`/courses/${course.id}/watch`} className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                        <PlayCircle size={32} fill="currentColor" />
                    </Link>
                </div>
                <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none font-bold py-1 px-3 rounded-xl shadow-sm">
                        {course.category}
                    </Badge>
                </div>
              </div>

              <CardContent className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <Link href={`/courses/${course.id}/watch`}>
                        <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors line-clamp-2 cursor-pointer">
                            {course.title}
                        </h3>
                    </Link>
                    <button className="text-slate-300 hover:text-slate-600 transition-colors">
                        <MoreVertical size={20} />
                    </button>
                </div>

                <div className="mt-auto space-y-4 pt-6">
                    <div className="flex justify-between items-end mb-1">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">İlerleme</div>
                        <div className="text-sm font-black text-primary">%{progress}</div>
                    </div>
                    <Progress value={progress} className="h-2 rounded-full bg-slate-100" />
                    
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                <Clock size={14} /> {item.finishedCount}/{item.totalCount} Bölüm
                            </div>
                        </div>
                        {progress === 100 && (
                             <Trophy size={20} className="text-amber-500 animate-bounce" />
                        )}
                    </div>

                    <Link href={`/courses/${course.id}/watch`} className="block">
                        <button className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-slate-100 text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-2">
                            {progress === 100 ? "Tekrar İzle" : "Eğitime Devam Et"}
                        </button>
                    </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {(!enrollments || enrollments.length === 0) && (
            <div className="md:col-span-2 xl:col-span-3 py-32 bg-white rounded-[3rem] text-center space-y-6">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-400">
                    <BookOpen size={48} />
                </div>
                <div className="max-w-sm mx-auto space-y-2">
                    <h3 className="text-2xl font-bold text-slate-900">Keşfetmeye Hazır Mısın?</h3>
                    <p className="text-slate-500">Henüz bir eğitime kayıt olmamışsınız. Hemen bir kurs seçip öğrenmeye başlayın.</p>
                    <Link href="/home" className="inline-block pt-6">
                        <button className="h-14 px-10 rounded-2xl btn-primary font-bold text-lg shadow-xl shadow-indigo-100">
                            Eğitimleri Keşfet
                        </button>
                    </Link>
                </div>
            </div>
        )}
      </div>
    </div>
  )
}
