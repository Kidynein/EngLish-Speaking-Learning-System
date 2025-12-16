import { useState, useEffect } from "react";
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
import userService from "../services/user.service";
import { format, parseISO } from "date-fns";

function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    weekly: [],
    topics: [],
    skills: [],
    monthly: [],
    summary: {
      totalMinutes: 0,
      totalSessions: 0,
      avgScore: 0,
      streak: 0
    }
  });

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const responseData = await userService.getUserProgress();
        console.log('[DEBUG] Progress API Response:', responseData);
        // Assuming the structure matches what we defined in backend:
        // { weekly: [], topics: [], skills: [], monthly: [], summary: {} }
        if (responseData && responseData.data) {
          console.log('[DEBUG] Setting Data State:', responseData.data);
          setData(responseData.data);
        }
      } catch (err) {
        console.error("Failed to fetch progress data:", err);
        setError("Failed to load progress data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  // Format helpers
  const formatWeeklyData = (weeklyData) => {
    // Backend returns { date: '2025-12-15', avg_score: 80 }
    if (!weeklyData || weeklyData.length === 0) return [];

    return weeklyData.map(item => ({
      day: item.date ? format(parseISO(item.date), 'EEE') : 'N/A',
      score: Number(item.avg_score)
    }));
  };

  const formatMonthlyData = (monthlyData) => {
    // We need { week: 'Week 49', minutes: 120, sessions: 5 }
    if (!monthlyData) return [];
    return monthlyData.map(item => ({
      week: `Week ${item.week_num}`,
      minutes: Number(item.minutes),
      sessions: Number(item.sessions)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-100 flex items-center justify-center">
        <div className="text-xl text-emerald-800 font-semibold">Loading your progress...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-emerald-100 flex items-center justify-center">
        <div className="text-xl text-red-600 font-semibold">{error}</div>
      </div>
    );
  }

  const { weekly, topics, skills, monthly, summary } = data;
  const formattedWeekly = formatWeeklyData(weekly);
  const formattedMonthly = formatMonthlyData(monthly);

  return (
    <div className="min-h-screen bg-emerald-100">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Progress</h1>
          <p className="text-gray-600">Track your improvement over time</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-emerald-50 rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Minutes</h3>
            <div className="text-3xl font-bold text-green-600">{summary.totalMinutes}</div>
            <p className="text-xs text-gray-500 mt-2">All time practice</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Sessions</h3>
            <div className="text-3xl font-bold text-green-600">{summary.totalSessions}</div>
            <p className="text-xs text-gray-500 mt-2">Total sessions completed</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Average Score</h3>
            <div className="text-3xl font-bold text-green-600">{summary.avgScore}%</div>
            <p className="text-xs text-gray-500 mt-2">Global average</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Streak</h3>
            <div className="text-3xl font-bold text-green-600">{summary.streak}</div>
            <p className="text-xs text-gray-500 mt-2">Days in a row</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Weekly Performance */}
          <div className="bg-emerald-50 rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h3>
            {formattedWeekly.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formattedWeekly}>
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
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data for this week
              </div>
            )}
          </div>

          {/* Topic Performance */}
          <div className="bg-emerald-50 rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Topic Performance</h3>
            {topics.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="topic"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    stroke="#6b7280"
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#6b7280"
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                    formatter={(value) => [Number(value).toFixed(2), "Score"]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar
                    dataKey="score"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    name="Score"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No topic data yet
              </div>
            )}
          </div>

          {/* Skills Radar */}
          <div className="bg-emerald-50 rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Breakdown</h3>
            {skills.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skills}>
                  <PolarGrid gridType="polygon" stroke="#d1e7dd" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fill: '#166534', fontSize: 13, fontWeight: '600', dy: 4 }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" tick={false} axisLine={false} />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                  <Tooltip
                    formatter={(value) => [Number(value).toFixed(2), "Score"]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No skills data yet
              </div>
            )}
          </div>

          {/* Monthly Activity */}
          <div className="bg-emerald-50 rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Activity</h3>
            {formattedMonthly.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={formattedMonthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="week" stroke="#6b7280" />
                  <YAxis yAxisId="left" stroke="#6b7280" label={{ value: 'Mins', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" label={{ value: 'Sessions', angle: 90, position: 'insideRight' }} />
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
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No activity this month
              </div>
            )}
          </div>
        </div>

        {/* Detailed Topic Performance */}
        <div className="bg-emerald-50 rounded-xl p-8 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Detailed Topic Analysis</h3>
          {topics.length > 0 ? (
            <div className="space-y-4">
              {topics.map((topic) => (
                <div key={topic.topic} className="flex items-center justify-between">
                  <span className="text-gray-900 font-medium">{topic.topic}</span>
                  <div className="flex items-center gap-4 flex-1 ml-4">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${Number(topic.score)}%` }} // Ensure number
                      ></div>
                    </div>
                    <span className="text-gray-900 font-semibold min-w-12 text-right">
                      {Math.round(Number(topic.score))}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">No detailed analysis available</div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ProgressPage;