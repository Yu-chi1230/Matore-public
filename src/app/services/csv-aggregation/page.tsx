import { ServiceDetail } from "@/components/service-detail";
import { csvService } from "@/lib/services";
import { pageMetadata } from "@/lib/seo";
import "../service.css";

export const metadata = pageMetadata(csvService.title, csvService.description, csvService.path);

export default function CsvAggregationPage() {
  return <ServiceDetail service={csvService} />;
}
