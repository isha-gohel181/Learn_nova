import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { API_BASE_URL, getCourseById, enrollInCourse } from '@/lib/api';
import ParallaxTilt from '@/components/ParallaxTilt';

// ─── star rating ──────────────────────────────────────────────────────────────
function StarRating({ rating = 0, large = false }) {
  const filled = Math.round(rating);
  const size = large ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <span className='flex items-center gap-1'>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`${size} ${i <= filled ? 'text-[#FBBF24]' : 'text-[rgba(255,255,255,0.15)]'}`}
          fill='currentColor'
          viewBox='0 0 20 20'
        >
          <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
        </svg>
      ))}
      <span className={`ml-1 ${large ? 'text-sm' : 'text-xs'} text-[#9CA3AF]`}>{Number(rating).toFixed(1)}</span>
    </span>
  );
}

// ─── stat pill ────────────────────────────────────────────────────────────────
function StatPill({ icon, label, value }) {
  return (
    <div className='flex items-center gap-2 rounded-lg border border-[rgba(59,130,246,0.2)] bg-[rgba(255,255,255,0.04)] px-4 py-3'>
      <span className='text-xl'>{icon}</span>
      <div>
        <p className='text-xs text-[#9CA3AF]'>{label}</p>
        <p className='text-sm font-semibold text-[#E5E7EB]'>{value}</p>
      </div>
    </div>
  );
}

function isVideoUrl(url) {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

function resolveMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('/uploads/')) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
}

