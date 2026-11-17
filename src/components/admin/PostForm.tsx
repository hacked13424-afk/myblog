"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePost, savePost, type PostInput } from "@/app/actions";
import { slugify } from "@/lib/utils";
import RichEditor, { uploadFiles } from "./RichEditor";
import { cardCls, ghostBtn, hintCls, inputCls, labelCls, primaryBtn } from "./ui";

export default function PostForm({
  initial,
  categories,
}: {
  initial: PostInput;
  categories: string[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<PostInput>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const [coverBusy, setCoverBusy] = useState(false);
  const coverFile = useRef<HTMLInputElement>(null);
  const contentRef = useRef(initial.content);

  const set = <K extends keyof PostInput>(k: K, v: PostInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  function submit(status: "draft" | "published") {
    setMsg(null);
    start(async () => {
      const res = await savePost({ ...form, content: contentRef.current, status });
      if (!res.ok) {
        setMsg({ ok: false, text: res.error });
        return;
      }
      setForm((f) => ({ ...f, id: res.id, slug: res.slug, status }));
      setSlugTouched(true);
      setMsg({ ok: true, text: status === "published" ? "Published successfully." : "Saved as draft." });
      if (!initial.id) router.replace(`/admin/posts/${res.id}`);
      else router.refresh();
    });
  }

  function remove() {
    if (!form.id || !window.confirm("Delete this post permanently?")) return;
    start(async () => {
      await deletePost(form.id!);
      router.push("/admin/posts");
      router.refresh();
    });
  }

  async function uploadCover(files: File[]) {
    if (!files.length) return;
    setCoverBusy(true);
    try {
      const [f] = await uploadFiles([files[0]]);
      set("coverImage", f.url);
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Upload failed" });
    } finally {
      setCoverBusy(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-4">
        <input
          value={form.title}
          onChange={(e) => {
            set("title", e.target.value);
            if (!slugTouched) set("slug", slugify(e.target.value));
          }}
          placeholder="Post title"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-2xl font-extrabold outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
        />
        <RichEditor
          key={initial.id ?? "new"}
          value={initial.content}
          onChange={(html) => {
            contentRef.current = html;
          }}
        />
      </div>

      <div className="space-y-4">
        <div className={cardCls}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Publish</h2>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                form.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {form.id ? form.status : "new"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={pending} onClick={() => submit("draft")} className={ghostBtn}>
              Save draft
            </button>
            <button type="button" disabled={pending} onClick={() => submit("published")} className={primaryBtn}>
              {form.status === "published" ? "Update" : "Publish"}
            </button>
            {form.id && form.status === "published" && (
              <a
                href={`/${form.type === "article" ? "articles" : "blogs"}/${form.slug}`}
                target="_blank"
                className={ghostBtn}
              >
                View ↗
              </a>
            )}
          </div>
          {pending && <p className="mt-2 text-sm text-gray-500">Saving…</p>}
          {msg && (
            <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
              {msg.text}
            </p>
          )}
          {form.id && (
            <button type="button" onClick={remove} className="mt-3 text-sm font-semibold text-rose-600 hover:underline">
              Delete post
            </button>
          )}
        </div>

        <div className={cardCls}>
          <h2 className="mb-3 font-bold">Details</h2>
          <label className={labelCls}>Type</label>
          <select value={form.type} onChange={(e) => set("type", e.target.value)} className={inputCls}>
            <option value="blog">Blog (casual / personal / updates)</option>
            <option value="article">Article (in-depth / research)</option>
          </select>
          <label className={`${labelCls} mt-3`}>Category</label>
          <input
            list="category-list"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className={inputCls}
            placeholder="e.g. Technology"
          />
          <datalist id="category-list">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <label className="mt-3 flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-violet-600" />
            Featured on the home page
          </label>
        </div>

        <div className={cardCls}>
          <h2 className="mb-3 font-bold">Cover image</h2>
          {form.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.coverImage} alt="Cover preview" className="mb-3 aspect-[16/10] w-full rounded-lg object-cover" />
          )}
          <input
            value={form.coverImage}
            onChange={(e) => set("coverImage", e.target.value)}
            placeholder="Paste image URL…"
            className={inputCls}
          />
          <div className="mt-2 flex gap-2">
            <button type="button" disabled={coverBusy} onClick={() => coverFile.current?.click()} className={ghostBtn}>
              {coverBusy ? "Uploading…" : "Upload from computer"}
            </button>
            {form.coverImage && (
              <button type="button" onClick={() => set("coverImage", "")} className={ghostBtn}>
                Remove
              </button>
            )}
          </div>
          <input
            ref={coverFile}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              void uploadCover(files);
            }}
          />
        </div>

        <div className={cardCls}>
          <h2 className="mb-3 font-bold">SEO</h2>
          <label className={labelCls}>URL slug</label>
          <input
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", e.target.value);
            }}
            onBlur={() => set("slug", slugify(form.slug || form.title))}
            className={inputCls}
            placeholder="auto-generated-from-title"
          />
          <p className={hintCls}>
            /{form.type === "article" ? "articles" : "blogs"}/{form.slug || "…"}
          </p>
          <label className={`${labelCls} mt-3`}>Meta title</label>
          <input value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} className={inputCls} placeholder={form.title} />
          <p className={hintCls}>{form.metaTitle.length}/60 recommended</p>
          <label className={`${labelCls} mt-3`}>Meta description</label>
          <textarea value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} rows={3} className={inputCls} />
          <p className={hintCls}>{form.metaDescription.length}/160 recommended</p>
          <label className={`${labelCls} mt-3`}>Excerpt (shown on cards)</label>
          <textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={3} className={inputCls} placeholder="Auto-generated from the content if empty" />
        </div>
      </div>
    </div>
  );
}
