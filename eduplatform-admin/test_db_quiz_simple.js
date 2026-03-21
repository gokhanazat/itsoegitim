
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or ANAL_KEY in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkQuizzes() {
    console.log("--- Supabase Quiz Fetch Test (JS) ---");
    
    const { data: courses } = await supabase.from("courses").select("id, title");
    console.log("Available Courses:");
    courses?.forEach(c => console.log(`- ${c.title} (${c.id})`));

    const { data: quizzes, error: qErr } = await supabase
        .from("quizzes")
        .select("id, course_id, pass_score_percent");
    
    if (qErr) {
        console.error("Error fetching quizzes:", qErr);
    } else {
        console.log("\nQuizzes found in DB:", quizzes.length);
        for (const quiz of quizzes) {
            console.log(`\nQuiz ID: ${quiz.id} (Course ID: ${quiz.course_id})`);
            
            const { data: questions, error: qestErr } = await supabase
                .from("questions")
                .select("id, question_text")
                .eq("quiz_id", quiz.id);
            
            if (qestErr) {
                console.error(`- Error fetching questions for quiz ${quiz.id}:`, qestErr);
            } else {
                console.log(`- Questions found: ${questions?.length || 0}`);
                
                for(const q of (questions || [])) {
                    const { data: options } = await supabase.from("options").select("id, option_text, is_correct").eq("question_id", q.id);
                    console.log(`  - Question: ${q.question_text} (Options: ${options?.length || 0})`);
                }
            }
        }
    }
}

checkQuizzes();
