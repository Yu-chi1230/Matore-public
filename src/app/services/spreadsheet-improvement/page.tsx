import { ServiceDetail } from "@/components/service-detail";
import { spreadsheetService } from "@/lib/services";
import { pageMetadata } from "@/lib/seo";
import "../service.css";

export const metadata = pageMetadata(spreadsheetService.title, spreadsheetService.description, spreadsheetService.path);

export default function SpreadsheetImprovementPage() {
  return <ServiceDetail service={spreadsheetService} />;
}
