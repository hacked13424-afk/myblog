import PageHero from "./PageHero";

export default function StaticPage({
  title,
  html,
  children,
}: {
  title: string;
  html: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="w-full">
      <PageHero title={title} />
      <div className="glass mx-auto w-full max-w-5xl rounded-3xl px-5 py-8 sm:px-10">
        <div
          className="post-content prose prose-lg dark:prose-invert max-w-none prose-a:text-fuchsia-600 dark:prose-a:text-fuchsia-300"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {children}
      </div>
    </section>
  );
}
