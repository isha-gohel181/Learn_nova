import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NavBar from '@/components/NavBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { getCourseById, updateCourse, API_BASE_URL } from '@/lib/api';
import { ArrowLeft, Edit2, Trash2, MoreVertical } from 'lucide-react';

function resolveMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('/uploads/')) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
}

export default function EditCoursePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    title: 'e.g: Basics of Odoo',
    description: '',
    tags: '',
    isPublished: false,
    image: ''
  });
  
  const [loading, setLoading] = useState(false);

  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [contentForm, setContentForm] = useState({
    title: 'Advanced Sales & CRM Automation in Odoo',
    category: 'video',
    link: '',
    responsible: '',
    duration: '00:00',
    allowDownload: false
  });

  const [isAddQuizOpen, setIsAddQuizOpen] = useState(false);
  const [quizState, setQuizState] = useState({
    activeTab: 0, 
    questions: [
      { id: 1, text: '', choices: [{ text: 'Answer 1', correct: false }, { text: 'Answer 2', correct: false }, { text: 'Answer 3', correct: false }] }
    ],
    rewards: { first: 10, second: 7, third: 5, fourth: 2 }
  });

  const handleAddQuestion = () => {
    setQuizState(prev => ({
      ...prev,
      questions: [...prev.questions, { id: prev.questions.length + 1, text: '', choices: [{ text: 'Answer 1', correct: false }, { text: 'Answer 2', correct: false }, { text: 'Answer 3', correct: false }] }],
      activeTab: prev.questions.length
    }));
  };

  useEffect(() => {
    async function fetchCourse() {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const res = await getCourseById(id);
        const course = res.data;
        
        setFormData({
          title: course.title || '',
          description: course.description || '',
          tags: course.tags?.join(', ') || '',
          isPublished: course.isPublished || false,
          image: course.mediaUrl || course.image || ''
        });
      } catch (err) {
        // silently fallback or handle
      }
    }

    if (id) fetchCourse();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTogglePublished = async () => {
    const newStatus = !formData.isPublished;
    setFormData((prev) => ({ ...prev, isPublished: newStatus }));
    try {
      await updateCourse(id, { isPublished: newStatus });
    } catch {}
  };

  if (loading) {
    return (
      <main className='min-h-screen bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] text-[#E5E7EB] p-6 flex flex-col'>
        <NavBar />
        <div className='flex items-center gap-3 mt-32'>
          Loading course studio...
        </div>
      </main>
    );
  }

  return (
    <div className='min-h-screen relative overflow-hidden bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] flex flex-col font-sans text-[#E5E7EB] pb-24'>
      {/* ambient glows */}
      <div className='pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.2),transparent_40%),radial-gradient(circle_at_center,rgba(139,92,246,0.12),transparent_55%)]' />

      <NavBar />

      {/* Main Odoo-like UI Container wrapped tightly */}
      <main className='w-full max-w-[1200px] mx-auto mt-24 px-4 sm:px-6 relative z-10 flex-1'>
        
        {/* Top Control Bar */}
        <div className='bg-[rgba(255,255,255,0.03)] shadow-[0_0_36px_rgba(59,130,246,0.1)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl rounded-xl overflow-hidden'>
          
          {/* Top border buttons (New) */}
          <div className='border-b border-[rgba(255,255,255,0.08)] px-4 py-2 flex items-center gap-2'>
            <Link to="/instructor/course/create">
              <Button variant="outline" className='h-8 px-4 py-1 bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] text-sm font-medium text-[#E5E7EB]'>
                New
              </Button>
            </Link>
          </div>

          {/* Action Row */}
          <div className='px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.2)]'>
            <div className='flex items-center gap-2'>
              <Button className='h-8 bg-[rgba(59,130,246,0.2)] hover:bg-[rgba(59,130,246,0.3)] text-[#60A5FA] border border-[#3B82F6]/50 shadow-none font-medium'>
                Contact Attendees
              </Button>
              <Button variant="outline" className='h-8 bg-transparent hover:bg-[rgba(59,130,246,0.1)] text-[#60A5FA] border border-[#3B82F6]/50 shadow-none font-medium'>
                Add Attendees
              </Button>
            </div>
            
            <div className='flex items-center gap-6 mt-4 sm:mt-0'>
              {/* Publish Toggle */}
              <div className='border border-[rgba(255,255,255,0.1)] rounded-md p-2 px-3 shadow-sm bg-[rgba(255,255,255,0.02)] float-right flex flex-col'>
                <div className='flex items-center justify-between gap-4'>
                  <span className='text-sm font-semibold text-[#E5E7EB]'>Publish on website</span>
                  <Edit2 className='w-3 h-3 text-[#9CA3AF]' />
                </div>
                <div className='flex items-center justify-between gap-4 mt-1'>
                  <span className='text-xs text-[#9CA3AF]'>Share on web</span>
                  <Switch 
                    checked={formData.isPublished} 
                    onCheckedChange={handleTogglePublished} 
                    className="data-[state=checked]:bg-[#10B981] scale-75"
                  />
                </div>
              </div>

              {/* Preview Button */}
              <Link to={`/courses/${id}`}>
                <Button variant="outline" className='h-9 px-6 bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border-[rgba(255,255,255,0.1)] shadow-none font-medium text-[#E5E7EB]'>
                  Preview
                </Button>
              </Link>
            </div>
          </div>

          {/* Header Content Section */}
          <div className='p-6 flex flex-col md:flex-row gap-8 justify-between'>
            {/* Left form area */}
            <div className='flex-1 space-y-5 max-w-3xl'>
              
              <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
                <span className='text-sm font-medium w-28 text-[#9CA3AF]'>Course Title:</span>
                <input
                  type='text'
                  name='title'
                  placeholder='e.g: Basics of Odoo'
                  value={formData.title}
                  onChange={handleChange}
                  className='flex-1 border-b border-[rgba(255,255,255,0.2)] bg-transparent text-xl font-medium focus:outline-none focus:border-[#3B82F6] pb-1 text-[#60A5FA] placeholder:text-[#3B82F6]/40'
                />
              </div>

              <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
                <span className='text-sm font-medium w-28 text-[#9CA3AF]'>Tags:</span>
                <input
                  type='text'
                  name='tags'
                  value={formData.tags}
                  onChange={handleChange}
                  className='flex-1 border-b border-[rgba(255,255,255,0.2)] bg-transparent focus:outline-none focus:border-[#3B82F6] pb-1 text-sm text-[#E5E7EB]'
                />
              </div>

              <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4'>
                <span className='text-sm font-medium w-28 text-[#9CA3AF]'>Responsible:</span>
                <input
                  type='text'
                  className='flex-1 border-b border-[rgba(255,255,255,0.2)] bg-transparent focus:outline-none focus:border-[#3B82F6] pb-1 text-sm text-[#E5E7EB]'
                />
              </div>

            </div>

            {/* Right Course Image Box */}
            <div className='w-40 h-40 border-2 border-dashed border-[rgba(255,255,255,0.15)] rounded-lg flex flex-col items-center justify-center relative bg-[rgba(255,255,255,0.02)] shrink-0 text-[#9CA3AF]'>
              <div className='absolute top-2 left-2 cursor-pointer hover:bg-[rgba(255,255,255,0.1)] p-1 rounded transition-colors'>
                <Edit2 className='w-4 h-4 text-[#9CA3AF]' />
              </div>
              <div className='absolute top-2 right-2 cursor-pointer hover:bg-[rgba(255,255,255,0.1)] p-1 rounded transition-colors'>
                <Trash2 className='w-4 h-4 text-[#9CA3AF]' />
              </div>
              {formData.image ? (
                <img src={resolveMediaUrl(formData.image)} alt='Course' className='w-full h-full object-cover rounded-lg' />
              ) : (
                <span className='text-sm mt-4'>Course image</span>
              )}
            </div>
          </div>

          {/* Setup Tabs */}
          <div className='px-6 pb-6'>
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="bg-transparent border-b border-[rgba(255,255,255,0.1)] w-full justify-start rounded-none h-auto p-0 gap-1 flex flex-wrap">
                <TabsTrigger 
                  value="content" 
                  className="rounded-t-lg rounded-b-none border border-b-0 border-[rgba(255,255,255,0.1)] bg-[rgba(239,68,68,0.15)] data-[state=active]:bg-[rgba(239,68,68,0.2)] data-[state=active]:border-b-0 data-[state=active]:shadow-[0_-5px_15px_rgba(239,68,68,0.15)] px-6 py-2 text-sm text-[#FCA5A5] data-[state=active]:text-[#FCA5A5] relative after:absolute after:-bottom-[1px] after:left-0 after:w-full after:h-[1px] data-[state=active]:after:bg-[rgba(239,68,68,0.2)]"
                >
                  Content
                </TabsTrigger>
                <TabsTrigger 
                  value="description" 
                  className="rounded-t-lg rounded-b-none border border-b-0 border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] data-[state=active]:bg-[rgba(255,255,255,0.08)] data-[state=active]:border-b-0 data-[state=active]:shadow-[0_-5px_15px_rgba(255,255,255,0.05)] px-6 py-2 text-sm text-[#9CA3AF] data-[state=active]:text-white relative after:absolute after:-bottom-[1px] after:left-0 after:w-full after:h-[1px] data-[state=active]:after:bg-[rgba(255,255,255,0.08)]"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger 
                  value="options" 
                  className="rounded-t-lg rounded-b-none border border-b-0 border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] data-[state=active]:bg-[rgba(255,255,255,0.08)] data-[state=active]:border-b-0 data-[state=active]:shadow-[0_-5px_15px_rgba(255,255,255,0.05)] px-6 py-2 text-sm text-[#9CA3AF] data-[state=active]:text-white relative after:absolute after:-bottom-[1px] after:left-0 after:w-full after:h-[1px] data-[state=active]:after:bg-[rgba(255,255,255,0.08)]"
                >
                  Options
                </TabsTrigger>
                <TabsTrigger 
                  value="quiz" 
                  className="rounded-t-lg rounded-b-none border border-b-0 border-white/20 bg-[rgba(255,255,255,0.02)] data-[state=active]:bg-white data-[state=active]:border-white data-[state=active]:border-b-0 data-[state=active]:shadow-[0_-5px_15px_rgba(255,255,255,0.2)] px-6 py-2 text-sm font-semibold text-[#9CA3AF] data-[state=active]:text-black relative after:absolute after:-bottom-[1px] after:left-0 after:w-full after:h-[1px] data-[state=active]:after:bg-white"
                >
                  Quiz
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="m-0 pt-0">
                <div className='w-full overflow-x-auto bg-[rgba(0,0,0,0.15)] border-x border-b border-[rgba(255,255,255,0.05)] rounded-b-xl'>
                  <table className='w-full text-left text-sm border-b border-[rgba(255,255,255,0.05)]'>
                    <thead>
                      <tr className='text-[#9CA3AF] font-medium border-b border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]'>
                        <th className='py-3 px-6 w-1/2'>Content title</th>
                        <th className='py-3 px-6 w-1/3'>Category</th>
                        <th className='py-3 px-6 w-16'></th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-[rgba(255,255,255,0.05)] text-[#E5E7EB]'>
                      <tr className='hover:bg-[rgba(255,255,255,0.03)] group cursor-pointer transition-colors'>
                        <td className='py-4 px-6 font-medium max-w-sm truncate'>Advanced Sales & CRM Automation in Odoo</td>
                        <td className='py-4 px-6'>Video</td>
                        <td className='py-4 px-6 text-right'>
                          <MoreVertical className='w-4 h-4 inline-block text-[#9CA3AF] group-hover:text-white cursor-pointer transition-colors' />
                        </td>
                      </tr>
                      <tr className='hover:bg-[rgba(255,255,255,0.03)] group cursor-pointer transition-colors'>
                        <td className='py-4 px-6 font-medium max-w-sm truncate'>Odoo CRM: Advanced Features & Best Practices</td>
                        <td className='py-4 px-6'>Document</td>
                        <td className='py-4 px-6 text-right'>
                          <MoreVertical className='w-4 h-4 inline-block text-[#9CA3AF] group-hover:text-white cursor-pointer transition-colors' />
                        </td>
                      </tr>
                      <tr className='hover:bg-[rgba(255,255,255,0.03)] group cursor-pointer transition-colors'>
                        <td className='py-4 px-6 font-medium'>Quiz</td>
                        <td className='py-4 px-6'>Quiz</td>
                        <td className='py-4 px-6 text-right'>
                          <MoreVertical className='w-4 h-4 inline-block text-[#9CA3AF] group-hover:text-white cursor-pointer transition-colors' />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div className='py-6 text-center border-t border-[rgba(255,255,255,0.05)]'>
                    <Dialog open={isAddContentOpen} onOpenChange={setIsAddContentOpen}>
                      <DialogTrigger asChild>
                        <Button className='bg-[linear-gradient(90deg,#8B5CF6,#EC4899)] hover:opacity-90 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] font-semibold uppercase tracking-wider text-xs px-6 py-1 h-8 rounded-sm transition-all'>
                          Add content
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='sm:max-w-2xl bg-[#0F172A] border-[rgba(255,255,255,0.1)] p-0 gap-0 overflow-hidden text-[#E5E7EB] shadow-[0_0_50px_rgba(0,0,0,0.5)]'>
                        <div className='p-6 space-y-6 pt-10'>
                          <div className='space-y-2'>
                            <label className='text-[#F59E0B] text-sm'>Content title</label>
                            <input 
                              value={contentForm.title}
                              onChange={(e) => setContentForm({...contentForm, title: e.target.value})}
                              className='w-full bg-transparent border-b border-[rgba(255,255,255,0.2)] text-[#3B82F6] text-xl pb-1 focus:outline-none focus:border-[#3B82F6]'
                            />
                          </div>

                          <Tabs defaultValue="content" className="w-full">
                            <TabsList className="bg-transparent border-b border-[rgba(255,255,255,0.1)] w-full justify-start rounded-none h-auto p-0 gap-2 flex flex-wrap">
                              <TabsTrigger value="content" className="rounded-xl rounded-b-none border border-b-0 border-[rgba(255,255,255,0.1)] bg-[rgba(239,68,68,0.15)] px-6 py-2 text-sm text-[#FCA5A5] data-[state=active]:bg-[rgba(239,68,68,0.2)] data-[state=active]:text-[#FCA5A5] data-[state=active]:border-b-0 relative after:absolute after:-bottom-[1px] after:left-0 after:w-full after:h-[1px] data-[state=active]:after:bg-[rgba(239,68,68,0.2)] shadow-none">Content</TabsTrigger>
                              <TabsTrigger value="description" className="rounded-xl rounded-b-none border border-b-0 border-[rgba(255,255,255,0.1)] bg-transparent px-6 py-2 text-sm text-[#E5E7EB] data-[state=active]:bg-[rgba(255,255,255,0.05)] data-[state=active]:text-white shadow-none">Description</TabsTrigger>
                              <TabsTrigger value="attachment" className="rounded-xl rounded-b-none border border-b-0 border-[rgba(255,255,255,0.1)] bg-transparent px-6 py-2 text-sm text-[#E5E7EB] data-[state=active]:bg-[rgba(255,255,255,0.05)] data-[state=active]:text-white shadow-none">Additional attachment</TabsTrigger>
                            </TabsList>
                            <TabsContent value="content" className="pt-6 space-y-8 min-h-[220px]">
                              <div className='flex items-center gap-6'>
                                <span className='text-sm font-medium'>Content Category :</span>
                                <div className='flex items-center gap-6'>
                                  {['video', 'document', 'image'].map(cat => (
                                    <label 
                                      key={cat} 
                                      onClick={() => setContentForm({...contentForm, category: cat})}
                                      className='flex items-center gap-2 cursor-pointer text-sm'
                                    >
                                      <div className={`w-4 h-4 rounded-[4px] flex justify-center items-center border ${contentForm.category === cat ? 'bg-[#8B5CF6] border-[#8B5CF6]' : 'border-[rgba(255,255,255,0.5)] bg-transparent'}`}>
                                      </div>
                                      <span className="capitalize">{cat}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>

                              {contentForm.category === 'video' && (
                                <div className='space-y-6'>
                                  <div className='flex items-end gap-4'>
                                    <span className='text-sm w-24'>Video Link:</span>
                                    <div className='flex-1'>
                                      <div className='text-[10px] text-[#3B82F6] mb-1'>(Google drive link or youtube video link is applicable)</div>
                                      <input className='w-full bg-transparent border-b border-[rgba(255,255,255,0.2)] pb-1 focus:outline-none focus:border-[#3B82F6]' />
                                    </div>
                                  </div>
                                  <div className='flex items-center gap-4'>
                                    <span className='text-sm w-24'>Responsible :</span>
                                    <input className='flex-1 max-w-[200px] bg-transparent border-b border-[rgba(255,255,255,0.2)] pb-1 focus:outline-none focus:border-[#3B82F6]' />
                                  </div>
                                  <div className='flex items-center gap-4'>
                                    <span className='text-sm w-24'>Duration :</span>
                                    <span className='text-sm text-[#9CA3AF]'>00:00 hours</span>
                                  </div>
                                </div>
                              )}

                              {contentForm.category === 'document' && (
                                <div className='space-y-6'>
                                  <div className='flex items-center gap-4'>
                                    <span className='text-sm w-24'>Document file:</span>
                                    <input className='flex-1 max-w-[200px] bg-transparent border-b border-[rgba(255,255,255,0.2)] pb-1 focus:outline-none focus:border-[#3B82F6]' />
                                    <Button className='bg-[#8B5CF6] hover:bg-[#7C3AED] h-8 text-xs px-4 border-none shadow-none'>Upload file</Button>
                                  </div>
                                  <div className='flex items-center gap-4'>
                                    <span className='text-sm w-24'>Responsible :</span>
                                    <input className='flex-1 max-w-[200px] bg-transparent border-b border-[rgba(255,255,255,0.2)] pb-1 focus:outline-none focus:border-[#3B82F6]' />
                                    <div className='flex items-center gap-3 ml-8'>
                                      <span className='text-sm'>Allow Download :</span>
                                      <div 
                                        onClick={() => setContentForm({...contentForm, allowDownload: !contentForm.allowDownload})}
                                        className={`w-4 h-4 rounded-[4px] flex justify-center items-center cursor-pointer border ${contentForm.allowDownload ? 'bg-[#8B5CF6] border-[#8B5CF6]' : 'border-[rgba(255,255,255,0.5)] bg-transparent'}`}
                                      >
                                      </div>
                                    </div>
                                  </div>
                                  <div className='text-[10px] text-[rgba(255,255,255,0.4)] md:absolute bottom-6 right-6 border border-[rgba(255,255,255,0.1)] p-2 rounded-lg bg-[rgba(255,255,255,0.02)] max-w-[200px]'>
                                    When it is checked on, the participant download the file
                                  </div>
                                </div>
                              )}

                              {contentForm.category === 'image' && (
                                <div className='space-y-6'>
                                  <div className='flex items-center gap-4'>
                                    <span className='text-sm w-24'>Image file :</span>
                                    <input className='flex-1 max-w-[200px] bg-transparent border-b border-[rgba(255,255,255,0.2)] pb-1 focus:outline-none focus:border-[#3B82F6]' />
                                    <Button className='bg-[#8B5CF6] hover:bg-[#7C3AED] h-8 text-xs px-4 border-none shadow-none'>Upload image</Button>
                                  </div>
                                  <div className='flex items-center gap-4'>
                                    <span className='text-sm w-24'>Responsible :</span>
                                    <input className='flex-1 max-w-[200px] bg-transparent border-b border-[rgba(255,255,255,0.2)] pb-1 focus:outline-none focus:border-[#3B82F6]' />
                                    <div className='flex items-center gap-3 ml-8'>
                                      <span className='text-sm'>Allow Download :</span>
                                      <div 
                                        onClick={() => setContentForm({...contentForm, allowDownload: !contentForm.allowDownload})}
                                        className={`w-4 h-4 rounded-[4px] flex justify-center items-center cursor-pointer border ${contentForm.allowDownload ? 'bg-[#8B5CF6] border-[#8B5CF6]' : 'border-[rgba(255,255,255,0.5)] bg-transparent'}`}
                                      >
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </TabsContent>
                            <TabsContent value="description" className="pt-4 min-h-[220px]">
                              <textarea 
                                placeholder="Write your content description here..."
                                className="w-full min-h-[200px] bg-transparent resize-none focus:outline-none text-[#3B82F6] placeholder:text-[#3B82F6] placeholder:italic text-sm"
                              ></textarea>
                            </TabsContent>
                            <TabsContent value="attachment" className="pt-8 min-h-[220px] space-y-8">
                              <div className='flex items-center gap-4'>
                                <span className='text-sm w-12'>File :</span>
                                <input className='flex-1 max-w-[200px] bg-transparent border-b border-[rgba(255,255,255,0.2)] pb-1 focus:outline-none focus:border-[#3B82F6]' />
                                <Button className='bg-[#8B5CF6] hover:bg-[#7C3AED] h-8 text-xs px-4 border-none shadow-none rounded-[8px]'>Upload your file</Button>
                              </div>
                              <div className='flex items-center gap-4'>
                                <span className='text-sm w-12'>Link :</span>
                                <input placeholder='e.g : www.google.com' className='flex-1 max-w-[200px] bg-transparent border-b border-[rgba(255,255,255,0.2)] pb-1 focus:outline-none focus:border-[#3B82F6] text-[#3B82F6] placeholder:text-[#3B82F6]' />
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="description" className="p-6 border border-t-0 border-[rgba(255,255,255,0.05)] min-h-32 bg-[rgba(0,0,0,0.15)] rounded-b-xl">
                <p className="text-[#9CA3AF] text-sm">Course description placeholder...</p>
              </TabsContent>
              <TabsContent value="options" className="p-6 border border-t-0 border-[rgba(255,255,255,0.05)] min-h-32 bg-[rgba(0,0,0,0.15)] rounded-b-xl">
                <p className="text-[#9CA3AF] text-sm">Course options placeholder...</p>
              </TabsContent>
              <TabsContent value="quiz" className="m-0 pt-0">
                <div className='w-full overflow-x-auto bg-[rgba(0,0,0,0.15)] border-x border-b border-[rgba(255,255,255,0.05)] rounded-b-xl'>
                  <table className='w-full text-left text-sm border-b border-[rgba(255,255,255,0.05)]'>
                    <thead>
                      <tr className='text-[#9CA3AF] font-medium border-b border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]'>
                        <th className='py-3 px-6 w-1/2'>Content title</th>
                        <th className='py-3 px-6 w-1/3'>Category</th>
                        <th className='py-3 px-6 w-16'></th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-[rgba(255,255,255,0.05)] text-[#E5E7EB]'>
                      <tr className='hover:bg-[rgba(255,255,255,0.03)] group transition-colors'>
                        <td className='py-4 px-6 font-medium'>Quiz</td>
                        <td className='py-4 px-6'>Quiz</td>
                        <td className='py-4 px-6 text-right'>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="focus:outline-none">
                              <MoreVertical className='w-4 h-4 inline-block text-[#9CA3AF] hover:text-white cursor-pointer transition-colors' />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32 bg-[#0F172A] border-[rgba(255,255,255,0.1)] text-[#E5E7EB]">
                              <DropdownMenuItem className="cursor-pointer hover:bg-[rgba(255,255,255,0.05)] focus:bg-[rgba(255,255,255,0.05)]">Edit</DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500 hover:bg-[rgba(239,68,68,0.1)] focus:bg-[rgba(239,68,68,0.1)]">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div className='py-12 pb-24 text-center border-t border-[rgba(255,255,255,0.05)] relative'>
                    <Dialog open={isAddQuizOpen} onOpenChange={setIsAddQuizOpen}>
                      <DialogTrigger asChild>
                        <Button className='bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(139,92,246,0.25)] font-semibold h-9 px-8 rounded-[6px] transition-all'>
                          Add Quiz
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='sm:max-w-4xl bg-[#0F172A] border-[rgba(255,255,255,0.1)] p-0 gap-0 overflow-hidden text-[#E5E7EB] shadow-[0_0_50px_rgba(0,0,0,0.5)] h-[600px] flex flex-row' showCloseButton={true}>
                        {/* Sidebar */}
                        <div className="w-56 border-r border-[rgba(255,255,255,0.1)] flex flex-col pt-6 pb-6 px-4 bg-[#0B0F1A]/50">
                          <div className="text-[#E5E7EB] font-medium text-sm mb-4 pb-2 border-b border-[rgba(255,255,255,0.05)]">Question List</div>
                          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                             {quizState.questions.map((q, idx) => (
                               <div 
                                  key={idx} 
                                  onClick={() => setQuizState({...quizState, activeTab: idx})}
                                  className={`text-sm py-2 px-3 cursor-pointer rounded border transition-colors ${quizState.activeTab === idx ? 'border-red-400/80 bg-[rgba(239,68,68,0.1)] text-[#E5E7EB]' : 'border-transparent text-[#9CA3AF] hover:bg-[rgba(255,255,255,0.05)]'}`}
                               >
                                  Question {idx + 1}
                               </div>
                             ))}
                             
                             <div className="pt-6 space-y-4">
                               <Button onClick={handleAddQuestion} className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-[4px] shadow-sm border-none justify-center px-4 h-9">Add Question</Button>
                               <Button onClick={() => setQuizState({...quizState, activeTab: 'rewards'})} className={`w-full rounded-[4px] shadow-sm border justify-center px-4 h-9 transition-colors ${quizState.activeTab === 'rewards' ? 'border-red-400/80 bg-[#8B5CF6] text-white' : 'bg-[#8B5CF6] border-transparent hover:bg-[#7C3AED] text-white'}`}>Rewards</Button>
                             </div>
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-8 overflow-y-auto">
                           {quizState.activeTab !== 'rewards' && quizState.questions[quizState.activeTab] && (
                              <div className="max-w-2xl mt-4">
                                <div className="flex items-start gap-3 mb-12">
                                  <span className="text-xl text-[#E5E7EB] mt-0.5">{quizState.activeTab + 1}.</span>
                                  <input 
                                    className="flex-1 bg-transparent border-b border-[rgba(255,255,255,0.2)] pb-1 text-[#F59E0B] placeholder:text-[#F59E0B]/50 focus:outline-none focus:border-[#F59E0B] text-lg tracking-wide italic" 
                                    placeholder="Write your question here"
                                    value={quizState.questions[quizState.activeTab].text}
                                    onChange={(e) => {
                                      const newQs = [...quizState.questions];
                                      newQs[quizState.activeTab].text = e.target.value;
                                      setQuizState({...quizState, questions: newQs});
                                    }}
                                  />
                                </div>
                                <div className="grid grid-cols-[1fr_80px] mb-2 px-2">
                                  <div className="text-sm font-medium text-[#E5E7EB]">Choices</div>
                                  <div className="text-sm font-medium text-center text-[#E5E7EB]">Correct</div>
                                </div>
                                <div className="border-t border-[rgba(255,255,255,0.1)] mb-6"></div>
                                
                                <div className="space-y-4 px-2">
                                  {quizState.questions[quizState.activeTab].choices.map((choice, cIdx) => (
                                    <div key={cIdx} className="grid grid-cols-[1fr_80px] items-center group">
                                      <input 
                                        className="bg-transparent text-sm text-[#E5E7EB] focus:outline-none placeholder:text-[#9CA3AF] italic"
                                        value={choice.text}
                                        placeholder="Answer text"
                                        onChange={(e) => {
                                          const newQs = [...quizState.questions];
                                          newQs[quizState.activeTab].choices[cIdx].text = e.target.value;
                                          setQuizState({...quizState, questions: newQs});
                                        }}
                                      />
                                      <div className="flex justify-center">
                                        <div 
                                          onClick={() => {
                                            const newQs = [...quizState.questions];
                                            newQs[quizState.activeTab].choices.forEach(c => c.correct = false); 
                                            newQs[quizState.activeTab].choices[cIdx].correct = true;
                                            setQuizState({...quizState, questions: newQs});
                                          }}
                                          className={`w-4 h-4 rounded-sm border flex items-center justify-center cursor-pointer transition-colors ${choice.correct ? 'bg-transparent border-[#10B981]' : 'border-[rgba(255,255,255,0.3)]'}`}
                                        >
                                           {choice.correct && <div className="w-2.5 h-2.5 bg-[#10B981] rounded-[2px]" />}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div 
                                  onClick={() => {
                                    const newQs = [...quizState.questions];
                                    newQs[quizState.activeTab].choices.push({ text: `Answer ${newQs[quizState.activeTab].choices.length + 1}`, correct: false });
                                    setQuizState({...quizState, questions: newQs});
                                  }}
                                  className="text-[#3B82F6] text-sm mt-8 cursor-pointer hover:underline px-2 inline-block font-medium"
                                >
                                  Add choice
                                </div>
                              </div>
                           )}

                           {quizState.activeTab === 'rewards' && (
                              <div className="max-w-md mt-4">
                                <div className="text-xl mb-4 text-[#E5E7EB] font-serif tracking-wide border-b border-[rgba(255,255,255,0.1)] pb-4">Rewards</div>
                                <div className="space-y-8 pt-4">
                                  <div className="flex items-center gap-4">
                                    <span className="text-[#F59E0B] w-36 italic text-sm">First try :</span>
                                    <input value={quizState.rewards.first} onChange={e => setQuizState({...quizState, rewards: {...quizState.rewards, first: e.target.value}})} className="w-16 bg-transparent border-b border-[#F59E0B] text-[#F59E0B] text-center focus:outline-none pb-1" />
                                    <span className="text-[#F59E0B] italic text-sm">points</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="text-[#F59E0B] w-36 italic text-sm">Second try:</span>
                                    <input value={quizState.rewards.second} onChange={e => setQuizState({...quizState, rewards: {...quizState.rewards, second: e.target.value}})} className="w-16 bg-transparent border-b border-[#F59E0B] text-[#F59E0B] text-center focus:outline-none pb-1" />
                                    <span className="text-[#F59E0B] italic text-sm">points</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="text-[#F59E0B] w-36 italic text-sm">Third try:</span>
                                    <input value={quizState.rewards.third} onChange={e => setQuizState({...quizState, rewards: {...quizState.rewards, third: e.target.value}})} className="w-16 bg-transparent border-b border-[#F59E0B] text-[#F59E0B] text-center focus:outline-none pb-1" />
                                    <span className="text-[#F59E0B] italic text-sm">points</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="text-[#F59E0B] w-36 italic text-sm whitespace-nowrap">Fourth Try and more :</span>
                                    <input value={quizState.rewards.fourth} onChange={e => setQuizState({...quizState, rewards: {...quizState.rewards, fourth: e.target.value}})} className="w-16 bg-transparent border-b border-[#F59E0B] text-[#F59E0B] text-center focus:outline-none pb-1" />
                                    <span className="text-[#F59E0B] italic text-sm">points</span>
                                  </div>
                                </div>
                              </div>
                           )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </TabsContent>

            </Tabs>
          </div>

        </div>
      </main>
    </div>
  );
}
