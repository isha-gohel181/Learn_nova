import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
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
        <Route path='/dashboard' element={<DashboardPage />} />

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