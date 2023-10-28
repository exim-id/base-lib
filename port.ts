/**
buat panitia service, untuk handle Docker dan custom docker.
 */

export default {
  internal: {
    // basic service...
    auth: {
      api: 3010,
      grpc: 30010,
    },
    user: {
      api: 3020,
      grpc: 30020,
    },
    audit: {
      api: 3030,
      grpc: 30030,
    },

    // business service...
    subscriber: {
      api: 3040,
      grpc: 30040,
    },
    report: {
      api: 3050,
      grpc: 30050,
    },
  },
  client: {
    // basic service...
    auth: {
      api: 4010,
      grpc: 40010,
    },
    user: {
      api: 4020,
      grpc: 40020,
    },
    audit: {
      api: 4030,
      grpc: 40030,
    },
    report: {
      api: 4040,
      grpc: 40040,
    },
    notification: {
      api: 4050,
    },

    // business service...
    master: {
      api: 4060,
      grpc: 40060,
    },
    finance: {
      api: 4070,
      grpc: 40070,
    },
    marketing: {
      api: 4080,
      grpc: 40080,
    },
    inventory: {
      api: 4090,
      grpc: 40090,
    },
    manufacture: {
      api: 4100,
      grpc: 40100,
    },
    stream: {
      api: 4110,
      grpc: 40110,
    },
    sampling: {
      api: 4120,
      grpc: 40120,
    },
    scheduler: {},
  },
};
