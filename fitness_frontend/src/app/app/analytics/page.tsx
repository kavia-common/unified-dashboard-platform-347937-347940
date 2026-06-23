"use client";

import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import { useWorkoutStore } from "@/lib/state/workoutStore";
import { useActivityStore } from "@/lib/state/activityStore";
import { useProgressStore } from "@/lib/state/progressStore";

export default function AnalyticsPage() {
  const { workouts } = useWorkoutStore();
  const { entries } = useActivityStore();
  const { metrics } = useProgressStore();

  const rpeSeries = useMemo(() => {
    // Average RPE per workout date.
    return workouts
      .map((w) => {
        const rpes = w.exercises.map((e) => e.rpe);
        const avg = rpes.length ? rpes.reduce((s, v) => s + v, 0) / rpes.length : 0;
        return { date: w.date, avgRpe: Number(avg.toFixed(2)) };
      })
      .reverse();
  }, [workouts]);

  const stepsSeries = useMemo(() => entries.slice().reverse(), [entries]);

  const weightSeries = useMemo(() => {
    return metrics
      .filter((m) => m.type === "weight")
      .slice()
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .map((m) => ({ date: m.date, weight: m.value }));
  }, [metrics]);

  return (
    <div className="container">
      <div style={{ fontWeight: 900, fontSize: 20 }}>Analytics</div>
      <div className="muted" style={{ marginTop: 6 }}>
        Visualize trends from your logs. (Backend analytics endpoints will replace this later.)
      </div>

      <div className="grid2" style={{ marginTop: 12 }}>
        <div className="card">
          <div className="cardBody" style={{ height: 320 }}>
            <div style={{ fontWeight: 850, marginBottom: 10 }}>Average RPE by workout</div>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={rpeSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="avgRpe" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="cardBody" style={{ height: 320 }}>
            <div style={{ fontWeight: 850, marginBottom: 10 }}>Steps</div>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={stepsSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="steps" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardBody" style={{ height: 320 }}>
          <div style={{ fontWeight: 850, marginBottom: 10 }}>Weight trend</div>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={weightSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
