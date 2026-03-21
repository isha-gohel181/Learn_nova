import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getQuizByCourse, submitQuiz } from '@/lib/api';

// ─── Timer ────────────────────────────────────────────────────────────────────

function Timer({ seconds }) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const isLow = seconds < 60;
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-4 py-2 font-mono text-sm font-bold transition-colors ${
      isLow
        ? 'border-[rgba(239,68,68,0.5)] bg-[rgba(239,68,68,0.1)] text-[#FCA5A5] animate-pulse'
        : 'border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.08)] text-[#93C5FD]'
    }`}>
      ⏱ {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({ question, questionIndex, totalQuestions, answers, onAnswer }) {
  const isMultiple = question.correctAnswers?.length > 1 || false;
  const selected = answers[questionIndex] || [];

  function toggle(optIdx) {
    if (isMultiple) {
      const next = selected.includes(optIdx)
        ? selected.filter((i) => i !== optIdx)
        : [...selected, optIdx];
      onAnswer(questionIndex, next);
    } else {
      onAnswer(questionIndex, [optIdx]);
    }
  }

  return (
    <div className='rounded-2xl border border-[rgba(59,130,246,0.2)] bg-[rgba(255,255,255,0.04)] backdrop-blur-xl p-6 sm:p-8'>
      {/* question header */}
      <div className='flex items-start justify-between gap-4 mb-6'>
        <div className='flex items-start gap-3'>
          <span className='flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3B82F6,#8B5CF6)] text-xs font-bold text-white shrink-0 mt-0.5'>
            {questionIndex + 1}
          </span>
          <div>
            <p className='text-sm text-[#6B7280] mb-1'>
              Question {questionIndex + 1} of {totalQuestions}
              {isMultiple && <span className='ml-2 text-[#A78BFA]'>• Multiple correct answers</span>}
            </p>
            <h2 className='text-base sm:text-lg font-semibold text-[#F9FAFB] leading-snug'>
              {question.questionText}
            </h2>
          </div>
        </div>
        {question.points && (
          <span className='shrink-0 rounded-full border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.1)] px-2.5 py-0.5 text-xs text-[#FBBF24] font-medium'>
            {question.points} pt{question.points > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* options */}
      <div className='space-y-2.5'>
        {question.options.map((opt, optIdx) => {
          const checked = selected.includes(optIdx);
          return (
            <button
              key={optIdx}
              onClick={() => toggle(optIdx)}
              className={`w-full text-left flex items-center gap-3 rounded-xl border px-4 py-3.5 text-sm transition-all duration-200 group ${
                checked
                  ? 'border-[rgba(59,130,246,0.7)] bg-[rgba(59,130,246,0.15)] shadow-[0_0_16px_rgba(59,130,246,0.2)]'
                  : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] hover:border-[rgba(59,130,246,0.4)] hover:bg-[rgba(59,130,246,0.08)]'
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-${isMultiple ? 'md' : 'full'} border-2 transition-all ${
                  checked
                    ? 'border-[#3B82F6] bg-[#3B82F6]'
                    : 'border-[rgba(255,255,255,0.2)] group-hover:border-[rgba(59,130,246,0.6)]'
                }`}
              >
                {checked && (
                  <svg className='h-3 w-3 text-white' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                  </svg>
                )}
              </span>
              <span className={checked ? 'text-[#E5E7EB]' : 'text-[#9CA3AF] group-hover:text-[#E5E7EB]'}>
                {opt}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function QuizProgressBar({ current, total, answered }) {
  const pct = Math.round((answered / total) * 100);
  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between text-xs text-[#6B7280]'>
        <span>Progress</span>
        <span>{answered} / {total} answered</span>
      </div>
      <div className='h-2 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden'>
        <div
          className='h-full rounded-full bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] transition-all duration-500'
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function QuizTakingPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const isLoggedIn = Boolean(localStorage.getItem('authToken'));

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await getQuizByCourse(courseId);
        const quizData = res.data;
        setQuiz(quizData);
        // Set timer: 2 min per question
        setTimeLeft((quizData.questions?.length || 0) * 120);
      } catch (err) {
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId, isLoggedIn, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleAnswer = useCallback((qIdx, selected) => {
    setAnswers((prev) => ({ ...prev, [qIdx]: selected }));
  }, []);

  async function handleSubmit() {
    if (submitting) return;
    setShowConfirm(false);
    setSubmitting(true);
    setSubmitError('');

    // Build final answers array — index = question idx, value = array of selected option indices
    const answersArray = quiz.questions.map((_, i) => answers[i] || []);

    try {
      await submitQuiz({ courseId, answers: answersArray });
      navigate(`/quiz/results/${courseId}`);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit quiz');
      setSubmitting(false);
    }
  }

  const answeredCount = Object.keys(answers).filter((k) => answers[k] && answers[k].length > 0).length;
  const totalQ = quiz?.questions?.length || 0;
  const allAnswered = answeredCount === totalQ;

  function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    navigate('/login', { replace: true });
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className='min-h-screen bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] flex items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <div className='h-12 w-12 rounded-full border-4 border-[rgba(139,92,246,0.3)] border-t-[#8B5CF6] animate-spin' />
          <p className='text-[#9CA3AF] text-sm'>Loading quiz…</p>
        </div>
      </main>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <main className='min-h-screen bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] flex items-center justify-center p-6'>
        <div className='rounded-2xl border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] p-8 text-center max-w-md w-full'>
          <p className='text-4xl mb-4'>😔</p>
          <p className='text-[#FCA5A5] font-semibold text-lg mb-2'>Quiz Not Available</p>
          <p className='text-[#9CA3AF] text-sm mb-6'>{error}</p>
          <div className='flex gap-3 justify-center'>
            <Link to={`/learn/${courseId}`} className='inline-flex items-center gap-2 rounded-xl border border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.08)] px-5 py-2.5 text-sm text-[#93C5FD] hover:bg-[rgba(59,130,246,0.15)] transition-colors'>
              ← Back to Lessons
            </Link>
            <Link to='/dashboard' className='inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] px-5 py-2.5 text-sm text-white font-medium hover:opacity-90 transition-opacity'>
              Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className='min-h-screen bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)]'>
      {/* Ambient glows */}
      <div className='pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.1),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_40%)]' />

      {/* ── Navbar ── */}
      <nav className='relative z-20 flex items-center justify-between border-b border-[rgba(255,255,255,0.07)] bg-[rgba(11,15,26,0.85)] backdrop-blur-xl px-4 sm:px-6 py-3'>
        <div className='flex items-center gap-3'>
          <Link to='/courses' className='flex items-center gap-2'>
            <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#3B82F6,#8B5CF6)]'>
              <svg className='h-3.5 w-3.5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
              </svg>
            </div>
            <span className='text-sm font-bold text-[#E5E7EB] hidden sm:block'>LearnNova</span>
          </Link>
          <span className='text-[rgba(255,255,255,0.2)] hidden sm:block'>›</span>
          <span className='text-sm font-semibold text-[#A78BFA] hidden sm:block'>📝 Quiz</span>
        </div>
        <div className='flex items-center gap-3'>
          {timeLeft !== null && <Timer seconds={timeLeft} />}
          <button
            onClick={handleLogout}
            className='flex items-center h-8 px-3 rounded-lg border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.05)] text-xs text-[#FCA5A5] hover:bg-[rgba(239,68,68,0.1)] transition-colors'
          >
            Logout
          </button>
        </div>
      </nav>

      <div className='relative max-w-3xl mx-auto px-4 py-8 sm:px-6 space-y-6'>
        {/* ── Quiz Header ── */}
        <div className='rounded-2xl border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.06)] backdrop-blur-xl p-6'>
          <div className='flex items-start justify-between gap-4 mb-4'>
            <div>
              <div className='flex items-center gap-2 mb-2'>
                <span className='rounded-full border border-[rgba(139,92,246,0.4)] bg-[rgba(139,92,246,0.1)] px-2.5 py-0.5 text-xs font-medium text-[#A78BFA]'>
                  Quiz
                </span>
                {quiz.passingScore && (
                  <span className='rounded-full border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.08)] px-2.5 py-0.5 text-xs text-[#FBBF24]'>
                    Pass: {quiz.passingScore}%
                  </span>
                )}
              </div>
              <h1 className='text-xl sm:text-2xl font-bold text-[#F9FAFB]'>Course Quiz</h1>
              <p className='text-sm text-[#9CA3AF] mt-1'>
                {totalQ} question{totalQ !== 1 ? 's' : ''} · All the best! 🎯
              </p>
            </div>
            <Link
              to={`/learn/${courseId}`}
              className='shrink-0 flex items-center gap-1 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-xs text-[#9CA3AF] hover:bg-[rgba(255,255,255,0.08)] hover:text-white transition-all'
            >
              ← Lessons
            </Link>
          </div>
          <QuizProgressBar current={currentQ} total={totalQ} answered={answeredCount} />
        </div>

        {/* ── Question Navigation pills ── */}
        <div className='flex flex-wrap gap-2'>
          {quiz.questions.map((_, i) => {
            const isAnswered = answers[i] && answers[i].length > 0;
            const isCurrent = i === currentQ;
            return (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={`h-8 w-8 rounded-lg text-xs font-semibold border transition-all ${
                  isCurrent
                    ? 'bg-[linear-gradient(135deg,#3B82F6,#8B5CF6)] text-white border-transparent shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                    : isAnswered
                    ? 'border-[rgba(34,197,94,0.4)] bg-[rgba(34,197,94,0.1)] text-[#4ADE80]'
                    : 'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] text-[#6B7280] hover:bg-[rgba(255,255,255,0.08)] hover:text-white'
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* ── Active Question ── */}
        {quiz.questions[currentQ] && (
          <QuestionCard
            key={currentQ}
            question={quiz.questions[currentQ]}
            questionIndex={currentQ}
            totalQuestions={totalQ}
            answers={answers}
            onAnswer={handleAnswer}
          />
        )}

        {/* ── Nav buttons ── */}
        <div className='flex items-center justify-between gap-3'>
          <button
            onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
            disabled={currentQ === 0}
            className='flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-5 py-2.5 text-sm font-medium text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.08)] disabled:opacity-40 disabled:cursor-not-allowed transition-all'
          >
            ← Previous
          </button>

          <div className='flex items-center gap-2'>
            {currentQ < totalQ - 1 ? (
              <button
                onClick={() => setCurrentQ((q) => Math.min(totalQ - 1, q + 1))}
                className='flex items-center gap-2 rounded-xl bg-[linear-gradient(90deg,#3B82F6_0%,#8B5CF6_100%)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_18px_rgba(59,130,246,0.35)] hover:shadow-[0_0_26px_rgba(139,92,246,0.5)] transition-all'
              >
                Next →
              </button>
            ) : (
              <button
                id='submit-quiz-btn'
                onClick={() => setShowConfirm(true)}
                disabled={submitting}
                className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all ${
                  allAnswered
                    ? 'bg-[linear-gradient(90deg,#059669,#10B981)] text-white shadow-[0_0_18px_rgba(16,185,129,0.4)] hover:shadow-[0_0_26px_rgba(16,185,129,0.6)]'
                    : 'bg-[linear-gradient(90deg,#3B82F6_0%,#8B5CF6_100%)] text-white shadow-[0_0_18px_rgba(59,130,246,0.35)] hover:shadow-[0_0_26px_rgba(139,92,246,0.5)]'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {submitting ? (
                  <>
                    <div className='h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin' />
                    Submitting…
                  </>
                ) : (
                  <>🚀 Submit Quiz</>
                )}
              </button>
            )}
          </div>
        </div>

        {submitError && (
          <div className='rounded-xl border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-sm text-[#FCA5A5]'>
            {submitError}
          </div>
        )}

        {/* ── Unanswered count banner ── */}
        {!allAnswered && (
          <div className='flex items-center gap-3 rounded-xl border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.06)] px-4 py-3'>
            <span className='text-lg'>⚠️</span>
            <p className='text-sm text-[#FCD34D]'>
              You have <strong>{totalQ - answeredCount}</strong> unanswered question{totalQ - answeredCount !== 1 ? 's' : ''}.
              You can still submit — unanswered questions will be marked incorrect.
            </p>
          </div>
        )}
      </div>

      {/* ── Confirm Dialog ── */}
      {showConfirm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.7)] backdrop-blur-sm'>
          <div className='w-full max-w-md rounded-2xl border border-[rgba(59,130,246,0.3)] bg-[#0F1629] shadow-[0_0_60px_rgba(59,130,246,0.3)] p-8 text-center'>
            <span className='text-5xl mb-4 block'>🚀</span>
            <h2 className='text-xl font-bold text-[#F9FAFB] mb-2'>Submit Quiz?</h2>
            <p className='text-sm text-[#9CA3AF] mb-6'>
              You've answered <strong className='text-[#E5E7EB]'>{answeredCount}</strong> of <strong className='text-[#E5E7EB]'>{totalQ}</strong> questions.
              {!allAnswered && ' Unanswered questions will count as incorrect.'}
            </p>
            <div className='flex gap-3'>
              <button
                onClick={() => setShowConfirm(false)}
                className='flex-1 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] py-2.5 text-sm text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.08)] transition-colors'
              >
                Review Answers
              </button>
              <button
                onClick={handleSubmit}
                className='flex-1 rounded-xl bg-[linear-gradient(90deg,#059669,#10B981)] py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_rgba(16,185,129,0.4)] hover:opacity-90 transition-opacity'
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
