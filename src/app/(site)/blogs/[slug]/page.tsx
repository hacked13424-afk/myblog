import PostView, { postMetadata } from "@/components/PostView";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return postMetadata(decodeURIComponent(slug), "blogs");
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  return <PostView slug={decodeURIComponent(slug)} section="blogs" />;
}
