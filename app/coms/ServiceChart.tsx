import TimeLabels from "./TimeLabels";

type ServiceChartProps = {
  serviceName: string;
  uptimeData: number[];
};

export default function ServiceChart({ serviceName, uptimeData }: ServiceChartProps) {
  const currentStatus = uptimeData[uptimeData.length - 1];
  const isUp = currentStatus === 100;
  const isDown = currentStatus === 0;
  const isDegraded = currentStatus > 0 && currentStatus < 100;
  const capitalizedName = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);

  let statusLabel = "Up";
  let statusStyle = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
  
  if (isDown) {
    statusLabel = "Down";
    statusStyle = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
  } else if (isDegraded) {
    statusLabel = "Degraded";
    statusStyle = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
  }

  return (
    <div 
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800"
    >
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-semibold">{capitalizedName}</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyle}`}>
          {statusLabel}
        </span>
      </div>

      <div className="relative mt-2 flex gap-2">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 w-8 text-right pr-2 h-24">
          <span>100</span>
          <span>50</span>
          <span>0</span>
        </div>
        
        {/* Graph */}
        <div className="flex-1 relative">
          <div className="border-l border-b border-gray-300 dark:border-gray-600 h-24">
            <svg className="w-full h-full" viewBox="0 0 200 80">
              {/* Horizontal grid lines */}
              <line x1="0" y1="10" x2="200" y2="10" stroke="currentColor" strokeWidth="0.5" className="text-gray-300 dark:text-gray-700" opacity="0.3" />
              <line x1="0" y1="40" x2="200" y2="40" stroke="currentColor" strokeWidth="0.5" className="text-gray-300 dark:text-gray-700" opacity="0.3" />
              <line x1="0" y1="70" x2="200" y2="70" stroke="currentColor" strokeWidth="0.5" className="text-gray-300 dark:text-gray-700" opacity="0.3" />
              
              {/* Line connecting points */}
              <polyline
                points={uptimeData.map((value, index) => {
                  const x = (index / (uptimeData.length - 1)) * 200;
                  const y = 80 - (value / 100) * 70 - 5;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke={isUp ? "#22c55e" : isDegraded ? "#eab308" : "#ef4444"}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Plot points */}
              {uptimeData.map((value, index) => {
                const x = (index / (uptimeData.length - 1)) * 200;
                const y = 80 - (value / 100) * 70 - 5;
                const isLast = index === uptimeData.length - 1;
                
                const pointColor = value === 100 ? "#22c55e" : value === 0 ? "#ef4444" : "#eab308";
                
                return (
                  <g key={index}>
                    {/* Outer ring for last point */}
                    {isLast && (
                      <circle
                        cx={x}
                        cy={y}
                        r="6"
                        fill="none"
                        stroke={pointColor}
                        strokeWidth="1.5"
                        opacity="0.5"
                      />
                    )}
                    {/* Point */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isLast ? "4" : "3.5"}
                      fill={pointColor}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
          
          {/* X-axis time labels - Client-side component for user's timezone */}
          <TimeLabels dataPointCount={uptimeData.length} />
        </div>
      </div>
    </div>
  );
}
