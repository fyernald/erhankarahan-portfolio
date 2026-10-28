import { BriefcaseBusiness, FileText, Images, Inbox, LayoutGrid, Newspaper, Settings, type LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Key used to attach a live counter (e.g. unread messages). */
  badgeKey?: "unreadMessages";
};

export const DASHBOARD_NAV: { title: string; items: NavItem[] }[] = [
  {
    title: "General",
    items: [{ href: "/dashboard", label: "Overview", icon: LayoutGrid }],
  },
  {
    title: "Content",
    items: [
      { href: "/dashboard/posts", label: "Blog posts", icon: Newspaper },
      { href: "/dashboard/projects", label: "Portfolio", icon: BriefcaseBusiness },
      { href: "/dashboard/resume", label: "Resume", icon: FileText },
      { href: "/dashboard/media", label: "Media library", icon: Images },
    ],
  },
  {
    title: "Manage",
    items: [
      { href: "/dashboard/messages", label: "Messages", icon: Inbox, badgeKey: "unreadMessages" },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  return href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}
