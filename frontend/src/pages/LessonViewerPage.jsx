import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getLessonsByCourse, getLessonById, markLessonComplete, getCourseById } from '@/lib/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[1].length === 11 ? match[1] : null;
}

function isVideoUrl(url) {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) || getYouTubeId(url);
}

function isDocumentUrl(url) {
  if (!url) return false;
  return /\.(pdf|doc|docx|ppt|pptx|xls|xlsx)(\?.*)?$/i.test(url);
}

function isImageUrl(url) {
  if (!url) return false;
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(url);
}

function formatDuration(minutes) {
  if (!minutes) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ─── Sidebar Lesson Item ──────────────────────────────────────────────────────

function LessonItem({ lesson, isActive, isCompleted, onClick }) {
  const typeIcons = { video: '🎬', document: '📄', image: '🖼️', quiz: '📝' };
  return (
    <button
      onClick={() => onClick(lesson)}
      className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 group flex items-start gap-3 ${
        isActive
          ? 'border-[rgba(59,130,246,0.6)] bg-[rgba(59,130,246,0.15)] shadow-[0_0_18px_rgba(59,130,246,0.25)]'
          : 'border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(59,130,246,0.3)]'
      }`}
    >
      <span className='text-lg shrink-0 mt-0.5'>{typeIcons[lesson.type] || '📋'}</span>
      <div className='flex-1 min-w-0'>
        <p className={`text-sm font-medium truncate ${isActive ? 'text-[#93C5FD]' : 'text-[#E5E7EB]'}`}>
          {lesson.title}
        </p>
        <p className='text-xs text-[#6B7280] mt-0.5'>{formatDuration(lesson.duration)}</p>
      </div>
      {isCompleted && (
        <span className='shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(34,197,94,0.2)] border border-[rgba(34,197,94,0.4)]'>
          <svg className='h-3 w-3 text-[#4ADE80]' fill='currentColor' viewBox='0 0 20 20'>
            <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
          </svg>
        </span>
      )}
    </button>
  );
}

// ─── Content Renderer ─────────────────────────────────────────────────────────

function ContentRenderer({ lesson }) {
  const url = lesson?.contentUrl;
  const ytId = getYouTubeId(url);

  if (!url) {
    return (
      <div className='flex items-center justify-center h-64 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]'>
        <p className='text-[#6B7280]'>No content available</p>
      </div>
    );
  }

  if (ytId) {
    return (
      <div className='aspect-video w-full rounded-xl overflow-hidden border border-[rgba(59,130,246,0.2)] shadow-[0_0_40px_rgba(59,130,246,0.15)]'>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
          className='w-full h-full'
          allowFullScreen
          title={lesson.title}
        />
      </div>
    );
  }

  if (isVideoUrl(url)) {
    return (
      <div className='w-full rounded-xl overflow-hidden border border-[rgba(59,130,246,0.2)] shadow-[0_0_40px_rgba(59,130,246,0.15)]'>
        <video controls className='w-full max-h-[520px] bg-black' src={url}>
          Your browser does not support this video format.
        </video>
      </div>
    );
  }

  if (isImageUrl(url)) {
    return (
      <div className='w-full rounded-xl overflow-hidden border border-[rgba(59,130,246,0.2)] flex items-center justify-center bg-[rgba(0,0,0,0.3)]'>
        <img src={url} alt={lesson.title} className='max-w-full max-h-[520px] object-contain' />
      </div>
    );
  }

  if (isDocumentUrl(url) || lesson.type === 'document') {
    return (
      <div className='rounded-xl border border-[rgba(59,130,246,0.2)] bg-[rgba(255,255,255,0.03)] overflow-hidden'>
        <div className='flex items-center gap-3 px-6 py-4 border-b border-[rgba(255,255,255,0.07)]'>
          <span className='text-2xl'>📄</span>
          <div>
            <p className='text-[#E5E7EB] font-medium'>{lesson.title}</p>
            <p className='text-xs text-[#6B7280] mt-0.5'>Document content</p>
          </div>
          <a
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className='ml-auto flex items-center gap-2 rounded-lg bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity'
          >
            Open Document ↗
          </a>
        </div>
        {url.endsWith('.pdf') ? (
          <iframe src={url} className='w-full h-[500px]' title={lesson.title} />
        ) : (
          <div className='p-8 text-center'>
            <p className='text-[#9CA3AF] mb-4'>Preview not available for this file type.</p>
            <a
              href={url}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 rounded-lg bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] px-6 py-3 text-white font-medium hover:opacity-90 transition-opacity'
            >
              Download / View File
            </a>
          </div>
        )}
      </div>
    );
  }

  // Fallback — just show a link
  return (
    <div className='flex flex-col items-center justify-center gap-4 h-64 rounded-xl border border-[rgba(59,130,246,0.2)] bg-[rgba(255,255,255,0.03)]'>
      <span className='text-5xl'>🔗</span>
      <p className='text-[#9CA3AF]'>External content</p>
      <a
        href={url}
        target='_blank'
        rel='noopener noreferrer'
        className='flex items-center gap-2 rounded-lg bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] px-6 py-3 text-white font-medium hover:opacity-90 transition-opacity'
      >
        Open Content ↗
      </a>
    </div>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({ percent }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width='48' height='48' viewBox='0 0 48 48' className='shrink-0'>
      <circle cx='24' cy='24' r={r} fill='none' stroke='rgba(255,255,255,0.08)' strokeWidth='4' />
      <circle
        cx='24' cy='24' r={r} fill='none'
        stroke='url(#ringGrad)' strokeWidth='4'
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap='round'
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <defs>
        <linearGradient id='ringGrad' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#3B82F6' />
          <stop offset='100%' stopColor='#8B5CF6' />
        </linearGradient>
      </defs>
      <text x='24' y='28' textAnchor='middle' fill='#E5E7EB' fontSize='9' fontWeight='700'>
        {percent}%
      </text>
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LessonViewerPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [marking, setMarking] = useState(false);
  const [markMsg, setMarkMsg] = useState('');
  const [markErr, setMarkErr] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isLoggedIn = Boolean(localStorage.getItem('authToken'));
  const userStr = localStorage.getItem('authUser');
  const user = userStr ? JSON.parse(userStr) : null;

  const progress = lessons.length > 0 ? Math.round((completedIds.size / lessons.length) * 100) : 0;

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [courseRes, lessonsRes] = await Promise.all([
          getCourseById(courseId),
          getLessonsByCourse(courseId),
        ]);
        setCourse(courseRes.data);
        const all = lessonsRes.data || [];
        setLessons(all);
        if (all.length > 0) setActiveLesson(all[0]);
      } catch (err) {
        setError(err.message || 'Failed to load lessons');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId, isLoggedIn, navigate]);

  const handleSelectLesson = useCallback((lesson) => {
    setActiveLesson(lesson);
    setMarkMsg('');
    setMarkErr('');
  }, []);

  const handleNext = useCallback(() => {
    const idx = lessons.findIndex((l) => l._id === activeLesson?._id);
    if (idx < lessons.length - 1) setActiveLesson(lessons[idx + 1]);
  }, [lessons, activeLesson]);

  const handlePrev = useCallback(() => {
    const idx = lessons.findIndex((l) => l._id === activeLesson?._id);
    if (idx > 0) setActiveLesson(lessons[idx - 1]);
  }, [lessons, activeLesson]);

  async function handleMarkComplete() {
    if (!activeLesson) return;
    if (completedIds.has(activeLesson._id)) {
      setMarkMsg('Already marked as complete!');
      return;
    }
    setMarking(true);
    setMarkMsg('');
    setMarkErr('');
    try {
      await markLessonComplete({ lessonId: activeLesson._id, courseId });
      setCompletedIds((prev) => new Set([...prev, activeLesson._id]));
      setMarkMsg('✅ Lesson marked as complete!');
    } catch (err) {
      setMarkErr(err.message || 'Failed to mark lesson complete');
    } finally {
      setMarking(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    navigate('/login', { replace: true });
  }

  const activeIdx = lessons.findIndex((l) => l._id === activeLesson?._id);
  const isCompleted = activeLesson ? completedIds.has(activeLesson._id) : false;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className='min-h-screen bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] flex items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <div className='h-12 w-12 rounded-full border-4 border-[rgba(59,130,246,0.3)] border-t-[#3B82F6] animate-spin' />
          <p className='text-[#9CA3AF] text-sm'>Loading lessons…</p>
        </div>
      </main>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <main className='min-h-screen bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] flex items-center justify-center p-6'>
        <div className='rounded-2xl border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] p-8 text-center max-w-md w-full'>
          <p className='text-2xl mb-3'>⚠️</p>
          <p className='text-[#FCA5A5] font-medium mb-2'>Failed to load lessons</p>
          <p className='text-[#9CA3AF] text-sm mb-6'>{error}</p>
          <Link to={`/courses/${courseId}`} className='inline-flex items-center gap-2 rounded-lg bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] px-5 py-2.5 text-white text-sm font-medium'>
            ← Back to Course
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className='min-h-screen bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] flex flex-col'>
      {/* ── Ambient glows ── */}
      <div className='pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_40%)]' />

      {/* ── Top Navbar ── */}
      <nav className='relative z-20 flex items-center justify-between border-b border-[rgba(255,255,255,0.07)] bg-[rgba(11,15,26,0.85)] backdrop-blur-xl px-4 sm:px-6 py-3 shrink-0'>
        <div className='flex items-center gap-3 min-w-0'>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className='flex items-center justify-center h-8 w-8 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[#9CA3AF] hover:bg-[rgba(255,255,255,0.1)] hover:text-white transition-colors shrink-0'
          >
            <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
            </svg>
          </button>
          <Link to='/courses' className='flex items-center gap-2 shrink-0'>
            <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#3B82F6,#8B5CF6)]'>
              <svg className='h-3.5 w-3.5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
              </svg>
            </div>
            <span className='text-sm font-bold text-[#E5E7EB] hidden sm:block'>LearnNova</span>
          </Link>
          <span className='text-[rgba(255,255,255,0.2)] hidden sm:block'>›</span>
          <span className='text-sm text-[#9CA3AF] truncate max-w-[200px] hidden sm:block'>{course?.title}</span>
        </div>

        <div className='flex items-center gap-2'>
          <ProgressRing percent={progress} />
          <Link to={`/quiz/${courseId}`} className='hidden sm:flex items-center gap-1.5 rounded-lg border border-[rgba(139,92,246,0.4)] bg-[rgba(139,92,246,0.1)] px-3 py-1.5 text-xs font-medium text-[#A78BFA] hover:bg-[rgba(139,92,246,0.2)] transition-colors'>
            📝 Take Quiz
          </Link>
          <Link to='/dashboard' className='flex items-center justify-center h-8 px-3 rounded-lg border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] text-xs text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.08)] transition-colors'>
            Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className='flex items-center justify-center h-8 px-3 rounded-lg border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.05)] text-xs text-[#FCA5A5] hover:bg-[rgba(239,68,68,0.1)] transition-colors'
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ── Body (sidebar + content) ── */}
      <div className='relative flex flex-1 overflow-hidden'>

        {/* ── Sidebar ── */}
        <aside
          className={`relative z-10 flex flex-col shrink-0 border-r border-[rgba(255,255,255,0.07)] bg-[rgba(11,15,26,0.7)] backdrop-blur-xl transition-all duration-300 ${
            sidebarOpen ? 'w-72 lg:w-80' : 'w-0 overflow-hidden'
          }`}
        >
          <div className='flex flex-col h-full min-w-[288px] lg:min-w-[320px]'>
            {/* sidebar header */}
            <div className='px-4 py-4 border-b border-[rgba(255,255,255,0.07)]'>
              <p className='text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-0.5'>Course Content</p>
              <p className='text-sm text-[#E5E7EB] font-medium truncate'>{course?.title}</p>
              <div className='flex items-center gap-2 mt-2'>
                <div className='flex-1 h-1.5 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden'>
                  <div
                    className='h-full rounded-full bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] transition-all duration-700'
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className='text-xs text-[#6B7280] shrink-0'>{completedIds.size}/{lessons.length}</span>
              </div>
            </div>

            {/* lesson list */}
            <div className='flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[rgba(255,255,255,0.1)]'>
              {lessons.length === 0 ? (
                <div className='text-center py-8'>
                  <p className='text-[#6B7280] text-sm'>No lessons available yet</p>
                </div>
              ) : (
                lessons.map((lesson) => (
                  <LessonItem
                    key={lesson._id}
                    lesson={lesson}
                    isActive={activeLesson?._id === lesson._id}
                    isCompleted={completedIds.has(lesson._id)}
                    onClick={handleSelectLesson}
                  />
                ))
              )}
            </div>

            {/* quiz CTA */}
            <div className='p-3 border-t border-[rgba(255,255,255,0.07)]'>
              <Link
                to={`/quiz/${courseId}`}
                className='flex items-center justify-center gap-2 w-full rounded-xl border border-[rgba(139,92,246,0.4)] bg-[rgba(139,92,246,0.1)] py-2.5 text-sm font-medium text-[#A78BFA] hover:bg-[rgba(139,92,246,0.2)] transition-colors'
              >
                📝 Take Course Quiz
              </Link>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className='flex-1 overflow-y-auto px-4 py-6 sm:px-8'>
          {!activeLesson ? (
            <div className='flex flex-col items-center justify-center h-full gap-4'>
              <span className='text-6xl'>📚</span>
              <p className='text-[#9CA3AF]'>Select a lesson to begin</p>
            </div>
          ) : (
            <div className='max-w-3xl mx-auto space-y-6'>

              {/* breadcrumb */}
              <div className='flex items-center gap-2 text-xs text-[#6B7280]'>
                <Link to={`/courses/${courseId}`} className='hover:text-[#9CA3AF] transition-colors'>Course</Link>
                <span>›</span>
                <span className='text-[#9CA3AF]'>Lesson {activeIdx + 1} of {lessons.length}</span>
              </div>

              {/* lesson title row */}
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <h1 className='text-xl sm:text-2xl font-bold text-[#F9FAFB] leading-tight'>{activeLesson.title}</h1>
                  <div className='flex items-center gap-3 mt-2 flex-wrap'>
                    <span className='inline-flex items-center gap-1 rounded-full border border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.1)] px-2.5 py-0.5 text-xs text-[#93C5FD] capitalize'>
                      {activeLesson.type}
                    </span>
                    {activeLesson.duration > 0 && (
                      <span className='text-xs text-[#6B7280] flex items-center gap-1'>
                        ⏱ {formatDuration(activeLesson.duration)}
                      </span>
                    )}
                    {isCompleted && (
                      <span className='inline-flex items-center gap-1 rounded-full border border-[rgba(34,197,94,0.4)] bg-[rgba(34,197,94,0.1)] px-2.5 py-0.5 text-xs text-[#4ADE80]'>
                        ✓ Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <ContentRenderer lesson={activeLesson} />

              {/* Description */}
              {activeLesson.description && (
                <div className='rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-5'>
                  <h3 className='text-sm font-semibold text-[#E5E7EB] mb-2'>About this lesson</h3>
                  <p className='text-sm text-[#9CA3AF] leading-relaxed whitespace-pre-line'>{activeLesson.description}</p>
                </div>
              )}

              {/* Attachments */}
              {activeLesson.attachments && activeLesson.attachments.length > 0 && (
                <div className='rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-5'>
                  <h3 className='text-sm font-semibold text-[#E5E7EB] mb-3'>📎 Attachments</h3>
                  <div className='space-y-2'>
                    {activeLesson.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={att.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[#93C5FD] hover:bg-[rgba(59,130,246,0.1)] hover:border-[rgba(59,130,246,0.3)] transition-all group'
                      >
                        <span className='text-base'>📁</span>
                        <span className='flex-1 truncate'>{att.title || `Attachment ${i + 1}`}</span>
                        <span className='text-[#6B7280] text-xs group-hover:text-[#93C5FD] transition-colors'>↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action bar */}
              <div className='flex flex-col sm:flex-row items-center gap-3 pt-2'>
                {/* Prev */}
                <button
                  onClick={handlePrev}
                  disabled={activeIdx <= 0}
                  className='w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-5 py-2.5 text-sm font-medium text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.08)] disabled:opacity-40 disabled:cursor-not-allowed transition-all'
                >
                  ← Previous
                </button>

                {/* Mark complete */}
                {user?.role === 'learner' && (
                  <button
                    id='mark-complete-btn'
                    onClick={handleMarkComplete}
                    disabled={marking || isCompleted}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all ${
                      isCompleted
                        ? 'border border-[rgba(34,197,94,0.4)] bg-[rgba(34,197,94,0.1)] text-[#4ADE80] cursor-default'
                        : 'bg-[linear-gradient(90deg,#3B82F6_0%,#8B5CF6_100%)] text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] disabled:opacity-60 disabled:cursor-not-allowed'
                    }`}
                  >
                    {marking ? (
                      <>
                        <div className='h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin' />
                        Saving…
                      </>
                    ) : isCompleted ? '✓ Completed' : '✓ Mark as Complete'}
                  </button>
                )}

                {/* Next */}
                <button
                  onClick={handleNext}
                  disabled={activeIdx >= lessons.length - 1}
                  className='w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-5 py-2.5 text-sm font-medium text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.08)] disabled:opacity-40 disabled:cursor-not-allowed transition-all'
                >
                  Next →
                </button>
              </div>

              {/* feedback messages */}
              {markMsg && (
                <div className='rounded-xl border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.08)] px-4 py-3 text-sm text-[#4ADE80]'>
                  {markMsg}
                </div>
              )}
              {markErr && (
                <div className='rounded-xl border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-sm text-[#FCA5A5]'>
                  {markErr}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
