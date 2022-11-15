const Cookies = {
  getCookie: (name) => {
    const v = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
    return v ? v[2] : null;
  },

  setCookie: (name, value, days) => {
    var d = new Date();
    d.setTime(d.getTime() + 24*60*60*1000*days);
    // d.setTime(d.getTime() + 60 * 1000  * minutes);
    document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
  },

  setCookieSecure: (name, value) => {
    document.cookie = name + "=" + value + ";Secure";
  },

  deleteCookie: (name) => {
    Cookies.setCookie(name, "", -1);
  },

  deleteAllCookies: () => {
    Cookies.deleteCookie("user");
    Cookies.deleteCookie("jwt");
    Cookies.deleteCookie("apptoken");
  },
};

export default Cookies;
