"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Briefcase, ExternalLink, FolderKanban, Images, LayoutDashboard, LogOut } from "lucide-react";
import {
  adminLogout,
  getAdminApplications,
  getAdminMe,
  updateApplicationStatus,
  type AdminApplication,
} from "@/lib/api/applications";
import {
  deletePost,
  deleteSite,
  getAdminPosts,
  getNotices,
  markNotice,
  POST_CATEGORIES,
  savePost,
  saveSite,
  type AdminNotice,
  type PostCategory,
  type PostInput,
  type SiteInput,
  type WorkPost,
} from "@/lib/api/content";
import { getSites, getSkills } from "@/lib/api/sites";
import { APPLICATION_STATUSES, SITE_STATUSES, type ApplicationStatus, type Site, type SiteStatus, type SkillCategory } from "@/types";
import { BRAND } from "@/lib/brand";
import { cn, formatDate } from "@/lib/utils";

type Tab = "home" | "notices" | "posts" | "projects" | "applications";

const SITE_LABEL: Record<SiteStatus, string> = {
  STRUCTURAL_WORK: "Structural work",
  ROUGH_IN: "Rough-in",
  FINAL_FINISHING: "Final finishing",
  COMPLETED: "Completed",
};

const APPLICATION_LABEL: Record<ApplicationStatus, string> = {
  PENDING: "Waiting",
  REVIEWED: "Reviewed",
  SHORTLISTED: "Shortlisted",
  CONTACTED: "Contacted",
  ACCEPTED: "Hired",
  REJECTED: "Declined",
};

const CATEGORY_LABEL: Record<PostCategory, string> = {
  interior: "Interior",
  exterior: "Exterior",
  living: "Living room",
  kitchens: "Kitchen",
  bathrooms: "Bathroom",
  flooring: "Flooring",
  ceilings: "Ceiling",
  painting: "Painting",
};

const emptyPost: PostInput = {
  title: "",
  description: "",
  category: "living",
  imageUrl: "/assets/preview/living.jpg",
  published: true,
};

const emptySite = (): SiteInput => ({
  name: "",
  description: "",
  status: "FINAL_FINISHING",
  address: "",
  estimatedDuration: "",
  coverImageUrl: "/assets/preview/hero.jpg",
  compensationMin: null,
  compensationMax: null,
  compensationNote: "",
  currentWorkerCount: 0,
  isPreview: true,
  skillCategoryIds: [],
});

type StudioSnapshot = {
  email: string;
  notices: AdminNotice[];
  unread: number;
  posts: WorkPost[];
  sites: Site[];
  skills: SkillCategory[];
  applications: AdminApplication[];
};

let studioRequest: Promise<StudioSnapshot> | null = null;

function loadStudio(): Promise<StudioSnapshot> {
  if (studioRequest) return studioRequest;
  const request = (async () => {
    const me = await getAdminMe();
    const notices = await getNotices();
    const posts = await getAdminPosts();
    const siteResult = await getSites({ pageSize: 50 });
    const skills = await getSkills();
    const applications = await getAdminApplications();
    return {
      email: me.data.email,
      notices: notices.data,
      unread: notices.meta.unread,
      posts,
      sites: siteResult.data,
      skills,
      applications,
    };
  })();
  studioRequest = request;
  request.finally(() => {
    if (studioRequest === request) studioRequest = null;
  });
  return request;
}

