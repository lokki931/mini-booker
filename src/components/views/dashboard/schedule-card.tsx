import React from "react";

const WEEKDAYS_MAP: Record<number, string> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  0: "Sun",
};

type StaffSchedule = {
  workStart: string;
  workEnd: string;
  workDays: number[];
};

type Props = {
  schedule: StaffSchedule;
};

export const StaffScheduleCard = ({ schedule }: Props) => {
  const { workStart, workEnd, workDays } = schedule;

  const sortedDays = [...workDays].sort((a, b) => a - b);

  const formattedDays = sortedDays.map((day) => WEEKDAYS_MAP[day]).join(", ");

  const formatTime = (time: string) => time.slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-md hover:shadow">
      <h3 className="text-lg font-semibold mb-2">Schedule:</h3>
      <p className="text-sm">
        🕒 <strong>{formatTime(workStart)}</strong> –{" "}
        <strong>{formatTime(workEnd)}</strong>
      </p>
      <p className="text-sm mt-1">
        📅 <strong>{formattedDays}</strong>
      </p>
    </div>
  );
};
