import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Status } from "../backend";
import { useActor } from "./useActor";

export function useRecentJobs() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecentJobs(BigInt(10));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetJob(jobId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["job", jobId?.toString()],
    queryFn: async () => {
      if (!actor || jobId === null) return null;
      return actor.getJob(jobId);
    },
    enabled: !!actor && !isFetching && jobId !== null,
    refetchInterval: 2000,
  });
}

export function useCreateJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      filename,
      sourceFormat,
      targetFormat,
    }: {
      filename: string;
      sourceFormat: string;
      targetFormat: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createJob(filename, sourceFormat, targetFormat);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useUpdateProgress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      jobId,
      status,
      progress,
    }: {
      jobId: bigint;
      status: Status;
      progress: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProgress(jobId, status, progress);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["job", variables.jobId.toString()],
      });
    },
  });
}
