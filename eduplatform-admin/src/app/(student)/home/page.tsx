import { createServerSupabase } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, BookOpen, Clock, Trophy, Star, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import CategoryFilter from "@/components/home/CategoryFilter"
import SearchInput from "@/components/home/SearchInput"

export const dynamic = "force-dynamic"

export default async function StudentHomePage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string };
}) {
  const supabase = await createServerSupabase()
  
  const query = searchParams.search || ""
  const category = searchParams.category || "Hepsi"

  let supabaseQuery = supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)

  if (query) {
    supabaseQuery = supabaseQuery.ilike("title", `%${query}%`)
  }

  if (category !== "Hepsi") {
    supabaseQuery = supabaseQuery.eq("category", category)
  }

  const { data: courses } = await supabaseQuery.order("created_at", { ascending: false })

  const categories = ["Hepsi", "Programlama", "Tasarım", "İş Geliştirme", "Liderlik", "Diğer"]

  return (
    <div className="space-y-10 pb-20">
      {/* Hero Section / Banner Image */}
      <div className="relative h-[300px] w-full overflow-hidden rounded-[2.5rem] shadow-2xl shadow-indigo-100 group">
        <img 
            src="/ogrenci-banner.jpeg" 
            alt="Student Banner" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <Suspense fallback={<div className="h-12 w-full lg:w-96 bg-slate-50 animate-pulse rounded-2xl" />}>
                <CategoryFilter categories={categories} currentCategory={category} />
            </Suspense>
            <div className="flex items-center gap-3 w-full lg:w-auto">
                <Suspense fallback={<div className="h-12 w-80 bg-slate-50 animate-pulse rounded-2xl" />}>
                    <SearchInput defaultValue={query} />
                </Suspense>
            </div>
      </div>

      {/* Course Grid */}
      <div>
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-extrabold text-slate-900">
                {query ? `"${query}" Sonuçları` : category !== "Hepsi" ? `${category} Eğitimleri` : "Popüler Eğitimler"}
            </h3>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{courses?.length || 0} Sonuç</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {courses?.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`} className="group cursor-pointer">
                    <Card className="border-none bg-white rounded-[2rem] overflow-hidden card-hover h-full flex flex-col shadow-sm">
                        <div className="relative aspect-video overflow-hidden">
                            {course.thumbnail_url ? (
                                <img 
                                    src={course.thumbnail_url} 
                                    alt={course.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                    <BookOpen size={48} className="text-slate-200" />
                                </div>
                            )}
                            <div className="absolute top-4 left-4">
                                <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none font-bold py-1 px-3 rounded-xl shadow-sm capitalize">
                                    {course.category}
                                </Badge>
                            </div>
                        </div>
                        <CardContent className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs mb-3">
                                <Star size={12} fill="currentColor" /> 4.8 (120+ Öğrenci)
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-4">
                                {course.title}
                            </h4>
                            
                            <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                                        <Clock size={14} /> {course.duration_minutes || 0} dk
                                    </div>
                                    {course.has_certificate && (
                                        <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold">
                                            <Trophy size={14} /> Sertifikalı
                                        </div>
                                    )}
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1">
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
        
        {!courses?.length && (
            <div className="bg-white rounded-[2.5rem] py-24 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <BookOpen size={40} className="text-slate-200" />
                </div>
                <div className="max-w-xs mx-auto">
                    <h3 className="text-xl font-bold text-slate-900">Sonuç Bulunamadı</h3>
                    <p className="text-slate-500 text-sm mt-2">Aramanıza veya seçtiğiniz kategoriye uygun içerik bulunamadı.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  )
}
