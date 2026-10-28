import { siFacebook, siInstagram, siPinterest, siVimeo, siX, siYoutube } from "simple-icons";
import type { SocialLinks } from "@/lib/db/schema";

type Network = keyof SocialLinks;

// LinkedIn is not distributed by simple-icons; standard 24×24 glyph.
const LINKEDIN_PATH =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";

const NETWORKS: Record<Network, { label: string; path: string }> = {
  facebook: { label: "Facebook", path: siFacebook.path },
  twitter: { label: "X (Twitter)", path: siX.path },
  pinterest: { label: "Pinterest", path: siPinterest.path },
  instagram: { label: "Instagram", path: siInstagram.path },
  youtube: { label: "YouTube", path: siYoutube.path },
  linkedin: { label: "LinkedIn", path: LINKEDIN_PATH },
  vimeo: { label: "Vimeo", path: siVimeo.path },
};

/** Ordered list of networks that have a link configured. */
export function configuredSocials(socials: SocialLinks) {
  return (Object.keys(NETWORKS) as Network[])
    .filter((network) => Boolean(socials[network]))
    .map((network) => ({ network, href: socials[network]!, ...NETWORKS[network] }));
}

export function SocialLinksList({ socials, className = "", iconClassName = "size-3" }: { socials: SocialLinks; className?: string; iconClassName?: string }) {
  const links = configuredSocials(socials);
  if (links.length === 0) return null;
  return (
    <ul className={`flex items-center gap-4 ${className}`}>
      {links.map((link) => (
        <li key={link.network}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer me"
            aria-label={link.label}
            className="block text-ink transition-opacity hover:opacity-60"
          >
            <svg viewBox="0 0 24 24" className={iconClassName} fill="currentColor" aria-hidden>
              <path d={link.path} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
