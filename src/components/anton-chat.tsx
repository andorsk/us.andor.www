"use client";

// Chat with Anton, built from prompt-kit components (shadcn registry): ChatContainer, Message,
// PromptInput, FileUpload, Loader. Photos are downscaled in the browser and sent to Anton (Claude vision).
import { ImagePlus, X, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { ChatContainerContent, ChatContainerRoot, ChatContainerScrollAnchor } from "@/components/ui/chat-container";
import { FileUpload, FileUploadContent, FileUploadTrigger } from "@/components/ui/file-upload";
import { Loader } from "@/components/ui/loader";
import { Message, MessageContent } from "@/components/ui/message";
import { PromptInput, PromptInputAction, PromptInputActions, PromptInputTextarea } from "@/components/ui/prompt-input";
import { Button } from "@/components/ui/button";

type Api = (path: string, init?: RequestInit) => Promise<any>;
type Photo = { name: string; media_type: string; data: string; preview: string };
type Msg = { role: "user" | "assistant"; content: string; photos?: string[] };

// Anton's Slack-style mrkdwn → Markdown (older replies were written for Slack).
export function slackToMarkdown(s: string): string {
  return s
    .replace(/<(https?:\/\/[^|>]+)\|([^>]+)>/g, "[$2]($1)")
    .replace(/<(https?:\/\/[^>]+)>/g, "$1")
    .replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,:;!?]|$)/gm, "$1**$2**")
    .replace(/^(\s*)•\s+/gm, "$1- ");
}

const MAX_SIDE = 1568; // Claude's vision sweet spot; keeps uploads small

async function toPhoto(file: File): Promise<Photo> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error(`Can't read ${file.name}`));
      i.src = url;
    });
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    return { name: file.name, media_type: "image/jpeg", data: dataUrl.split(",")[1], preview: dataUrl };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function AntonChat({ api }: { api: Api }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api("/api/chat")
      .then((d) => setMsgs((d.messages as Msg[]).slice(-20)))
      .catch(() => {});
  }, [api]);

  const addFiles = async (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith("image/")).slice(0, 4 - photos.length);
    try {
      const converted = await Promise.all(images.map(toPhoto));
      setPhotos((p) => [...p, ...converted].slice(0, 4));
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const send = async () => {
    const m = text.trim();
    if ((!m && !photos.length) || busy) return;
    const sending = photos;
    setText("");
    setPhotos([]);
    setMsgs((x) => [...x, { role: "user", content: m, photos: sending.map((p) => p.preview) }]);
    setBusy(true);
    try {
      const d = await api("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: m, images: sending.map(({ media_type, data }) => ({ media_type, data })) }),
      });
      setMsgs((x) => [...x, { role: "assistant", content: d.reply }]);
    } catch (e) {
      setMsgs((x) => [...x, { role: "assistant", content: `⚠️ ${(e as Error).message}` }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <FileUpload onFilesAdded={addFiles} accept="image/*" multiple>
      <div className="flex flex-col gap-3">
        <ChatContainerRoot className="max-h-[32rem] min-h-[6rem] flex-1">
          <ChatContainerContent className="space-y-4 py-2">
            {msgs.length === 0 && !busy ? (
              <p className="text-paper-muted">Ask about your email, calendar, tickets or anything else. You can attach photos.</p>
            ) : null}
            {msgs.map((m, i) =>
              m.role === "user" ? (
                <Message key={i} className="justify-end">
                  <div className="flex max-w-[85%] flex-col items-end gap-2">
                    {m.photos?.length ? (
                      <div className="flex flex-wrap justify-end gap-2">
                        {m.photos.map((src, j) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={j} src={src} alt="attached photo" className="h-24 w-24 rounded-md object-cover" />
                        ))}
                      </div>
                    ) : null}
                    {m.content ? (
                      <MessageContent className="border border-dashed border-white/20 bg-transparent px-3 py-2 text-paper-body">
                        {m.content}
                      </MessageContent>
                    ) : null}
                  </div>
                </Message>
              ) : (
                <Message key={i}>
                  <MessageContent markdown className="share-article max-w-[95%] bg-transparent p-0 text-paper-body">
                    {slackToMarkdown(m.content)}
                  </MessageContent>
                </Message>
              ),
            )}
            {busy ? (
              <div className="flex items-center gap-2 text-paper-muted">
                <Loader variant="typing" size="sm" /> anton is thinking…
              </div>
            ) : null}
          </ChatContainerContent>
          <ChatContainerScrollAnchor />
        </ChatContainerRoot>

        <PromptInput
          value={text}
          onValueChange={setText}
          isLoading={busy}
          onSubmit={send}
          className="rounded-xl border border-dashed border-white/30 bg-transparent p-2"
        >
          {photos.length ? (
            <div className="flex flex-wrap gap-2 px-1 pb-2">
              {photos.map((p, i) => (
                <div key={i} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.preview} alt={p.name} className="h-16 w-16 rounded-md object-cover" />
                  <button
                    type="button"
                    aria-label={`Remove ${p.name}`}
                    onClick={() => setPhotos((x) => x.filter((_, j) => j !== i))}
                    className="absolute -right-1.5 -top-1.5 rounded-full bg-paper-bg p-0.5 text-paper-muted hover:text-paper-stamp"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <PromptInputTextarea placeholder="ask anton…" className="text-base text-white placeholder:text-paper-muted" />
          <PromptInputActions className="flex items-center justify-between pt-2">
            <PromptInputAction tooltip="Attach photos">
              <FileUploadTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-paper-muted hover:text-paper-accent" aria-label="Attach photos">
                  <ImagePlus className="h-4 w-4" />
                </Button>
              </FileUploadTrigger>
            </PromptInputAction>
            <PromptInputAction tooltip="Send">
              <Button
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={send}
                disabled={busy || (!text.trim() && !photos.length)}
                aria-label="Send"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </PromptInputAction>
          </PromptInputActions>
        </PromptInput>
      </div>

      <FileUploadContent>
        <div className="flex min-h-[200px] w-full max-w-md flex-col items-center justify-center rounded-lg border border-dashed border-paper-accent bg-paper-bg/90 p-8 text-paper-accent">
          <ImagePlus className="mb-2 h-8 w-8" />
          drop photos for anton
        </div>
      </FileUploadContent>
    </FileUpload>
  );
}
