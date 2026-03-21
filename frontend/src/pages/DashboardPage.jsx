import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  getInstructorCourses,
  getInstructorDashboardReport,
  getLearnerProgressReport,
  getProfile,
  getPublicCourses,
} from '@/lib/api';

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

  function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    navigate('/login', { replace: true });
  }

  if (loading) {
    return (
      <main className='min-h-screen bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] p-6 text-[#E5E7EB]'>
        <div className='mx-auto max-w-6xl'>Loading dashboard...</div>
      </main>
    );
  }

  return (
    <main className='relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] p-4 sm:p-8'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.2),transparent_40%),radial-gradient(circle_at_center,rgba(139,92,246,0.12),transparent_55%)]' />

      <section className='relative mx-auto max-w-6xl space-y-6'>
        <Card className='border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.06)] text-[#E5E7EB] shadow-[0_0_36px_rgba(59,130,246,0.25)] backdrop-blur-xl'>
          <CardHeader className='flex flex-row items-start justify-between'>
            <div className='space-y-2'>
              <CardTitle className='text-2xl'>Welcome, {profile?.name || 'User'}</CardTitle>
              <CardDescription className='text-[#9CA3AF]'>
                Role-aware dashboard from backend endpoints ({profile?.role || 'unknown'})
              </CardDescription>
            </div>
            <div className='flex items-center gap-3'>
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

        {error ? (
          <Alert variant='destructive'>
            <AlertTitle>Dashboard error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
          {stats.map((item) => (
            <Card
              key={item.label}
              className='border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.06)] text-[#E5E7EB] backdrop-blur-xl'
            >
              <CardHeader>
                <CardDescription className='text-[#9CA3AF]'>{item.label}</CardDescription>
                <CardTitle className='text-2xl text-[#E5E7EB]'>{item.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        {profile?.role === 'instructor' && dashboardData?.summary ? (
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
        ) : null}

        {profile?.role === 'instructor' ? (
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

        {profile?.role === 'learner' && dashboardData?.summary ? (
          <Card className='border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.06)] text-[#E5E7EB] backdrop-blur-xl'>
            <CardHeader>
              <CardTitle className='text-xl'>Learning Progress</CardTitle>
              <CardDescription className='text-[#9CA3AF]'>Average completion from report endpoint</CardDescription>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='flex items-center justify-between text-sm text-[#9CA3AF]'>
                <span>Average progress</span>
                <span>{dashboardData.summary.averageProgress || 0}%</span>
              </div>
              <Progress
                value={dashboardData.summary.averageProgress || 0}
                className='h-2 bg-[rgba(255,255,255,0.12)] **:data-[slot=progress-indicator]:bg-[linear-gradient(90deg,#3B82F6_0%,#8B5CF6_100%)]'
              />
              <div className='flex flex-wrap gap-3 pt-4'>
                <Link to='/progress'>
                  <Button size='sm' variant='outline' className='border-[rgba(34,211,238,0.3)] bg-[rgba(34,211,238,0.05)] text-[#22D3EE] hover:bg-[rgba(34,211,238,0.1)]'>
                    📈 View Details
                  </Button>
                </Link>
                <Link to='/my-reviews'>
                  <Button size='sm' variant='outline' className='border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.05)] text-[#A78BFA] hover:bg-[rgba(139,92,246,0.1)]'>
                    ⭐ My Reviews
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
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
      </section>
    </main>
  );
}
