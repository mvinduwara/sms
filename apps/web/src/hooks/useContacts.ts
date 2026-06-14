import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Contact, PaginatedResponse } from "@/types";
import { toast } from "sonner";

export function useContacts(params: {
  page?: number;
  limit?: number;
  search?: string;
  group?: string;
}) {
  return useQuery({
    queryKey: ["contacts", params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Contact>>("/contacts", {
        params,
      });
      return data;
    },
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: Omit<Contact, "id" | "created_at">
    ) => {
      const { data } = await api.post<Contact>("/contacts", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact created.");
    },
    onError: () => toast.error("Failed to create contact."),
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: Partial<Contact> & { id: string }) => {
      const { data } = await api.put<Contact>(`/contacts/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact updated.");
    },
    onError: () => toast.error("Failed to update contact."),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/contacts/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact deleted.");
    },
    onError: () => toast.error("Failed to delete contact."),
  });
}