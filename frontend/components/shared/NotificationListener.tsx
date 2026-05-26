"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { API_BASE_URL } from "@/services/api";

export default function NotificationListener() {
  const { user, isAuthenticated } = useAuthStore();
  const { addNotification, activeChatRoomId } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;

    const socketURL = API_BASE_URL.replace("/api", "");
    const socket = io(socketURL, { withCredentials: true });

    socket.on("connect", () => {
      socket.emit("join_user", user._id);
    });

    // 1. Listen for new bookings (for workers)
    socket.on("new_booking", (data: any) => {
      if (user.role === "worker") {
        addNotification({
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
      const isWorker = user.role === "worker";
      addNotification({
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
      if (activeChatRoomId === data.jobId) return;

      const isWorker = user.role === "worker";
      addNotification({
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
  }, [isAuthenticated, user, addNotification, activeChatRoomId]);

  return null;
}
