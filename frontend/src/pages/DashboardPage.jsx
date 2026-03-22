import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Activity, BookOpen, LayoutDashboard, Settings } from 'lucide-react';
import ParallaxTilt from '@/components/ParallaxTilt';
import {
  getInstructorCourses,
  getInstructorDashboardReport,
  getLearnerProgressReport,
  getProfile,
  getPublicCourses,
} from '@/lib/api';

const BADGE_TRACK = [
  { label: 'Newbie', points: 0 },
  { label: 'Explorer', points: 40 },
  { label: 'Achiever', points: 60 },
  { label: 'Specialist', points: 80 },
  { label: 'Expert', points: 100 },
  { label: 'Master', points: 120 },
];

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function ProgressRing({ value, label, sublabel, size = 120, gradientId = 'ring-gradient' }) {
  const stroke = 10;
  const radius = size / 2 - stroke;
  const circumference = 2 * Math.PI * radius;
  const pct = clamp(value);
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className='flex flex-col items-center gap-2'>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradientId} x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stopColor='#3B82F6' />
            <stop offset='100%' stopColor='#8B5CF6' />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke='rgba(255,255,255,0.08)'
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap='round'
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text x='50%' y='50%' textAnchor='middle' dominantBaseline='middle' fill='#E5E7EB' fontSize='18' fontWeight='700'>
          {Math.round(pct)}%
        </text>
      </svg>
      <div className='text-center'>
        <p className='text-sm font-semibold text-[#E5E7EB]'>{label}</p>
        {sublabel && <p className='text-xs text-[#9CA3AF]'>{sublabel}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      setLoading(true);
      setError('');

      try {
        const profileResponse = await getProfile();
        const user = profileResponse.data;
        setProfile(user);

        const coursesResponse = await getPublicCourses();
        setCourses(coursesResponse.data || []);

        if (user.role === 'instructor') {
          const [reportResponse, instructorCoursesResponse] = await Promise.all([
            getInstructorDashboardReport(),
            getInstructorCourses(1, 50),
          ]);
          setDashboardData(reportResponse.data);
          setInstructorCourses(instructorCoursesResponse.data || []);
        } else {
          const reportResponse = await getLearnerProgressReport();
          setDashboardData(reportResponse.data);
          setInstructorCourses([]);
        }
      } catch (requestError) {
        setError(requestError.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [navigate]);

  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
    []
  );

  const instructorInsights = useMemo(() => {
    if (!dashboardData || profile?.role !== 'instructor') {
      return null;
    }

    const paidCourses = instructorCourses.filter((course) => course.accessType === 'paid' && course.price > 0);
    const estimatedRevenue = paidCourses.reduce(
      (sum, course) => sum + course.price * (course.enrolledUsers?.length || 0),
      0
    );
    const revenueLabel = paidCourses.length > 0 ? currencyFormatter.format(estimatedRevenue) : 'N/A';

    const engagementCourses = (dashboardData.courses || []).map((course) => {
      const completionRate = course.enrollmentCount
        ? Math.round((course.completedCount / course.enrollmentCount) * 100)
        : 0;
      return {
        ...course,
        completionRate,
      };
    });

    const topEngagement = engagementCourses
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 4);

    return {
      revenueLabel,
      paidCoursesCount: paidCourses.length,
      topEngagement,
    };
  }, [currencyFormatter, dashboardData, instructorCourses, profile?.role]);

  const stats = useMemo(() => {
    if (!dashboardData) {
      return [];
    }

    if (profile?.role === 'instructor') {
      return [
        { label: 'Total Courses', value: dashboardData.summary?.totalCourses ?? 0 },
        { label: 'Published', value: dashboardData.summary?.publishedCourses ?? 0 },
        { label: 'Enrollments', value: dashboardData.summary?.totalEnrollment ?? 0 },
        { label: 'Revenue (est.)', value: instructorInsights?.revenueLabel ?? 'N/A' },
        { label: 'Completion Rate', value: `${dashboardData.summary?.completionRate ?? 0}%` },
      ];
    }

    return [
      { label: 'Total Courses', value: dashboardData.summary?.totalCourses ?? 0 },
      { label: 'Completed', value: dashboardData.summary?.completedCourses ?? 0 },
      { label: 'In Progress', value: dashboardData.summary?.inProgressCourses ?? 0 },
      { label: 'Average Progress', value: `${dashboardData.summary?.averageProgress ?? 0}%` },
    ];
  }, [dashboardData, profile?.role]);

  const learnerContinue = dashboardData?.courseProgress?.[0];

  const containerVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: 'easeOut', staggerChildren: 0.06 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  };

  function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    navigate('/login', { replace: true });
  }

  const isLearner = profile?.role === 'learner';
  const isInstructor = profile?.role === 'instructor';

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'My Courses', to: '/courses', icon: BookOpen },
    { label: 'Progress', to: '/progress', icon: Activity },
    { label: 'Settings', to: '/dashboard', icon: Settings },
  ];

  if (loading) {
    return (
      <main className='min-h-screen bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] p-6 text-[#E5E7EB]'>
        <div className='mx-auto max-w-6xl'>Loading dashboard...</div>
      </main>
    );
  }

  return (
    <main className='relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] p-4 sm:p-8'>
      <div className='pointer-events-none absolute inset-0 ambient-blobs' />

      <section className='relative mx-auto max-w-7xl lg:grid lg:grid-cols-[260px_1fr] gap-6'>
        <aside className='glass-panel h-fit rounded-2xl p-4 lg:sticky lg:top-8'>
          <div className='flex items-center gap-3 rounded-2xl border border-[rgba(59,130,246,0.35)] bg-[rgba(255,255,255,0.04)] px-4 py-3 shadow-[0_0_18px_rgba(59,130,246,0.28)]'>
            <img
              src='/Logo.jpeg'
              alt='LearnNova logo'
              className='h-12 w-12 rounded-2xl bg-white/70 p-1 object-contain shadow-[0_0_20px_rgba(34,211,238,0.55)] ring-[0.5px] ring-[rgba(59,130,246,0.3)] brightness-110 contrast-110'
            />
            <div>
              <p className='font-heading text-sm uppercase tracking-[0.28em] text-[#93C5FD]'>LearnNova</p>
              <p className='text-xs text-[#9CA3AF]'>Neon Frost Dashboard</p>
            </div>
          </div>

          <div className='mt-4 flex items-center gap-3 rounded-xl border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] px-4 py-3 shadow-[0_0_16px_rgba(59,130,246,0.2)]'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#3B82F6,#8B5CF6)] text-white text-sm font-semibold'>
              {profile?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className='text-sm font-semibold text-[#E5E7EB]'>{profile?.name || 'Your Space'}</p>
              <p className='text-xs text-[#9CA3AF]'>{profile?.role || 'member'} portal</p>
            </div>
          </div>

          <nav className='mt-5 space-y-2'>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className='flex items-center gap-3 rounded-xl border border-transparent bg-[rgba(255,255,255,0.02)] px-3 py-2 text-sm text-[#D1D5DB] hover:border-[rgba(59,130,246,0.35)] hover:bg-[rgba(59,130,246,0.12)] hover:text-white transition-all'
                >
                  <Icon className='h-4 w-4 text-[#93C5FD]' />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className='mt-6 rounded-xl border border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.08)] px-4 py-3 text-xs text-[#C4B5FD]'>
            Neon Frost OS · premium learning cockpit
          </div>
        </aside>

        <motion.div variants={containerVariants} initial='hidden' animate='show' className='space-y-6'>
          <motion.div variants={itemVariants}>
            <Card className='border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.06)] text-[#E5E7EB] shadow-[0_0_36px_rgba(59,130,246,0.25)] backdrop-blur-xl'>
              <CardHeader className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div className='space-y-2'>
                  <CardTitle className='text-3xl leading-tight'>Welcome, {profile?.name || 'User'}</CardTitle>
                  <CardDescription className='text-[#9CA3AF]'>
                    Role-aware dashboard from backend endpoints ({profile?.role || 'unknown'})
                  </CardDescription>
                </div>
                <div className='flex flex-wrap items-center gap-3'>
                  <Badge className='bg-[linear-gradient(90deg,#3B82F6_0%,#8B5CF6_100%)] text-white'>
                    {profile?.role || 'user'}
                  </Badge>
                  {profile?.role === 'instructor' && (
                    <Link to='/instructor/my-courses'>
                      <Button
                        variant='outline'
                        className='border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.05)] text-[#A78BFA] hover:bg-[rgba(139,92,246,0.1)]'
                      >
                        Manage Courses
                      </Button>
                    </Link>
                  )}
                  <Link to='/courses'>
                    <Button
                      variant='outline'
                      className='border-[rgba(34,211,238,0.3)] bg-[rgba(34,211,238,0.05)] text-[#22D3EE] hover:bg-[rgba(34,211,238,0.1)]'
                    >
                      Browse Courses
                    </Button>
                  </Link>
                  <Button
                    variant='outline'
                    className='border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.08)]'
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

        {error ? (
          <Alert variant='destructive'>
            <AlertTitle>Dashboard error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {isLearner && dashboardData ? (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]'>
              <ParallaxTilt max={10} hoverScale={1.02}>
                <Card className='border border-[rgba(59,130,246,0.35)] bg-[rgba(255,255,255,0.08)] text-[#E5E7EB] shadow-[0_0_36px_rgba(59,130,246,0.25)] backdrop-blur-xl'>
                  <CardHeader className='space-y-3'>
                    <div className='flex flex-wrap items-center gap-3'>
                      <Badge className='bg-[rgba(59,130,246,0.18)] text-[#93C5FD] border-[rgba(59,130,246,0.35)]'>Learning Path</Badge>
                      <Badge className='bg-[rgba(139,92,246,0.16)] text-[#C4B5FD] border-[rgba(139,92,246,0.35)]'>
                        {dashboardData?.user?.badge || 'Learner'}
                      </Badge>
                    </div>
                    <div className='space-y-2'>
                      <CardTitle className='text-2xl sm:text-3xl'>Continue your journey</CardTitle>
                      <CardDescription className='text-[#9CA3AF]'>Continue your journey with focused lessons and progress insights.</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-5'>
                    {learnerContinue ? (
                      <div className='rounded-2xl border border-[rgba(59,130,246,0.25)] bg-[rgba(15,23,42,0.5)] p-4'>
                        <div className='flex flex-wrap items-center justify-between gap-3'>
                          <div>
                            <p className='text-sm text-[#9CA3AF]'>Continue learning</p>
                            <p className='text-lg font-semibold text-[#E5E7EB]'>
                              {learnerContinue.courseId?.title || 'Your course'}
                            </p>
                          </div>
                          <Badge className='bg-[rgba(34,211,238,0.2)] text-[#22D3EE] border-[rgba(34,211,238,0.3)]'>
                            {learnerContinue.progressPercent || 0}% complete
                          </Badge>
                        </div>
                        <div className='mt-4 space-y-3'>
                          <Progress
                            value={learnerContinue.progressPercent || 0}
                            className='h-2 bg-[rgba(255,255,255,0.12)] **:data-[slot=progress-indicator]:bg-[linear-gradient(90deg,#3B82F6_0%,#8B5CF6_100%)]'
                          />
                          <Link to={`/learn/${learnerContinue.courseId?._id}`}>
                            <Button className='bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] text-white shadow-[0_0_22px_rgba(59,130,246,0.4)]'>
                              Resume Lesson
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className='rounded-2xl border border-dashed border-[rgba(59,130,246,0.25)] bg-[rgba(15,23,42,0.35)] p-4 text-sm text-[#9CA3AF]'>
                        Enroll in a course to start tracking progress here.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </ParallaxTilt>

              <ParallaxTilt max={8} hoverScale={1.01}>
                <Card className='border border-[rgba(139,92,246,0.35)] bg-[rgba(255,255,255,0.06)] text-[#E5E7EB] backdrop-blur-xl'>
                  <CardHeader>
                    <CardTitle className='text-lg'>Total Points</CardTitle>
                    <CardDescription className='text-[#9CA3AF]'>Badge progression</CardDescription>
                  </CardHeader>
                  <CardContent className='flex flex-col items-center gap-4'>
                    {(() => {
                      const points = dashboardData?.user?.points ?? 0;
                      const badge = dashboardData?.user?.badge || 'Newbie';
                      const currentIndex = Math.max(0, BADGE_TRACK.findIndex((b) => b.label === badge));
                      const current = BADGE_TRACK[currentIndex] || BADGE_TRACK[0];
                      const next = BADGE_TRACK[Math.min(currentIndex + 1, BADGE_TRACK.length - 1)];
                      const span = Math.max(1, next.points - current.points);
                      const pct = clamp(((points - current.points) / span) * 100);

                      return (
                        <>
                          <ProgressRing
                            value={currentIndex === BADGE_TRACK.length - 1 ? 100 : pct}
                            label={`${points} pts`}
                            sublabel={`Next: ${next.label}`}
                            size={140}
                            gradientId='points-ring'
                          />
                          <div className='w-full rounded-xl border border-[rgba(59,130,246,0.25)] bg-[rgba(15,23,42,0.4)] p-3 text-xs text-[#9CA3AF]'>
                            Current badge: <span className='text-[#E5E7EB] font-semibold'>{current.label}</span>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              </ParallaxTilt>
            </div>

            <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
              {[
                { label: 'Total Courses', value: dashboardData.summary?.totalCourses ?? 0 },
                { label: 'Completed', value: dashboardData.summary?.completedCourses ?? 0 },
                { label: 'In Progress', value: dashboardData.summary?.inProgressCourses ?? 0 },
                { label: 'Avg Progress', value: `${dashboardData.summary?.averageProgress ?? 0}%` },
              ].map((item) => (
                <ParallaxTilt key={item.label} max={8} hoverScale={1.015}>
                  <Card className='border border-[rgba(59,130,246,0.25)] bg-[rgba(255,255,255,0.04)] text-[#E5E7EB] backdrop-blur-xl'>
                    <CardHeader className='space-y-1'>
                      <CardDescription className='text-[#9CA3AF]'>{item.label}</CardDescription>
                      <CardTitle className='text-2xl text-[#E5E7EB]'>{item.value}</CardTitle>
                    </CardHeader>
                  </Card>
                </ParallaxTilt>
              ))}
            </div>

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]'>
              <Card className='border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.06)] text-[#E5E7EB] backdrop-blur-xl'>
                <CardHeader>
                  <CardTitle className='text-lg'>My Courses</CardTitle>
                  <CardDescription className='text-[#9CA3AF]'>Continue where you left off</CardDescription>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {dashboardData.courseProgress?.length ? (
                    dashboardData.courseProgress.slice(0, 4).map((progress) => (
                      <div key={progress._id} className='rounded-xl border border-[rgba(59,130,246,0.2)] bg-[rgba(15,23,42,0.45)] p-4'>
                        <div className='flex items-center justify-between gap-3'>
                          <div>
                            <p className='text-sm font-semibold text-[#E5E7EB]'>
                              {progress.courseId?.title || 'Course'}
                            </p>
                            <p className='text-xs text-[#9CA3AF]'>{progress.completedLessons?.length || 0} lessons completed</p>
                          </div>
                          <Badge className='bg-[rgba(34,211,238,0.2)] text-[#22D3EE] border-[rgba(34,211,238,0.3)]'>
                            {progress.progressPercent || 0}%
                          </Badge>
                        </div>
                        <div className='mt-3 space-y-2'>
                          <Progress
                            value={progress.progressPercent || 0}
                            className='h-2 bg-[rgba(255,255,255,0.12)] **:data-[slot=progress-indicator]:bg-[linear-gradient(90deg,#3B82F6_0%,#22D3EE_100%)]'
                          />
                          <Link to={`/learn/${progress.courseId?._id}`}>
                            <Button size='sm' className='bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] text-white'>
                              {progress.status === 'completed' ? 'Review' : 'Continue'}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className='text-sm text-[#9CA3AF]'>You have not enrolled in any courses yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card className='border border-[rgba(139,92,246,0.3)] bg-[rgba(255,255,255,0.05)] text-[#E5E7EB] backdrop-blur-xl'>
                <CardHeader>
                  <CardTitle className='text-lg'>Your Progress</CardTitle>
                  <CardDescription className='text-[#9CA3AF]'>Top course momentum</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {(() => {
                    const sorted = [...(dashboardData.courseProgress || [])]
                      .sort((a, b) => (b.progressPercent || 0) - (a.progressPercent || 0))
                      .slice(0, 3);

                    if (!sorted.length) {
                      return <p className='text-sm text-[#9CA3AF]'>No progress data yet.</p>;
                    }

                    return (
                      <>
                        <div className='flex items-center justify-between gap-3'>
                          {sorted.map((course, idx) => (
                            <ProgressRing
                              key={course._id}
                              value={course.progressPercent || 0}
                              label={course.courseId?.title?.split(' ').slice(0, 2).join(' ') || `Course ${idx + 1}`}
                              sublabel={`${course.progressPercent || 0}%`}
                              size={92}
                              gradientId={`progress-ring-${idx}`}
                            />
                          ))}
                        </div>
                        <div className='space-y-3'>
                          {sorted.map((course) => (
                            <div key={`${course._id}-bar`} className='space-y-1'>
                              <div className='flex items-center justify-between text-xs text-[#9CA3AF]'>
                                <span className='truncate pr-2'>{course.courseId?.title || 'Course'}</span>
                                <span className='text-[#93C5FD]'>{course.progressPercent || 0}%</span>
                              </div>
                              <Progress
                                value={course.progressPercent || 0}
                                className='h-2 bg-[rgba(255,255,255,0.12)] **:data-[slot=progress-indicator]:bg-[linear-gradient(90deg,#8B5CF6_0%,#22D3EE_100%)]'
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}

        {isInstructor ? (
          <>
            <motion.div variants={itemVariants} className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
              {stats.map((item) => (
                <ParallaxTilt key={item.label} variants={itemVariants} max={8} hoverScale={1.015}>
                  <Card className='border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.06)] text-[#E5E7EB] backdrop-blur-xl'>
                    <CardHeader>
                      <CardDescription className='text-[#9CA3AF]'>{item.label}</CardDescription>
                      <CardTitle className='text-2xl text-[#E5E7EB]'>{item.value}</CardTitle>
                    </CardHeader>
                  </Card>
                </ParallaxTilt>
              ))}
            </motion.div>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
            <Card className='border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.06)] text-[#E5E7EB] backdrop-blur-xl'>
              <CardHeader>
                <CardTitle className='text-lg'>Enrollment Momentum</CardTitle>
                <CardDescription className='text-[#9CA3AF]'>Total learners across your courses</CardDescription>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center justify-between text-sm text-[#9CA3AF]'>
                  <span>Completion rate</span>
                  <span>{dashboardData.summary.completionRate ?? 0}%</span>
                </div>
                <Progress
                  value={dashboardData.summary.completionRate ?? 0}
                  className='h-2 bg-[rgba(255,255,255,0.12)] **:data-[slot=progress-indicator]:bg-[linear-gradient(90deg,#3B82F6_0%,#22D3EE_100%)]'
                />
                <div className='flex items-center justify-between text-sm text-[#9CA3AF]'>
                  <span>Completed learners</span>
                  <span>{dashboardData.summary.totalCompleted ?? 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card className='border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.06)] text-[#E5E7EB] backdrop-blur-xl'>
              <CardHeader>
                <CardTitle className='text-lg'>Revenue Snapshot</CardTitle>
                <CardDescription className='text-[#9CA3AF]'>Based on paid course enrollments</CardDescription>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='text-3xl font-semibold text-[#E5E7EB]'>{instructorInsights?.revenueLabel ?? 'N/A'}</div>
                <div className='text-sm text-[#9CA3AF]'>Paid courses: {instructorInsights?.paidCoursesCount ?? 0}</div>
                <div className='rounded-lg border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.08)] px-3 py-2 text-xs text-[#C4B5FD]'>
                  Revenue is estimated from current enrollments.
                </div>
              </CardContent>
            </Card>

            <Card className='border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.06)] text-[#E5E7EB] backdrop-blur-xl'>
              <CardHeader>
                <CardTitle className='text-lg'>Engagement Pulse</CardTitle>
                <CardDescription className='text-[#9CA3AF]'>Reviews and learner sentiment</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between text-sm text-[#9CA3AF]'>
                  <span>Total reviews</span>
                  <span>{dashboardData.summary.totalReviews ?? 0}</span>
                </div>
                <div className='flex items-center justify-between text-sm text-[#9CA3AF]'>
                  <span>Average rating</span>
                  <span>{dashboardData.summary.averageRating ?? 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          </>
        ) : null}

        {isInstructor ? (
          <Card className='border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.06)] text-[#E5E7EB] backdrop-blur-xl'>
            <CardHeader>
              <CardTitle className='text-xl'>Course Engagement</CardTitle>
              <CardDescription className='text-[#9CA3AF]'>Top courses by completion rate</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              {instructorInsights?.topEngagement?.length ? (
                instructorInsights.topEngagement.map((course) => (
                  <div
                    key={course.id}
                    className='rounded-lg border border-[rgba(59,130,246,0.25)] bg-[rgba(255,255,255,0.04)] p-4 space-y-2'
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <p className='font-medium text-[#E5E7EB]'>{course.title}</p>
                        <p className='text-xs text-[#9CA3AF]'>Enrollments: {course.enrollmentCount} · Lessons: {course.lessonsCount}</p>
                      </div>
                      <Badge className={`text-xs ${course.isPublished ? 'bg-[rgba(34,197,94,0.15)] text-[#4ADE80] border-[rgba(34,197,94,0.35)]' : 'bg-[rgba(239,68,68,0.12)] text-[#FCA5A5] border-[rgba(239,68,68,0.3)]'}`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between text-xs text-[#9CA3AF]'>
                      <span>Completion rate</span>
                      <span>{course.completionRate}%</span>
                    </div>
                    <Progress
                      value={course.completionRate}
                      className='h-2 bg-[rgba(255,255,255,0.12)] **:data-[slot=progress-indicator]:bg-[linear-gradient(90deg,#3B82F6_0%,#8B5CF6_100%)]'
                    />
                  </div>
                ))
              ) : (
                <p className='text-sm text-[#9CA3AF]'>Engagement data will appear once learners start completing lessons.</p>
              )}
            </CardContent>
          </Card>
        ) : null}

        {isLearner && dashboardData?.summary ? (
          <div className='flex flex-wrap gap-3'>
            <Link to='/progress'>
              <Button size='sm' variant='outline' className='border-[rgba(34,211,238,0.3)] bg-[rgba(34,211,238,0.05)] text-[#22D3EE] hover:bg-[rgba(34,211,238,0.1)]'>
                View Progress Details
              </Button>
            </Link>
            <Link to='/my-reviews'>
              <Button size='sm' variant='outline' className='border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.05)] text-[#A78BFA] hover:bg-[rgba(139,92,246,0.1)]'>
                My Reviews
              </Button>
            </Link>
          </div>
        ) : null}

        <Card className='border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.06)] text-[#E5E7EB] backdrop-blur-xl'>
          <CardHeader>
            <CardTitle className='text-xl'>Published Courses</CardTitle>
            <CardDescription className='text-[#9CA3AF]'>Browse & start learning</CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <p className='text-sm text-[#9CA3AF]'>No published courses available right now.</p>
            ) : (
              <div className='space-y-3'>
                {courses.slice(0, 6).map((course) => (
                  <div
                    key={course._id}
                    className='rounded-lg border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] p-3 flex items-start justify-between gap-3'
                  >
                    <div className='min-w-0 flex-1'>
                      <p className='font-medium text-[#E5E7EB] truncate'>{course.title}</p>
                      <p className='mt-1 text-xs text-[#9CA3AF] line-clamp-2'>{course.description}</p>
                    </div>
                    <div className='flex flex-col gap-1.5 shrink-0'>
                      <Link to={`/learn/${course._id}`}>
                        <Button size='sm' className='text-xs h-7 px-2.5 bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] text-white hover:opacity-90'>
                          🎬 Learn
                        </Button>
                      </Link>
                      <Link to={`/quiz/${course._id}`}>
                        <Button size='sm' variant='outline' className='text-xs h-7 px-2.5 border-[rgba(139,92,246,0.4)] text-[#A78BFA] hover:bg-[rgba(139,92,246,0.1)]'>
                          📝 Quiz
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </motion.div>
      </section>
    </main>
  );
}
