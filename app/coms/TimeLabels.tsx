"use client";

type TimeLabelsProps = {
  dataPointCount: number;
};

export default function TimeLabels({ dataPointCount }: TimeLabelsProps) {
  // Calculate times for each data point (30 minutes apart)
  const now = new Date();
  const timeLabels = Array.from({ length: dataPointCount }, (_, index) => {
    const minutesAgo = (dataPointCount - 1 - index) * 30;
    const time = new Date(now.getTime() - minutesAgo * 60000);
    return time.toLocaleTimeString(undefined, { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true,
      timeZoneName: 'short'
    });
  });

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
