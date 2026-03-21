import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createCourse } from '@/lib/api';
import { ArrowLeft, Video, Save, Tags, Globe, DollarSign, Image as ImageIcon } from 'lucide-react';

export default function CreateCoursePage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    visibility: 'everyone',
    accessType: 'open',
    price: 0,
    image: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description) {
      setError('Title and description are required.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        price: Number(formData.price)
      };

      const res = await createCourse(payload);
      
      // Navigate to the newly created course's edit page
      navigate(`/instructor/course/${res.data._id}/edit`, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to create course');
      setSubmitting(false);
    }
  };

  return (
    <main className='relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] p-4 sm:p-8 flex justify-center items-start pt-12 md:pt-20 lg:pt-24'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.2),transparent_40%),radial-gradient(circle_at_center,rgba(139,92,246,0.12),transparent_55%)]' />

      <section className='relative w-full max-w-3xl space-y-6'>
        <div className='mb-2'>
          <Link to='/instructor/my-courses'>
            <Button variant='ghost' className='text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.1)] gap-2'>
              <ArrowLeft className='w-4 h-4' />
              Back to My Courses
            </Button>
          </Link>
        </div>

        <Card className='border border-[rgba(59,130,246,0.4)] bg-[rgba(255,255,255,0.06)] backdrop-blur-2xl shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden relative'>
          <div className='absolute top-0 left-0 w-full h-1 bg-[linear-gradient(90deg,#3B82F6,#8B5CF6,#EC4899)]' />
          
          <CardHeader className='pb-4 border-b border-[rgba(255,255,255,0.05)] text-center sm:text-left sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <CardTitle className='text-3xl text-[#E5E7EB] font-bold tracking-tight'>
                Create New Course
              </CardTitle>
              <CardDescription className='text-[#9CA3AF] text-base mt-2'>
                Setup the fundamental details of your new learning module.
              </CardDescription>
            </div>
            <div className='hidden sm:flex bg-[rgba(59,130,246,0.15)] ring-1 ring-[#3B82F6]/40 p-3 rounded-xl mt-4 sm:mt-0'>
              <Video className='w-8 h-8 text-[#60A5FA]' />
            </div>
          </CardHeader>

          <CardContent className='pt-8 space-y-6'>
            {error && (
              <Alert variant='destructive' className='bg-[rgba(220,38,38,0.1)] border-red-500/50 text-red-200'>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form id='create-course-form' onSubmit={handleSubmit} className='space-y-6'>
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-2 md:col-span-2'>
                  <Label htmlFor='title' className='text-[#E5E7EB] font-semibold text-sm'>
                    Course Title <span className='text-red-400'>*</span>
                  </Label>
                  <Input
                    id='title'
                    name='title'
                    value={formData.title}
                    onChange={handleChange}
                    placeholder='e.g., Advanced React Patterns 2026'
                    className='bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] focus:border-[#3B82F6] focus:ring focus:ring-[rgba(59,130,246,0.2)] text-[#E5E7EB] placeholder:text-[#6B7280] h-12 text-lg'
                    required
                  />
                </div>

                <div className='space-y-2 md:col-span-2'>
                  <Label htmlFor='description' className='text-[#E5E7EB] font-semibold text-sm'>
                    Description <span className='text-red-400'>*</span>
                  </Label>
                  <Textarea
                    id='description'
                    name='description'
                    value={formData.description}
                    onChange={handleChange}
                    placeholder='Describe what students will learn in this course...'
                    className='min-h-[140px] resize-y bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] focus:border-[#3B82F6] focus:ring focus:ring-[rgba(59,130,246,0.2)] text-[#E5E7EB] placeholder:text-[#6B7280]'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='tags' className='text-[#E5E7EB] font-semibold flex items-center gap-2'>
                    <Tags className='w-4 h-4 text-[#9CA3AF]' /> Tags
                  </Label>
                  <Input
                    id='tags'
                    name='tags'
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder='react, frontend, hooks (comma separated)'
                    className='bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#E5E7EB] focus:border-[#3B82F6]'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='image' className='text-[#E5E7EB] font-semibold flex items-center gap-2'>
                    <ImageIcon className='w-4 h-4 text-[#9CA3AF]' /> Banner Image URL
                  </Label>
                  <Input
                    id='image'
                    name='image'
                    value={formData.image}
                    onChange={handleChange}
                    placeholder='https://example.com/banner.jpg'
                    className='bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#E5E7EB] focus:border-[#3B82F6]'
                  />
                </div>

                <div className='grid grid-cols-2 gap-4 col-span-1 md:col-span-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='accessType' className='text-[#E5E7EB] font-semibold flex items-center gap-2'>
                      Access Type
                    </Label>
                    <select
                      id='accessType'
                      name='accessType'
                      value={formData.accessType}
                      onChange={handleChange}
                      className='flex w-full items-center justify-between rounded-md border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] focus:border-[#3B82F6] px-3 py-2 text-sm text-[#E5E7EB] min-h-12 ring-offset-background outline-none'
                    >
                      <option value='open' className='bg-[#1A1F3A] text-white'>Open (Free)</option>
                      <option value='paid' className='bg-[#1A1F3A] text-white'>Paid</option>
                    </select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='price' className='text-[#E5E7EB] font-semibold flex items-center gap-2'>
                      <DollarSign className='w-4 h-4 text-[#9CA3AF]' /> Price ($)
                    </Label>
                    <Input
                      id='price'
                      name='price'
                      type='number'
                      min='0'
                      step='0.01'
                      value={formData.price}
                      onChange={handleChange}
                      disabled={formData.accessType === 'open'}
                      className={`bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#E5E7EB] focus:border-[#3B82F6] ${formData.accessType === 'open' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>
                
              </div>
            </form>
          </CardContent>

          <CardFooter className='bg-[rgba(255,255,255,0.02)] border-t border-[rgba(255,255,255,0.05)] p-6 pt-5'>
            <Button
              type='submit'
              form='create-course-form'
              disabled={submitting}
              className='w-full bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] hover:opacity-90 text-white font-medium py-6 text-lg transition-transform hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
            >
              <Save className='w-5 h-5 mr-2' />
              {submitting ? 'Creating Course...' : 'Create Course & Continue'}
            </Button>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
