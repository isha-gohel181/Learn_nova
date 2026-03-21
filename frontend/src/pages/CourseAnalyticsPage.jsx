import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getCourseAnalytics } from '@/lib/api';
import ParallaxTilt from '@/components/ParallaxTilt';

export default function CourseAnalyticsPage() {
  const { courseId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const response = await getCourseAnalytics(courseId);
        setData(response.data);
      } catch (err) {
        setError(err.message || 'Failed to load course analytics');
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [courseId]);

  const stats = useMemo(() => {
    if (!data) return [];
    return [
      { label: 'Total Enrollments', value: data.enrollment.total },
      { label: 'Completion Rate', value: `${data.enrollment.completionRate}%` },
      { label: 'Avg User Progress', value: `${data.avgProgress}%` },
      { label: 'Average Rating', value: `${data.reviews.average} / 5 (${data.reviews.total} reviews)` },
    ];
  }, [data]);

  if (loading) {
    return (
      <main className='min-h-screen bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] p-6 text-[#E5E7EB]'>
        <div className='mx-auto max-w-6xl'>Loading course analytics...</div>
      </main>
    );
  }

  return (
    <main className='relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] p-4 sm:p-8'>
      <div className='pointer-events-none absolute inset-0 ambient-blobs' />

      <section className='relative mx-auto max-w-6xl space-y-6'>
        <ParallaxTilt max={8} hoverScale={1.01}>
          <Card className='border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.06)] text-[#E5E7EB] shadow-[0_0_36px_rgba(59,130,246,0.25)] backdrop-blur-xl'>
            <CardHeader className='flex flex-row items-start justify-between'>
              <div className='space-y-2'>
                <CardTitle className='text-2xl'>Course Analytics</CardTitle>
                <CardDescription className='text-[#9CA3AF]'>
                  {data?.course?.title ? `Detailed metrics for: ${data.course.title}` : 'Loading...'}
                </CardDescription>
              </div>
              <div className='flex items-center gap-3'>
                <Badge className='bg-[linear-gradient(90deg,#3B82F6_0%,#8B5CF6_100%)] text-white'>
                  {data?.course?.totalLessons} Lessons
                </Badge>
                <Link to='/instructor/my-courses'>
                  <Button
                    variant='outline'
                    className='border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.05)] text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.1)]'
                  >
                    Back to Courses
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </Card>
        </ParallaxTilt>

        {error && (
          <Alert variant='destructive' className='border-[rgba(239,68,68,0.5)] bg-[rgba(239,68,68,0.1)] text-red-100'>
            <AlertTitle>Analytics error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {stats.map((item) => (
            <ParallaxTilt
              key={item.label}
              max={8}
              hoverScale={1.015}
            >
              <Card className='border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.06)] text-[#E5E7EB] backdrop-blur-xl'>
                <CardHeader>
                  <CardDescription className='text-[#9CA3AF]'>{item.label}</CardDescription>
                  <CardTitle className='text-2xl text-[white]'>{item.value}</CardTitle>
                </CardHeader>
              </Card>
            </ParallaxTilt>
          ))}
        </div>

        {data && (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Breakdown Chart/Visual */}
            <ParallaxTilt max={8} hoverScale={1.01} className='col-span-1'>
              <Card className='border border-[rgba(139,92,246,0.3)] bg-[rgba(255,255,255,0.04)] text-[#E5E7EB] backdrop-blur-xl'>
                <CardHeader>
                  <CardTitle className='text-xl'>Enrollment Breakdown</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm text-[#9CA3AF]'>
                      <span>Completed ({data.enrollment.completed})</span>
                      <span>{data.enrollment.total > 0 ? Math.round((data.enrollment.completed / data.enrollment.total) * 100) : 0}%</span>
                    </div>
                    <Progress value={data.enrollment.total > 0 ? (data.enrollment.completed / data.enrollment.total) * 100 : 0} className='h-2 bg-[rgba(255,255,255,0.1)] **:data-[slot=progress-indicator]:bg-[linear-gradient(90deg,#34D399_0%,#10B981_100%)]' />
                  </div>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm text-[#9CA3AF]'>
                      <span>In Progress ({data.enrollment.inProgress})</span>
                      <span>{data.enrollment.total > 0 ? Math.round((data.enrollment.inProgress / data.enrollment.total) * 100) : 0}%</span>
                    </div>
                    <Progress value={data.enrollment.total > 0 ? (data.enrollment.inProgress / data.enrollment.total) * 100 : 0} className='h-2 bg-[rgba(255,255,255,0.1)] **:data-[slot=progress-indicator]:bg-[linear-gradient(90deg,#FBBF24_0%,#F59E0B_100%)]' />
                  </div>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm text-[#9CA3AF]'>
                      <span>Not Started ({data.enrollment.notStarted})</span>
                      <span>{data.enrollment.total > 0 ? Math.round((data.enrollment.notStarted / data.enrollment.total) * 100) : 0}%</span>
                    </div>
                    <Progress value={data.enrollment.total > 0 ? (data.enrollment.notStarted / data.enrollment.total) * 100 : 0} className='h-2 bg-[rgba(255,255,255,0.1)] **:data-[slot=progress-indicator]:bg-[linear-gradient(90deg,#9CA3AF_0%,#6B7280_100%)]' />
                  </div>
                </CardContent>
              </Card>
            </ParallaxTilt>

            {/* Top Learners List */}
            <ParallaxTilt max={8} hoverScale={1.01} className='col-span-1 lg:col-span-2'>
              <Card className='border border-[rgba(34,211,238,0.3)] bg-[rgba(255,255,255,0.04)] text-[#E5E7EB] backdrop-blur-xl'>
                <CardHeader>
                  <CardTitle className='text-xl'>Top Learners</CardTitle>
                  <CardDescription className='text-[#9CA3AF]'>Students who have successfully completed the course.</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.topLearners && data.topLearners.length > 0 ? (
                    <div className='space-y-4'>
                      {data.topLearners.map((learner, idx) => (
                        <div key={idx} className='flex items-center justify-between p-3 rounded-lg border border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)] hover:bg-[rgba(255,255,255,0.05)] transition-colors'>
                          <div className='flex items-center gap-3'>
                            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3B82F6,#8B5CF6)] text-white font-bold text-lg shadow-[0_0_15px_rgba(59,130,246,0.3)]'>
                              {idx + 1}
                            </div>
                            <div>
                              <p className='font-medium text-white'>{learner.userId?.name || 'Unknown Learner'}</p>
                              <div className='flex items-center gap-2 text-xs'>
                                <span className='text-[#22D3EE]'>{learner.userId?.badge || 'Learner'}</span>
                                <span className='text-[#9CA3AF]'>• {learner.userId?.points || 0} pts</span>
                              </div>
                            </div>
                          </div>
                          <div className='text-right'>
                            <Badge className='bg-[rgba(34,197,94,0.15)] text-[#34D399] border-none hover:bg-[rgba(34,197,94,0.25)]'>
                              Completed
                            </Badge>
                            <p className='text-xs text-[#9CA3AF] mt-1'>
                              {new Date(learner.completedDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-6 text-[#9CA3AF]'>
                      No students have completed this course yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </ParallaxTilt>
          </div>
        )}
      </section>
    </main>
  );
}
