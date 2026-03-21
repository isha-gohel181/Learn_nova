import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { getMyReviews } from '@/lib/api';
import { ArrowLeft, Star, Edit3, MessageSquareText } from 'lucide-react';

export default function MyReviewsPage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadReviews() {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await getMyReviews(1, 50); // Fetch up to 50 reviews
        setReviews(response.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, [navigate]);

  if (loading) {
    return (
      <main className='min-h-screen bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] p-6 text-[#E5E7EB]'>
        <div className='mx-auto max-w-6xl'>Loading your reviews...</div>
      </main>
    );
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <main className='relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] p-4 sm:p-8'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.2),transparent_40%),radial-gradient(circle_at_center,rgba(139,92,246,0.12),transparent_55%)]' />

      <section className='relative mx-auto max-w-6xl space-y-6'>
        <div className='flex items-center gap-4 mb-8'>
          <Link to='/dashboard'>
            <Button variant='outline' className='border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.08)]'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Dashboard
            </Button>
          </Link>
          <div>
            <h1 className='text-3xl font-bold bg-clip-text text-transparent bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)]'>
              My Reviews
            </h1>
            <p className='text-[#9CA3AF] mt-1'>View and manage your feedback on completed courses</p>
          </div>
        </div>

        {error && (
          <Alert variant='destructive' className='bg-[rgba(220,38,38,0.1)] border-red-500/50 text-red-200'>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className='grid grid-cols-1 gap-6 md:grid-cols-3 mb-8'>
          <Card className='border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.06)] backdrop-blur-xl'>
            <CardHeader className='pb-2'>
              <CardDescription className='text-[#9CA3AF] flex items-center gap-2'>
                <MessageSquareText className='w-4 h-4 text-blue-400' />
                Total Reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold text-[#E5E7EB]'>{reviews.length}</div>
            </CardContent>
          </Card>
          
          <Card className='border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.06)] backdrop-blur-xl'>
            <CardHeader className='pb-2'>
              <CardDescription className='text-[#9CA3AF] flex items-center gap-2'>
                <Star className='w-4 h-4 text-yellow-400' />
                Average Rating Given
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold text-[#E5E7EB]'>{averageRating}</div>
            </CardContent>
          </Card>
        </div>

        <Card className='border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.06)] backdrop-blur-xl mt-8'>
          <CardHeader>
            <CardTitle className='text-xl text-[#E5E7EB]'>Your Submitted Reviews</CardTitle>
            <CardDescription className='text-[#9CA3AF]'>Feedback you've left for instructors and fellow learners</CardDescription>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <div className='text-center py-12 bg-[rgba(255,255,255,0.02)] rounded-lg border border-[rgba(255,255,255,0.05)]'>
                <Star className='w-12 h-12 text-[#4B5563] mx-auto mb-4 opacity-50' />
                <p className='text-[#9CA3AF] text-lg'>You haven't submitted any reviews yet.</p>
                <p className='text-[#6B7280] text-sm mt-2'>Complete courses and share your experiences to help others!</p>
                <Link to='/progress'>
                  <Button className='mt-6 bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] hover:opacity-90'>
                    View Completed Courses
                  </Button>
                </Link>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className='rounded-xl border border-[rgba(59,130,246,0.2)] bg-[rgba(255,255,255,0.03)] p-5 transition-all hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(139,92,246,0.4)] flex flex-col justify-between group h-full'
                  >
                    <div>
                      <div className='flex justify-between items-start mb-4'>
                        <div className='flex flex-col gap-1'>
                          <span className='text-xs font-semibold text-purple-400 tracking-wider uppercase'>
                            Course Review
                          </span>
                          <h3 className='font-bold text-lg text-[#E5E7EB] line-clamp-1'>
                            {review.courseId?.title || 'Unknown Course'}
                          </h3>
                        </div>
                        <Badge className='bg-[rgba(234,179,8,0.1)] text-yellow-400 border-yellow-500/30 flex items-center gap-1 backdrop-blur-md px-2.5 py-1'>
                          <Star className='w-3.5 h-3.5 fill-current' />
                          <span className='font-bold'>{review.rating}</span>
                        </Badge>
                      </div>

                      <div className='relative mb-6'>
                        <MessageSquareText className='w-5 h-5 absolute top-0 -left-6 text-[rgba(255,255,255,0.1)]' />
                        <p className='text-[#9CA3AF] text-sm italic min-h-[40px]'>
                          {review.comment ? `"${review.comment}"` : 'No comment provided.'}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center justify-between mt-auto pt-4 border-t border-[rgba(255,255,255,0.05)]'>
                      <span className='text-xs text-[#6B7280]'>
                        Posted on {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                      <Link to={`/review/${review.courseId?._id}`}>
                        <Button size='sm' variant='ghost' className='text-[#22D3EE] hover:bg-[rgba(34,211,238,0.1)] hover:text-[#22D3EE] gap-1.5 h-8'>
                          <Edit3 className='w-3.5 h-3.5' /> Edit
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
