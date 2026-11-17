"use client";

import { useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { ResizableImage, Video, resolveVideoUrl } from "./MediaExtensions";

type Uploaded = { url: string; type: "image" | "video"; name: string };

export async function uploadFiles(files: File[]): Promise<Uploaded[]> {
  const fd = new FormData();
  files.forEach((f) => fd.append("file", f));
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Upload failed");
  return json.files as Uploaded[];
}

function Tool({
  title,
  active,
  disabled,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`h-8 min-w-8 rounded-md px-2 text-sm font-semibold transition disabled:opacity-40 ${
        active ? "bg-violet-600 text-white" : "text-gray-700 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

const Sep = () => <span className="mx-1 h-6 w-px bg-gray-300" />;

export default function RichEditor({
  value,
  onChange,
  placeholder = "Start writing… Insert images and videos exactly where your cursor is.",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editorRef = useRef<Editor | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [words, setWords] = useState(() => value.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length);
  const [urlModal, setUrlModal] = useState<null | { kind: "image" | "video"; url: string; alt: string }>(null);

  async function handleFiles(files: File[], at?: number) {
    const ed = editorRef.current;
    const valid = files.filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"));
    if (!ed || !valid.length) return;
    setBusy(true);
    setError("");
    try {
      const uploaded = await uploadFiles(valid);
      let pos = at;
      for (const u of uploaded) {
        const node =
          u.type === "image"
            ? { type: "image", attrs: { src: u.url, alt: u.name.replace(/\.[^.]+$/, "") } }
            : { type: "video", attrs: { src: u.url, embed: false } };
        if (pos !== undefined) {
          ed.chain().focus().insertContentAt(pos, node).run();
          pos = ed.state.selection.to;
        } else {
          ed.chain().focus().insertContent(node).run();
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      ResizableImage.configure({ inline: false, allowBase64: false }),
      Video,
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "post-content prose prose-lg max-w-none px-5 py-4 focus:outline-none prose-img:my-0",
      },
      handleDrop(view, event, _slice, moved) {
        const files = Array.from(event.dataTransfer?.files ?? []);
        if (moved || !files.length) return false;
        event.preventDefault();
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
        void handleFiles(files, coords?.pos);
        return true;
      },
      handlePaste(_view, event) {
        const files = Array.from(event.clipboardData?.files ?? []).filter(
          (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
        );
        if (!files.length) return false;
        event.preventDefault();
        void handleFiles(files);
        return true;
      },
    },
    onCreate({ editor }) {
      editorRef.current = editor;
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
      setWords(editor.getText().split(/\s+/).filter(Boolean).length);
    },
  });

  if (!editor) {
    return <div className="h-[500px] animate-pulse rounded-xl border border-gray-300 bg-gray-50" />;
  }
  editorRef.current = editor;

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (leave empty to remove):", prev ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const blockValue = editor.isActive("paragraph")
    ? "p"
    : ([1, 2, 3, 4, 5, 6].find((l) => editor.isActive("heading", { level: l })) ?? "p").toString();

  function insertFromUrl() {
    if (!urlModal || !urlModal.url.trim()) return;
    const url = urlModal.url.trim();
    if (urlModal.kind === "image") {
      editor?.chain().focus().insertContent({ type: "image", attrs: { src: url, alt: urlModal.alt } }).run();
    } else {
      const v = resolveVideoUrl(url);
      editor?.chain().focus().insertContent({ type: "video", attrs: { src: v.src, embed: v.embed } }).run();
    }
    setUrlModal(null);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white text-gray-900 shadow-sm">
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 p-2">
        <select
          aria-label="Text style"
          value={blockValue}
          onChange={(e) => {
            const v = e.target.value;
            const chain = editor.chain().focus();
            if (v === "p") chain.setParagraph().run();
            else chain.setHeading({ level: Number(v) as 1 | 2 | 3 | 4 | 5 | 6 }).run();
          }}
          className="h-8 rounded-md border border-gray-300 bg-white px-2 text-sm"
        >
          <option value="p">Paragraph</option>
          {[1, 2, 3, 4, 5, 6].map((l) => (
            <option key={l} value={l}>
              Heading {l}
            </option>
          ))}
        </select>
        <Sep />
        <Tool title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <b>B</b>
        </Tool>
        <Tool title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <i>I</i>
        </Tool>
        <Tool title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <u>U</u>
        </Tool>
        <Tool title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <s>S</s>
        </Tool>
        <Tool title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
          {"</>"}
        </Tool>
        <Sep />
        <Tool title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </Tool>
        <Tool title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1. List
        </Tool>
        <Tool title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          ❝
        </Tool>
        <Tool title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          {"{ }"}
        </Tool>
        <Tool title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          ―
        </Tool>
        <Sep />
        <Tool title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          ⇤
        </Tool>
        <Tool title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          ≡
        </Tool>
        <Tool title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          ⇥
        </Tool>
        <Sep />
        <Tool title="Add / edit link" active={editor.isActive("link")} onClick={setLink}>
          🔗 Link
        </Tool>
        <Sep />
        <Tool title="Upload image or video from your computer (inserted at the cursor)" disabled={busy} onClick={() => fileRef.current?.click()}>
          {busy ? "Uploading…" : "⬆ Upload media"}
        </Tool>
        <Tool title="Insert image by URL" onClick={() => setUrlModal({ kind: "image", url: "", alt: "" })}>
          🖼 URL
        </Tool>
        <Tool title="Insert video by URL (YouTube, Vimeo or direct file)" onClick={() => setUrlModal({ kind: "video", url: "", alt: "" })}>
          🎬 URL
        </Tool>
        <Sep />
        <Tool title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          ↶
        </Tool>
        <Tool title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          ↷
        </Tool>
        <Tool title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          Tx
        </Tool>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            void handleFiles(files);
          }}
        />
      </div>

      {error && <p className="bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

      <EditorContent editor={editor} />

      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-1.5 text-xs text-gray-500">
        <span>Tip: drag &amp; drop files into the text, click an image/video to resize, align or move it.</span>
        <span>{words.toLocaleString()} words · no limit</span>
      </div>

      {urlModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setUrlModal(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Insert {urlModal.kind} from URL</h3>
            <input
              autoFocus
              value={urlModal.url}
              onChange={(e) => setUrlModal({ ...urlModal, url: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && insertFromUrl()}
              placeholder={urlModal.kind === "image" ? "https://…/photo.jpg" : "https://youtube.com/watch?v=… or https://…/clip.mp4"}
              className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            {urlModal.kind === "image" && (
              <input
                value={urlModal.alt}
                onChange={(e) => setUrlModal({ ...urlModal, alt: e.target.value })}
                placeholder="Alt text (optional)"
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setUrlModal(null)} className="rounded-lg px-4 py-2 text-sm hover:bg-gray-100">
                Cancel
              </button>
              <button type="button" onClick={insertFromUrl} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white">
                Insert at cursor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
