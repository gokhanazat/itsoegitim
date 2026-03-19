"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ThumbnailUploadProps {
  currentUrl?: string
  onUpload: (url: string) => void
}

export function ThumbnailUpload({ currentUrl, onUpload }: ThumbnailUploadProps) {
    const [uploading, setUploading] = useState(false)
    const { toast } = useToast()

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        // 1. Basic Validation
        if (!file.type.startsWith('image/')) {
            toast({ title: "Hata", description: "Lütfen sadece rsim dosyası seçin.", variant: "destructive" })
            return
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast({ title: "Hata", description: "Resim boyutu 2MB'dan küçük olmalıdır.", variant: "destructive" })
            return
        }

        setUploading(true)
        try {
            // 2. Generate path (e.g., thumbnail-123.jpg)
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            // 3. Upload to Supabase Storage (Using existing 'thumbnails' bucket)
            const { error: uploadError } = await supabase.storage
                .from('thumbnails')
                .upload(filePath, file)

            if (uploadError) throw new Error(uploadError.message)

            // 4. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('thumbnails')
                .getPublicUrl(filePath)

            onUpload(publicUrl)
            toast({ title: "Başarılı", description: "Görsel yüklendi." })
        } catch (error: any) {
            console.error("Upload error:", error)
            toast({ title: "Yükleme Hatası", description: "Görsel yüklenemedi. Supabase panelinden 'thumbnails' bucket'ının PUBLIC olduğundan emin olun.", variant: "destructive" })
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className={`relative aspect-video rounded-3xl overflow-hidden border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 ${currentUrl ? 'border-indigo-100 bg-slate-50' : 'border-slate-100 bg-slate-50/50 hover:border-indigo-200'}`}>
                {currentUrl ? (
                    <>
                        <img src={currentUrl} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <Button variant="destructive" size="sm" onClick={() => onUpload('')} className="rounded-xl h-10 px-4 gap-2 font-bold shadow-xl">
                                <X size={18} /> Görseli Kaldır
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-300">
                             {uploading ? <Loader2 size={24} className="animate-spin text-primary" /> : <ImageIcon size={28} />}
                        </div>
                        <div className="text-center px-4">
                            <div className="font-bold text-slate-600">Eğitim Kapak Görseli</div>
                            <p className="text-[10px] text-slate-400 font-medium mt-1">Önerilen ölçü: 1280x720 (16:9)</p>
                        </div>
                        <label className="cursor-pointer">
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                            <div className="flex items-center gap-2 bg-white border border-slate-100 px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm active:scale-95">
                                <Upload size={16} /> Dosya Seç
                            </div>
                        </label>
                    </>
                )}
            </div>
        </div>
    )
}
