import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Message, PaginatedResponse } from "@/types";
import { toast } from "sonner";

export function useMessages(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["messages", params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Message>>("/messages", {
        params,
      });
      return data;
    },
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      to: string;
      body: string;
      scheduled_at?: string;
    }) => {
      const { data } = await api.post<Message>("/messages", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Message sent successfully.");
    },
    onError: () => {
      toast.error("Failed to send message. Check your provider configuration.");
    },
  });
}

export function useSendBulk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      recipients: { phone: string; name?: string }[];
      body: string;
      scheduled_at?: string;
    }) => {
      const { data } = await api.post("/messages/bulk", payload);
      return data;
    },
    onSuccess: (data: { queued: number }) => {
      qc.invalidateQueries({ queryKey: ["messages"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      toast.success(`${data.queued} messages queued successfully.`);
    },
    onError: () => {
      toast.error("Bulk send failed.");
    },
  });
}