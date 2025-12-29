import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header.jsx";
import StatCard from "../components/StatCard.jsx";
import TopicCard from "../components/TopicCard.jsx";
import TopicCardSkeleton from "../components/TopicCardSkeleton.jsx";
import TopicFilterBar from "../components/TopicFilterBar.jsx";
import topicService from "../services/topic.service";
import exerciseService from "../services/exercise.service";
import userService from "../services/user.service";
import practiceSessionService from "../services/practiceSession.service";
import { toast } from "react-toastify";

function DashboardPage() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [user, setUser] = useState({});
  const [stats, setStats] = useState({
    currentStreak: 0,
    totalPracticeSeconds: 0,
    averageScore: 0
  });
  const [filters, setFilters] = useState({ search: '', level: 'all' });

  const LimitTopic = 9;

  // Initial Load & Stats
  useEffect(() => {
    // Load user from local storage
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(storedUser);

    // Fetch User Stats
    const fetchStats = async () => {
      try {
        const data = await userService.getUserStats();
        if (data && data.data) {
          setStats(data.data);
        }
      } catch (error) {
        console.error("Failed to load stats:", error);
      }
    };

    fetchStats();
    // fetchTopics called by filter effect below
  }, []);

  // Filter Change Effect
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchTopics(1, false, filters);
  }, [filters]);

  // Fetch Topics
  // Note: We pass filters explicitly to avoid closure staleness if called from other contexts, 
  // but usually for LoadMore we need the *current* state. 
  // For LoadMore, we'll use the state `filters`.
  const fetchTopics = async (pageNumber = 1, isLoadMore = false, currentFilters = filters) => {
    try {
      if (isLoadMore) setIsLoadingMore(true);
      else setLoading(true);

      const newTopics = await topicService.getAllTopics(pageNumber, LimitTopic, currentFilters);

      if (newTopics.length < LimitTopic) {
        setHasMore(false);
      }

      setTopics((prev) => (isLoadMore ? [...prev, ...newTopics] : newTopics));
    } catch (err) {
      toast.error("Failed to load topics");
      console.error(err);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTopics(nextPage, true, filters);
  };

  const handleSearch = (term) => {
    setFilters(prev => ({ ...prev, search: term }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };


  const handleStartTopic = async (topicId) => {
    try {
      // 1. Get lessons for topic
      const lessons = await topicService.getLessonsByTopic(topicId);

      if (lessons.length === 0) {
        toast.warning("This topic has no lessons yet.");
        return;
      }

      // 2. Get first lesson (Simulate flow)
      const firstLesson = lessons[0];

      // 3. Get exercises for first lesson
      const exercises = await exerciseService.getExercisesByLesson(firstLesson.id);

      if (exercises.length === 0) {
        toast.warning("This lesson has no exercises yet.");
        return;
      }

      // 4. Start Practice Session (Backend)
      let sessionId = null;
      try {
        const sessionData = await practiceSessionService.startSession(topicId);
        // sessionData.data is the session object from controller successResponse
        sessionId = sessionData.data.id;
      } catch (sessionErr) {
        console.error("Failed to create session:", sessionErr);
        toast.error("Could not start session tracking. Practice will not be saved.");
      }

      // 5. Navigate to practice with data
      navigate("/practice", {
        state: {
          topicId,
          lessonId: firstLesson.id,
          exercises,
          sessionId // Pass session ID to PracticePage
        }
      });

    } catch (error) {
      console.error(error);
      toast.error("Failed to start practice session");
    }
  };

  const handleRandomPractice = async () => {
    try {
      setLoading(true); // Reuse loading state or create a new local one
      // Better to use a specific loading state if 'loading' controls the main skeleton
      const randomExercises = await exerciseService.getRandomExercises();

      if (randomExercises.length === 0) {
        toast.warning("No exercises available for random practice.");
        return;
      }

      navigate("/practice", {
        state: {
          exercises: randomExercises,
          sessionId: null // Explicitly untracked
        }
      });
    } catch (error) {
      console.error("Failed to start random practice:", error);
      toast.error("Failed to start random practice");
    } finally {
      setLoading(false);
    }
  };

  // derived stats
  const totalMinutes = Math.round(stats.totalPracticeSeconds / 60);

  return (
    <div className="min-h-screen bg-emerald-100">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {user.role === 'admin' ? (
          // Admin Dashboard
          <>
            <section className="mb-12 space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
                    Admin Dashboard 👑
                  </h1>
                  <p className="text-base text-gray-600">
                    Manage users and exercises for the system
                  </p>
                </div>
              </div>
            </section>

            <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 mb-12">
              <div
                onClick={() => navigate('/admin/users')}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Manage Users</h3>
                    <p className="text-gray-600">View, edit, and manage user accounts</p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => navigate('/admin/exercises')}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Manage Exercises</h3>
                    <p className="text-gray-600">Create, edit, and organize exercises</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Welcome Section */}
            <section className="mb-12 space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
                    Welcome back, {user.fullName || 'Learner'}! 👋
                  </h1>
                  <p className="text-base text-gray-600">
                    Keep practicing and improve your speaking skills
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 w-fit border border-green-100/50 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Day Streak 🔥</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.currentStreak}</p>
                  <p className="text-xs text-green-600 mt-1">Keep it going!</p>
                </div>
              </div>
            </section>

            {/* Stats */}
            <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-12">
              <StatCard
                label="Total Practice"
                value={totalMinutes}
                description="minutes total"
                color="green"
              />
              <StatCard
                label="Average Score"
                value={`${Math.round(stats.averageScore)}%`}
                description="overall performance"
                color="green"
              />
              {/* Temporary Placeholder or another stat if available */}
              <StatCard
                label="Levels"
                value="N/A"
                description="coming soon"
                color="gray"
              />
            </section>

            {/* Topics Section */}
            <section id="progress" className="mb-12 space-y-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Choose a Topic to Practice
                  </h2>
                </div>
              </div>

              <TopicFilterBar
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                currentFilters={filters}
              />

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {topics.map((topic, index) => (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: (index % LimitTopic) * 0.05 }}
                      layout
                    >
                      <TopicCard
                        title={topic.name}
                        percent={topic.progress || 0} // Display real progress or 0
                        color="from-green-500 to-emerald-600"
                        emoji="👋"
                        onClick={() => handleStartTopic(topic.id)}
                        isLoading={false}
                      />
                    </motion.div>
                  ))}
                  {(loading || isLoadingMore) &&
                    Array.from({ length: 3 }).map((_, i) => (
                      <motion.div
                        key={`skeleton-${i}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <TopicCardSkeleton />
                      </motion.div>
                    ))
                  }
                </AnimatePresence>
              </div>

              {/* Load More Button Container */}
              {!loading && hasMore && (
                <div className="relative pt-8 pb-4 flex justify-center">
                  {/* Optional Gradient Mask Hint */}
                  <div className="absolute -top-12 left-0 right-0 h-12 bg-gradient-to-t from-emerald-100/80 to-transparent pointer-events-none" />

                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="group relative px-8 py-3 rounded-full border border-green-500 text-green-700 font-medium 
                               hover:bg-green-600 hover:text-white hover:border-transparent hover:shadow-lg hover:-translate-y-0.5
                               active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center gap-2">
                        Loading...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Load More Topics
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    )}
                  </button>
                </div>
              )}

              {!hasMore && topics.length > 0 && (
                <div className="text-center py-8 text-gray-500 italic text-sm">
                  You have viewed all topics
                </div>
              )}

              {!loading && topics.length === 0 && (
                <div className="text-center py-12 text-gray-500">No topics found.</div>
              )}
            </section>

            {/* Random Practice CTA */}
            <section
              id="challenge"
              className="mt-16 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border border-green-200/50 rounded-2xl p-8 sm:p-12 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Ready for a Challenge?
              </h3>
              <p className="text-base text-gray-600 mb-8 max-w-2xl mx-auto">
                Try our random practice mode to test your skills with sentences
                at your current level.
              </p>
              <button
                onClick={handleRandomPractice}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-3 text-base font-semibold text-white hover:from-green-700 hover:to-emerald-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Loading..." : "Start Random Practice"}
              </button>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;