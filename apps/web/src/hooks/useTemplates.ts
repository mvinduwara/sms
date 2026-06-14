import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Template } from "@/types";
import { toast } from "sonner";

export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data } = await api.get<Template[]>("/templates");
      return data;
    },
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; body: string }) => {
      const { data } = await api.post<Template>("/templates", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template created.");
    },
    onError: () => toast.error("Failed to create template."),
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: Partial<Template> & { id: string }) => {
      const { data } = await api.put<Template>(`/templates/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template updated.");
    },
    onError: () => toast.error("Failed to update template."),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/templates/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template deleted.");
    },
    onError: () => toast.error("Failed to delete template."),
  });
}