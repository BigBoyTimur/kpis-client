import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/axios";
import { Metric } from "@/types";

/**
 * Custom hook for updating metrics.
 * Uses react-query's useMutation for handling the PUT request.
 */
export const useUpdateMetrics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (metricsToUpdate: Metric[]) => {
      const response = await apiClient.put("/metrics", metricsToUpdate);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch the metrics data after a successful update
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      console.log("Metrics updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating metrics:", error);
      // Вы можете показать всплывающее уведомление или сообщение об ошибке пользователю
    },
  });
};