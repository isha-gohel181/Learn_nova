import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getLessonsByCourse, createLesson, updateLesson, deleteLesson, publishLesson, getCourseById } from '@/lib/api';

export default function LessonManagementPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'video',
    contentUrl: '',
    duration: 0,
    description: '',
    order: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourseAndLessons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function fetchCourseAndLessons() {
    setLoading(true);
    try {
      const courseRes = await getCourseById(courseId);
      setCourse(courseRes.data);
      const lessonsRes = await getLessonsByCourse(courseId);
      setLessons(lessonsRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch lessons');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenModal(lesson = null) {
    if (lesson) {
      setEditingLesson(lesson);
      setFormData({
        title: lesson.title,
        type: lesson.type,
        contentUrl: lesson.contentUrl,
        duration: lesson.duration,
        description: lesson.description || '',
        order: lesson.order,
      });
    } else {
      setEditingLesson(null);
      setFormData({
        title: '',
        type: 'video',
        contentUrl: '',
        duration: 0,
        description: '',
        order: lessons.length, // Put at end by default
      });
    }
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingLesson(null);
  }

  async function handleSaveLesson(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      if (editingLesson) {
        await updateLesson(editingLesson._id, formData);
      } else {
        await createLesson({ ...formData, courseId });
      }
      await fetchCourseAndLessons();
      handleCloseModal();
    } catch (err) {
      setError(err.message || 'Failed to save lesson');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteLesson(id) {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await deleteLesson(id);
      await fetchCourseAndLessons();
    } catch (err) {
      setError(err.message || 'Failed to delete lesson');
    }
  }

  async function handlePublishToggle(id, currentStatus) {
    try {
      await publishLesson(id, !currentStatus);
      await fetchCourseAndLessons();
    } catch (err) {
      setError(err.message || 'Failed to publish lesson');
    }
  }

  if (loading && !lessons.length) {
    return (
      <main className='min-h-screen bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] p-6 text-[#E5E7EB]'>
        <div className='mx-auto max-w-5xl'>Loading lessons...</div>
      </main>
    );
  }

  return (
    <main className='relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] p-4 sm:p-8'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.1),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_center,rgba(139,92,246,0.1),transparent_55%)]' />

      <section className='relative mx-auto max-w-5xl space-y-6'>
        <Card className='border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.06)] text-[#E5E7EB] shadow-[0_0_36px_rgba(59,130,246,0.25)] backdrop-blur-xl'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <div>
              <CardTitle className='text-2xl'>Manage Lessons</CardTitle>
              <CardDescription className='text-[#9CA3AF]'>
                {course ? `Course: ${course.title}` : 'Lessons configuration'}
              </CardDescription>
            </div>
            <div className='flex gap-2'>
              <Link to='/instructor/my-courses'>
                <Button variant='outline' className='border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-white hover:bg-[rgba(255,255,255,0.1)]'>
                  Back
                </Button>
              </Link>
              <Button 
                onClick={() => handleOpenModal()}
                className='bg-[linear-gradient(90deg,#3B82F6_0%,#8B5CF6_100%)] text-white hover:opacity-90 transition-opacity'
              >
                + Add Lesson
              </Button>
            </div>
          </CardHeader>
        </Card>

        {error && (
          <Alert variant='destructive' className='border-[rgba(239,68,68,0.5)] bg-[rgba(239,68,68,0.1)] text-red-100'>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className='grid gap-4'>
          {lessons.length === 0 ? (
            <Card className='border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] backdrop-blur-md'>
              <CardContent className='pt-6 text-center text-[#9CA3AF]'>
                No lessons found for this course. Start by adding one.
              </CardContent>
            </Card>
          ) : (
            lessons.map((lesson) => (
              <Card key={lesson._id} className='border border-[rgba(59,130,246,0.2)] bg-[rgba(255,255,255,0.04)] backdrop-blur-md hover:bg-[rgba(255,255,255,0.06)] transition-all'>
                <CardContent className='flex items-center justify-between p-4'>
                  <div className='space-y-1 w-2/3'>
                    <div className='flex items-center gap-2'>
                      <span className='font-mono text-sm text-[#8B5CF6]'>#{lesson.order}</span>
                      <h4 className='font-semibold text-lg text-white truncate'>{lesson.title}</h4>
                      <span className='rounded bg-[rgba(34,211,238,0.1)] px-2 py-0.5 text-xs font-medium text-[#22D3EE] uppercase'>
                        {lesson.type}
                      </span>
                      {lesson.isPublished ? (
                        <span className='rounded bg-[rgba(34,197,94,0.1)] px-2 py-0.5 text-xs font-medium text-green-400'>Published</span>
                      ) : (
                        <span className='rounded bg-[rgba(239,68,68,0.1)] px-2 py-0.5 text-xs font-medium text-red-400'>Draft</span>
                      )}
                    </div>
                    <p className='text-sm text-[#9CA3AF] line-clamp-1'>{lesson.description || 'No description'}</p>
                    <p className='text-xs text-[#6B7280] truncate'>URL: {lesson.contentUrl}</p>
                  </div>
                  
                  <div className='flex items-center gap-3'>
                    <div className='flex flex-col items-center gap-1 mr-4 border-r border-[rgba(255,255,255,0.1)] pr-4'>
                      <Label htmlFor={`publish-${lesson._id}`} className='text-xs text-[#9CA3AF] cursor-pointer'>
                        {lesson.isPublished ? 'Unpublish' : 'Publish'}
                      </Label>
                      <Switch 
                        id={`publish-${lesson._id}`}
                        checked={lesson.isPublished} 
                        onCheckedChange={() => handlePublishToggle(lesson._id, lesson.isPublished)}
                        className='data-[state=checked]:bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)]'
                      />
                    </div>
                    
                    <Button 
                      variant='outline' 
                      size='sm'
                      onClick={() => handleOpenModal(lesson)}
                      className='border-[rgba(34,211,238,0.3)] bg-[rgba(34,211,238,0.05)] text-[#22D3EE] hover:bg-[rgba(34,211,238,0.1)]'
                    >
                      Edit
                    </Button>
                    <Button 
                      variant='outline' 
                      size='sm'
                      onClick={() => handleDeleteLesson(lesson._id)}
                      className='border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.05)] text-red-400 hover:bg-[rgba(239,68,68,0.1)]'
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* CREATE/EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='border border-[rgba(59,130,246,0.3)] bg-[#0f172a] text-[#E5E7EB] shadow-[0_0_40px_rgba(59,130,246,0.15)] sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle className='text-xl'>{editingLesson ? 'Edit Lesson' : 'Create New Lesson'}</DialogTitle>
            <DialogDescription className='text-[#9CA3AF]'>
              {editingLesson ? 'Update the details for this lesson.' : 'Add a new lesson to your course.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSaveLesson} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2 col-span-2 sm:col-span-1'>
                <Label htmlFor='title'>Title *</Label>
                <Input 
                  id='title'
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  required
                  className='border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)] text-white focus:border-[#3B82F6] focus:ring-[#3B82F6]'
                />
              </div>
              
              <div className='space-y-2 col-span-2 sm:col-span-1'>
                <Label htmlFor='type'>Type *</Label>
                <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                  <SelectTrigger className='border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)] text-white'>
                    <SelectValue placeholder='Select type...' />
                  </SelectTrigger>
                  <SelectContent className='border border-[rgba(59,130,246,0.3)] bg-[#0f172a] text-white'>
                    <SelectItem value='video'>Video</SelectItem>
                    <SelectItem value='document'>Document</SelectItem>
                    <SelectItem value='interactive'>Interactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className='space-y-2 col-span-2 sm:col-span-1'>
                <Label htmlFor='duration'>Duration (mins)</Label>
                <Input 
                  id='duration'
                  type='number'
                  min='0'
                  value={formData.duration} 
                  onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})} 
                  className='border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)] text-white'
                />
              </div>

              <div className='space-y-2 col-span-2 sm:col-span-1'>
                <Label htmlFor='order'>Order</Label>
                <Input 
                  id='order'
                  type='number'
                  min='0'
                  value={formData.order} 
                  onChange={(e) => setFormData({...formData, order: Number(e.target.value)})} 
                  className='border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)] text-white'
                />
              </div>

              <div className='space-y-2 col-span-2'>
                <Label htmlFor='contentUrl'>Content URL *</Label>
                <Input 
                  id='contentUrl'
                  placeholder='https://youtube.com/...'
                  value={formData.contentUrl} 
                  onChange={(e) => setFormData({...formData, contentUrl: e.target.value})} 
                  required
                  className='border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)] text-white font-mono text-sm'
                />
              </div>

              <div className='space-y-2 col-span-2'>
                <Label htmlFor='description'>Description</Label>
                <Textarea 
                  id='description'
                  rows={3}
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  className='border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)] text-white resize-none'
                />
              </div>
            </div>

            <DialogFooter className='pt-4 border-t-0 bg-transparent sm:justify-end'>
              <Button type='button' onClick={handleCloseModal} className='bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] text-white hover:opacity-90'>
                Cancel
              </Button>
              <Button type='submit' disabled={saving} className='bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] text-white hover:opacity-90'>
                {saving ? 'Saving...' : 'Save Lesson'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
