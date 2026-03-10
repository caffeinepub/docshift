import Map "mo:core/Map";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";

actor {
  type JobId = Nat;
  type Status = { #pending; #converting; #done };

  type ConversionJob = {
    id : JobId;
    filename : Text;
    sourceFormat : Text;
    targetFormat : Text;
    status : Status;
    progress : Nat;
    createdAt : Time.Time;
  };

  module ConversionJob {
    public func compareByCreatedAt(a : ConversionJob, b : ConversionJob) : Order.Order {
      if (a.createdAt < b.createdAt) { #greater } else if (a.createdAt > b.createdAt) {
        #less;
      } else { #equal };
    };
  };

  var nextJobId = 0;
  let jobs = Map.empty<JobId, ConversionJob>();

  public shared ({ caller }) func createJob(filename : Text, sourceFormat : Text, targetFormat : Text) : async JobId {
    let jobId = nextJobId;
    let job : ConversionJob = {
      id = jobId;
      filename;
      sourceFormat;
      targetFormat;
      status = #pending;
      progress = 0;
      createdAt = Time.now();
    };
    jobs.add(jobId, job);
    nextJobId += 1;
    jobId;
  };

  public shared ({ caller }) func updateProgress(jobId : JobId, status : Status, progress : Nat) : async () {
    switch (jobs.get(jobId)) {
      case (null) {
        ();
      };
      case (?job) {
        let updatedJob = {
          job with
          status;
          progress;
        };
        jobs.add(jobId, updatedJob);
      };
    };
  };

  public query ({ caller }) func getJob(jobId : JobId) : async ?ConversionJob {
    jobs.get(jobId);
  };

  public query ({ caller }) func getRecentJobs(limit : Nat) : async [ConversionJob] {
    jobs.values().toArray().sort(ConversionJob.compareByCreatedAt).sliceToArray(0, limit);
  };
};
