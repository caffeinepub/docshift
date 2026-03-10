import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ConversionJob {
    id: JobId;
    status: Status;
    createdAt: Time;
    filename: string;
    progress: bigint;
    targetFormat: string;
    sourceFormat: string;
}
export type JobId = bigint;
export type Time = bigint;
export enum Status {
    pending = "pending",
    done = "done",
    converting = "converting"
}
export interface backendInterface {
    createJob(filename: string, sourceFormat: string, targetFormat: string): Promise<JobId>;
    getJob(jobId: JobId): Promise<ConversionJob | null>;
    getRecentJobs(limit: bigint): Promise<Array<ConversionJob>>;
    updateProgress(jobId: JobId, status: Status, progress: bigint): Promise<void>;
}