export function AdminConsole() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("home");
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [notices, setNotices] = useState<AdminNotice[]>([]);
  const [unread, setUnread] = useState(0);
  const [posts, setPosts] = useState<WorkPost[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const loadNotices = useCallback(async () => {
    const result = await getNotices();
    setNotices(result.data);
    setUnread(result.meta.unread);
  }, []);

  useEffect(() => {
    let active = true;
    loadStudio()
      .then((studio) => {
        if (!active) return;
        setEmail(studio.email);
        setNotices(studio.notices);
        setUnread(studio.unread);
        setPosts(studio.posts);
        setSites(studio.sites);
        setSkills(studio.skills);
        setApplications(studio.applications);
        setReady(true);
      })
      .catch(() => {
        if (active) router.replace("/admin/login");
      });
    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setInterval(() => {
      loadNotices().catch(() => undefined);
    }, 20000);
    return () => window.clearInterval(timer);
  }, [loadNotices, ready]);

  function note(message: string) {
    setError(null);
    setFlash(message);
  }

  async function signOut() {
    setSigningOut(true);
    await adminLogout().catch(() => undefined);
    router.replace("/admin/login");
  }

  const waiting = applications.filter((row) => row.status === "PENDING").length;
  const recruiting = sites.filter((site) => site.isRecruiting).length;

  if (!ready) {
    return (
      <div className="admin-app grid min-h-svh place-items-center bg-ivory px-6 text-ink">
        <p className="text-sm text-ink/70">Opening the studio…</p>
      </div>
    );
  }

  const pages: Record<Tab, { title: string; lead: string }> = {
    home: {
      title: "Overview",
      lead: "What needs attention on the public site.",
    },
    notices: {
      title: "Messages",
      lead: "Emails from the contact form and new job applications.",
    },
    posts: {
      title: "Work photos",
      lead: "These photos appear in the portfolio slider. The first living-room photo is shown first.",
    },
    projects: {
      title: "Projects",
      lead: "Job sites people can browse and apply to.",
    },
    applications: {
      title: "Applications",
      lead: "People who asked to work on a project. Change the status as you review them.",
    },
  };

  return (
    <div className="admin-app min-h-svh bg-ivory text-ink lg:grid lg:grid-cols-[15.5rem_1fr]">
      <aside className="border-b border-line bg-surface lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:border-r lg:border-b-0">
        <div className="px-5 py-5">
          <p className="text-xs font-medium tracking-wide text-gold-ink">MIERAG</p>
          <p className="mt-1 text-lg font-medium">Studio</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3" aria-label="Studio">
          <NavButton current={tab} id="home" icon={<LayoutDashboard size={16} />} label="Overview" onSelect={setTab} />
          <NavButton current={tab} id="notices" icon={<Bell size={16} />} label="Messages" count={unread} onSelect={setTab} />
          <NavButton current={tab} id="posts" icon={<Images size={16} />} label="Work photos" count={posts.length} onSelect={setTab} />
          <NavButton current={tab} id="projects" icon={<FolderKanban size={16} />} label="Projects" count={sites.length} onSelect={setTab} />
          <NavButton current={tab} id="applications" icon={<Briefcase size={16} />} label="Applications" count={waiting} onSelect={setTab} />
        </nav>
        <div className="mt-auto hidden space-y-3 px-4 py-5 lg:block">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-ink/75 hover:text-ink">
            <ExternalLink size={14} />
            View public site
          </Link>
          <p className="truncate text-xs text-ink/60">{email}</p>
          <button type="button" onClick={() => setConfirmSignOut(true)} className="inline-flex items-center gap-2 text-sm text-ink hover:text-brand">
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-5 sm:px-8">
          <div>
            <h1 className="text-2xl font-medium">{pages[tab].title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-ink/70">{pages[tab].lead}</p>
          </div>
          <button type="button" onClick={() => setConfirmSignOut(true)} className="inline-flex items-center gap-2 text-sm lg:hidden">
            <LogOut size={14} />
            Sign out
          </button>
        </header>

        <div className="px-4 py-6 sm:px-8">
          {error ? <p className="mb-4 rounded-md border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">{error}</p> : null}
          {flash ? <p className="mb-4 rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">{flash}</p> : null}

          {tab === "home" ? (
            <Overview
              unread={unread}
              posts={posts.length}
              recruiting={recruiting}
              waiting={waiting}
              notices={notices.slice(0, 4)}
              onOpen={setTab}
            />
          ) : null}
          {tab === "notices" ? (
            <NoticeList
              notices={notices}
              onError={setError}
              onRead={async (notice) => {
                await markNotice(notice.id, !notice.read);
                await loadNotices();
                note(notice.read ? "Marked as new." : "Marked as read.");
              }}
            />
          ) : null}
          {tab === "posts" ? (
            <PostEditor
              posts={posts}
              onError={setError}
              onSaved={(message) => note(message)}
              onChange={async () => setPosts(await getAdminPosts())}
            />
          ) : null}
          {tab === "projects" ? (
            <ProjectEditor
              sites={sites}
              skills={skills}
              onError={setError}
              onSaved={(message) => note(message)}
              onChange={async () => {
                const result = await getSites({ pageSize: 50 });
                setSites(result.data);
              }}
            />
          ) : null}
          {tab === "applications" ? (
            <ApplicationTable
              rows={applications}
              onError={setError}
              onChange={setApplications}
              onSaved={() => note("Application status updated.")}
            />
          ) : null}
        </div>
      </div>
      {confirmSignOut ? (
        <SignOutDialog
          busy={signingOut}
          onCancel={() => {
            if (!signingOut) setConfirmSignOut(false);
          }}
          onConfirm={() => void signOut()}
        />
      ) : null}
    </div>
  );
}

function SignOutDialog({
  busy,
  onCancel,
  onConfirm,
}: {
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-night/50 p-4" role="presentation">
      <button type="button" className="absolute inset-0" aria-label="Stay signed in" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sign-out-title"
        className="relative w-full max-w-md rounded-lg border border-line bg-surface p-6"
      >
        <h2 id="sign-out-title" className="text-lg font-medium">Sign out of the studio?</h2>
        <p className="mt-2 text-sm leading-6 text-ink/75">
          You will need your email and password to open photos, projects, and messages again.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            autoFocus
            disabled={busy}
            onClick={onCancel}
            className="min-h-11 rounded-md border border-line px-4 text-sm disabled:opacity-50"
          >
            Stay signed in
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="min-h-11 rounded-md bg-ink px-4 text-sm text-ivory disabled:opacity-50"
          >
            {busy ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NavButton({
  current,
  id,
  label,
  icon,
  count,
  onSelect,
}: {
  current: Tab;
  id: Tab;
  label: string;
  icon: ReactNode;
  count?: number;
  onSelect: (tab: Tab) => void;
}) {
  const active = current === id;
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={cn(
        "flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 text-left text-sm",
        active ? "bg-ink text-ivory" : "text-ink/80 hover:bg-ink/5",
      )}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {count ? <span className={cn("text-xs", active ? "text-ivory/80" : "text-ink/55")}>{count}</span> : null}
    </button>
  );
}

function Overview({
  unread,
  posts,
  recruiting,
  waiting,
  notices,
  onOpen,
}: {
  unread: number;
  posts: number;
  recruiting: number;
  waiting: number;
  notices: AdminNotice[];
  onOpen: (tab: Tab) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Unread messages" value={unread} hint="Contact form and applications" onClick={() => onOpen("notices")} />
        <Stat label="Waiting applicants" value={waiting} hint="Still marked as waiting" onClick={() => onOpen("applications")} />
        <Stat label="Open projects" value={recruiting} hint="Currently accepting workers" onClick={() => onOpen("projects")} />
        <Stat label="Work photos" value={posts} hint="Shown in the portfolio" onClick={() => onOpen("posts")} />
      </div>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-medium">Latest messages</h2>
          <button type="button" onClick={() => onOpen("notices")} className="text-sm text-ink/70 underline-offset-4 hover:underline">
            See all
          </button>
        </div>
        {notices.length === 0 ? (
          <Empty>No messages yet. A card appears here when someone writes or applies.</Empty>
        ) : (
          <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
            {notices.map((notice) => (
              <li key={notice.id} className="px-4 py-3">
                <p className="text-sm font-medium">
                  {notice.kind === "INQUIRY" ? "Contact email" : "Job application"}
                  {notice.read ? "" : " · New"}
                </p>
                <p className="mt-1 text-sm text-ink/75">{notice.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="text-xs text-ink/55">{BRAND.name}</p>
    </div>
  );
}

function Stat({ label, value, hint, onClick }: { label: string; value: number; hint: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-lg border border-line bg-surface px-4 py-4 text-left hover:border-ink/30">
      <p className="text-sm text-ink/70">{label}</p>
      <p className="mt-2 text-3xl font-medium">{value}</p>
      <p className="mt-1 text-xs text-ink/55">{hint}</p>
    </button>
  );
}

function NoticeList({
  notices,
  onRead,
  onError,
}: {
  notices: AdminNotice[];
  onRead: (notice: AdminNotice) => Promise<void>;
  onError: (message: string) => void;
}) {
  if (notices.length === 0) {
    return <Empty>No messages yet. A notice appears when someone writes through the contact form or applies for work.</Empty>;
  }
  return (
    <ul className="space-y-3">
      {notices.map((notice) => (
        <li key={notice.id} className={cn("rounded-lg border bg-surface px-4 py-4", notice.read ? "border-line" : "border-brand/40")}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {notice.kind === "INQUIRY" ? "Contact email" : "Job application"}
                {notice.read ? "" : " · New"}
              </p>
              <p className="mt-2 text-sm">{notice.body}</p>
              {notice.inquiry ? (
                <div className="mt-3 space-y-1 text-sm text-ink/80">
                  <p>{notice.inquiry.name} · {notice.inquiry.email}</p>
                  {notice.inquiry.phone ? <p>{notice.inquiry.phone}</p> : null}
                  <p className="max-w-2xl leading-7">{notice.inquiry.message}</p>
                </div>
              ) : null}
              <p className="mt-2 text-xs text-ink/55">{formatDate(notice.createdAt)}</p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-md border border-line px-3 py-2 text-sm hover:border-ink"
              onClick={() => {
                onRead(notice).catch((err: unknown) => onError(err instanceof Error ? err.message : "Could not update the message."));
              }}
            >
              {notice.read ? "Mark as new" : "Mark as read"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function PostEditor({
  posts,
  onChange,
  onError,
  onSaved,
}: {
  posts: WorkPost[];
  onChange: () => Promise<void>;
  onError: (message: string) => void;
  onSaved: (message: string) => void;
}) {
  const [draft, setDraft] = useState<PostInput>(emptyPost);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((post) => `${post.title} ${post.description} ${post.category}`.toLowerCase().includes(q));
  }, [posts, query]);

  function edit(post: WorkPost) {
    setEditing(post.id);
    setDraft({
      title: post.title,
      description: post.description,
      category: post.category,
      imageUrl: post.imageUrl,
      published: post.published,
    });
    document.getElementById("work-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    onError("");
    try {
      await savePost(draft, editing ?? undefined);
      setDraft(emptyPost);
      setEditing(null);
      await onChange();
      onSaved(editing ? "Photo updated." : "Photo added to the site.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "The photo could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,22rem)_1fr]">
      <form id="work-editor" className="space-y-4 rounded-lg border border-line bg-surface p-4" onSubmit={(event) => void onSubmit(event)}>
        <h2 className="text-base font-medium">{editing ? "Edit this photo" : "Add a photo"}</h2>
        <Field label="Title" hint="Short name visitors see under the photo, such as Living room.">
          <input className="field" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required />
        </Field>
        <Field label="Description" hint="One or two sentences about what the photo shows.">
          <textarea className="field min-h-28" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} required />
        </Field>
        <Field label="Room" hint="Used to group the photo. Living room is shown first.">
          <select className="field" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as PostCategory })}>
            {POST_CATEGORIES.map((category) => (
              <option key={category} value={category}>{CATEGORY_LABEL[category]}</option>
            ))}
          </select>
        </Field>
        <Field label="Image address" hint="A file on this site, starting with /, or an Unsplash link.">
          <input className="field" value={draft.imageUrl} onChange={(event) => setDraft({ ...draft, imageUrl: event.target.value })} required />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={draft.published} onChange={(event) => setDraft({ ...draft, published: event.target.checked })} />
          Show this photo on the public site
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={saving} className="min-h-11 rounded-md bg-ink px-4 text-sm text-ivory disabled:opacity-50">
            {saving ? "Saving…" : editing ? "Save changes" : "Add photo"}
          </button>
          {editing ? (
            <button type="button" className="min-h-11 rounded-md border border-line px-4 text-sm" onClick={() => { setEditing(null); setDraft(emptyPost); }}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      <div>
        <input className="field mb-4" placeholder="Search photos" value={query} onChange={(event) => setQuery(event.target.value)} />
        {visible.length === 0 ? <Empty>No photos match this search.</Empty> : (
          <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
            {visible.map((post) => (
              <li key={post.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{post.title}</p>
                  <p className="text-sm text-ink/65">
                    {CATEGORY_LABEL[post.category] ?? post.category}
                    {post.published ? " · Visible" : " · Hidden"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="rounded-md border border-line px-3 py-2 text-sm" onClick={() => edit(post)}>Edit</button>
                  <button
                    type="button"
                    className="rounded-md border border-line px-3 py-2 text-sm text-error"
                    onClick={() => {
                      if (!window.confirm(`Remove “${post.title}” from the site?`)) return;
                      deletePost(post.id)
                        .then(async () => {
                          await onChange();
                          onSaved("Photo removed.");
                        })
                        .catch((err: unknown) => onError(err instanceof Error ? err.message : "The photo could not be removed."));
                    }}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ProjectEditor({
  sites,
  skills,
  onChange,
  onError,
  onSaved,
}: {
  sites: Site[];
  skills: SkillCategory[];
  onChange: () => Promise<void>;
  onError: (message: string) => void;
  onSaved: (message: string) => void;
}) {
  const [draft, setDraft] = useState<SiteInput>(emptySite);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter((site) => `${site.name} ${site.address} ${site.status}`.toLowerCase().includes(q));
  }, [query, sites]);

  function edit(site: Site) {
    setEditing(site.id);
    setDraft({
      name: site.name,
      description: site.description,
      status: site.status,
      address: site.address,
      estimatedDuration: site.estimatedDuration,
      coverImageUrl: site.coverImageUrl,
      compensationMin: site.compensationMin ?? null,
      compensationMax: site.compensationMax ?? null,
      compensationNote: site.compensationNote ?? "",
      currentWorkerCount: site.currentWorkerCount,
      isPreview: site.isPreview,
      skillCategoryIds: site.requiredSkills.map((skill) => skill.id),
    });
    document.getElementById("project-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleSkill(id: string) {
    setDraft((current) => ({
      ...current,
      skillCategoryIds: current.skillCategoryIds.includes(id)
        ? current.skillCategoryIds.filter((item) => item !== id)
        : [...current.skillCategoryIds, id],
    }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    onError("");
    try {
      await saveSite(
        {
          ...draft,
          compensationMin: draft.compensationMin === null ? null : Number(draft.compensationMin),
          compensationMax: draft.compensationMax === null ? null : Number(draft.compensationMax),
          currentWorkerCount: Number(draft.currentWorkerCount) || 0,
        },
        editing ?? undefined,
      );
      const wasEdit = Boolean(editing);
      setDraft(emptySite());
      setEditing(null);
      await onChange();
      onSaved(wasEdit ? "Project updated." : "Project added.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "The project could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,24rem)_1fr]">
      <form id="project-editor" className="space-y-4 rounded-lg border border-line bg-surface p-4" onSubmit={(event) => void onSubmit(event)}>
        <h2 className="text-base font-medium">{editing ? "Edit this project" : "Add a project"}</h2>
        <Field label="Project name">
          <input className="field" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required />
        </Field>
        <Field label="Description" hint="At least a short paragraph. Say if this is still a preview record.">
          <textarea className="field min-h-28" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} required />
        </Field>
        <Field label="Address">
          <input className="field" value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} required />
        </Field>
        <Field label="How long the work should take" hint="For example: 3 months">
          <input className="field" value={draft.estimatedDuration} onChange={(event) => setDraft({ ...draft, estimatedDuration: event.target.value })} required />
        </Field>
        <Field label="Stage of work">
          <select className="field" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as SiteStatus })}>
            {SITE_STATUSES.map((status) => (
              <option key={status} value={status}>{SITE_LABEL[status]}</option>
            ))}
          </select>
        </Field>
        <Field label="Cover image address" hint="A file on this site, starting with /, or an Unsplash link.">
          <input className="field" value={draft.coverImageUrl} onChange={(event) => setDraft({ ...draft, coverImageUrl: event.target.value })} required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Lowest daily pay (ETB)">
            <input className="field" type="number" min={0} value={draft.compensationMin ?? ""} onChange={(event) => setDraft({ ...draft, compensationMin: event.target.value === "" ? null : Number(event.target.value) })} />
          </Field>
          <Field label="Highest daily pay (ETB)">
            <input className="field" type="number" min={0} value={draft.compensationMax ?? ""} onChange={(event) => setDraft({ ...draft, compensationMax: event.target.value === "" ? null : Number(event.target.value) })} />
          </Field>
        </div>
        <Field label="Pay note" hint="Optional. Shown when a number is not set.">
          <input className="field" value={draft.compensationNote ?? ""} onChange={(event) => setDraft({ ...draft, compensationNote: event.target.value })} />
        </Field>
        <Field label="Workers on site now">
          <input className="field" type="number" min={0} value={draft.currentWorkerCount} onChange={(event) => setDraft({ ...draft, currentWorkerCount: Number(event.target.value) })} />
        </Field>
        <fieldset>
          <legend className="text-sm font-medium">Skills this site needs</legend>
          <p className="mt-1 text-xs text-ink/60">Select every trade that can apply.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill) => {
              const on = draft.skillCategoryIds.includes(skill.id);
              return (
                <button key={skill.id} type="button" onClick={() => toggleSkill(skill.id)} className={cn("min-h-10 rounded-md px-3 text-sm", on ? "bg-ink text-ivory" : "border border-line")}>
                  {skill.name}
                </button>
              );
            })}
          </div>
        </fieldset>
        <label className="flex items-start gap-2 text-sm">
          <input className="mt-1" type="checkbox" checked={draft.isPreview} onChange={(event) => setDraft({ ...draft, isPreview: event.target.checked })} />
          <span>This is sample data, not a live MIERAG job. Leave this on until the record is real.</span>
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={saving} className="min-h-11 rounded-md bg-ink px-4 text-sm text-ivory disabled:opacity-50">
            {saving ? "Saving…" : editing ? "Save changes" : "Add project"}
          </button>
          {editing ? (
            <button type="button" className="min-h-11 rounded-md border border-line px-4 text-sm" onClick={() => { setEditing(null); setDraft(emptySite()); }}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      <div>
        <input className="field mb-4" placeholder="Search projects" value={query} onChange={(event) => setQuery(event.target.value)} />
        {visible.length === 0 ? <Empty>No projects match this search.</Empty> : (
          <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
            {visible.map((site) => (
              <li key={site.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{site.name}</p>
                  <p className="text-sm text-ink/65">
                    {SITE_LABEL[site.status]} · {site.address}
                    {site.isRecruiting ? " · Hiring" : " · Closed"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="rounded-md border border-line px-3 py-2 text-sm" onClick={() => edit(site)}>Edit</button>
                  <button
                    type="button"
                    className="rounded-md border border-line px-3 py-2 text-sm text-error"
                    onClick={() => {
                      if (!window.confirm(`Remove “${site.name}” and its applications?`)) return;
                      deleteSite(site.id)
                        .then(async () => {
                          await onChange();
                          onSaved("Project removed.");
                        })
                        .catch((err: unknown) => onError(err instanceof Error ? err.message : "The project could not be removed."));
                    }}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ApplicationTable({
  rows,
  onChange,
  onError,
  onSaved,
}: {
  rows: AdminApplication[];
  onChange: (rows: AdminApplication[]) => void;
  onError: (message: string) => void;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState<"" | ApplicationStatus>("");
  const [query, setQuery] = useState("");
  const visible = rows.filter((row) => {
    if (status && row.status !== status) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return `${row.fullName} ${row.phoneNumber} ${row.site.name} ${row.skill.name}`.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_14rem]">
        <input className="field" placeholder="Search name, phone, or project" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="field" value={status} onChange={(event) => setStatus(event.target.value as "" | ApplicationStatus)}>
          <option value="">All statuses</option>
          {APPLICATION_STATUSES.map((item) => (
            <option key={item} value={item}>{APPLICATION_LABEL[item]}</option>
          ))}
        </select>
      </div>
      {visible.length === 0 ? <Empty>No applications match this view.</Empty> : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line text-ink/60">
              <tr>
                <th className="px-4 py-3 font-medium">Person</th>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Skill</th>
                <th className="px-4 py-3 font-medium">Daily pay</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id} className="border-t border-line align-top">
                  <td className="px-4 py-4">
                    <p className="font-medium">{row.fullName}</p>
                    <a className="text-ink/70 underline-offset-2 hover:underline" href={`tel:${row.phoneNumber}`}>{row.phoneNumber}</a>
                    <p className="mt-1 text-xs text-ink/55">{row.experienceYears} years · {formatDate(row.createdAt)}</p>
                    {row.experienceDetails ? <p className="mt-2 max-w-xs text-ink/75">{row.experienceDetails}</p> : null}
                  </td>
                  <td className="px-4 py-4">{row.site.name}</td>
                  <td className="px-4 py-4">{row.skill.name}</td>
                  <td className="px-4 py-4">{row.expectedRate.toLocaleString("en-ET")} ETB</td>
                  <td className="px-4 py-4">
                    <select
                      value={row.status}
                      className="field"
                      aria-label={`Status for ${row.fullName}`}
                      onChange={async (event) => {
                        const next = event.target.value as ApplicationStatus;
                        try {
                          await updateApplicationStatus(row.id, next);
                          onChange(rows.map((item) => (item.id === row.id ? { ...item, status: next } : item)));
                          onSaved();
                        } catch (err) {
                          onError(err instanceof Error ? err.message : "Status could not be updated.");
                        }
                      }}
                    >
                      {APPLICATION_STATUSES.map((item) => (
                        <option key={item} value={item}>{APPLICATION_LABEL[item]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs text-ink/60">{hint}</span> : null}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed border-line px-4 py-8 text-sm text-ink/70">{children}</p>;
}
