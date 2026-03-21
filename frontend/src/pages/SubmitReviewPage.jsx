import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { getCourseById, getMyReviews, submitReview, updateReview } from '@/lib/api';
import { ArrowLeft, Star, CheckCircle, Save } from 'lucide-react';

export default function SubmitReviewPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  const [course, setCourse] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      setLoading(true);
      setError('');

      try {
        // Fetch course info
        const courseRes = await getCourseById(courseId);
        setCourse(courseRes.data);

        // Fetch user reviews to check if they already reviewed this course
        const reviewsRes = await getMyReviews(1, 100);
        const myReviews = reviewsRes.data || [];
        
        const review = myReviews.find(r => r.courseId?._id === courseId || r.courseId === courseId);
        if (review) {
          setExistingReview(review);
          setRating(review.rating);
          setComment(review.comment || '');
        }
      } catch (err) {
        setError(err.message || 'Failed to load review data');
      } finally {
        setLoading(false);
      }
    }

    if (courseId) loadData();
  }, [courseId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (rating === 0) {
      setError('Please select a star rating between 1 and 5.');
      return;
    }

    setSubmitting(true);

    try {
      if (existingReview) {
        // Edit existing
        await updateReview(existingReview._id, { rating, comment });
        setSuccess(true);
      } else {
        // Create new
        const res = await submitReview({ courseId, rating, comment });
        setExistingReview(res.data);
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className='min-h-screen bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] p-6 text-[#E5E7EB] flex items-center justify-center font-sans'>
        <div className='flex flex-col items-center gap-4'>
          <div className='h-8 w-8 animate-spin rounded-full border-4 border-[#3B82F6] border-t-transparent'></div>
          <p className='text-[#9CA3AF] animate-pulse'>Loading review studio...</p>
        </div>
      </main>
    );
  }

  return (
    <main className='relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] p-4 sm:p-8 flex items-center justify-center'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.2),transparent_40%),radial-gradient(circle_at_center,rgba(139,92,246,0.12),transparent_55%)]' />

      <section className='relative w-full max-w-2xl space-y-6'>
        <div className='mb-2'>
          <Link to='/my-reviews'>
            <Button variant='ghost' className='text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.1)] gap-2'>
              <ArrowLeft className='w-4 h-4' />
              Back to My Reviews
            </Button>
          </Link>
        </div>

        <Card className='border border-[rgba(59,130,246,0.5)] bg-[rgba(255,255,255,0.06)] backdrop-blur-2xl shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden relative'>
          <div className='absolute top-0 left-0 w-full h-1 bg-[linear-gradient(90deg,#3B82F6,#8B5CF6,#EC4899)]' />
          
          <CardHeader className='pb-4 border-b border-[rgba(255,255,255,0.05)] text-center'>
            <div className='mx-auto bg-[rgba(139,92,246,0.15)] ring-1 ring-[#8B5CF6]/40 p-3 rounded-full mb-4 inline-flex'>
              <Star className='w-8 h-8 text-[#A78BFA]' />
            </div>
            <CardTitle className='text-2xl text-[#E5E7EB] font-bold'>
              {existingReview ? 'Update Your Review' : 'Rate this Course'}
            </CardTitle>
            <CardDescription className='text-[#9CA3AF] text-base mt-2'>
              {course ? <span className='text-white font-medium'>"{course.title}"</span> : 'Loading course...'}
            </CardDescription>
          </CardHeader>

          <CardContent className='pt-8 space-y-8'>
            {error && (
              <Alert variant='destructive' className='bg-[rgba(220,38,38,0.1)] border-red-500/50 text-red-200'>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className='bg-[rgba(16,185,129,0.1)] border-emerald-500/50 text-emerald-200'>
                <CheckCircle className='w-5 h-5 text-emerald-400 mr-2 inline-block' />
                <AlertTitle className='inline font-bold'>Success</AlertTitle>
                <AlertDescription className='mt-2'>Your review has been successfully {existingReview ? 'updated' : 'submitted'}. Thank you for your feedback!</AlertDescription>
              </Alert>
            )}

            <form id='review-form' onSubmit={handleSubmit} className='space-y-8'>
              <div className='flex flex-col items-center justify-center space-y-4'>
                <label className='text-[#D1D5DB] font-medium text-lg'>Overall Rating</label>
                <div className='flex items-center gap-3'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type='button'
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className='focus:outline-none transition-transform hover:scale-125'
                    >
                      <Star
                        className={`w-10 h-10 transition-colors duration-200 ${
                          (hoverRating || rating) >= star
                            ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]'
                            : 'text-[rgba(255,255,255,0.2)]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className='h-6 text-sm font-medium text-yellow-400/80 uppercase tracking-widest'>
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hoverRating || rating]}
                </div>
              </div>

              <div className='space-y-3 relative'>
                <label className='text-[#D1D5DB] font-medium text-lg flex justify-between items-center'>
                  <span>Written Review</span>
                  <span className='text-xs text-[#6B7280] font-normal'>Optional</span>
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder='What did you enjoy most about this course? How can it improve?'
                  className='min-h-[140px] resize-y bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] focus:border-[#3B82F6] focus:ring focus:ring-[rgba(59,130,246,0.2)] text-[#E5E7EB] placeholder:text-[#6B7280]'
                />
              </div>
            </form>
          </CardContent>

          <CardFooter className='bg-[rgba(255,255,255,0.02)] border-t border-[rgba(255,255,255,0.05)] p-6 pt-5'>
            <Button
              type='submit'
              form='review-form'
              disabled={submitting}
              className='w-full bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] hover:opacity-90 text-white font-medium py-6 text-lg transition-transform hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.4)]'
            >
              <Save className='w-5 h-5 mr-2' />
              {submitting ? 'Saving...' : existingReview ? 'Update Review' : 'Submit Review'}
            </Button>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
