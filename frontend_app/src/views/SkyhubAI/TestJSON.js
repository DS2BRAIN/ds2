export const AWS_REGION = {
  provider: "AWS",
  availableContinents: [
    {
      continentName: "US East",
      availableRegions: [
        {
          cloud: "AWS",
          name: "N. Virginia",
          regionName: "US_Test_1",
        },
        {
          cloud: "AWS",
          name: "N. Virginia",
          regionName: "US_Test_2",
        },
        {
          cloud: "AWS",
          name: "N. Virginia",
          regionName: "US_Test_3",
        },
      ],
    },
    {
      continentName: "US West",
      availableRegions: [
        {
          cloud: "AWS",
          name: "N. California",
          regionName: "US_Test_3",
        },
        {
          cloud: "AWS",
          name: "Los Angeles",
          regionName: "US_TEST_4",
        },
        {
          cloud: "AWS",
          name: "Oregon",
          regionName: "US_TEST_5",
        },
      ],
    },
    {
      continentName: "Asia Pacific",
      availableRegions: [
        {
          cloud: "AWS",
          name: "Hong Kong",
          regionName: "ASIA_TEST_1",
        },
        {
          cloud: "AWS",
          name: "Seoul",
          regionName: "ASIA_TEST_2",
        },
        {
          cloud: "AWS",
          name: "Tokyo",
          regionName: "ASIA_TEST_1",
        },
        {
          cloud: "AWS",
          name: "Tokyo",
          regionName: "ASIA_TEST_1",
        },
      ],
    },
    {
      continentName: "Europe",
      availableRegions: [
        {
          cloud: "AWS",
          name: "Ireland",
          regionName: "UK_TEST_1",
        },
        {
          cloud: "AWS",
          name: "Frankfurt",
          regionName: "UK_TEST_2",
        },
        {
          cloud: "AWS",
          name: "London",
          regionName: "UK_TEST_3",
        },
        {
          cloud: "AWS",
          name: "Paris",
          regionName: "UK_TEST_4",
        },
      ],
    },
    {
      continentName: "Canada",
      availableRegions: [
        {
          cloud: "AWS",
          name: "Central",
          regionName: "CANADA_TEST_1",
        },
        {
          cloud: "AWS",
          name: "Central",
          regionName: "CANADA_TEST_2",
        },
        {
          cloud: "AWS",
          name: "Central",
          regionName: "CANADA_TEST_3",
        },
      ],
    },
  ],
};

export const DETAIL_DATA = {
  availableSpecifications: [
    {
      instance_name: "pd4.24xlarge",
      on_demand_hourly_rate: "$32.7726",
      v_cpu: "96",
      memory: "1152GiB",
      storage: "8 x 1000 SSD",
      network_performance: "400 Gigabit",
    },
    {
      instance_name: "pd3.2xlarge",
      on_demand_hourly_rate: "$3.06",
      v_cpu: "8",
      memory: "61GiB",
      storage: "EBS only",
      network_performance: "up to 10 Gigabit",
    },
    {
      instance_name: "pd3.8xlarge",
      on_demand_hourly_rate: "$12.24",
      v_cpu: "32",
      memory: "244GiB",
      storage: "EBS only",
      network_performance: "10 Gigabit",
    },
  ],
};

export const SERVER_DATA = {
  availableServers: [
    {
      userId: "610",
      movieId: "111111",
      rating: "4.5",
      timeslamp: "144124214111",
    },
    {
      userId: "611",
      movieId: "111112",
      rating: "5",
      timeslamp: "144124214222",
    },
    {
      userId: "612",
      movieId: "111113",
      rating: "3.6",
      timeslamp: "144124214333",
    },
    {
      userId: "613",
      movieId: "111113",
      rating: "3.6",
      timeslamp: "144124214444",
    },
    {
      userId: "614",
      movieId: "111113",
      rating: "3.6",
      timeslamp: "144124214555",
    },
    {
      userId: "615",
      movieId: "111113",
      rating: "3.6",
      timeslamp: "144124214666",
    },
    {
      userId: "616",
      movieId: "111113",
      rating: "3.6",
      timeslamp: "144124214666",
    },
    {
      userId: "617",
      movieId: "111113",
      rating: "3.6",
      timeslamp: "144124214666",
    },
    {
      userId: "618",
      movieId: "111113",
      rating: "3.6",
      timeslamp: "144124214666",
    },
    {
      userId: "617",
      movieId: "111113",
      rating: "3.6",
      timeslamp: "144124214666",
    },
    {
      userId: "618",
      movieId: "111113",
      rating: "3.6",
      timeslamp: "144124214666",
    },
    {
      userId: "617",
      movieId: "111113",
      rating: "3.6",
      timeslamp: "144124214666",
    },
    {
      userId: "618",
      movieId: "111113",
      rating: "3.6",
      timeslamp: "144124214666",
    },
  ],
};

export const API_CALL = {
  count: "9999",
};
