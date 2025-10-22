import statusData from "@/public/status.json";
import issuesData from "@/public/issues.json";
import IssueAlert from "./coms/IssueAlert";
import ServiceChart from "./coms/ServiceChart";

type Issue = {
  id?: number;
  type: "warning" | "error" | "info";
  message: string;
  down?: boolean;
};

export default function Home() {
  const services = Object.entries(statusData) as [string, number[]][];
  const issues = issuesData as Issue[];
  
  // Separate issues into top (general) and bottom (down-related)
  const topIssues = issues.filter(issue => !issue.down);
  const downIssues = issues.filter(issue => issue.down);

  return (
    <div className="font-sans min-h-screen p-8 pb-20 sm:p-20">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Pathverse Service Status</h1>
        
        {/* Top Issues Section */}
        {topIssues.length > 0 && (
          <div className="mb-8 space-y-3">
            {topIssues.map((issue, index) => (
              <IssueAlert key={issue.id || index} issue={issue} index={index} />
            ))}
          </div>
        )}
        
        <div className="grid gap-6 md:grid-cols-2">
          {services.map(([serviceName, uptimeData]) => (
            <ServiceChart 
              key={serviceName} 
              serviceName={serviceName} 
              uptimeData={uptimeData} 
            />
          ))}
        </div>
        
        {/* Down Issues Section - Below status charts */}
        {downIssues.length > 0 && (
          <div className="mt-8 space-y-3">
            {downIssues.map((issue, index) => (
              <IssueAlert key={issue.id || index} issue={issue} index={index} />
            ))}
          </div>
        )}
        
        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Note: Time displayed has a ±30 minutes margin and only serves as a reference.
          </p>
        </footer>
      </main>
    </div>
  );
}
