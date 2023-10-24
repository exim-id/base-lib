export default {
  internal: {
    // basic service...
    auth: {
      api: 3000,
      grpc: 30000,
    },
    user: {
      api: 3010,
      grpc: 30010,
    },
    audit: {
      api: 3020,
      grpc: 30020,
    },

    // business service...
    subscriber: {
      api: 3030,
      grpc: 30030,
    },
    report: {
      api: 3040,
      grpc: 30040,
    },
  },
  client: {
    // basic service...
    auth: {
      api: 4000,
      grpc: 40000,
    },
    user: {
      api: 4010,
      grpc: 40010,
    },
    audit: {
      api: 4020,
      grpc: 40020,
    },
    notification: {
      api: 4030,
    },
    report: {
      api: 4040,
      grpc: 40040,
    },

    // business service...
    master: {
      api: 4050,
      grpc: 40050,
    },
    finance: {
      api: 4060,
      grpc: 40060,
    },
    marketing: {
      api: 4070,
      grpc: 40070,
    },
    inventory: {
      api: 4080,
      grpc: 40080,
    },
    manufacture: {
      api: 4090,
      grpc: 40090,
    },
    stream: {
      api: 4100,
      grpc: 40100,
    },
  },
};
