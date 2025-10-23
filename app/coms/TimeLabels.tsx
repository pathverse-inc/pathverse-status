"use client";

import { useEffect, useState } from "react";

type TimeLabelsProps = {
  dataPointCount: number;
};

export default function TimeLabels({ dataPointCount }: TimeLabelsProps) {
  const [timeLabels, setTimeLabels] = useState<string[]>([]);

  useEffect(() => {
    // Calculate times for each data point (30 minutes apart)
    const now = new Date();
    const labels = Array.from({ length: dataPointCount }, (_, index) => {
      const minutesAgo = (dataPointCount - 1 - index) * 30;
      const time = new Date(now.getTime() - minutesAgo * 60000);
      return time.toLocaleTimeString(undefined, { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true,
        timeZoneName: 'short'
      });
    });
    setTimeLabels(labels);
  }, [dataPointCount]);

  if (timeLabels.length === 0) {
    // Return placeholder with same structure to prevent layout shift
    return (
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 pl-10">
        {Array.from({ length: dataPointCount }).map((_, index) => (
          <span key={index} className="text-center invisible" style={{ width: `${100 / dataPointCount}%` }}>
            Loading...
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 pl-10">
      {timeLabels.map((time, index) => (
        <span key={index} className="text-center" style={{ width: `${100 / timeLabels.length}%` }}>
          {time}
        </span>
      ))}
    </div>
  );
}
