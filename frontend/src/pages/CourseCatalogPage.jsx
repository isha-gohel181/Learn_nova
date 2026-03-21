import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { API_BASE_URL, getPublicCoursesFiltered } from '@/lib/api';

// ─── helper: star rating display ─────────────────────────────────────────────
function StarRating({ rating = 0 }) {
  const filled = Math.round(rating);
  return (
    <span className='flex items-center gap-0.5'>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`h-3.5 w-3.5 ${i <= filled ? 'text-[#FBBF24]' : 'text-[rgba(255,255,255,0.15)]'}`}
          fill='currentColor'
          viewBox='0 0 20 20'
        >
          <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
        </svg>
      ))}
      <span className='ml-1 text-xs text-[#9CA3AF]'>{Number(rating).toFixed(1)}</span>
    </span>
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

// ─── access type badge colours ────────────────────────────────────────────────
const ACCESS_COLOURS = {
  open: 'bg-[rgba(34,197,94,0.18)] text-[#4ADE80] border-[rgba(34,197,94,0.3)]',
  paid: 'bg-[rgba(251,191,36,0.18)] text-[#FBBF24] border-[rgba(251,191,36,0.3)]',
  invite: 'bg-[rgba(139,92,246,0.18)] text-[#A78BFA] border-[rgba(139,92,246,0.3)]',
};

