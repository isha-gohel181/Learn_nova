import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import CourseCatalogPage from '@/pages/CourseCatalogPage';
import CourseDetailPage from '@/pages/CourseDetailPage';
import LessonViewerPage from '@/pages/LessonViewerPage';
import QuizTakingPage from '@/pages/QuizTakingPage';
import QuizResultsPage from '@/pages/QuizResultsPage';
import ProgressTrackingPage from '@/pages/ProgressTrackingPage';
import MyReviewsPage from '@/pages/MyReviewsPage';
import SubmitReviewPage from '@/pages/SubmitReviewPage';
import InstructorCoursesPage from '@/pages/InstructorCoursesPage';
import CreateCoursePage from '@/pages/CreateCoursePage';
import EditCoursePage from '@/pages/EditCoursePage';
import { getProfile } from '@/lib/api';

function RoleBasedDashboardRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    let isActive = true;

    async function resolveRole() {
      try {
        const profileResponse = await getProfile();
        const role = profileResponse.data?.role;
        if (!isActive) return;
        navigate(role === 'instructor' ? '/dashboard/instructor' : '/dashboard/learner', { replace: true });
      } catch (error) {
        if (!isActive) return;
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        navigate('/login', { replace: true });
      }
    }

    resolveRole();

    return () => {
      isActive = false;
    };
  }, [navigate]);

  return (
    <main className='min-h-screen bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] flex items-center justify-center text-[#E5E7EB]'>
      Redirecting to your dashboard...
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing – redirect root to the course catalog */}
        <Route path='/' element={<Navigate to='/courses' replace />} />
        <Route path='/courses' element={<CourseCatalogPage />} />
        <Route path='/courses/:id' element={<CourseDetailPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/dashboard' element={<RoleBasedDashboardRedirect />} />
        <Route path='/dashboard/learner' element={<DashboardPage />} />
        <Route path='/dashboard/instructor' element={<DashboardPage />} />

        {/* Progress Tracking — /progress */}
        <Route path='/progress' element={<ProgressTrackingPage />} />

        {/* My Reviews — /my-reviews */}
        <Route path='/my-reviews' element={<MyReviewsPage />} />

        {/* Submit Review — /review/:courseId */}
        <Route path='/review/:courseId' element={<SubmitReviewPage />} />

        {/* Instructor Routes */}
        <Route path='/instructor/my-courses' element={<InstructorCoursesPage />} />
        <Route path='/instructor/course/create' element={<CreateCoursePage />} />
        <Route path='/instructor/course/:id/edit' element={<EditCoursePage />} />

        {/* Lesson Viewer — /learn/:courseId */}
        <Route path='/learn/:courseId' element={<LessonViewerPage />} />

        {/* Quiz Taking — /quiz/:courseId */}
        <Route path='/quiz/:courseId' element={<QuizTakingPage />} />

        {/* Quiz Results — /quiz/results/:courseId */}
        <Route path='/quiz/results/:courseId' element={<QuizResultsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;