describe("SignUp", function() {
  it("signUp", () => {
    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬

      //사이트 SignIn 방문
      cy.visit("/signin");
      //회원가입 클릭
      cy.get("#signupPage").click();
      //라우팅 확인
      cy.url().should("include", "/signup");
      //이메일 입력없이 제출
      cy.get("#signUpBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "이메일주소를 입력해주세요."
      );
      //이메일 입력없이 중복 확인
      cy.get("#checkBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "이메일주소를 입력해주세요."
      );
      //이상한 이메일로 중복 확인
      cy.get("#email").type("abcccccc");
      cy.get("#checkBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "이메일주소가 올바르지 않습니다. (영문 소문자만 입력가능)"
      );
      //이메일 이상한 값 입력 후 제출
      cy.get("#email").clear();
      cy.get("#email").type("rararacdsa");
      cy.get("#signUpBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "이메일주소가 올바르지 않습니다. (영문 소문자만 입력가능)"
      );
      //이메일 초기화
      cy.get("#email").clear();
      //이메일 정상 값 입력 후 제출
      cy.get("#email").type("rararacdsa@naver.com");
      cy.get("#signUpBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "이메일 중복 확인 후 진행해주세요."
      );
      //이메일 확인
      cy.get("#checkBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should("contain", "사용가능한 이메일입니다.");
      //제출
      cy.get("#signUpBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should("contain", "비밀번호를 입력해주세요.");
      //잘못된 비밀번호 입력
      cy.get("#password").type("123");
      //제출
      cy.get("#signUpBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "비밀번호는 영문, 숫자, 특수문자 3종류를 조합하여 최소 8자리 이상의 길이로 구성하여야합니다."
      );
      //정확한 비밀번호 입력
      cy.get("#password").clear();
      cy.get("#password").type("@123racgoo@");
      //제출
      cy.get("#signUpBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "비밀번호 확인 값을 입력해주세요."
      );
      //잘못된 비밀번호 확인 입력
      cy.get("#passwordCheck").type("@racgoo@");
      //제출
      cy.get("#signUpBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "비밀번호를 다시 한번 확인해주세요."
      );
      //정확한 비밀번호 확인 입력
      cy.get("#passwordCheck").clear();
      cy.get("#passwordCheck").type("@123racgoo@");
      //제출
      cy.get("#signUpBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "약관에 동의후 진행해주세요."
      );
      //이메일,비밀번호,비밀번호확인 초기화
      cy.get("#email").clear();
      cy.get("#password").clear();
      cy.get("#passwordCheck").clear();
      //이메일 입력(기존에 있는 이메일)
      cy.get("#email").type("rakhyeon.seong@dslab.global");
      //이메일 중복 확인
      cy.get("#checkBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should("contain", "이미 가입된 이메일입니다.");
      //이메일 초기화
      cy.get("#email").clear();
      //이메일 입력(새로운 이메일)
      cy.get("#email").type("rakhyeon.seong@dslab.glo1lal");
      //이메일 확인
      cy.get("#checkBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should("contain", "사용가능한 이메일입니다.");
      //password 입력
      cy.get("#password").type("aaaaaaaa");
      //영문으로 변경
      cy.en();
      //password 확인 입력
      cy.get("#passwordCheck").type("bbbbbbbb");
      //회원가입 버튼 클릭
      cy.get("#signUpBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "Your password must be at least eight characters long. It must contain letters, numbers, and special character such as @#$%!"
      );
      //비밀번호 초기화
      cy.get("#password").clear();
      cy.get("#passwordCheck").clear();
      //비밀번호 다르게 입력(특수기호 포함)
      cy.get("#password").type("abc!@#abc!@#123");
      cy.get("#passwordCheck").type("abc!@#abc!@#12");
      //회원가입 클릭
      cy.get("#signUpBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "The password you entered is incorrect. Please re-enter your password."
      );
      //한글로 변경
      cy.ko();
      //비밀번호 확인 동일하게 변경
      cy.get("#passwordCheck").clear();
      cy.get("#passwordCheck").type("abc!@#abc!@#123");
      //회원가입 클릭
      cy.get("#signUpBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "약관에 동의후 진행해주세요."
      );
      //약관동의 천번째 동의
      cy.get("#agreeBtn1").click();
      //회원가입 클릭
      cy.get("#signUpBtn").click();
      //채널톡 닫기
      cy.closeChennalTalk();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "만 19세 미만의 경우 법정대리인의 동의가 필요합니다. 영업팀에 문의해주세요."
      );
      //약관동의 1번 빼고 모두 클릭
      cy.get("#agreeBtn1").click();
      cy.get("#agreeBtn2").click();
      cy.get("#agreeBtn3").click();
      //signIn으로 라우팅
      cy.get('a[href="../signin"]').click();
      //라우팅 확인
      cy.url().should("contain", "/signin");
    } else {
      //사이트 SignIn 방문
      cy.visit("/signin");
      //회원가입 클릭
      cy.get("#signupPage").click();
      //라우팅 확인
      cy.url().should("include", "/signup");
      //이메일 입력없이 제출
      cy.get("#signUpBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "이메일주소를 입력해주세요."
      );
      //이메일 입력없이 중복 확인
      cy.get("#checkBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "이메일주소를 입력해주세요."
      );
      //이상한 이메일로 중복 확인
      cy.get("#email").type("abcccccc");
      cy.get("#checkBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "이메일주소가 올바르지 않습니다. (영문 소문자만 입력가능)"
      );
      //이메일 이상한 값 입력 후 제출
      cy.get("#email").clear();
      cy.get("#email").type("rararacdsa");
      cy.get("#signUpBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "이메일주소가 올바르지 않습니다. (영문 소문자만 입력가능)"
      );
      //이메일 초기화
      cy.get("#email").clear();
      //이메일 정상 값 입력 후 제출
      cy.get("#email").type("rararacdsa@naver.com");
      cy.get("#signUpBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "이메일 중복 확인 후 진행해주세요."
      );
      //이메일 확인
      cy.get("#checkBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should("contain", "사용가능한 이메일입니다.");
      //제출
      cy.get("#signUpBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should("contain", "비밀번호를 입력해주세요.");
      //잘못된 비밀번호 입력
      cy.get("#password").type("123");
      //제출
      cy.get("#signUpBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "비밀번호는 영문, 숫자, 특수문자 3종류를 조합하여 최소 8자리 이상의 길이로 구성하여야합니다."
      );
      //정확한 비밀번호 입력
      cy.get("#password").clear();
      cy.get("#password").type("@123racgoo@");
      //제출
      cy.get("#signUpBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "비밀번호 확인 값을 입력해주세요."
      );
      //잘못된 비밀번호 확인 입력
      cy.get("#passwordCheck").type("@racgoo@");
      //제출
      cy.get("#signUpBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "비밀번호를 다시 한번 확인해주세요."
      );
      //정확한 비밀번호 확인 입력
      cy.get("#passwordCheck").clear();
      cy.get("#passwordCheck").type("@123racgoo@");
      //제출
      cy.get("#signUpBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "약관에 동의후 진행해주세요."
      );
      //이메일,비밀번호,비밀번호확인 초기화
      cy.get("#email").clear();
      cy.get("#password").clear();
      cy.get("#passwordCheck").clear();
      //이메일 입력(기존에 있는 이메일)
      cy.get("#email").type("rakhyeon.seong@dslab.global");
      //이메일 중복 확인
      cy.get("#checkBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should("contain", "이미 가입된 이메일입니다.");
      //이메일 초기화
      cy.get("#email").clear();
      //이메일 입력(새로운 이메일)
      cy.get("#email").type("rakhyeon.seong@dslab.glo1lal");
      //이메일 확인
      cy.get("#checkBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should("contain", "사용가능한 이메일입니다.");
      //password 입력
      cy.get("#password").type("aaaaaaaa");
      //영문으로 변경
      cy.en();
      //password 확인 입력
      cy.get("#passwordCheck").type("bbbbbbbb");
      //회원가입 버튼 클릭
      cy.get("#signUpBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "Your password must be at least eight characters long. It must contain letters, numbers, and special character such as @#$%!"
      );
      //비밀번호 초기화
      cy.get("#password").clear();
      cy.get("#passwordCheck").clear();
      //비밀번호 다르게 입력(특수기호 포함)
      cy.get("#password").type("abc!@#abc!@#123");
      cy.get("#passwordCheck").type("abc!@#abc!@#12");
      //회원가입 클릭
      cy.get("#signUpBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "The password you entered is incorrect. Please re-enter your password."
      );
      //한글로 변경
      cy.ko();
      //비밀번호 확인 동일하게 변경
      cy.get("#passwordCheck").clear();
      cy.get("#passwordCheck").type("abc!@#abc!@#123");
      //회원가입 클릭
      cy.get("#signUpBtn").click();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "약관에 동의후 진행해주세요."
      );
      //약관동의 천번째 동의
      cy.get("#agreeBtn1").click();
      //회원가입 클릭
      cy.get("#signUpBtn").click();
      //채널톡 닫기
      cy.closeChennalTalk();
      //스낵바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "만 19세 미만의 경우 법정대리인의 동의가 필요합니다. 영업팀에 문의해주세요."
      );
      //약관동의 1번 빼고 모두 클릭
      cy.get("#agreeBtn1").click();
      cy.get("#agreeBtn2").click();
      cy.get("#agreeBtn3").click();
      //signIn으로 라우팅
      cy.get('a[href="../signin"]').click();
      //라우팅 확인
      cy.url().should("contain", "/signin");
    }
  });
});
