import Header from "../components/Header.jsx";
import StatCard from "../components/StatCard.jsx";
import TopicCard from "../components/TopicCard.jsx";

function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <section className="mb-12 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
                Welcome back, Sarah! 👋
              </h1>
              <p className="text-base text-gray-600">
                Keep practicing and improve your speaking skills
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 w-fit border border-green-100/50 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Day Streak 🔥</p>
              <p className="text-3xl font-bold text-green-600 mt-2">7</p>
              <p className="text-xs text-green-600 mt-1">Keep it going!</p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          <StatCard
            label="Total Practice"
            value="142"
            description="minutes this week"
            color="green"
          />
          <StatCard
            label="Topics Completed"
            value="4"
            description="out of 6"
            color="green"
          />
          <StatCard
            label="Average Score"
            value="78%"
            description="and improving"
            color="green"
          />
        </section>

        {/* Topics Section */}
        <section id="progress" className="mb-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Choose a Topic to Practice
              </h2>
            </div>
            
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <TopicCard
              title="Greetings"
              percent={85}
              emoji="👋"
              color="from-blue-400 to-blue-600"
            />
            <TopicCard
              title="Self-Introduction"
              percent={60}
              emoji="🎤"
              color="from-purple-400 to-purple-600"
            />
            <TopicCard
              title="Work & Career"
              percent={45}
              emoji="💼"
              color="from-green-400 to-green-600"
            />
            <TopicCard
              title="Travel"
              percent={30}
              emoji="✈️"
              color="from-orange-400 to-orange-600"
            />
            <TopicCard
              title="Shopping"
              percent={15}
              emoji="🛍️"
              color="from-pink-400 to-pink-600"
            />
            <TopicCard
              title="Dining"
              percent={70}
              emoji="🍽️"
              color="from-indigo-400 to-indigo-600"
            />
          </div>
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
          <button className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-3 text-base font-semibold text-white hover:from-green-700 hover:to-emerald-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl">
            Start Random Practice
          </button>
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;