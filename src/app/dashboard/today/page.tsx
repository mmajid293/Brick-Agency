import { TodayReport } from "@/components/reports/today-report";
import { PageHeader } from "@/components/easy/page-header";

export const dynamic = "force-dynamic";

export default function TodayReportPage() {
  return (
    <div className="easy-page space-y-6">
      <PageHeader
        title="Today Report"
        titleUr="آج کی رپورٹ"
        hint="Live data from database — refreshes every minute."
        hintUr="ڈیٹابیس سے براہ راست — ہر منٹ اپ ڈیٹ۔"
      />
      <TodayReport />
    </div>
  );
}
