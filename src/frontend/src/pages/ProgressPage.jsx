import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

function ProgressPage() {
  const userName = "Sarah";

  const weeklyData = [
    { day: "Mon", score: 72 },
    { day: "Tue", score: 78 },
    { day: "Wed", score: 81 },
    { day: "Thu", score: 75 },
    { day: "Fri", score: 85 },
    { day: "Sat", score: 88 },
    { day: "Sun", score: 82 },
  ];

  const topicPerformance = [
    { topic: "Greetings", score: 85 },
    { topic: "Intro", score: 78 },
    { topic: "Work", score: 65 },
    { topic: "Travel", score: 72 },
    { topic: "Shopping", score: 70 },
    { topic: "Dining", score: 80 },
  ];

  const radarData = [
    { skill: "Pronunciation", value: 78 },
    { skill: "Fluency", value: 82 },
    { skill: "Confidence", value: 75 },
    { skill: "Vocabulary", value: 70 },
    { skill: "Grammar", value: 73 },
  ];

  const monthlyStats = [
    { week: "Week 1", minutes: 120, sessions: 15 },
    { week: "Week 2", minutes: 150, sessions: 18 },
    { week: "Week 3", minutes: 180, sessions: 22 },
    { week: "Week 4", minutes: 200, sessions: 25 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Progress</h1>
          <p className="text-gray-600">Track your improvement over time</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Minutes</h3>
            <div className="text-3xl font-bold text-green-600">650</div>
            <p className="text-xs text-gray-500 mt-2">+50 min this week</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Sessions</h3>
            <div className="text-3xl font-bold text-green-600">80</div>
            <p className="text-xs text-gray-500 mt-2">Average 12 per week</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Average Score</h3>
            <div className="text-3xl font-bold text-green-600">80%</div>
            <p className="text-xs text-gray-500 mt-2">+5% from last month</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Streak</h3>
            <div className="text-3xl font-bold text-green-600">15</div>
            <p className="text-xs text-gray-500 mt-2">Days in a row</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Weekly Performance */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis domain={[0, 100]} stroke="#6b7280" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Topic Performance */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Topic Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topicPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="topic" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                  stroke="#6b7280" 
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="#6b7280" 
                />
                <Tooltip />
                <Bar 
                  dataKey="score" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Skills Radar */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="skill" stroke="#6b7280" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Activity */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" stroke="#6b7280" />
                <YAxis yAxisId="left" stroke="#6b7280" />
                <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Bar 
                  yAxisId="left" 
                  dataKey="minutes" 
                  fill="#10b981" 
                  name="Minutes" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="sessions" 
                  fill="#34d399" 
                  name="Sessions" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Topic Performance */}
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Detailed Topic Analysis</h3>
          <div className="space-y-4">
            {topicPerformance.map((topic) => (
              <div key={topic.topic} className="flex items-center justify-between">
                <span className="text-gray-900 font-medium">{topic.topic}</span>
                <div className="flex items-center gap-4 flex-1 ml-4">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${topic.score}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-900 font-semibold min-w-12 text-right">{topic.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProgressPage;