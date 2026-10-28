import { SiteButtonLink } from "@/components/site/site-button";

export default function NotFound() {
  return (
    <section className="container-page flex flex-col items-center py-32 text-center">
      <p className="font-display text-8xl font-bold text-mist-strong">404</p>
      <h1 className="mt-6 font-display text-3xl font-bold text-ink">This frame is missing</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-body">The page you are looking for has moved or never existed.</p>
      <SiteButtonLink href="/" className="mt-10">
        Back home
      </SiteButtonLink>
    </section>
  );
}
