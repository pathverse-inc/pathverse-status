type Issue = {
  id?: number;
  type: "warning" | "error" | "info";
  message: string;
  down?: boolean;
};

type IssueAlertProps = {
  issue: Issue;
  index: number;
};

export default function IssueAlert({ issue, index }: IssueAlertProps) {
  const styles = {
    warning: "bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-100",
    error: "bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100",
    info: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100"
  };
  
  const icons = {
    warning: "⚠️",
    error: "❌",
    info: "ℹ️"
  };

  return (
    <div 
      key={issue.id || index}
      className={`border rounded-lg p-4 flex items-start gap-3 ${styles[issue.type]}`}
    >
      <span className="text-xl">{icons[issue.type]}</span>
      <p className="flex-1">{issue.message}</p>
    </div>
  );
}
