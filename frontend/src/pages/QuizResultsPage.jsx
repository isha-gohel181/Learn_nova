import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getQuizResults, getCourseById } from '@/lib/api';
import ParallaxTilt from '@/components/ParallaxTilt';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ percent, isPassed, size = 120 }) {
  const r = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  const cx = size / 2;
  const cy = size / 2;
  const color = isPassed ? ['#059669', '#10B981'] : ['#DC2626', '#EF4444'];
  const gradId = `scoreGrad-${percent}`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill='none' stroke='rgba(255,255,255,0.06)' strokeWidth='8' />
      <circle
        cx={cx} cy={cy} r={r} fill='none'
        stroke={`url(#${gradId})`} strokeWidth='8'
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap='round'
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 1s ease' }}
      />
      <defs>
        <linearGradient id={gradId} x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor={color[0]} />
          <stop offset='100%' stopColor={color[1]} />
        </linearGradient>
      </defs>
      <text x={cx} y={cy - 6} textAnchor='middle' fill='#F9FAFB' fontSize='18' fontWeight='800'>
        {percent}%
      </text>
      <text x={cx} y={cy + 12} textAnchor='middle' fill={isPassed ? '#4ADE80' : '#FCA5A5'} fontSize='9' fontWeight='600'>
        {isPassed ? '✓ PASSED' : '✗ FAILED'}
      </text>
    </svg>
  );
}

// ─── Attempt Card ─────────────────────────────────────────────────────────────

