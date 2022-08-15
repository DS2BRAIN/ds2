import { backendurl } from "../../../../support/commands";
describe("customTraining", function() {
  const createJupyter = () => {
    cy.intercept("POST", `${backendurl}jupyterprojects/*`, {
      statusCode: 200,
      body: {
        result: "success",
        projectName: "racgoo10000",
        user: 21400,
        id: 299,
        instances: {
          instanceId: "i-0c62a84b7e05eb2fc",
          status: 1,
          jupyterProject: 299,
          region: "ap-northeast-2",
          created_at: "2021-09-02T01:37:05.355318",
          serverType: "g4dn.xlarge",
          id: 462,
        },
      },
    }).as("createjupyter");
  };

  const getJupyter = () => {
    cy.intercept("GET", `${backendurl}jupyterprojects/299/*`, {
      statusCode: 200,
      body: {
        id: 299,
        projectName: "racgoo10000",
        status: null,
        created_at: "2021-09-02T01:37:03",
        updated_at: "2021-09-02T01:37:03",
        user: 21400,
        valueForPredict: null,
        option: null,
        csvupload: null,
        fileStructure: null,
        fileStructureGAN: null,
        filePath: null,
        statusText: null,
        originalFileName: null,
        trainingMethod: null,
        detectedTrainingMethod: null,
        isTest: null,
        isSample: null,
        errorCountConflict: 0,
        errorCountMemory: 0,
        errorCountNotExpected: 0,
        successCount: 0,
        valueForNorm: null,
        description: null,
        license: null,
        sampleData: null,
        yClass: null,
        datasetlicense: null,
        hasTextData: null,
        hasImageData: null,
        isSentCompletedEmail: null,
        projectcategory: null,
        isParameterCompressed: null,
        fileSize: null,
        hasTimeSeriesData: null,
        isFavorite: null,
        dataset: null,
        joinInfo: null,
        trainingColumnInfo: null,
        preprocessingInfo: null,
        preprocessingInfoValue: null,
        labelproject: null,
        isSentFirstModelDoneEmail: null,
        valueForPredictColumnId: null,
        dataconnectorsList: null,
        timeSeriesColumnInfo: null,
        startTimeSeriesDatetime: null,
        endTimeSeriesDatetime: null,
        analyticsStandard: null,
        prescriptionAnalyticsInfo: null,
        isDeleted: null,
        webhookURL: null,
        webhookMethod: null,
        webhookData: null,
        sharedgroup: null,
        background: null,
        resultJson: null,
        labelType: null,
        framework: null,
        developProjectId: null,
        minServerSize: null,
        maxServerSize: null,
        startServerSize: null,
        autoScalingGroupName: null,
        targetGroupArn: null,
        ruleArn: null,
        server_size_changed_at: "2021-09-02T01:37:03",
        instances: [
          {
            AmiLaunchIndex: 0,
            ImageId: "ami-08b3a425cd8e457c9",
            InstanceId: "i-0c62a84b7e05eb2fc",
            InstanceType: "g4dn.xlarge",
            KeyName: "astore",
            LaunchTime: "2021-09-02T01:37:05+00:00",
            Monitoring: { State: "enabled" },
            Placement: {
              AvailabilityZone: "ap-northeast-2c",
              GroupName: "",
              Tenancy: "default",
            },
            PrivateDnsName: "ip-172-31-17-189.ap-northeast-2.compute.internal",
            PrivateIpAddress: "172.31.17.189",
            ProductCodes: [],
            PublicDnsName:
              "ec2-3-35-16-111.ap-northeast-2.compute.amazonaws.com",
            PublicIpAddress: "3.35.16.111",
            State: { Code: 0, Name: "pending" },
            StateTransitionReason: "",
            SubnetId: "subnet-99bbedd5",
            VpcId: "vpc-29e81842",
            Architecture: "x86_64",
            BlockDeviceMappings: [
              {
                DeviceName: "/dev/sda1",
                Ebs: {
                  AttachTime: "2021-09-02T01:37:06+00:00",
                  DeleteOnTermination: true,
                  Status: "attaching",
                  VolumeId: "vol-068270f32dd64eb34",
                },
              },
            ],
            ClientToken: "2f440404-1628-465e-a09c-5a38af1b84ed",
            EbsOptimized: false,
            EnaSupport: true,
            Hypervisor: "xen",
            NetworkInterfaces: [
              {
                Association: {
                  IpOwnerId: "amazon",
                  PublicDnsName:
                    "ec2-3-35-16-111.ap-northeast-2.compute.amazonaws.com",
                  PublicIp: "3.35.16.111",
                },
                Attachment: {
                  AttachTime: "2021-09-02T01:37:05+00:00",
                  AttachmentId: "eni-attach-0bcf247103fd452ee",
                  DeleteOnTermination: true,
                  DeviceIndex: 0,
                  Status: "attaching",
                  NetworkCardIndex: 0,
                },
                Description: "",
                Groups: [
                  {
                    GroupName: "jupyter-security",
                    GroupId: "sg-049207c385d8067de",
                  },
                ],
                Ipv6Addresses: [],
                MacAddress: "0a:3a:4e:02:77:4c",
                NetworkInterfaceId: "eni-02266651302badc83",
                OwnerId: "691864559919",
                PrivateDnsName:
                  "ip-172-31-17-189.ap-northeast-2.compute.internal",
                PrivateIpAddress: "172.31.17.189",
                PrivateIpAddresses: [
                  {
                    Association: {
                      IpOwnerId: "amazon",
                      PublicDnsName:
                        "ec2-3-35-16-111.ap-northeast-2.compute.amazonaws.com",
                      PublicIp: "3.35.16.111",
                    },
                    Primary: true,
                    PrivateDnsName:
                      "ip-172-31-17-189.ap-northeast-2.compute.internal",
                    PrivateIpAddress: "172.31.17.189",
                  },
                ],
                SourceDestCheck: true,
                Status: "in-use",
                SubnetId: "subnet-99bbedd5",
                VpcId: "vpc-29e81842",
                InterfaceType: "interface",
              },
            ],
            RootDeviceName: "/dev/sda1",
            RootDeviceType: "ebs",
            SecurityGroups: [
              {
                GroupName: "jupyter-security",
                GroupId: "sg-049207c385d8067de",
              },
            ],
            SourceDestCheck: true,
            Tags: [
              { Key: "appToken", Value: "46638768992f42248002af4ba0ee75d2" },
              { Key: "configOption", Value: "dev" },
              { Key: "jupyterId", Value: "299" },
              { Key: "jupyterServerId", Value: "462" },
              { Key: "userId", Value: "21400" },
            ],
            VirtualizationType: "hvm",
            CpuOptions: { CoreCount: 2, ThreadsPerCore: 2 },
            CapacityReservationSpecification: {
              CapacityReservationPreference: "open",
            },
            HibernationOptions: { Configured: false },
            MetadataOptions: {
              State: "pending",
              HttpTokens: "optional",
              HttpPutResponseHopLimit: 1,
              HttpEndpoint: "enabled",
            },
            EnclaveOptions: { Enabled: false },
            region: "ap-northeast-2",
          },
        ],
        jupyterServers: [
          {
            id: 462,
            serverType: "g4dn.xlarge",
            instanceId: "i-0c62a84b7e05eb2fc",
            status: 1,
            jupyterProject: 299,
            publicIp: "3.35.16.111",
            region: "ap-northeast-2",
            timezone: null,
            terminated_at: null,
            last_paid_at: null,
            created_at: "2021-09-02T01:37:05",
            availabilityZone: null,
            lifecycleState: null,
            healthStatus: null,
            updated_at: "2021-09-02T01:37:05",
            port: null,
            gpu: null,
          },
        ],
      },
    }).as("getjupyter");
  };

  const jupyterStatus = () => {
    cy.intercept("GET", `${backendurl}jupyter-servers-status/*`, {
      statusCode: 200,
      body: [
        {
          AmiLaunchIndex: 0,
          ImageId: "ami-08b3a425cd8e457c9",
          InstanceId: "i-0c62a84b7e05eb2fc",
          InstanceType: "g4dn.xlarge",
          KeyName: "astore",
          LaunchTime: "2021-09-02T01:37:05+00:00",
          Monitoring: { State: "enabled" },
          Placement: {
            AvailabilityZone: "ap-northeast-2c",
            GroupName: "",
            Tenancy: "default",
          },
          PrivateDnsName: "ip-172-31-17-189.ap-northeast-2.compute.internal",
          PrivateIpAddress: "172.31.17.189",
          ProductCodes: [],
          PublicDnsName: "ec2-3-35-16-111.ap-northeast-2.compute.amazonaws.com",
          PublicIpAddress: "3.35.16.111",
          State: { Code: 16, Name: "pending" },
          StateTransitionReason: "",
          SubnetId: "subnet-99bbedd5",
          VpcId: "vpc-29e81842",
          Architecture: "x86_64",
          BlockDeviceMappings: [
            {
              DeviceName: "/dev/sda1",
              Ebs: {
                AttachTime: "2021-09-02T01:37:06+00:00",
                DeleteOnTermination: true,
                Status: "attached",
                VolumeId: "vol-068270f32dd64eb34",
              },
            },
          ],
          ClientToken: "2f440404-1628-465e-a09c-5a38af1b84ed",
          EbsOptimized: false,
          EnaSupport: true,
          Hypervisor: "xen",
          NetworkInterfaces: [
            {
              Association: {
                IpOwnerId: "amazon",
                PublicDnsName:
                  "ec2-3-35-16-111.ap-northeast-2.compute.amazonaws.com",
                PublicIp: "3.35.16.111",
              },
              Attachment: {
                AttachTime: "2021-09-02T01:37:05+00:00",
                AttachmentId: "eni-attach-0bcf247103fd452ee",
                DeleteOnTermination: true,
                DeviceIndex: 0,
                Status: "attached",
                NetworkCardIndex: 0,
              },
              Description: "",
              Groups: [
                {
                  GroupName: "jupyter-security",
                  GroupId: "sg-049207c385d8067de",
                },
              ],
              Ipv6Addresses: [],
              MacAddress: "0a:3a:4e:02:77:4c",
              NetworkInterfaceId: "eni-02266651302badc83",
              OwnerId: "691864559919",
              PrivateDnsName:
                "ip-172-31-17-189.ap-northeast-2.compute.internal",
              PrivateIpAddress: "172.31.17.189",
              PrivateIpAddresses: [
                {
                  Association: {
                    IpOwnerId: "amazon",
                    PublicDnsName:
                      "ec2-3-35-16-111.ap-northeast-2.compute.amazonaws.com",
                    PublicIp: "3.35.16.111",
                  },
                  Primary: true,
                  PrivateDnsName:
                    "ip-172-31-17-189.ap-northeast-2.compute.internal",
                  PrivateIpAddress: "172.31.17.189",
                },
              ],
              SourceDestCheck: true,
              Status: "in-use",
              SubnetId: "subnet-99bbedd5",
              VpcId: "vpc-29e81842",
              InterfaceType: "interface",
            },
          ],
          RootDeviceName: "/dev/sda1",
          RootDeviceType: "ebs",
          SecurityGroups: [
            { GroupName: "jupyter-security", GroupId: "sg-049207c385d8067de" },
          ],
          SourceDestCheck: true,
          Tags: [
            { Key: "appToken", Value: "46638768992f42248002af4ba0ee75d2" },
            { Key: "configOption", Value: "dev" },
            { Key: "jupyterId", Value: "299" },
            { Key: "jupyterServerId", Value: "462" },
            { Key: "userId", Value: "21400" },
          ],
          VirtualizationType: "hvm",
          CpuOptions: { CoreCount: 2, ThreadsPerCore: 2 },
          CapacityReservationSpecification: {
            CapacityReservationPreference: "open",
          },
          HibernationOptions: { Configured: false },
          MetadataOptions: {
            State: "applied",
            HttpTokens: "optional",
            HttpPutResponseHopLimit: 1,
            HttpEndpoint: "enabled",
          },
          EnclaveOptions: { Enabled: false },
        },
      ],
    }).as("jupyterStatus");
  };

  const putJupyter = (name) => {
    cy.intercept("PUT", `${backendurl}jupyterprojects/299/*`, {
      statusCode: 200,
      body: {
        id: 299,
        projectName: name,
        status: null,
        created_at: "2021-09-02T01:37:03",
        updated_at: "2021-09-02T01:37:03",
        user: 21400,
        valueForPredict: null,
        option: null,
        csvupload: null,
        fileStructure: null,
        fileStructureGAN: null,
        filePath: null,
        statusText: null,
        originalFileName: null,
        trainingMethod: null,
        detectedTrainingMethod: null,
        isTest: null,
        isSample: null,
        errorCountConflict: 0,
        errorCountMemory: 0,
        errorCountNotExpected: 0,
        successCount: 0,
        valueForNorm: null,
        description: null,
        license: null,
        sampleData: null,
        yClass: null,
        datasetlicense: null,
        hasTextData: null,
        hasImageData: null,
        isSentCompletedEmail: null,
        projectcategory: null,
        isParameterCompressed: null,
        fileSize: null,
        hasTimeSeriesData: null,
        isFavorite: null,
        dataset: null,
        joinInfo: null,
        trainingColumnInfo: null,
        preprocessingInfo: null,
        preprocessingInfoValue: null,
        labelproject: null,
        isSentFirstModelDoneEmail: null,
        valueForPredictColumnId: null,
        dataconnectorsList: null,
        timeSeriesColumnInfo: null,
        startTimeSeriesDatetime: null,
        endTimeSeriesDatetime: null,
        analyticsStandard: null,
        prescriptionAnalyticsInfo: null,
        isDeleted: null,
        webhookURL: null,
        webhookMethod: null,
        webhookData: null,
        sharedgroup: null,
        background: null,
        resultJson: null,
        labelType: null,
        framework: null,
        developProjectId: null,
        minServerSize: null,
        maxServerSize: null,
        startServerSize: null,
        autoScalingGroupName: null,
        targetGroupArn: null,
        ruleArn: null,
        server_size_changed_at: "2021-09-02T01:37:03",
        instances: [
          {
            AmiLaunchIndex: 0,
            ImageId: "ami-08b3a425cd8e457c9",
            InstanceId: "i-0c62a84b7e05eb2fc",
            InstanceType: "g4dn.xlarge",
            KeyName: "astore",
            LaunchTime: "2021-09-02T01:37:05+00:00",
            Monitoring: { State: "enabled" },
            Placement: {
              AvailabilityZone: "ap-northeast-2c",
              GroupName: "",
              Tenancy: "default",
            },
            PrivateDnsName: "ip-172-31-17-189.ap-northeast-2.compute.internal",
            PrivateIpAddress: "172.31.17.189",
            ProductCodes: [],
            PublicDnsName:
              "ec2-3-35-16-111.ap-northeast-2.compute.amazonaws.com",
            PublicIpAddress: "3.35.16.111",
            State: { Code: 0, Name: "pending" },
            StateTransitionReason: "",
            SubnetId: "subnet-99bbedd5",
            VpcId: "vpc-29e81842",
            Architecture: "x86_64",
            BlockDeviceMappings: [
              {
                DeviceName: "/dev/sda1",
                Ebs: {
                  AttachTime: "2021-09-02T01:37:06+00:00",
                  DeleteOnTermination: true,
                  Status: "attaching",
                  VolumeId: "vol-068270f32dd64eb34",
                },
              },
            ],
            ClientToken: "2f440404-1628-465e-a09c-5a38af1b84ed",
            EbsOptimized: false,
            EnaSupport: true,
            Hypervisor: "xen",
            NetworkInterfaces: [
              {
                Association: {
                  IpOwnerId: "amazon",
                  PublicDnsName:
                    "ec2-3-35-16-111.ap-northeast-2.compute.amazonaws.com",
                  PublicIp: "3.35.16.111",
                },
                Attachment: {
                  AttachTime: "2021-09-02T01:37:05+00:00",
                  AttachmentId: "eni-attach-0bcf247103fd452ee",
                  DeleteOnTermination: true,
                  DeviceIndex: 0,
                  Status: "attaching",
                  NetworkCardIndex: 0,
                },
                Description: "",
                Groups: [
                  {
                    GroupName: "jupyter-security",
                    GroupId: "sg-049207c385d8067de",
                  },
                ],
                Ipv6Addresses: [],
                MacAddress: "0a:3a:4e:02:77:4c",
                NetworkInterfaceId: "eni-02266651302badc83",
                OwnerId: "691864559919",
                PrivateDnsName:
                  "ip-172-31-17-189.ap-northeast-2.compute.internal",
                PrivateIpAddress: "172.31.17.189",
                PrivateIpAddresses: [
                  {
                    Association: {
                      IpOwnerId: "amazon",
                      PublicDnsName:
                        "ec2-3-35-16-111.ap-northeast-2.compute.amazonaws.com",
                      PublicIp: "3.35.16.111",
                    },
                    Primary: true,
                    PrivateDnsName:
                      "ip-172-31-17-189.ap-northeast-2.compute.internal",
                    PrivateIpAddress: "172.31.17.189",
                  },
                ],
                SourceDestCheck: true,
                Status: "in-use",
                SubnetId: "subnet-99bbedd5",
                VpcId: "vpc-29e81842",
                InterfaceType: "interface",
              },
            ],
            RootDeviceName: "/dev/sda1",
            RootDeviceType: "ebs",
            SecurityGroups: [
              {
                GroupName: "jupyter-security",
                GroupId: "sg-049207c385d8067de",
              },
            ],
            SourceDestCheck: true,
            Tags: [
              { Key: "appToken", Value: "46638768992f42248002af4ba0ee75d2" },
              { Key: "configOption", Value: "dev" },
              { Key: "jupyterId", Value: "299" },
              { Key: "jupyterServerId", Value: "462" },
              { Key: "userId", Value: "21400" },
            ],
            VirtualizationType: "hvm",
            CpuOptions: { CoreCount: 2, ThreadsPerCore: 2 },
            CapacityReservationSpecification: {
              CapacityReservationPreference: "open",
            },
            HibernationOptions: { Configured: false },
            MetadataOptions: {
              State: "pending",
              HttpTokens: "optional",
              HttpPutResponseHopLimit: 1,
              HttpEndpoint: "enabled",
            },
            EnclaveOptions: { Enabled: false },
            region: "ap-northeast-2",
          },
        ],
        jupyterServers: [
          {
            id: 462,
            serverType: "g4dn.xlarge",
            instanceId: "i-0c62a84b7e05eb2fc",
            status: 1,
            jupyterProject: 299,
            publicIp: "3.35.16.111",
            region: "ap-northeast-2",
            timezone: null,
            terminated_at: null,
            last_paid_at: null,
            created_at: "2021-09-02T01:37:05",
            availabilityZone: null,
            lifecycleState: null,
            healthStatus: null,
            updated_at: "2021-09-02T01:37:05",
            port: null,
            gpu: null,
          },
        ],
      },
    }).as("putjupyter");
  };

  const deleteJupyter = () => {
    cy.intercept("DELETE", `${backendurl}jupyterprojects/*`, {
      statusCode: 200,
      body: { successList: ["299"], failList: [] },
    }).as("deletejupyter");
  };

  it("customTraining", () => {
    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      // let backendurl=cy.url().userInvocationStack.split("__")[0].split("(")[1];
      //로컬
      cy.login_Card(() => {
        cy.get("#menuProject").click({ multiple: true, force: true });
        cy.get("#sideSubMenujupyterproject").click({
          multiple: true,
          force: true,
        });
        cy.url().should("include", "/admin/jupyterproject");
        cy.get("body").then(($body) => {
          if ($body[0].innerHTML.indexOf("서비스 시작하기") != -1) {
            cy.get("#serviceStart").click();
          }
        });

        cy.get("#addProjcet").click();

        //프로젝트 이름 초기화
        cy.get("#setProjectName").clear();

        //프로젝트 이름 추가
        cy.get("#setProjectName").type("racgoo10000");

        //프로젝트 이름 변경된지 확인
        cy.get("#setProjectName").should("have.value", "racgoo10000");

        //한글화
        cy.ko();

        //GCP 클릭
        cy.get("#gcpBtn").click();

        //스낵바 확인 및 채널톡 닫기
        cy.get("#client-snackbar").should(
          "contain",
          "GCP 서버는 영업팀 문의 후 사용 할 수 있습니다."
        );
        cy.closeChennalTalk();

        //영문화
        cy.en();

        //AZURE 클릭
        cy.get("#azureBtn").click();

        //스낵바 확인 및 채널톡 닫기
        cy.get("#client-snackbar").should(
          "contain",
          "To use the Azure server, please contact the sales team."
        );
        cy.closeChennalTalk();

        //한국 클릭
        cy.get("#region_Seoul").click();

        //지역 선택 확인
        cy.get("#cloudRegionConfirm").should("contain", "Seoul");

        //유럽 런던 클릭
        cy.get("#region_Ireland").click();

        //지역 선택 확인
        cy.get("#cloudRegionConfirm").should("contain", "Ireland");

        //캐나다 클릭
        cy.get("#region_Central").click();

        //지역 선택 확인
        cy.get("#cloudRegionConfirm").should("contain", "Central");

        //버즈니아 클릭
        cy.get("#region_NVirginia").click();

        //지역 선택 확인
        cy.get("#cloudRegionConfirm").should("contain", "Virginia");

        //일본 도쿄 클릭
        cy.get("#region_Tokyo").click();

        //지역 선택 확인
        cy.get("#cloudRegionConfirm").should("contain", "Tokyo");

        //서버 선택
        cy.get("#server_inf1xlarge").click();

        //서버 선택 확인
        cy.get("#cloudServerConfirm").should("contain", "inf1.xlarge");

        //서버 선택
        cy.get("#server_inf12xlarge").click();

        //서버 선택 확인
        cy.get("#cloudServerConfirm").should("contain", "inf1.2xlarge");

        //서버 선택
        cy.get("#server_g3sxlarge").click();

        //서버 선택 확인
        cy.get("#cloudServerConfirm").should("contain", "g3s.xlarge");

        //서버 선택
        cy.get("#server_p2xlarge").click();

        //스낵바 확인 및 채널톡 닫기
        cy.get("#client-snackbar").should(
          "contain",
          "Servers larger than 4Xlarge can be used after contacting the sales team."
        );
        cy.closeChennalTalk();

        //큰 서버 선택
        cy.get("#server_inf12xlarge").click();

        createJupyter();
        getJupyter();
        jupyterStatus();

        cy.get("#createJupyterButton").click();

        //패널 접속까지 intercept (모두 다 변조된 값)
        cy.wait("@createjupyter", { timeout: 10000 });
        cy.wait("@getjupyter", { timeout: 10000 });
        cy.wait("@jupyterStatus", { timeout: 10000 });

        //이름 변경 API intercept
        putJupyter("racgoo");

        //이름변경 모달 취소
        cy.get("#changeJupyterPorjectName").click();
        cy.get("#inputJupyterNewName").type("racgoo");
        cy.get("#cancelJupyterNewName").click();

        //이름변경 모달 실행
        cy.get("#changeJupyterPorjectName").click();
        cy.get("#inputJupyterNewName").type("racgoo");
        cy.get("#confirmJupyterNewName").click();

        //intercept 기다림
        cy.wait("@putjupyter", { timeout: 10000 });

        //이름 변경 확인
        cy.get("#projectName").should("contain", "racgoo");

        //새로고침 확인
        jupyterStatus();
        cy.get("#jupyterRefreshBtn").click({ multiple: true, force: true });
        cy.wait("@jupyterStatus", { timeout: 10000 });
        cy.ko();
        cy.en();

        //프로젝트 삭제 테스트
        deleteJupyter();

        //프로젝트 삭제 모달 취소
        cy.get("#jupyterDelete").click();
        cy.get("#inputDeleteMethod").type("Delete");
        cy.get("#cancelJupyterDelete").click();

        //프로젝트 삭제 모달 실행
        cy.get("#jupyterDelete").click();
        cy.get("#inputDeleteMethod").type("Delete");
        cy.get("#confirmJupyterDelete").click();

        //intercept 기다림
        cy.wait("@deletejupyter", { timeout: 10000 });

        cy.get("#addProjcet").should("contain", "New Project");
      });
    } else {
    }
  });
});
