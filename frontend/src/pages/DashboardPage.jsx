import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getInstructorDashboardReport, getLearnerProgressReport, getProfile, getPublicCourses } from '@/lib/api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [courses, setCourses] = useState([]);
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

        const [coursesResponse, roleResponse] = await Promise.all([
          getPublicCourses(),
          user.role === 'instructor' ? getInstructorDashboardReport() : getLearnerProgressReport(),
        ]);

        setCourses(coursesResponse.data || []);
        setDashboardData(roleResponse.data);
      } catch (requestError) {
        setError(requestError.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [navigate]);

  const stats = useMemo(() => {
    if (!dashboardData) {
      return [];
    }

    if (profile?.role === 'instructor') {
      return [
        { label: 'Total Courses', value: dashboardData.summary?.totalCourses ?? 0 },
        { label: 'Published', value: dashboardData.summary?.publishedCourses ?? 0 },
        { label: 'Enrollments', value: dashboardData.summary?.totalEnrollment ?? 0 },
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

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
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
