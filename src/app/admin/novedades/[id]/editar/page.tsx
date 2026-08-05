import NewsEditForm from "@/components/admin/news/NewsEditForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditNewsPage({ params }: Props) {
  const { id } = await params;
  return <NewsEditForm newsId={id} />;
}
