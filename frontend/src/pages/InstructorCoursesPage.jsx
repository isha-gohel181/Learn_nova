import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { API_BASE_URL, getInstructorCourses, deleteCourse, publishCourse } from '@/lib/api';
import { ArrowLeft, BookOpen, Plus, Edit, Trash2, Eye, EyeOff, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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

export default function InstructorCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function loadCourses() {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      setLoading(true);
      setError('');

      try {
        const res = await getInstructorCourses(1, 50);
        setCourses(res.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load your courses');
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, [navigate, refreshTrigger]);

  const handleTogglePublish = async (courseId, currentStatus) => {
    try {
      await publishCourse(courseId, !currentStatus);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      alert(err.message || 'Failed to update visibility');
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone and will delete all associated lessons and progress records.')) {
      try {
        await deleteCourse(courseId);
        setRefreshTrigger(prev => prev + 1);
      } catch (err) {
        alert(err.message || 'Failed to delete course');
      }
    }
  };

  if (loading && courses.length === 0) {
    return (
      <main className='min-h-screen bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] p-6 text-[#E5E7EB]'>
        <div className='mx-auto max-w-6xl flex items-center gap-3'>
          <div className='w-5 h-5 border-2 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent rounded-full animate-spin'></div>
          Loading your courses...
        </div>
      </main>
    );
  }

  return (
    <main className='relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] p-4 sm:p-8'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.2),transparent_40%),radial-gradient(circle_at_center,rgba(139,92,246,0.12),transparent_55%)]' />

      <section className='relative mx-auto max-w-6xl space-y-6'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
          <div>
            <div className='flex items-center gap-3 mb-2'>
              <Link to='/dashboard'>
                <Button variant='ghost' size='sm' className='text-[#9CA3AF] hover:text-white hover:bg-[rgba(255,255,255,0.1)] p-0 w-8 h-8 rounded-full'>
                  <ArrowLeft className='w-4 h-4' />
                </Button>
              </Link>
              <h1 className='text-3xl font-bold bg-clip-text text-transparent bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)]'>
                My Courses
              </h1>
            </div>
            <p className='text-[#9CA3AF] ml-11'>Manage your created courses, update content, and control visibility</p>
          </div>
          
          <Link to='/instructor/course/create'>
            <Button className='bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] hover:opacity-90 text-white shadow-[0_0_20px_rgba(59,130,246,0.25)] transition-transform hover:scale-105'>
              <Plus className='w-4 h-4 mr-2' />
              Create New Course
            </Button>
          </Link>
        </div>

        {error && (
          <Alert variant='destructive' className='bg-[rgba(220,38,38,0.1)] border-red-500/50 text-red-200'>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className='border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.06)] backdrop-blur-xl'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-[rgba(59,130,246,0.15)] rounded-lg text-blue-400'>
                <BookOpen className='w-5 h-5' />
              </div>
              <div>
                <CardTitle className='text-xl text-[#E5E7EB]'>Course Library</CardTitle>
                <CardDescription className='text-[#9CA3AF]'>You have {courses.length} course{courses.length !== 1 && 's'} in total</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className='text-center py-16 bg-[rgba(255,255,255,0.02)] rounded-lg border border-[rgba(255,255,255,0.05)]'>
                <BookOpen className='w-16 h-16 text-[#4B5563] mx-auto mb-4 opacity-50' />
                <h3 className='text-xl font-bold text-[#D1D5DB] mb-2'>No Courses Yet</h3>
                <p className='text-[#9CA3AF] max-w-md mx-auto mb-6'>
                  You haven't created any courses. Start sharing your knowledge by creating your first course today!
                </p>
                <Link to='/instructor/course/create'>
                  <Button className='bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] hover:opacity-90'>
                    Create Your First Course
                  </Button>
                </Link>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                {courses.map((course) => {
                  const mediaUrl = resolveMediaUrl(course.mediaUrl || course.image);
                  const showVideo = course.mediaType === 'video' || isVideoUrl(mediaUrl);

                  return (
                    <div
                      key={course._id}
                      className='rounded-xl border border-[rgba(59,130,246,0.2)] bg-[rgba(255,255,255,0.03)] overflow-hidden flex flex-col group transition-all duration-300 hover:border-[rgba(139,92,246,0.5)] hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]'
                    >
                    <div className='h-32 bg-[rgba(255,255,255,0.02)] relative border-b border-[rgba(255,255,255,0.05)]'>
                      {mediaUrl ? (
                        showVideo ? (
                          <video
                            src={mediaUrl}
                            className='w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity'
                            muted
                            playsInline
                            loop
                            autoPlay
                          />
                        ) : (
                          <img src={mediaUrl} alt={course.title} className='w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity' />
                        )
                      ) : (
                        <div className='w-full h-full flex items-center justify-center bg-[linear-gradient(45deg,rgba(59,130,246,0.1),rgba(139,92,246,0.1))] text-[#4B5563]'>
                          <BookOpen className='w-10 h-10 opacity-30' />
                        </div>
                      )}
                      <div className='absolute top-3 right-3'>
                        <Badge className={`${
                          course.isPublished 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        } backdrop-blur-md`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className='p-5 flex-1 flex flex-col justify-between'>
                      <div>
                        <div className='flex justify-between items-start mb-2'>
                          <h3 className='font-bold text-lg text-[#E5E7EB] line-clamp-1 pr-4' title={course.title}>
                            {course.title}
                          </h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='sm' className='h-8 w-8 p-0 text-[#9CA3AF] hover:bg-[rgba(59,130,246,0.2)] hover:text-blue-300 data-[state=open]:bg-[rgba(59,130,246,0.2)] data-[state=open]:text-blue-300 shrink-0 -mr-2 -mt-1'>
                                <MoreVertical className='w-4 h-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end' className='bg-[#1A1F3A] border-[rgba(59,130,246,0.3)] text-gray-200'>
                              <Link to={`/instructor/course/${course._id}/edit`}>
                                <DropdownMenuItem className='hover:bg-[rgba(255,255,255,0.1)] cursor-pointer focus:bg-[rgba(59,130,246,0.2)] focus:text-blue-300 [&_svg]:!text-[#9CA3AF] focus:[&_svg]:!text-blue-300'>
                                  <Edit className='w-4 h-4 mr-2' /> Edit Info
                                </DropdownMenuItem>
                              </Link>
                              <Link to={`/instructor/course/${course._id}/lessons`}>
                                <DropdownMenuItem className='hover:bg-[rgba(255,255,255,0.1)] cursor-pointer focus:bg-[rgba(59,130,246,0.2)] focus:text-blue-300 [&_svg]:!text-[#9CA3AF] focus:[&_svg]:!text-blue-300'>
                                  <PlayCircle className='w-4 h-4 mr-2' /> Manage Lessons
                                </DropdownMenuItem>
                              </Link>
                              <Link to={`/instructor/course/${course._id}/quiz`}>
                                <DropdownMenuItem className='hover:bg-[rgba(255,255,255,0.1)] cursor-pointer focus:bg-[rgba(59,130,246,0.2)] focus:text-blue-300 [&_svg]:!text-[#9CA3AF] focus:[&_svg]:!text-blue-300'>
                                  <FileQuestion className='w-4 h-4 mr-2' /> Manage Quiz
                                </DropdownMenuItem>
                              </Link>
                              <Link to={`/instructor/course/${course._id}/analytics`}>
                                <DropdownMenuItem className='hover:bg-[rgba(255,255,255,0.1)] cursor-pointer focus:bg-[rgba(59,130,246,0.2)] focus:text-blue-300 [&_svg]:!text-[#9CA3AF] focus:[&_svg]:!text-blue-300'>
                                  <BarChart className='w-4 h-4 mr-2' /> View Analytics
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem 
                                className='hover:bg-[rgba(255,255,255,0.1)] cursor-pointer focus:bg-[rgba(59,130,246,0.2)] focus:text-blue-300 [&_svg]:!text-[#9CA3AF] focus:[&_svg]:!text-blue-300'
                                onClick={() => handleTogglePublish(course._id, course.isPublished)}
                              >
                                {course.isPublished ? (
                                  <><EyeOff className='w-4 h-4 mr-2' /> Unpublish</>
                                ) : (
                                  <><Eye className='w-4 h-4 mr-2' /> Publish</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className='hover:bg-red-500/10 text-red-400 cursor-pointer focus:bg-red-500/20 focus:text-red-300 [&_svg]:!text-red-400 focus:[&_svg]:!text-red-300'
                                onClick={() => handleDelete(course._id)}
                              >
                                <Trash2 className='w-4 h-4 mr-2' /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className='text-sm text-[#9CA3AF] line-clamp-2 mb-4'>
                          {course.description || 'No description provided.'}
                        </p>
                      </div>
                      
                      <div className='pt-4 border-t border-[rgba(255,255,255,0.05)] mt-auto flex items-center justify-between'>
                        <div className='text-xs text-[#6B7280] font-medium'>
                          {course.accessType === 'paid' ? (
                            <span className='text-green-400'>${course.price}</span>
                          ) : (
                            <span className='text-blue-400'>Free Access</span>
                          )}
                        </div>
                        <Link to={`/instructor/course/${course._id}/edit`} className='w-1/2'>
                          <Button size='sm' className='w-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-white border border-[rgba(255,255,255,0.1)]'>
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
