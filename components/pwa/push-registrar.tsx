"use client";

import { useEffect, useState, useTransition } from "react";
import { subscribePush, unsubscribePush } from "@/lib/actions/push";
import { BellIcon } from "@/components/icons";

function urlBase64ToBuffer(base64: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const buf = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
  return buf;
}

export function PushRegistrar({ vapidPublic }: { vapidPublic: string }) {
  const [state, setState] = useState<"idle" | "granted" | "denied" | "unsupported">(
    "idle",
  );
  const [subscribed, setSubscribed] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "granted") setState("granted");
    if (Notification.permission === "denied") setState("denied");
    navigator.serviceWorker.register("/sw.js").then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(Boolean(sub));
    });
  }, []);

  async function enable() {
    if (!vapidPublic) return;
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setState("denied");
      return;
    }
    setState("granted");
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToBuffer(vapidPublic),
    });
    startTransition(async () => {
      await subscribePush({
        endpoint: sub.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(sub.getKey("p256dh")),
          auth: arrayBufferToBase64(sub.getKey("auth")),
        },
      });
      setSubscribed(true);
    });
  }

  async function disable() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
      startTransition(async () => {
        await unsubscribePush({ endpoint: sub.endpoint });
        setSubscribed(false);
      });
    }
  }

  if (state === "unsupported") {
    return (
      <div className="card p-4 text-xs text-muted">
        อุปกรณ์นี้ไม่รองรับ Web Push (ลอง Safari ≥ 16.4 หรือ Chrome บน Android)
      </div>
    );
  }

  return (
    <div className="card p-4 space-y-2">
      <div className="flex items-center gap-2 font-semibold">
        <BellIcon className="h-4 w-4" />
        การแจ้งเตือน Flash Sale
      </div>
      <p className="text-xs text-muted">
        เปิดเพื่อรับ push notification เมื่อร้านในรัศมีปล่อย flash sale
      </p>
      {subscribed ? (
        <button onClick={disable} disabled={isPending} className="btn-outline text-xs">
          {isPending ? "กำลังยกเลิก..." : "ปิดการแจ้งเตือน"}
        </button>
      ) : (
        <button
          onClick={enable}
          disabled={isPending || state === "denied" || !vapidPublic}
          className="btn-primary text-xs disabled:opacity-50"
        >
          {!vapidPublic
            ? "ยังไม่ได้ตั้งค่า VAPID"
            : state === "denied"
              ? "ถูกบล็อคในเบราว์เซอร์"
              : isPending
                ? "กำลังเปิด..."
                : "เปิดการแจ้งเตือน"}
        </button>
      )}
    </div>
  );
}

function arrayBufferToBase64(buf: ArrayBuffer | null): string {
  if (!buf) return "";
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
