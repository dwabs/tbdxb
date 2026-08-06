/** Title block shared by the secondary pages, so they can't drift apart. */
export function PageHeader({ title, updated }: { title: string; updated?: string }) {
  return (
    <header className="border-b border-line pb-6">
      <h1 className="text-display font-bold text-ink">{title}</h1>
      {updated ? (
        <p className="mt-3 text-[0.8125rem] text-ink-subtle">Last updated {updated}</p>
      ) : null}
    </header>
  );
}
