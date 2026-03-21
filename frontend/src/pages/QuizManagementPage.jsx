import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getQuizByCourse, createQuiz, updateQuiz, publishQuiz, getCourseById } from '@/lib/api';

export default function QuizManagementPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [quizExists, setQuizExists] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [passingScore, setPassingScore] = useState(60);
  const [rewards, setRewards] = useState({ first: 10, second: 8, third: 5, fourth: 2 });
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswers: [0], points: 1, explanation: '' }
  ]);

  useEffect(() => {
    fetchCourseAndQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function fetchCourseAndQuiz() {
    setLoading(true);
    try {
      const courseRes = await getCourseById(courseId);
      setCourse(courseRes.data);

      try {
        const quizRes = await getQuizByCourse(courseId);
        if (quizRes.data) {
          const q = quizRes.data;
          setQuizExists(true);
          setIsPublished(q.isPublished);
          setPassingScore(q.passingScore);
          setRewards(q.rewards);
          setQuestions(q.questions.length ? q.questions : questions);
        }
      } catch (err) {
        // Quiz might not exist yet, APIs usually return 404 for this. That's fine.
        console.log("Quiz not found or error:", err);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch course data');
    } finally {
      setLoading(false);
    }
  }

  function handleAddQuestion() {
    setQuestions([
      ...questions,
      { questionText: '', options: ['', '', '', ''], correctAnswers: [0], points: 1, explanation: '' }
    ]);
  }

  function handleRemoveQuestion(index) {
    if (questions.length === 1) return; // Prevent removing last question
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  }

  function handleQuestionChange(index, field, value) {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  }

  function handleOptionChange(qIndex, optIndex, value) {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  }

  function toggleCorrectAnswer(qIndex, optIndex) {
    const updated = [...questions];
    const currentAnswers = updated[qIndex].correctAnswers;
    
    // Simplification for UI: We only support single correct answer per question easily in this UI for now,
    // although backend supports multiple. Let's force single select for simplicity, or toggle behavior.
    updated[qIndex].correctAnswers = [optIndex];
    setQuestions(updated);
  }

  async function handleSaveQuiz(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    // Payload validation
    if (questions.some(q => !q.questionText || q.options.some(opt => !opt))) {
      setError('Please fill out all question text and all their options.');
      setSaving(false);
      return;
    }

    const payload = {
      courseId,
      passingScore,
      rewards,
      questions
    };

    try {
      if (quizExists) {
        await updateQuiz(courseId, payload);
        setSuccessMsg('Quiz updated successfully!');
      } else {
        await createQuiz(payload);
        setQuizExists(true);
        setSuccessMsg('Quiz created successfully!');
      }
    } catch (err) {
      setError(err.message || 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublishToggle() {
    if (!quizExists) return;
    try {
      const newState = !isPublished;
      await publishQuiz(courseId, newState);
      setIsPublished(newState);
      setSuccessMsg(`Quiz ${newState ? 'published' : 'unpublished'} successfully!`);
    } catch (err) {
      setError(err.message || 'Failed to change publish status');
    }
  }

  if (loading) {
    return (
      <main className='min-h-screen bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] p-6 text-[#E5E7EB]'>
        <div className='mx-auto max-w-5xl'>Loading quiz configurator...</div>
      </main>
    );
  }

  return (
    <main className='relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] p-4 sm:p-8'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.1),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_center,rgba(139,92,246,0.1),transparent_55%)]' />

      <section className='relative mx-auto max-w-4xl space-y-6'>
        <Card className='border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.06)] text-[#E5E7EB] shadow-[0_0_36px_rgba(59,130,246,0.25)] backdrop-blur-xl'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <div>
              <CardTitle className='text-2xl'>Quiz Management</CardTitle>
              <CardDescription className='text-[#9CA3AF]'>
                {course ? `Build the quiz for: ${course.title}` : 'Configure quiz parameters and questions'}
              </CardDescription>
            </div>
            <div className='flex gap-2 items-center'>
              {quizExists && (
                <div className='flex items-center gap-2 mr-4 border-r border-[rgba(255,255,255,0.1)] pr-4'>
                  <Label htmlFor='publish-quiz' className='text-sm text-white cursor-pointer'>
                    {isPublished ? 'Published' : 'Draft'}
                  </Label>
                  <Switch 
                    id='publish-quiz'
                    checked={isPublished} 
                    onCheckedChange={handlePublishToggle}
                    className='data-[state=checked]:bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)]'
                  />
                </div>
              )}
              <Link to='/instructor/my-courses'>
                <Button variant='outline' className='border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-white hover:bg-[rgba(255,255,255,0.1)]'>
                  Back
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>

        {error && (
          <Alert variant='destructive' className='border-[rgba(239,68,68,0.5)] bg-[rgba(239,68,68,0.1)] text-red-100'>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMsg && (
          <Alert className='border-[rgba(34,197,94,0.5)] bg-[rgba(34,197,94,0.1)] text-green-100'>
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{successMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSaveQuiz} className='space-y-6'>
          {/* General Settings */}
          <Card className='border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] backdrop-blur-md'>
            <CardHeader>
              <CardTitle className='text-lg text-white'>General Settings</CardTitle>
            </CardHeader>
            <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='passingScore' className='text-white'>Passing Score (%)</Label>
                <Input 
                  id='passingScore'
                  type='number' min='1' max='100'
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  className='border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)] text-white focus:border-[#3B82F6]'
                  required
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label className='text-white'>1st Try Reward</Label>
                  <Input 
                    type='number' min='0'
                    value={rewards.first}
                    onChange={(e) => setRewards({...rewards, first: Number(e.target.value)})}
                    className='border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)] text-white focus:border-[#3B82F6]'
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-white'>2nd Try Reward</Label>
                  <Input 
                    type='number' min='0'
                    value={rewards.second}
                    onChange={(e) => setRewards({...rewards, second: Number(e.target.value)})}
                    className='border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)] text-white focus:border-[#3B82F6]'
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-white'>3rd Try Reward</Label>
                  <Input 
                    type='number' min='0'
                    value={rewards.third}
                    onChange={(e) => setRewards({...rewards, third: Number(e.target.value)})}
                    className='border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)] text-white focus:border-[#3B82F6]'
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-white'>4th Try Reward</Label>
                  <Input 
                    type='number' min='0'
                    value={rewards.fourth}
                    onChange={(e) => setRewards({...rewards, fourth: Number(e.target.value)})}
                    className='border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)] text-white focus:border-[#3B82F6]'
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-white'>Questions</h3>
              <Button type='button' onClick={handleAddQuestion} size='sm' className='bg-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.2)]'>
                + Add Question
              </Button>
            </div>

            {questions.map((q, qIndex) => (
              <Card key={qIndex} className='relative border border-[rgba(59,130,246,0.2)] bg-[rgba(255,255,255,0.04)] backdrop-blur-md'>
                {questions.length > 1 && (
                  <Button 
                    type='button' variant='ghost' size='sm' 
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className='absolute top-2 right-2 text-[#9CA3AF] hover:bg-[rgba(239,68,68,0.2)] hover:text-red-400'
                  >
                    Remove
                  </Button>
                )}
                <CardHeader className='pb-3'>
                  <CardTitle className='text-md text-[#22D3EE]'>Question {qIndex + 1}</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <Label className='text-white'>Question Text</Label>
                    <Input 
                      value={q.questionText}
                      onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                      placeholder='e.g. What is React?'
                      required
                      className='border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)] text-white focus:border-[#3B82F6]'
                    />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex} className='flex items-center gap-3 bg-[rgba(0,0,0,0.2)] p-2 rounded-md border border-[rgba(255,255,255,0.05)]'>
                        <div className='flex items-center justify-center'>
                          <input 
                            type='radio' 
                            name={`correct-${qIndex}`} 
                            checked={q.correctAnswers.includes(optIndex)}
                            onChange={() => toggleCorrectAnswer(qIndex, optIndex)}
                            className='h-4 w-4 cursor-pointer accent-[#3B82F6]'
                          />
                        </div>
                        <Input 
                          value={opt}
                          onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                          placeholder={`Option ${optIndex + 1}`}
                          required
                          className='h-8 bg-transparent border-0 ring-0 focus-visible:ring-0 px-1 text-sm text-white'
                        />
                      </div>
                    ))}
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-2'>
                    <div className='space-y-2'>
                      <Label className='text-white'>Points for this question</Label>
                      <Input 
                        type='number' min='1'
                        value={q.points}
                        onChange={(e) => handleQuestionChange(qIndex, 'points', Number(e.target.value))}
                        required
                        className='border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)] text-white focus:border-[#3B82F6]'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-white'>Explanation (Optional)</Label>
                      <Input 
                        value={q.explanation}
                        onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                        placeholder='Why is this correct?'
                        className='border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)] text-white focus:border-[#3B82F6]'
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className='border border-transparent bg-transparent shadow-none'>
            <CardFooter className='px-0 justify-end border-t-0 bg-transparent'>
              <Button type='submit' disabled={saving} className='bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] text-white px-8 py-6 text-lg tracking-wide hover:opacity-90'>
                {saving ? 'Saving...' : (quizExists ? 'Update Quiz' : 'Create Quiz')}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </section>
    </main>
  );
}
