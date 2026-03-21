
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkQuizzes() {
    console.log("--- Supabase Quiz Fetch Test ---");
    
    // 1. Fetch all courses to help user find the right ID
    const { data: courses } = await supabase.from("courses").select("id, title");
    console.log("Available Courses:");
    courses?.forEach(c => console.log(`- ${c.title} (${c.id})`));

    // 2. Fetch all quizzes
    const { data: quizzes, error: qErr } = await supabase
        .from("quizzes")
        .select("id, course_id, pass_score_percent");
    
    if (qErr) {
        console.error("Error fetching quizzes:", qErr);
    } else {
        console.log("\nQuizzes found in DB:", quizzes.length);
        for (const quiz of quizzes) {
            console.log(`\nQuiz ID: ${quiz.id} (Course ID: ${quiz.course_id})`);
            
            // 3. Fetch questions for this quiz
            const { data: questions, error: qestErr } = await supabase
                .from("questions")
                .select("id, question_text, options(*)")
                .eq("quiz_id", quiz.id);
            
            if (qestErr) {
                console.error(`- Error fetching questions for quiz ${quiz.id}:`, qestErr);
            } else {
                console.log(`- Questions found: ${questions?.length || 0}`);
                questions?.forEach((q, i) => {
                    console.log(`  ${i+1}. ${q.question_text} (Options: ${q.options?.length || 0})`);
                });
            }
        }
    }
}

checkQuizzes();
