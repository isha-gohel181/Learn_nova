import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getAllProgress, getProgressStats } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Clock, Target, CheckCircle } from 'lucide-react';
import ParallaxTilt from '@/components/ParallaxTilt';

export default function ProgressTrackingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProgress() {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [statsResponse, listResponse] = await Promise.all([
          getProgressStats(),
          getAllProgress(1, 50), // Fetch up to 50 courses for the list
        ]);

        setStats(statsResponse.data);
        setProgressList(listResponse.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load progress data');
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, [navigate]);

  if (loading) {
    return (
      <main className='min-h-screen bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] p-6 text-[#E5E7EB]'>
        <div className='mx-auto max-w-6xl'>Loading progress...</div>
      </main>
    );
  }

  const statCards = [
    { label: 'Total Enrolled', value: stats?.totalCourses || 0, icon: <BookOpen className='w-5 h-5 text-blue-400' /> },
    { label: 'In Progress', value: stats?.inProgressCourses || 0, icon: <Clock className='w-5 h-5 text-yellow-400' /> },
    { label: 'Completed', value: stats?.completedCourses || 0, icon: <CheckCircle className='w-5 h-5 text-green-400' /> },
    { label: 'Average Progress', value: `${stats?.averageProgress || 0}%`, icon: <Target className='w-5 h-5 text-purple-400' /> },
  ];

  return (
    <main className='relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] p-4 sm:p-8'>
      <div className='pointer-events-none absolute inset-0 ambient-blobs' />

      <section className='relative mx-auto max-w-6xl space-y-6'>
        <div className='flex items-center gap-4 mb-8'>
          <Link to='/dashboard'>
            <Button variant='outline' className='border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.08)]'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back
            </Button>
          </Link>
          <div>
            <h1 className='text-3xl font-bold bg-clip-text text-transparent bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)]'>
              Your Learning Journey
            </h1>
            <p className='text-[#9CA3AF] mt-1'>Track your overall progress and achievements</p>
          </div>
        </div>

        {error && (
          <Alert variant='destructive' className='bg-[rgba(220,38,38,0.1)] border-red-500/50 text-red-200'>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {statCards.map((item) => (
            <ParallaxTilt
              key={item.label}
              max={8}
              hoverScale={1.015}
            >
              <Card className='border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.06)] backdrop-blur-xl relative overflow-hidden group'>
                <div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(59,130,246,0.1)_0%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                <CardHeader className='flex flex-row items-center justify-between pb-2'>
                  <CardDescription className='text-[#9CA3AF] font-medium'>{item.label}</CardDescription>
                  {item.icon}
                </CardHeader>
                <CardContent>
                  <div className='text-3xl font-bold text-[#E5E7EB]'>{item.value}</div>
                </CardContent>
              </Card>
            </ParallaxTilt>
          ))}
        </div>

        <ParallaxTilt max={8} hoverScale={1.01}>
          <Card className='border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.06)] backdrop-blur-xl mt-8'>
            <CardHeader>
              <CardTitle className='text-xl text-[#E5E7EB]'>Course-wise Progress</CardTitle>
              <CardDescription className='text-[#9CA3AF]'>Detailed view of your ongoing and completed courses</CardDescription>
            </CardHeader>
            <CardContent>
              {progressList.length === 0 ? (
                <div className='text-center py-10 bg-[rgba(255,255,255,0.02)] rounded-lg border border-[rgba(255,255,255,0.05)]'>
                  <BookOpen className='w-12 h-12 text-[#4B5563] mx-auto mb-3' />
                  <p className='text-[#9CA3AF]'>You haven't enrolled in any courses yet.</p>
                  <Link to='/courses'>
                    <Button className='mt-4 bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] hover:opacity-90'>
                      Explore Courses
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className='space-y-4'>
                  {progressList.map((progress) => (
                    <ParallaxTilt
                      key={progress._id}
                      className='rounded-xl border border-[rgba(59,130,246,0.2)] bg-[rgba(255,255,255,0.03)] p-5 transition-all hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(59,130,246,0.4)] flex flex-col sm:flex-row gap-5 items-start sm:items-center'
                      max={8}
                      hoverScale={1.01}
                    >
                    <div className='flex-1 w-full'>
                      <div className='flex items-center justify-between mb-2'>
                        <h3 className='font-semibold text-lg text-[#E5E7EB] pr-4'>{progress.courseId?.title || 'Unknown Course'}</h3>
                        <Badge 
                          className={`shrink-0 ${
                            progress.status === 'completed' 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          }`}
                          variant='outline'
                        >
                          {progress.status === 'completed' ? 'Completed' : 'In Progress'}
                        </Badge>
                      </div>
                      
                      <div className='flex items-center gap-4 text-sm text-[#9CA3AF] mb-3'>
                        <span className='flex items-center gap-1'>
                          <CheckCircle className='w-3.5 h-3.5' /> 
                          {progress.completedLessons?.length || 0} Lessons Completed
                        </span>
                        <span>•</span>
                        <span>Last updated: {new Date(progress.updatedAt).toLocaleDateString()}</span>
                      </div>

                      <div className='space-y-1.5'>
                        <div className='flex justify-between text-sm'>
                          <span className='font-medium text-[#D1D5DB]'>Progress</span>
                          <span className='font-bold text-[#E5E7EB]'>{progress.progressPercent || 0}%</span>
                        </div>
                        <Progress
                          value={progress.progressPercent || 0}
                          className='h-2.5 bg-[rgba(255,255,255,0.1)] **:data-[slot=progress-indicator]:bg-[linear-gradient(90deg,#3B82F6_0%,#8B5CF6_100%)]'
                        />
                      </div>
                    </div>
                    
                    <div className='shrink-0 flex flex-row sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0'>
                        <Link to={`/learn/${progress.courseId?._id}`} className='w-full sm:w-auto'>
                          <Button className='w-full bg-[rgba(59,130,246,0.15)] text-blue-400 hover:bg-[rgba(59,130,246,0.25)] border border-blue-500/30'>
                            {progress.status === 'completed' ? 'Revisit' : 'Continue'}
                          </Button>
                        </Link>
                        {progress.status === 'completed' && (
                          <Link to={`/review/${progress.courseId?._id}`} className='w-full sm:w-auto'>
                            <Button variant='outline' className='w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10'>
                              ⭐ Review
                            </Button>
                          </Link>
                        )}
                    </div>
                    </ParallaxTilt>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </ParallaxTilt>
      </section>
    </main>
  );
}
