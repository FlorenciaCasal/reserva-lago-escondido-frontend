import NewsEditForm from "@/components/admin/news/NewsEditForm";
import { getAuthInfo } from "@/lib/auth";

export default async function CreateNewsPage() {
  const { isAdmin } = await getAuthInfo();

  return <NewsEditForm isAdmin={isAdmin} />;
}
