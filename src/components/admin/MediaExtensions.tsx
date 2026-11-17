"use client";

import Image from "@tiptap/extension-image";
import {
  Node,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  mergeAttributes,
  type NodeViewProps,
} from "@tiptap/react";
import { useRef } from "react";

export function mediaMargin(align: string) {
  if (align === "left") return "1.5rem auto 1.5rem 0";
  if (align === "right") return "1.5rem 0 1.5rem auto";
  return "1.5rem auto";
}

function mediaStyle(width: string, align: string) {
  return `width:${width};max-width:100%;margin:${mediaMargin(align)};`;
}

const SIZES = ["25%", "50%", "75%", "100%"];

function Btn({
  active,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
        active ? "bg-violet-600 text-white" : "text-gray-100 hover:bg-white/20"
      }`}
    >
      {children}
    </button>
  );
}

/** Shared node view for images & videos: select, drag handle, align, size presets & drag-resize. */
function MediaView({ node, updateAttributes, selected, deleteNode }: NodeViewProps) {
  const { src, width, align, embed, alt } = node.attrs as {
    src: string;
    width: string;
    align: string;
    embed?: boolean;
    alt?: string;
  };
  const isVideo = node.type.name === "video";
  const box = useRef<HTMLDivElement>(null);

  function startResize(e: React.PointerEvent | React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const el = box.current;
    const container = el?.closest(".ProseMirror") as HTMLElement | null;
    if (!el || !container) return;
    const cw = container.getBoundingClientRect().width;
    const startX = (e as React.PointerEvent).clientX;
    const startW = el.getBoundingClientRect().width;
    const move = (ev: PointerEvent) => {
      const pct = Math.min(100, Math.max(10, ((startW + (ev.clientX - startX)) / cw) * 100));
      updateAttributes({ width: `${Math.round(pct)}%` });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return (
    <NodeViewWrapper style={{ width, maxWidth: "100%", margin: mediaMargin(align) }}>
      <div ref={box} className="group relative" contentEditable={false}>
        {isVideo ? (
          embed ? (
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
              <iframe src={src} className="h-full w-full" title="Embedded video" />
            </div>
          ) : (
            <video src={src} controls preload="metadata" className="block w-full rounded-xl bg-black" />
          )
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt ?? ""} draggable={false} className="block h-auto w-full rounded-xl" />
        )}

        {/* Click-catcher so iframes/videos can be selected, not played, while editing */}
        {isVideo && !selected && <div className="absolute inset-0 cursor-pointer" />}

        {selected && (
          <>
            <div className="absolute left-2 top-2 z-10 flex flex-wrap items-center gap-1 rounded-lg bg-gray-900/90 p-1 shadow-lg backdrop-blur">
              <span
                data-drag-handle
                title="Drag to move"
                className="cursor-grab rounded px-1.5 py-0.5 text-[11px] font-bold text-gray-100 hover:bg-white/20"
              >
                ✥ Move
              </span>
              <span className="mx-0.5 h-4 w-px bg-white/30" />
              {(["left", "center", "right"] as const).map((a) => (
                <Btn key={a} title={`Align ${a}`} active={align === a} onClick={() => updateAttributes({ align: a })}>
                  {a === "left" ? "⇤" : a === "right" ? "⇥" : "↔"}
                </Btn>
              ))}
              <span className="mx-0.5 h-4 w-px bg-white/30" />
              {SIZES.map((s) => (
                <Btn key={s} title={`Width ${s}`} active={width === s} onClick={() => updateAttributes({ width: s })}>
                  {s}
                </Btn>
              ))}
              {!isVideo && (
                <Btn
                  title="Edit alt text"
                  onClick={() => {
                    const v = window.prompt("Alt text (describes the image for SEO/accessibility):", alt ?? "");
                    if (v !== null) updateAttributes({ alt: v });
                  }}
                >
                  Alt
                </Btn>
              )}
              <Btn title="Delete" onClick={() => deleteNode()}>
                🗑
              </Btn>
            </div>
            <button
              type="button"
              aria-label="Drag to resize"
              title="Drag to resize"
              draggable={false}
              onPointerDown={startResize}
              onMouseDown={(e) => e.preventDefault()}
              className="absolute -bottom-2 -right-2 z-10 h-5 w-5 cursor-nwse-resize rounded-full border-2 border-white bg-violet-600 shadow"
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}

const commonAttrs = {
  width: {
    default: "100%",
    parseHTML: (el: HTMLElement) => el.getAttribute("data-width") || el.style.width || "100%",
    renderHTML: () => ({}),
  },
  align: {
    default: "center",
    parseHTML: (el: HTMLElement) => el.getAttribute("data-align") || "center",
    renderHTML: () => ({}),
  },
};

export const ResizableImage = Image.extend({
  draggable: true,
  addAttributes() {
    return {
      ...this.parent?.(),
      ...commonAttrs,
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      "img",
      mergeAttributes(HTMLAttributes, {
        "data-width": node.attrs.width,
        "data-align": node.attrs.align,
        loading: "lazy",
        style: mediaStyle(node.attrs.width, node.attrs.align),
      }),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(MediaView);
  },
});

/** Block node for uploaded/direct videos and YouTube / Vimeo embeds. */
export const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return {
      src: { default: "" },
      embed: { default: false },
      ...commonAttrs,
    };
  },
  parseHTML() {
    return [
      {
        tag: "div[data-video]",
        getAttrs: (el) => {
          const e = el as HTMLElement;
          const iframe = e.querySelector("iframe");
          const video = e.querySelector("video");
          return {
            src: e.getAttribute("data-src") || iframe?.getAttribute("src") || video?.getAttribute("src") || "",
            embed: e.getAttribute("data-embed") === "true",
            width: e.getAttribute("data-width") || "100%",
            align: e.getAttribute("data-align") || "center",
          };
        },
      },
    ];
  },
  renderHTML({ node }) {
    const { src, embed, width, align } = node.attrs;
    const inner = embed
      ? [
          "iframe",
          {
            src,
            loading: "lazy",
            allowfullscreen: "true",
            allow:
              "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen",
          },
        ]
      : ["video", { src, controls: "true", preload: "metadata", playsinline: "true" }];
    return [
      "div",
      {
        "data-video": "",
        "data-src": src,
        "data-embed": String(Boolean(embed)),
        "data-width": width,
        "data-align": align,
        style: mediaStyle(width, align),
      },
      inner,
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(MediaView);
  },
});

/** Turns a pasted video URL into either an embed (YouTube/Vimeo) or a direct <video> source. */
export function resolveVideoUrl(url: string): { src: string; embed: boolean } {
  const yt = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/.exec(url);
  if (yt) return { src: `https://www.youtube.com/embed/${yt[1]}`, embed: true };
  const vimeo = /vimeo\.com\/(?:video\/)?(\d+)/.exec(url);
  if (vimeo) return { src: `https://player.vimeo.com/video/${vimeo[1]}`, embed: true };
  return { src: url, embed: false };
}
