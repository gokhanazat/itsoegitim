"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, ArrowUp, ArrowDown, ChevronRight } from "lucide-react"

export default function QuizBuilderPage() {
  const params = useParams()
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id
  const { toast } = useToast()

  const [quiz, setQuiz] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadQuiz() }, [courseId])

  async function loadQuiz() {
    setLoading(true)
    const { data: quizData } = await supabase
      .from("quizzes")
      .select("*, questions(*, options(*))")
      .eq("course_id", courseId)
      .single()

    if (quizData) {
      setQuiz(quizData)
      setQuestions(quizData.questions.sort((a: any, b: any) => a.order_index - b.order_index) || [])
    } else {
      // Create quiz shell if doesn't exist
      const { data } = await supabase.from("quizzes").insert({ course_id: courseId }).select().single()
      setQuiz(data)
    }
    setLoading(false)
  }

  async function saveQuizSettings() {
    const { error } = await supabase.from("quizzes").update({
      pass_score_percent: quiz.pass_score_percent,
      time_limit_minutes: quiz.time_limit_minutes
    }).eq("id", quiz.id)

    if (!error) toast({ title: "Başarılı", description: "Sınav ayarları kaydedildi." })
  }

  async function saveQuestion() {
    const isNew = !editingQuestion.id
    const { data: qData, error: qError } = await supabase.from("questions").upsert({
      id: editingQuestion.id,
      quiz_id: quiz.id,
      question_text: editingQuestion.question_text,
      question_type: editingQuestion.question_type,
      order_index: editingQuestion.order_index || questions.length
    }).select().single()

    if (qError) return

    // Replace options
    await supabase.from("options").delete().eq("question_id", qData.id)
    const optionsToInsert = editingQuestion.options.map((o: any) => ({
      question_id: qData.id,
      option_text: o.option_text,
      is_correct: o.is_correct
    }))
    await supabase.from("options").insert(optionsToInsert)

    setShowQuestionForm(false)
    loadQuiz()
  }

  async function deleteQuestion(questionId: string) {
    if (!confirm("Bu soruyu silmek istediğinize emin misiniz?")) return
    const { error } = await supabase.from("questions").delete().eq("id", questionId)
    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Başarılı", description: "Soru silindi." })
      loadQuiz()
    }
  }

  if (loading) return <div>Yükleniyor...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <h1 className="text-2xl font-bold">Sınav Hazırlayıcı</h1>

      <Card>
        <CardHeader><CardTitle>Sınav Ayarları</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Geçme Notu (%{quiz.pass_score_percent})</Label>
            </div>
            <Slider
              value={[quiz.pass_score_percent]}
              onValueChange={([v]) => setQuiz({...quiz, pass_score_percent: v})}
              max={100} step={5}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label>Süre Sınırı</Label>
              <div className="text-sm text-slate-500">Öğrenci için geri sayım başlatır</div>
            </div>
            <div className="flex items-center gap-4">
              {quiz.time_limit_minutes !== null && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number" className="w-20"
                    value={quiz.time_limit_minutes}
                    onChange={e => setQuiz({...quiz, time_limit_minutes: parseInt(e.target.value)})}
                  />
                  <span className="text-sm">dk</span>
                </div>
              )}
              <Switch
                checked={quiz.time_limit_minutes !== null}
                onCheckedChange={checked => setQuiz({...quiz, time_limit_minutes: checked ? 30 : null})}
              />
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={saveQuizSettings}>Ayarları Kaydet</Button>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Sorular ({questions.length})</h2>
        <Button onClick={() => {
          setEditingQuestion({
            question_text: "",
            question_type: "multiple_choice",
            options: [
              { option_text: "", is_correct: true },
              { option_text: "", is_correct: false }
            ]
          });
          setShowQuestionForm(true)
        }}>
          <Plus size={16} className="mr-2" /> Soru Ekle
        </Button>
      </div>

      <div className="space-y-3">
        {questions.map((q, idx) => (
          <Card key={q.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="font-bold text-slate-400 w-6">{idx + 1}.</div>
              <div className="flex-1">
                <div className="font-medium line-clamp-1">{q.question_text}</div>
                <Badge variant="secondary" className="mt-1 text-[10px]">
                  {q.question_type === "multiple_choice" ? "Çoktan Seçmeli" : "Doğru/Yanlış"}
                </Badge>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon"><ArrowUp size={14} /></Button>
                <Button variant="ghost" size="icon"><ArrowDown size={14} /></Button>
                <Button variant="ghost" size="icon" onClick={() => { setEditingQuestion(q); setShowQuestionForm(true) }}>
                  <ChevronRight size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteQuestion(q.id)}><Trash2 size={16} /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showQuestionForm} onOpenChange={setShowQuestionForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Soru Düzenle</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Soru Metni</Label>
              <Textarea
                value={editingQuestion?.question_text}
                onChange={e => setEditingQuestion({...editingQuestion, question_text: e.target.value})}
              />
            </div>

            <div className="grid gap-2">
              <Label>Soru Tipi</Label>
              <Select
                value={editingQuestion?.question_type}
                onValueChange={v => setEditingQuestion({...editingQuestion, question_type: v})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Çoktan Seçmeli</SelectItem>
                  <SelectItem value="true_false">Doğru/Yanlış</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Seçenekler (Doğru cevabı işaretleyin)</Label>
              {editingQuestion?.options.map((opt: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio" name="correct"
                    checked={opt.is_correct}
                    onChange={() => {
                      const newOpts = editingQuestion.options.map((o: any, idx: number) => ({...o, is_correct: idx === i}))
                      setEditingQuestion({...editingQuestion, options: newOpts})
                    }}
                  />
                  <Input
                    value={opt.option_text}
                    placeholder={`Seçenek ${i+1}`}
                    onChange={e => {
                      const newOpts = [...editingQuestion.options]
                      newOpts[i].option_text = e.target.value
                      setEditingQuestion({...editingQuestion, options: newOpts})
                    }}
                  />
                  {editingQuestion.options.length > 2 && (
                    <Button variant="ghost" size="icon" onClick={() => {
                      const newOpts = editingQuestion.options.filter((_: any, idx: number) => idx !== i)
                      setEditingQuestion({...editingQuestion, options: newOpts})
                    }}><Trash2 size={14} /></Button>
                  )}
                </div>
              ))}
              {editingQuestion?.question_type === "multiple_choice" && editingQuestion.options.length < 6 && (
                <Button variant="ghost" size="sm" onClick={() => {
                  setEditingQuestion({...editingQuestion, options: [...editingQuestion.options, { option_text: "", is_correct: false }]})
                }}>+ Seçenek Ekle</Button>
              )}
            </div>

            <Button className="w-full" onClick={saveQuestion}>Soruyu Kaydet</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
