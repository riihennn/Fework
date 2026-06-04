"use client";

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { BACKEND_URL } from "@/services/api";

export default function NotificationListener() {
  const { user, isAuthenticated } = useAuthStore();
  const userId = user?._id;
  const userRole = user?.role;

  // Use a ref to always have the latest addNotification without putting it in deps
  const addNotificationRef = useRef(useNotificationStore.getState().addNotification);
  const activeChatRoomIdRef = useRef(useNotificationStore.getState().activeChatRoomId);

  // Keep the refs fresh without triggering re-connections
  useEffect(() => {
    return useNotificationStore.subscribe((state) => {
      addNotificationRef.current = state.addNotification;
      activeChatRoomIdRef.current = state.activeChatRoomId;
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    const socketURL = BACKEND_URL.replace("/api", "");
    const socket = io(socketURL, { withCredentials: true });

    socket.on("connect", () => {
      socket.emit("join_user", userId);
    });

    // 1. Listen for new bookings (for workers)
    socket.on("new_booking", (data: any) => {
      if (userRole === "worker") {
        addNotificationRef.current({
          type: "booking",
          title: "New Booking Request",
          description: `You received a request for ${data.job?.service || "service"} from ${data.job?.client || "a client"}.`,
          link: "/worker/jobs",
          jobId: data.job?.id,
        });
      }
    });

    // 2. Listen for booking updates (for both)
    socket.on("booking_updated", (data: any) => {
      const isWorker = userRole === "worker";
      addNotificationRef.current({
        type: "booking",
        title: "Booking Updated",
        description: `Booking status updated to ${data.status?.replace("_", " ")}.`,
        link: isWorker ? "/worker/jobs" : "/my-bookings",
        jobId: data.jobId,
      });
    });

    // 3. Listen for message notifications (for both)
    socket.on("message_notification", (data: any) => {
      // Don't alert if the user has this specific chat box open
      if (activeChatRoomIdRef.current === data.jobId) return;

      const isWorker = userRole === "worker";
      addNotificationRef.current({
        type: "message",
        title: `New Message from ${data.senderName}`,
        description: data.message,
        link: isWorker ? "/worker/chats" : "/chats",
        jobId: data.jobId,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, userId, userRole]); // Only reconnect when user identity changes

  return null;
}
