export interface QuizQuestion {
  id: number;
  question_text: string;
  options: string[]; 
  correct_option_index: number;
  explanation: string;
}

export interface Quiz {
  id: number;
  title: string;
  quiz_questions: QuizQuestion[];
}

export interface Lesson {
  id: number;
  title: string;
  content: string; 
  code_example?: string;
  order_num: number;
  xp_reward: number;
  quizzes?: Quiz[];
}
export interface LessonSummary {
  id: number;
  title: string;
  order_num: number;
  is_completed?: boolean; // Để hiện dấu tick xanh
}

export interface CourseDetail {
  id: number;
  title: string;
  lessons: LessonSummary[];
}