function AttemptCard({ attempt, passingScore, isLatest, isBest }) {
  const isPassed = attempt.percentage >= (passingScore || 60);

  return (
    <ParallaxTilt max={8} hoverScale={1.01}>
      <div className={`rounded-xl border p-5 transition-all ${
        isLatest
          ? 'border-[rgba(59,130,246,0.4)] bg-[rgba(59,130,246,0.08)] shadow-[0_0_20px_rgba(59,130,246,0.15)]'
          : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]'
      }`}>
      <div className='flex items-center justify-between gap-4 mb-3'>
        <div className='flex items-center gap-3'>
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
            isPassed
              ? 'bg-[rgba(34,197,94,0.2)] text-[#4ADE80] border border-[rgba(34,197,94,0.4)]'
              : 'bg-[rgba(239,68,68,0.15)] text-[#FCA5A5] border border-[rgba(239,68,68,0.3)]'
          }`}>
            {attempt.attemptNumber}
          </div>
          <div>
            <p className='text-sm font-semibold text-[#E5E7EB]'>{ordinal(attempt.attemptNumber)} Attempt</p>
            {attempt.timestamp && (
              <p className='text-xs text-[#6B7280] mt-0.5'>{formatDate(attempt.timestamp)}</p>
            )}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {isLatest && (
            <span className='rounded-full border border-[rgba(59,130,246,0.4)] bg-[rgba(59,130,246,0.1)] px-2 py-0.5 text-xs text-[#93C5FD]'>
              Latest
            </span>
          )}
          {isBest && (
            <span className='rounded-full border border-[rgba(251,191,36,0.4)] bg-[rgba(251,191,36,0.08)] px-2 py-0.5 text-xs text-[#FBBF24]'>
              🏆 Best
            </span>
          )}
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
            isPassed
              ? 'border-[rgba(34,197,94,0.4)] bg-[rgba(34,197,94,0.1)] text-[#4ADE80]'
              : 'border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] text-[#FCA5A5]'
          }`}>
            {isPassed ? 'Passed' : 'Failed'}
          </span>
        </div>
      </div>

      <div className='grid grid-cols-3 gap-3'>
        <div className='rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-3 text-center'>
          <p className='text-lg font-bold text-[#F9FAFB]'>{attempt.percentage ?? 0}%</p>
          <p className='text-xs text-[#6B7280] mt-0.5'>Score</p>
        </div>
        <div className='rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-3 text-center'>
          <p className='text-lg font-bold text-[#F9FAFB]'>{attempt.score ?? 0}</p>
          <p className='text-xs text-[#6B7280] mt-0.5'>Correct</p>
        </div>
        <div className='rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-3 text-center'>
          <p className={`text-lg font-bold ${attempt.pointsEarned > 0 ? 'text-[#FBBF24]' : 'text-[#6B7280]'}`}>
            {attempt.pointsEarned > 0 ? `+${attempt.pointsEarned}` : '—'}
          </p>
          <p className='text-xs text-[#6B7280] mt-0.5'>Points</p>
        </div>
      </div>

      {/* Score bar */}
      <div className='mt-3'>
        <div className='h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden'>
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isPassed
                ? 'bg-[linear-gradient(90deg,#059669,#10B981)]'
                : 'bg-[linear-gradient(90deg,#DC2626,#EF4444)]'
            }`}
            style={{ width: `${attempt.percentage ?? 0}%` }}
          />
        </div>
        {passingScore && (
          <div className='flex justify-between text-xs text-[#4B5563] mt-1'>
            <span>0%</span>
            <span className='text-[#6B7280]'>Pass: {passingScore}%</span>
            <span>100%</span>
          </div>
        )}
      </div>
      </div>
    </ParallaxTilt>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function QuizResultsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [results, setResults] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        const [resultsRes, courseRes] = await Promise.all([
          getQuizResults(courseId),
          getCourseById(courseId),
        ]);
        setResults(resultsRes.data);
        setCourse(courseRes.data);
      } catch (err) {
        setError(err.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId, isLoggedIn, navigate]);

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
          <div className='h-12 w-12 rounded-full border-4 border-[rgba(251,191,36,0.3)] border-t-[#FBBF24] animate-spin' />
          <p className='text-[#9CA3AF] text-sm'>Loading results…</p>
        </div>
      </main>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <main className='min-h-screen bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] flex items-center justify-center p-6'>
        <div className='rounded-2xl border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] p-8 text-center max-w-md w-full'>
          <p className='text-4xl mb-4'>📊</p>
          <p className='text-[#FCA5A5] font-semibold text-lg mb-2'>No Results Found</p>
          <p className='text-[#9CA3AF] text-sm mb-6'>{error}</p>
          <div className='flex gap-3 justify-center'>
            <Link to={`/quiz/${courseId}`} className='inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] px-5 py-2.5 text-sm text-white font-medium hover:opacity-90 transition-opacity'>
              📝 Take Quiz
            </Link>
            <Link to='/dashboard' className='inline-flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-5 py-2.5 text-sm text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.08)] transition-colors'>
              Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const lastAttempt = results?.lastAttempt;
  const highestScore = results?.highestScore ?? 0;
  const totalAttempts = results?.totalAttempts ?? 0;
  const attempts = results?.attempts ?? [];
  const passingScore = 60; // default — ideally from quiz data
  const lastPassed = lastAttempt ? lastAttempt.percentage >= passingScore : false;
  const bestIdx = attempts.reduce((best, a, i) => (a.percentage > (attempts[best]?.percentage ?? -1) ? i : best), 0);

  return (
    <div className='min-h-screen bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)]'>
      {/* Ambient glows */}
      <div className='pointer-events-none fixed inset-0 ambient-blobs' />

      {/* ── Navbar ── */}
      <nav className='relative z-20 flex items-center justify-between border-b border-[rgba(255,255,255,0.07)] bg-[rgba(11,15,26,0.85)] backdrop-blur-xl px-4 sm:px-6 py-3'>
        <div className='flex items-center gap-3'>
          <Link to='/courses' className='flex items-center gap-3 rounded-full border border-[rgba(59,130,246,0.35)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-[#E5E7EB] shadow-[0_0_14px_rgba(59,130,246,0.25)]'>
            <img
              src='/Logo.jpeg'
              alt='LearnNova logo'
              className='h-10 w-10 rounded-xl bg-white/70 p-1 object-contain shadow-[0_0_18px_rgba(34,211,238,0.55)] ring-[0.5px] ring-[rgba(59,130,246,0.3)] brightness-110 contrast-110'
            />
            <div className='hidden sm:block'>
              <p className='font-heading text-[11px] uppercase tracking-[0.28em] text-[#93C5FD]'>LearnNova</p>
              <p className='text-[10px] text-[#9CA3AF]'>Neon Frost OS</p>
            </div>
          </Link>
          <span className='text-[rgba(255,255,255,0.2)] hidden sm:block'>›</span>
          <span className='text-sm font-semibold text-[#FBBF24] hidden sm:block'>📊 Quiz Results</span>
        </div>
        <div className='flex items-center gap-2'>
          <Link to='/dashboard' className='flex h-8 items-center px-3 rounded-lg border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] text-xs text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.08)] transition-colors'>
            Dashboard
          </Link>
          <button onClick={handleLogout} className='flex h-8 items-center px-3 rounded-lg border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.05)] text-xs text-[#FCA5A5] hover:bg-[rgba(239,68,68,0.1)] transition-colors'>
            Logout
          </button>
        </div>
      </nav>

      <div className='relative max-w-3xl mx-auto px-4 py-8 sm:px-6 space-y-6'>

        {/* ── Hero Result Banner ── */}
        <div className={`glass-panel rounded-2xl border p-6 sm:p-8 text-center ${
          lastPassed
            ? 'border-[rgba(34,197,94,0.4)] bg-[linear-gradient(135deg,rgba(5,150,105,0.12),rgba(16,185,129,0.06))] shadow-[0_0_40px_rgba(16,185,129,0.2)]'
            : 'border-[rgba(239,68,68,0.3)] bg-[linear-gradient(135deg,rgba(220,38,38,0.1),rgba(239,68,68,0.05))] shadow-[0_0_40px_rgba(239,68,68,0.15)]'
        }`}>
          <div className='flex flex-col items-center gap-4'>
            <ScoreRing percent={lastAttempt?.percentage ?? 0} isPassed={lastPassed} size={130} />
            <div>
              <h1 className='font-heading text-2xl sm:text-3xl font-semibold text-[#F9FAFB] mb-1'>
                {lastPassed ? '🎉 Congratulations!' : '😞 Keep Trying!'}
              </h1>
              <p className='text-[#9CA3AF] text-sm'>
                {lastPassed
                  ? 'You passed the quiz! Great job on your performance.'
                  : `You need ${passingScore}% to pass. Review the material and try again!`}
              </p>
            </div>
          </div>
        </div>

        {/* ── Summary Stats ── */}
        <div className='grid grid-cols-3 gap-3'>
          {[
            { label: 'Highest Score', value: `${highestScore}%`, icon: '🏆', color: 'text-[#FBBF24]' },
            { label: 'Total Attempts', value: totalAttempts, icon: '🔄', color: 'text-[#93C5FD]' },
            { label: 'Last Score', value: `${lastAttempt?.percentage ?? 0}%`, icon: '📈', color: lastPassed ? 'text-[#4ADE80]' : 'text-[#FCA5A5]' },
          ].map((stat) => (
            <div key={stat.label} className='glass-card rounded-xl p-4 text-center'>
              <span className='text-2xl block mb-1'>{stat.icon}</span>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className='text-xs text-[#6B7280] mt-0.5'>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Points earned (last attempt) ── */}
        {lastAttempt?.pointsEarned > 0 && (
          <div className='flex items-center justify-center gap-3 rounded-2xl border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.06)] px-6 py-4'>
            <span className='text-3xl'>⚡</span>
            <div>
              <p className='text-[#FBBF24] font-semibold'>You earned {lastAttempt.pointsEarned} points!</p>
              <p className='text-xs text-[#9CA3AF] mt-0.5'>Points are added to your profile badge ranking</p>
            </div>
          </div>
        )}

        {/* ── Attempt History ── */}
        <div className='glass-card rounded-2xl p-5'>
          <h2 className='font-heading text-lg font-semibold text-[#E5E7EB] mb-4'>Attempt History</h2>
          {attempts.length === 0 ? (
            <p className='text-[#6B7280] text-sm'>No attempts found.</p>
          ) : (
            <div className='space-y-3'>
              {[...attempts].reverse().map((attempt, i) => {
                const originalIndex = attempts.length - 1 - i;
                return (
                  <AttemptCard
                    key={originalIndex}
                    attempt={attempt}
                    passingScore={passingScore}
                    isLatest={originalIndex === attempts.length - 1}
                    isBest={originalIndex === bestIdx}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* ── Action Buttons ── */}
        <div className='flex flex-col sm:flex-row gap-3 pt-2'>
          <Link
            to={`/quiz/${courseId}`}
            className='flex-1 flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(90deg,#3B82F6_0%,#8B5CF6_100%)] py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(59,130,246,0.35)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all'
          >
            🔄 Retake Quiz
          </Link>
          <Link
            to={`/learn/${courseId}`}
            className='flex-1 flex items-center justify-center gap-2 rounded-xl border border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.08)] py-3 text-sm font-medium text-[#93C5FD] hover:bg-[rgba(59,130,246,0.15)] transition-all'
          >
            📚 Review Lessons
          </Link>
          <Link
            to='/dashboard'
            className='flex-1 flex items-center justify-center gap-2 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] py-3 text-sm font-medium text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.08)] transition-all'
          >
            🏠 Dashboard
          </Link>
        </div>

        {/* course info */}
        {course && (
          <div className='flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] px-4 py-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,rgba(59,130,246,0.2),rgba(139,92,246,0.2))] border border-[rgba(255,255,255,0.07)]'>
              📚
            </div>
            <div className='min-w-0'>
              <p className='text-sm font-medium text-[#E5E7EB] truncate'>{course.title}</p>
              <p className='text-xs text-[#6B7280]'>Course Quiz Results</p>
            </div>
            <Link
              to={`/courses/${courseId}`}
              className='shrink-0 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-3 py-1.5 text-xs text-[#9CA3AF] hover:bg-[rgba(255,255,255,0.08)] transition-colors'
            >
              View Course
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
