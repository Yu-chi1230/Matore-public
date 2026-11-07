import { ServiceDetail } from "@/components/service-detail";
import { googleService } from "@/lib/services";
import { pageMetadata } from "@/lib/seo";
import "../service.css";

export const metadata = pageMetadata(googleService.title, googleService.description, googleService.path);

export default function GoogleAutomationPage() {
  return <ServiceDetail service={googleService} />;
}
