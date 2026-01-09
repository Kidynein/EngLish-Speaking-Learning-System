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
import { useTheme } from "../context/ThemeContext";

function ProgressPage() {
  const { theme } = useTheme();
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

  // Theme-aware chart colors
  const chartColors = theme === 'light' ? {
    primary: '#10b981',      // emerald-500
    secondary: '#34d399',    // emerald-400
    grid: '#e5e7eb',         // gray-200
    axis: '#6b7280',         // gray-500
    tooltipBg: '#ffffff',
    tooltipBorder: '#e5e7eb',
    tooltipText: '#111827',
    polarGrid: '#d1e7dd',
    radarFill: '#10b981',
    cursorFill: 'rgba(16, 185, 129, 0.1)',
  } : {
    primary: '#72fa93',      // brand-primary
    secondary: '#a0e548',    // brand-secondary
    grid: '#334155',         // slate-700
    axis: '#94a3b8',         // slate-400
    tooltipBg: '#1e293b',
    tooltipBorder: '#334155',
    tooltipText: '#f8fafc',
    polarGrid: '#334155',
    radarFill: '#72fa93',
    cursorFill: 'rgba(114, 250, 147, 0.1)',
  };

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const responseData = await userService.getUserProgress();
        console.log('[DEBUG] Progress API Response:', responseData);
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
    if (!weeklyData || weeklyData.length === 0) return [];

    return weeklyData.map(item => ({
      day: item.date ? format(parseISO(item.date), 'EEE') : 'N/A',
      score: Number(item.avg_score)
    }));
  };

  const formatMonthlyData = (monthlyData) => {
    if (!monthlyData) return [];
    return monthlyData.map(item => ({
      week: `Week ${item.week_num}`,
      minutes: Number(item.minutes),
      sessions: Number(item.sessions)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-xl text-brand-primary font-semibold">Loading your progress...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-xl text-red-400 font-semibold">{error}</div>
      </div>
    );
  }

  const { weekly, topics, skills, monthly, summary } = data;
  const formattedWeekly = formatWeeklyData(weekly);
  const formattedMonthly = formatMonthlyData(monthly);

  return (
    <div className="min-h-screen bg-slate-900">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">My Progress</h1>
          <p className="text-slate-400">Track your improvement over time</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Total Minutes</h3>
            <div className="text-3xl font-bold text-brand-primary">{summary.totalMinutes}</div>
            <p className="text-xs text-slate-500 mt-2">All time practice</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Sessions</h3>
            <div className="text-3xl font-bold text-brand-primary">{summary.totalSessions}</div>
            <p className="text-xs text-slate-500 mt-2">Total sessions completed</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Average Score</h3>
            <div className="text-3xl font-bold text-brand-secondary">{summary.avgScore}%</div>
            <p className="text-xs text-slate-500 mt-2">Global average</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Streak</h3>
            <div className="text-3xl font-bold text-brand-tertiary">{summary.streak}</div>
            <p className="text-xs text-slate-500 mt-2">Days in a row</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Weekly Performance */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-4">Weekly Performance</h3>
            {formattedWeekly.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formattedWeekly}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="day" stroke={chartColors.axis} />
                  <YAxis domain={[0, 100]} stroke={chartColors.axis} />
                  <Tooltip
                    contentStyle={{ backgroundColor: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: '8px' }}
                    labelStyle={{ color: chartColors.tooltipText }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke={chartColors.primary}
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                No data for this week
              </div>
            )}
          </div>

          {/* Topic Performance */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-4">Topic Performance</h3>
            {topics.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topics}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis
                    dataKey="topic"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    stroke={chartColors.axis}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke={chartColors.axis}
                  />
                  <Tooltip
                    cursor={{ fill: chartColors.cursorFill }}
                    formatter={(value) => [Number(value).toFixed(2), "Score"]}
                    contentStyle={{ backgroundColor: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: '8px' }}
                  />
                  <Bar
                    dataKey="score"
                    fill={chartColors.primary}
                    radius={[4, 4, 0, 0]}
                    name="Score"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                No topic data yet
              </div>
            )}
          </div>

          {/* Skills Radar */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-4">Skills Breakdown</h3>
            {skills.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skills}>
                  <PolarGrid gridType="polygon" stroke={chartColors.polarGrid} />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fill: chartColors.primary, fontSize: 13, fontWeight: '600', dy: 4 }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke={chartColors.axis} tick={false} axisLine={false} />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke={chartColors.radarFill}
                    strokeWidth={2}
                    fill={chartColors.radarFill}
                    fillOpacity={0.3}
                  />
                  <Tooltip
                    formatter={(value) => [Number(value).toFixed(2), "Score"]}
                    contentStyle={{ backgroundColor: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: '8px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                No skills data yet
              </div>
            )}
          </div>

          {/* Monthly Activity */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-4">Monthly Activity</h3>
            {formattedMonthly.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={formattedMonthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="week" stroke={chartColors.axis} />
                  <YAxis yAxisId="left" stroke={chartColors.axis} label={{ value: 'Mins', angle: -90, position: 'insideLeft', fill: chartColors.axis }} />
                  <YAxis yAxisId="right" orientation="right" stroke={chartColors.axis} label={{ value: 'Sessions', angle: 90, position: 'insideRight', fill: chartColors.axis }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="minutes"
                    fill={chartColors.primary}
                    name="Minutes"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="sessions"
                    fill={chartColors.secondary}
                    name="Sessions"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                No activity this month
              </div>
            )}
          </div>
        </div>

        {/* Detailed Topic Performance */}
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 shadow-sm">
          <h3 className="text-lg font-semibold text-white mb-6">Detailed Topic Analysis</h3>
          {topics.length > 0 ? (
            <div className="space-y-4">
              {topics.map((topic) => (
                <div key={topic.topic} className="flex items-center justify-between">
                  <span className="text-white font-medium">{topic.topic}</span>
                  <div className="flex items-center gap-4 flex-1 ml-4">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-primary rounded-full transition-all"
                        style={{ width: `${Number(topic.score)}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-semibold min-w-12 text-right">
                      {Math.round(Number(topic.score))}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-500">No detailed analysis available</div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ProgressPage;