// ─── single course card ───────────────────────────────────────────────────────
function CourseCard({ course }) {
  const instructor = course.instructorId;
  const accessColour = ACCESS_COLOURS[course.accessType] || ACCESS_COLOURS.open;
  const mediaUrl = resolveMediaUrl(course.mediaUrl || course.image);
  const showVideo = course.mediaType === 'video' || isVideoUrl(mediaUrl);

  return (
    <Link to={`/courses/${course._id}`} className='group block h-full focus:outline-none'>
      <Card className='h-full overflow-hidden border border-[rgba(59,130,246,0.2)] bg-[rgba(255,255,255,0.04)] text-[#E5E7EB] backdrop-blur-xl ring-0 transition-all duration-300 hover:border-[rgba(59,130,246,0.5)] hover:bg-[rgba(255,255,255,0.07)] hover:shadow-[0_0_28px_rgba(59,130,246,0.25)] group-focus:ring-2 group-focus:ring-[rgba(139,92,246,0.6)]'>
        {/* thumbnail */}
        <div className='relative h-40 w-full overflow-hidden bg-[rgba(15,23,42,0.6)]'>
          {mediaUrl ? (
            showVideo ? (
              <video
                src={mediaUrl}
                className='h-full w-full object-cover'
                muted
                playsInline
                loop
                autoPlay
              />
            ) : (
              <img
                src={mediaUrl}
                alt={course.title}
                className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
              />
            )
          ) : (
            <div className='flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,rgba(59,130,246,0.15),rgba(139,92,246,0.15))]'>
              <svg className='h-12 w-12 text-[rgba(139,92,246,0.4)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
              </svg>
            </div>
          )}
          {/* access type pill */}
          <span className={`absolute right-2 top-2 rounded-full border px-2 py-0.5 text-xs font-medium ${accessColour}`}>
            {course.accessType === 'open' ? 'Free' : course.accessType === 'paid' ? `$${course.price}` : 'Invite'}
          </span>
        </div>

        <CardHeader className='px-4 pt-3 pb-1 space-y-1'>
          <CardTitle className='line-clamp-2 text-sm font-semibold leading-snug text-[#E5E7EB]'>
            {course.title}
          </CardTitle>
          {instructor && (
            <p className='text-xs text-[#9CA3AF]'>by {instructor.name || 'Unknown Instructor'}</p>
          )}
        </CardHeader>

        <CardContent className='px-4 pb-4 space-y-3'>
          <p className='line-clamp-2 text-xs text-[#9CA3AF] leading-relaxed'>{course.description}</p>

          {/* rating row */}
          <div className='flex items-center justify-between'>
            <StarRating rating={course.averageRating || 0} />
            <span className='text-xs text-[#9CA3AF]'>{course.reviewCount || 0} reviews</span>
          </div>

          {/* tags */}
          {course.tags && course.tags.length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {course.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  className='rounded-full border-[rgba(59,130,246,0.25)] bg-[rgba(59,130,246,0.1)] px-2 py-0 text-[10px] text-[#93C5FD]'
                >
                  {tag}
                </Badge>
              ))}
              {course.tags.length > 3 && (
                <Badge className='rounded-full border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-2 py-0 text-[10px] text-[#9CA3AF]'>
                  +{course.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* enroll CTA */}
          <div className='pt-1'>
            <span className='inline-flex items-center gap-1.5 text-xs font-medium text-[#22D3EE] transition-colors group-hover:text-[#8B5CF6]'>
              View course
              <svg className='h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
              </svg>
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ─── skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className='h-72 animate-pulse rounded-xl border border-[rgba(59,130,246,0.15)] bg-[rgba(255,255,255,0.03)]'>
      <div className='h-40 rounded-t-xl bg-[rgba(255,255,255,0.06)]' />
      <div className='space-y-3 p-4'>
        <div className='h-3 w-3/4 rounded bg-[rgba(255,255,255,0.08)]' />
        <div className='h-3 w-1/2 rounded bg-[rgba(255,255,255,0.05)]' />
        <div className='h-3 w-full rounded bg-[rgba(255,255,255,0.05)]' />
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function CourseCatalogPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // filter state
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [accessType, setAccessType] = useState('');
  const [visibility, setVisibility] = useState('');
  const [page, setPage] = useState(1);

  const searchTimeout = useRef(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPublicCoursesFiltered({ search, page, limit: 12, accessType: accessType || undefined, visibility: visibility || undefined });
      setCourses(res.data || []);
      setPagination(res.pagination || { total: 0, page: 1, pages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to load courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [search, page, accessType, visibility]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // debounced search
  function handleSearchInput(e) {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 450);
  }

  function handleAccessType(val) {
    setAccessType(val === 'all' ? '' : val);
    setPage(1);
  }

  function handleVisibility(val) {
    setVisibility(val === 'all' ? '' : val);
    setPage(1);
  }

  function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    navigate('/login', { replace: true });
  }

  const isLoggedIn = Boolean(localStorage.getItem('authToken'));
  const user = isLoggedIn ? JSON.parse(localStorage.getItem('authUser') || '{}') : null;

  return (
    <main className='relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)]'>
      {/* ambient background glows */}
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_center,rgba(139,92,246,0.1),transparent_55%)]' />

      <div className='relative mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8'>

        {/* ── navbar ── */}
        <nav className='flex items-center justify-between py-5'>
          <div className='flex items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#3B82F6,#8B5CF6)]'>
              <svg className='h-4 w-4 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
              </svg>
            </div>
            <span className='text-lg font-bold text-[#E5E7EB]'>LearnNova</span>
          </div>

          <div className='flex items-center gap-3'>
            {isLoggedIn ? (
              <>
                <Link to='/dashboard'>
                  <Button
                    variant='outline'
                    className='border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.08)]'
                  >
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
              <>
                <Link to='/login'>
                  <Button
                    variant='outline'
                    className='border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.08)]'
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to='/register'>
                  <Button className='bg-[linear-gradient(90deg,#3B82F6_0%,#8B5CF6_100%)] text-white shadow-[0_0_18px_rgba(59,130,246,0.35)] hover:shadow-[0_0_26px_rgba(139,92,246,0.5)]'>
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* ── hero section ── */}
        <section className='py-12 text-center'>
          <div className='mx-auto max-w-3xl space-y-4'>
            <Badge className='rounded-full bg-[rgba(59,130,246,0.15)] px-3 py-1 text-xs font-medium text-[#93C5FD] border border-[rgba(59,130,246,0.3)]'>
              🚀 Public Course Catalog
            </Badge>
            <h1 className='text-4xl font-bold tracking-tight text-[#E5E7EB] sm:text-5xl'>
              Discover Your Next{' '}
              <span className='bg-[linear-gradient(90deg,#3B82F6,#22D3EE,#8B5CF6)] bg-clip-text text-transparent'>
                Learning Adventure
              </span>
            </h1>
            <p className='text-lg text-[#9CA3AF]'>
              Browse {pagination.total > 0 ? pagination.total : 'hundreds of'} published courses from expert instructors.
              Filter by access type, search by topic, and start learning today.
            </p>
          </div>
        </section>

        {/* ── search & filters ── */}
        <div className='mb-8 flex flex-col gap-3 sm:flex-row sm:items-center'>
          {/* search */}
          <div className='relative flex-1'>
            <svg className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
            </svg>
            <Input
              id='course-search'
              placeholder='Search courses by title, description or tag…'
              className='pl-10 border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] text-[#E5E7EB] placeholder:text-[#6B7280] focus-visible:ring-[rgba(139,92,246,0.6)]'
              value={searchInput}
              onChange={handleSearchInput}
            />
          </div>

          {/* access type filter */}
          <Select onValueChange={handleAccessType} defaultValue='all'>
            <SelectTrigger
              id='filter-access-type'
              className='w-full sm:w-44 border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] text-[#E5E7EB] focus:ring-[rgba(139,92,246,0.6)]'
            >
              <SelectValue placeholder='Access Type' />
            </SelectTrigger>
            <SelectContent className='border-[rgba(59,130,246,0.3)] bg-[#0F1629] text-[#E5E7EB]'>
              <SelectItem value='all'>All Access Types</SelectItem>
              <SelectItem value='open'>Free / Open</SelectItem>
              <SelectItem value='paid'>Paid</SelectItem>
              <SelectItem value='invite'>Invite Only</SelectItem>
            </SelectContent>
          </Select>

          {/* visibility filter */}
          <Select onValueChange={handleVisibility} defaultValue='all'>
            <SelectTrigger
              id='filter-visibility'
              className='w-full sm:w-44 border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] text-[#E5E7EB] focus:ring-[rgba(139,92,246,0.6)]'
            >
              <SelectValue placeholder='Visibility' />
            </SelectTrigger>
            <SelectContent className='border-[rgba(59,130,246,0.3)] bg-[#0F1629] text-[#E5E7EB]'>
              <SelectItem value='all'>All Visibility</SelectItem>
              <SelectItem value='everyone'>Everyone</SelectItem>
              <SelectItem value='signed'>Signed In Only</SelectItem>
            </SelectContent>
          </Select>

          {/* clear filters */}
          {(search || accessType || visibility) && (
            <Button
              variant='outline'
              className='shrink-0 border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.05)] text-[#FCA5A5] hover:bg-[rgba(239,68,68,0.1)]'
              onClick={() => {
                setSearch('');
                setSearchInput('');
                setAccessType('');
                setVisibility('');
                setPage(1);
              }}
            >
              Clear
            </Button>
          )}
        </div>

        {/* ── result count ── */}
        {!loading && (
          <p className='mb-4 text-sm text-[#9CA3AF]'>
            {pagination.total === 0
              ? 'No courses found.'
              : `Showing ${courses.length} of ${pagination.total} course${pagination.total !== 1 ? 's' : ''} (page ${pagination.page} / ${pagination.pages})`}
          </p>
        )}

        {/* ── error ── */}
        {error && (
          <Alert variant='destructive' className='mb-6'>
            <AlertTitle>Failed to load courses</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ── grid ── */}
        <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : courses.map((course) => <CourseCard key={course._id} course={course} />)}
        </div>

        {/* ── empty state ── */}
        {!loading && courses.length === 0 && !error && (
          <div className='mt-16 flex flex-col items-center gap-4 text-center'>
            <div className='flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(59,130,246,0.1)]'>
              <svg className='h-10 w-10 text-[rgba(59,130,246,0.5)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <h2 className='text-xl font-semibold text-[#E5E7EB]'>No courses found</h2>
            <p className='max-w-sm text-[#9CA3AF]'>Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}

        {/* ── pagination ── */}
        {!loading && pagination.pages > 1 && (
          <div className='mt-10 flex items-center justify-center gap-2'>
            <Button
              variant='outline'
              className='border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.08)] disabled:opacity-40'
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Prev
            </Button>

            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('…');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '…' ? (
                  <span key={`ellipsis-${i}`} className='px-2 text-[#6B7280]'>…</span>
                ) : (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    className={
                      p === page
                        ? 'bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] text-white shadow-[0_0_14px_rgba(59,130,246,0.4)] border-0'
                        : 'border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.08)]'
                    }
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                )
              )}

            <Button
              variant='outline'
              className='border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.08)] disabled:opacity-40'
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            >
              Next →
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