const ACCESS_COLOURS = {
  open: 'bg-[rgba(34,197,94,0.18)] text-[#4ADE80] border-[rgba(34,197,94,0.3)]',
  paid: 'bg-[rgba(251,191,36,0.18)] text-[#FBBF24] border-[rgba(251,191,36,0.3)]',
  invite: 'bg-[rgba(139,92,246,0.18)] text-[#A78BFA] border-[rgba(139,92,246,0.3)]',
};

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollMessage, setEnrollMessage] = useState('');
  const [enrollError, setEnrollError] = useState('');

  const isLoggedIn = Boolean(localStorage.getItem('authToken'));
  const user = isLoggedIn ? JSON.parse(localStorage.getItem('authUser') || '{}') : null;
  const isInstructor = user?.role === 'instructor';

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await getCourseById(id);
        setCourse(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleEnroll() {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setEnrollLoading(true);
    setEnrollError('');
    setEnrollMessage('');
    try {
      await enrollInCourse(id);
      setEnrollMessage('Successfully enrolled! Head to your dashboard to start learning.');
    } catch (err) {
      setEnrollError(err.message || 'Failed to enroll');
    } finally {
      setEnrollLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    navigate('/login', { replace: true });
  }

  // ── loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className='relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] p-6'>
        <div className='pointer-events-none absolute inset-0 ambient-blobs' />
        <div className='relative mx-auto max-w-5xl space-y-6 pt-8'>
          <div className='h-80 animate-pulse rounded-2xl bg-[rgba(255,255,255,0.06)]' />
          <div className='h-10 w-2/3 animate-pulse rounded-lg bg-[rgba(255,255,255,0.06)]' />
          <div className='h-4 w-1/2 animate-pulse rounded bg-[rgba(255,255,255,0.04)]' />
          <div className='h-4 w-full animate-pulse rounded bg-[rgba(255,255,255,0.04)]' />
          <div className='h-4 w-4/5 animate-pulse rounded bg-[rgba(255,255,255,0.04)]' />
        </div>
      </main>
    );
  }

  // ── error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <main className='relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] p-6'>
        <div className='relative mx-auto max-w-5xl pt-16'>
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>Error loading course</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Link to='/courses'>
            <Button variant='outline' className='border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] text-[#E5E7EB]'>
              ← Back to Catalog
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const instructor = course?.instructorId;
  const accessColour = ACCESS_COLOURS[course?.accessType] || ACCESS_COLOURS.open;
  const mediaUrl = resolveMediaUrl(course?.mediaUrl || course?.image);
  const showVideo = course?.mediaType === 'video' || isVideoUrl(mediaUrl);

  return (
    <main className='relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)]'>
      {/* ambient glows */}
      <div className='pointer-events-none absolute inset-0 ambient-blobs' />

      <div className='relative mx-auto max-w-5xl px-4 pb-20 sm:px-6'>

        {/* ── navbar ── */}
        <nav className='flex items-center justify-between py-5'>
          <Link to='/courses' className='flex items-center gap-3 rounded-full border border-[rgba(59,130,246,0.35)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-[#E5E7EB] shadow-[0_0_14px_rgba(59,130,246,0.25)]'>
            <img
              src='/Logo.jpeg'
              alt='LearnNova logo'
              className='h-10 w-10 rounded-xl bg-white/70 p-1 object-contain shadow-[0_0_18px_rgba(34,211,238,0.55)] ring-[0.5px] ring-[rgba(59,130,246,0.3)] brightness-110 contrast-110'
            />
            <div>
              <p className='font-heading text-[11px] uppercase tracking-[0.28em] text-[#93C5FD]'>LearnNova</p>
              <p className='text-[10px] text-[#9CA3AF]'>Neon Frost OS</p>
            </div>
          </Link>

          <div className='flex items-center gap-3'>
            <Link to='/courses'>
              <Button variant='outline' className='border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.08)]'>
                ← Catalog
              </Button>
            </Link>
            {isLoggedIn ? (
              <>
                <Link to='/dashboard'>
                  <Button variant='outline' className='border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.08)]'>
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant='outline'
                  className='border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.05)] text-[#FCA5A5] hover:bg-[rgba(239,68,68,0.1)]'
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link to='/login'>
                <Button className='bg-[linear-gradient(90deg,#3B82F6_0%,#8B5CF6_100%)] text-white shadow-[0_0_18px_rgba(59,130,246,0.35)]'>
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </nav>

        {/* ── hero banner ── */}
        <ParallaxTilt max={10} hoverScale={1.01}>
          <div className='relative overflow-hidden rounded-2xl border border-[rgba(59,130,246,0.25)] bg-[rgba(255,255,255,0.04)] backdrop-blur-xl'>
            {mediaUrl ? (
              showVideo ? (
                <video
                  src={mediaUrl}
                  className='h-72 w-full object-cover opacity-70'
                  muted
                  playsInline
                  loop
                  autoPlay
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt={course.title}
                  className='h-72 w-full object-cover opacity-60'
                />
              )
            ) : (
              <div className='flex h-56 w-full items-center justify-center bg-[linear-gradient(135deg,rgba(59,130,246,0.1),rgba(139,92,246,0.1))]'>
                <svg className='h-24 w-24 text-[rgba(139,92,246,0.3)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
                </svg>
              </div>
            )}

            {/* gradient overlay at bottom */}
            <div className='absolute inset-0 bg-[linear-gradient(to_top,rgba(11,15,26,0.95)_0%,rgba(11,15,26,0.4)_60%,transparent_100%)]' />

            {/* course headline over banner */}
            <div className='absolute bottom-0 left-0 right-0 p-6 sm:p-8'>
              <div className='flex flex-wrap items-center gap-2 mb-3'>
                <Badge className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${accessColour}`}>
                  {course?.accessType === 'open' ? 'Free' : course?.accessType === 'paid' ? `Paid — $${course?.price}` : 'Invite Only'}
                </Badge>
                {course?.visibility === 'signed' && (
                  <Badge className='rounded-full border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.1)] px-2.5 py-0.5 text-xs text-[#FBBF24]'>
                    🔐 Signed-in users only
                  </Badge>
                )}
              </div>
              <h1 className='text-2xl font-bold text-[#F9FAFB] sm:text-3xl leading-tight'>{course?.title}</h1>
            </div>
          </div>
        </ParallaxTilt>

        {/* ── main content grid ── */}
        <div className='mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3'>

          {/* ── left / description column ── */}
          <div className='space-y-6 lg:col-span-2'>

            {/* description */}
            <Card className='border border-[rgba(59,130,246,0.2)] bg-[rgba(255,255,255,0.04)] text-[#E5E7EB] backdrop-blur-xl ring-0'>
              <CardHeader>
                <CardTitle className='text-lg text-[#E5E7EB]'>About this Course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm leading-relaxed text-[#9CA3AF] whitespace-pre-line'>{course?.description}</p>
              </CardContent>
            </Card>

            {/* tags */}
            {course?.tags && course.tags.length > 0 && (
              <Card className='border border-[rgba(59,130,246,0.2)] bg-[rgba(255,255,255,0.04)] text-[#E5E7EB] backdrop-blur-xl ring-0'>
                <CardHeader>
                  <CardTitle className='text-lg text-[#E5E7EB]'>Topics Covered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-wrap gap-2'>
                    {course.tags.map((tag) => (
                      <Badge
                        key={tag}
                        className='rounded-full border border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.1)] px-3 py-1 text-xs text-[#93C5FD]'
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* stats row */}
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
              <StatPill icon='📚' label='Lessons' value={course?.lessonsCount ?? course?.totalLessons ?? 0} />
              <StatPill icon='👥' label='Enrolled' value={course?.enrolledUsers?.length ?? 0} />
              <StatPill icon='⭐' label='Rating' value={`${Number(course?.averageRating || 0).toFixed(1)} / 5`} />
              <StatPill icon='💬' label='Reviews' value={course?.reviewCount ?? 0} />
            </div>
          </div>

          {/* ── right / enroll sidebar ── */}
          <div className='space-y-5'>
            <ParallaxTilt max={8} hoverScale={1.01} className='sticky top-6'>
              <Card className='border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.06)] text-[#E5E7EB] shadow-[0_0_36px_rgba(59,130,246,0.2)] backdrop-blur-xl ring-0'>
                <CardHeader className='space-y-2'>
                  <CardTitle className='text-xl text-[#E5E7EB]'>
                    {course?.accessType === 'paid' ? (
                      <span className='bg-[linear-gradient(90deg,#FBBF24,#F97316)] bg-clip-text text-transparent'>
                        ${course?.price}
                      </span>
                    ) : (
                      <span className='bg-[linear-gradient(90deg,#4ADE80,#22D3EE)] bg-clip-text text-transparent'>
                        Free
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className='text-[#9CA3AF]'>
                    {course?.accessType === 'open'
                      ? 'Open access — enroll instantly.'
                      : course?.accessType === 'invite'
                      ? 'Invite-only course. Contact the instructor.'
                      : 'Purchase required to access.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className='space-y-4'>
                  <StarRating rating={course?.averageRating || 0} large />

                  {enrollMessage && (
                    <div className='space-y-3'>
                      <Alert className='border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.08)] text-[#4ADE80]'>
                        <AlertTitle>Enrolled!</AlertTitle>
                        <AlertDescription className='text-[#86EFAC]'>{enrollMessage}</AlertDescription>
                      </Alert>
                      <Link to={`/learn/${id}`}>
                        <Button className='w-full bg-[linear-gradient(90deg,#059669_0%,#10B981_100%)] text-white shadow-[0_0_22px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-shadow'>
                          🎬 Start Learning
                        </Button>
                      </Link>
                      <Link to={`/quiz/${id}`}>
                        <Button variant='outline' className='w-full border-[rgba(139,92,246,0.4)] bg-[rgba(139,92,246,0.08)] text-[#A78BFA] hover:bg-[rgba(139,92,246,0.15)]'>
                          📝 Take Quiz
                        </Button>
                      </Link>
                    </div>
                  )}

                  {enrollError && (
                    <Alert variant='destructive'>
                      <AlertTitle>Enrollment failed</AlertTitle>
                      <AlertDescription>{enrollError}</AlertDescription>
                    </Alert>
                  )}

                  {course?.accessType !== 'invite' && !enrollMessage && !isInstructor && (
                    <Button
                      id='enroll-btn'
                      className='w-full bg-[linear-gradient(90deg,#3B82F6_0%,#8B5CF6_100%)] text-white shadow-[0_0_22px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-shadow'
                      onClick={handleEnroll}
                      disabled={enrollLoading}
                    >
                      {enrollLoading ? 'Enrolling…' : isLoggedIn ? 'Enroll Now' : 'Sign In to Enroll'}
                    </Button>
                  )}

                  {!isLoggedIn && (
                    <p className='text-center text-xs text-[#9CA3AF]'>
                      <Link to='/login' className='text-[#22D3EE] hover:underline'>Sign in</Link>
                      {' '}or{' '}
                      <Link to='/register' className='text-[#22D3EE] hover:underline'>register</Link>
                      {' '}to enroll and track your progress.
                    </p>
                  )}

                  {/* instructor info */}
                  {instructor && (
                    <div className='mt-2 flex items-center gap-3 rounded-lg border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.06)] p-3'>
                      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3B82F6,#8B5CF6)] text-sm font-bold text-white'>
                        {(instructor.name || 'I')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className='text-sm font-medium text-[#E5E7EB]'>{instructor.name}</p>
                        <p className='text-xs text-[#9CA3AF]'>{instructor.email}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </ParallaxTilt>
          </div>
        </div>
      </div>
    </main>
  );
}
