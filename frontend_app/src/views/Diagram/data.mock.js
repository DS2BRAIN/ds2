export const recipe = {
  id: "recipe-id-0002",
  name: "Coverage calculation",
  owner: {
    id: "user-id-0002",
    fullName: "System User",
    email: "user@example.com",
    groups: [
      {
        id: "group-id-0002",
        name: "RF department",
        description: "Users from RF department",
      },
      {
        id: "group-id-0004",
        name: "Everyone",
      },
    ],
  },
  groups: [
    {
      id: "group-id-0002",
      name: "RF department",
      description: "Users from RF department",
    },
    {
      id: "group-id-0004",
      name: "Everyone",
    },
  ],
  stages: [
    {
      id: "stage-id-0002",
      order: 1,
      job: {
        id: "job-id-0002",
        name: "Project generation",
        owner: {
          id: "user-id-0001",
          fullName: "System administrator",
          email: "admin@example.com",
          groups: [
            {
              id: "group-id-0004",
              name: "Everyone",
            },
            {
              id: "group-id-0003",
              name: "Administrators",
              description: "System administrators",
            },
          ],
        },
        type: "script",
        isSingleThread: true,
        groups: [
          {
            id: "group-id-0004",
            name: "Everyone",
          },
        ],
        description: "HTZ coverage calculation",
        OS: ["windows"],
        calls: [
          {
            id: "call-id-0002",
            system: "windows",
            command:
              "prm-gen.bat {{prm-file}} {{ewf-file}} {{geo-file}} {{sol-file}} {{blg-file}}",
          },
        ],
        inputs: [
          {
            id: "input-id-0001",
            name: "Network file",
            ident: "ewf-file",
            isArray: false,
            isRequired: true,
            type: "file",
            descriptor: {
              extensions: ["EWFx"],
            },
          },
          {
            id: "input-id-0002",
            name: "Parameters file",
            ident: "prm-file",
            isArray: false,
            isRequired: true,
            type: "file",
            descriptor: {
              extensions: ["PRM"],
            },
          },
          {
            id: "input-id-0003",
            name: "DTM layer file",
            ident: "geo-file",
            isArray: false,
            isRequired: true,
            type: "file",
            descriptor: {
              extensions: ["GEO"],
            },
          },
          {
            id: "input-id-0004",
            name: "Clutter layer file",
            ident: "sol-file",
            isArray: false,
            isRequired: false,
            type: "file",
            descriptor: {
              extensions: ["SOL"],
            },
          },
          {
            id: "input-id-0005",
            name: "Building layer file",
            ident: "blg-file",
            isArray: false,
            isRequired: false,
            type: "file",
            descriptor: {
              extensions: ["BLG"],
            },
          },
        ],
        outputs: [
          {
            id: "output-id-0002",
            name: "Generated PROx file",
            ident: "pro-file-out",
            isArray: false,
            isRequired: true,
            type: "file",
            descriptor: {
              type: "search",
              relativeDir: "",
              namePattern: "*.PRM",
            },
          },
          {
            id: "output-id-0003",
            name: "Forwarded PRM file",
            ident: "prm-file",
            isArray: false,
            isRequired: true,
            type: "file",
            descriptor: {
              type: "search",
              relativeDir: ".",
              namePattern: "*.PRM",
            },
          },
          {
            id: "output-id-0004",
            name: "Forwarded GEO file",
            ident: "geo-file-out",
            isArray: false,
            isRequired: true,
            type: "file",
            descriptor: {
              type: "search",
              relativeDir: ".",
              namePattern: "*.GEO",
            },
          },
          {
            id: "output-id-0005",
            name: "Forwarded SOL file",
            ident: "sol-file-out",
            isArray: false,
            isRequired: true,
            type: "file",
            descriptor: {
              type: "search",
              relativeDir: ".",
              namePattern: "*.SOL",
            },
          },
          {
            id: "output-id-0006",
            name: "Forwarded SOL file",
            ident: "blg-file-out",
            isArray: false,
            isRequired: true,
            type: "file",
            descriptor: {
              type: "search",
              relativeDir: ".",
              namePattern: "*.BLG",
            },
          },
          {
            id: "output-id-0007",
            name: "Forwarded EWFx file",
            ident: "ewf-file-out",
            isArray: false,
            isRequired: true,
            type: "file",
            descriptor: {
              type: "search",
              relativeDir: "",
              namePattern: "*.EWFx",
            },
          },
        ],
        inputData: {},
        outputData: {},
      },
    },
    {
      id: "stage-id-0003",
      order: 2,
      job: {
        id: "job-id-0003",
        name: "Coverage calculation",
        owner: {
          id: "user-id-0001",
          fullName: "System administrator",
          email: "admin@example.com",
          groups: [
            {
              id: "group-id-0004",
              name: "Everyone",
            },
            {
              id: "group-id-0003",
              name: "Administrators",
              description: "System administrators",
            },
          ],
        },
        type: "program",
        isSingleThread: true,
        groups: [
          {
            id: "group-id-0004",
            name: "Everyone",
          },
        ],
        description: "HTZ coverage calculation",
        OS: ["windows"],
        calls: [
          {
            id: "call-id-0003",
            system: "windows",
            command:
              '"C:/ATDI/HTZ communications x64/HTZcx64.exe" {{project-file}} -ADMIN 1010',
          },
        ],
        inputs: [
          {
            id: "input-id-0007",
            name: "Project file",
            ident: "project-file",
            isArray: false,
            isRequired: true,
            type: "file",
            descriptor: {
              extensions: ["PROx"],
            },
          },
          {
            id: "input-id-0008",
            name: "Network file",
            ident: "ewf-file",
            isArray: false,
            isRequired: true,
            type: "file",
            descriptor: {
              extensions: ["EWFx"],
            },
          },
          {
            id: "input-id-0009",
            name: "Parameters file",
            ident: "prm-file",
            isArray: false,
            isRequired: true,
            type: "file",
            descriptor: {
              extensions: ["PRM"],
            },
          },
          {
            id: "input-id-0010",
            name: "DTM layer file",
            ident: "geo-file",
            isArray: false,
            isRequired: true,
            type: "file",
            descriptor: {
              extensions: ["GEO"],
            },
          },
          {
            id: "input-id-0011",
            name: "Clutter layer file",
            ident: "sol-file",
            isArray: false,
            isRequired: false,
            type: "file",
            descriptor: {
              extensions: ["SOL"],
            },
          },
          {
            id: "input-id-0012",
            name: "Building layer file",
            ident: "blg-file",
            isArray: false,
            isRequired: false,
            type: "file",
            descriptor: {
              extensions: ["BLG"],
            },
          },
        ],
        outputs: [
          {
            id: "output-id-0008",
            name: "EWFx file with coverage",
            ident: "ewf-file-out",
            isArray: false,
            isRequired: true,
            type: "file",
            descriptor: {
              type: "search",
              relativeDir: ".",
              namePattern: "*.EWFx",
            },
          },
        ],
        inputData: {},
        outputData: {},
      },
    },
  ],
  pipes: [
    {
      id: "pipe-id-0001",
      from: {
        stage: {
          id: "stage-id-0002",
          order: 1,
          job: {
            id: "job-id-0002",
            name: "Project generation",
            owner: {
              id: "user-id-0001",
              fullName: "System administrator",
              email: "admin@example.com",
              groups: [
                {
                  id: "group-id-0004",
                  name: "Everyone",
                },
                {
                  id: "group-id-0003",
                  name: "Administrators",
                  description: "System administrators",
                },
              ],
            },
            type: "script",
            isSingleThread: true,
            groups: [
              {
                id: "group-id-0004",
                name: "Everyone",
              },
            ],
            description: "HTZ coverage calculation",
            OS: ["windows"],
            calls: [
              {
                id: "call-id-0002",
                system: "windows",
                command:
                  "prm-gen.bat {{prm-file}} {{ewf-file}} {{geo-file}} {{sol-file}} {{blg-file}}",
              },
            ],
            inputs: [
              {
                id: "input-id-0001",
                name: "Network file",
                ident: "ewf-file",
                isArray: false,
                isRequired: true,
                type: "file",
                descriptor: {
                  extensions: ["EWFx"],
                },
              },
              {
                id: "input-id-0002",
                name: "Parameters file",
                ident: "prm-file",
                isArray: false,
                isRequired: true,
                type: "file",
                descriptor: {
                  extensions: ["PRM"],
                },
              },
              {
                id: "input-id-0003",
                name: "DTM layer file",
                ident: "geo-file",
                isArray: false,
                isRequired: true,
                type: "file",
                descriptor: {
                  extensions: ["GEO"],
                },
              },
              {
                id: "input-id-0004",
                name: "Clutter layer file",
                ident: "sol-file",
                isArray: false,
                isRequired: false,
                type: "file",
                descriptor: {
                  extensions: ["SOL"],
                },
              },
              {
                id: "input-id-0005",
                name: "Building layer file",
                ident: "blg-file",
                isArray: false,
                isRequired: false,
                type: "file",
                descriptor: {
                  extensions: ["BLG"],
                },
              },
            ],
            outputs: [
              {
                id: "output-id-0002",
                name: "Generated PROx file",
                ident: "pro-file-out",
                isArray: false,
                isRequired: true,
                type: "file",
                descriptor: {
                  type: "search",
                  relativeDir: "",
                  namePattern: "*.PRM",
                },
              },
              {
                id: "output-id-0003",
                name: "Forwarded PRM file",
                ident: "prm-file",
                isArray: false,
                isRequired: true,
                type: "file",
                descriptor: {
                  type: "search",
                  relativeDir: ".",
                  namePattern: "*.PRM",
                },
              },
              {
                id: "output-id-0004",
                name: "Forwarded GEO file",
                ident: "geo-file-out",
                isArray: false,
                isRequired: true,
                type: "file",
                descriptor: {
                  type: "search",
                  relativeDir: ".",
                  namePattern: "*.GEO",
                },
              },
              {
                id: "output-id-0005",
                name: "Forwarded SOL file",
                ident: "sol-file-out",
                isArray: false,
                isRequired: true,
                type: "file",
                descriptor: {
                  type: "search",
                  relativeDir: ".",
                  namePattern: "*.SOL",
                },
              },
              {
                id: "output-id-0006",
                name: "Forwarded SOL file",
                ident: "blg-file-out",
                isArray: false,
                isRequired: true,
                type: "file",
                descriptor: {
                  type: "search",
                  relativeDir: ".",
                  namePattern: "*.BLG",
                },
              },
              {
                id: "output-id-0007",
                name: "Forwarded EWFx file",
                ident: "ewf-file-out",
                isArray: false,
                isRequired: true,
                type: "file",
                descriptor: {
                  type: "search",
                  relativeDir: "",
                  namePattern: "*.EWFx",
                },
              },
            ],
            inputData: {},
            outputData: {},
          },
        },
        output: {
          id: "output-id-0002",
          name: "Generated PROx file",
          ident: "pro-file-out",
          isArray: false,
          isRequired: true,
          type: "file",
          descriptor: {
            type: "search",
            relativeDir: "",
            namePattern: "*.PRM",
          },
        },
      },
      to: {
        stage: {
          id: "stage-id-0003",
          order: 2,
          job: {
            id: "job-id-0003",
            name: "Coverage calculation",
            owner: {
              id: "user-id-0001",
              fullName: "System administrator",
              email: "admin@example.com",
              groups: [
                {
                  id: "group-id-0004",
                  name: "Everyone",
                },
                {
                  id: "group-id-0003",
                  name: "Administrators",
                  description: "System administrators",
                },
              ],
            },
            type: "program",
            isSingleThread: true,
            groups: [
              {
                id: "group-id-0004",
                name: "Everyone",
              },
            ],
            description: "HTZ coverage calculation",
            OS: ["windows"],
            calls: [
              {
                id: "call-id-0003",
                system: "windows",
                command:
                  '"C:/ATDI/HTZ communications x64/HTZcx64.exe" {{project-file}} -ADMIN 1010',
              },
            ],
            inputs: [
              {
                id: "input-id-0007",
                name: "Project file",
                ident: "project-file",
                isArray: false,
                isRequired: true,
                type: "file",
                descriptor: {
                  extensions: ["PROx"],
                },
              },
              {
                id: "input-id-0008",
                name: "Network file",
                ident: "ewf-file",
                isArray: false,
                isRequired: true,
                type: "file",
                descriptor: {
                  extensions: ["EWFx"],
                },
              },
              {
                id: "input-id-0009",
                name: "Parameters file",
                ident: "prm-file",
                isArray: false,
                isRequired: true,
                type: "file",
                descriptor: {
                  extensions: ["PRM"],
                },
              },
              {
                id: "input-id-0010",
                name: "DTM layer file",
                ident: "geo-file",
                isArray: false,
                isRequired: true,
                type: "file",
                descriptor: {
                  extensions: ["GEO"],
                },
              },
              {
                id: "input-id-0011",
                name: "Clutter layer file",
                ident: "sol-file",
                isArray: false,
                isRequired: false,
                type: "file",
                descriptor: {
                  extensions: ["SOL"],
                },
              },
              {
                id: "input-id-0012",
                name: "Building layer file",
                ident: "blg-file",
                isArray: false,
                isRequired: false,
                type: "file",
                descriptor: {
                  extensions: ["BLG"],
                },
              },
            ],
            outputs: [
              {
                id: "output-id-0008",
                name: "EWFx file with coverage",
                ident: "ewf-file-out",
                isArray: false,
                isRequired: true,
                type: "file",
                descriptor: {
                  type: "search",
                  relativeDir: ".",
                  namePattern: "*.EWFx",
                },
              },
            ],
            inputData: {},
            outputData: {},
          },
        },
        input: {
          id: "input-id-0007",
          name: "Project file",
          ident: "project-file",
          isArray: false,
          isRequired: true,
          type: "file",
          descriptor: {
            extensions: ["PROx"],
          },
        },
      },
    },
  ],
  inputs: [],
  outputs: [],
};
