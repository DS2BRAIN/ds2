import { makeStyles } from "@material-ui/core/styles";

let textSub = "#525557";
let bg = "white";
let btnBlue = "#2979ff";
let btnMint = "#1BC6B4";

const introStyles = makeStyles({
  Body: {
    backgroundColor: bg,
    margin: "-80px -30px -50px -30px",
    paddingBottom: "150px",
    wordBreak: "keep-all",
  },

  Section: {
    padding: "3rem",
  },

  H1: {
    marginTop: "2rem",
    marginBottom: "2rem",
    fontFamily: '"Noto Sans KR", "Roboto"',
    fontSize: "3rem",
    fontWeight: "600",
    letterSpacing: "-0.1rem",
    lineHeight: "1.2",
  },

  H2: {
    marginBottom: "1rem",
    color: textSub,
    fontFamily: '"Noto Sans KR", "Roboto"',
    fontSize: "2rem",
    fontWeight: "550",
    letterSpacing: "-0.1rem",
    lineHeight: "1.2",
  },

  H4: {
    color: textSub,
    fontFamily: '"Noto Sans KR", "Roboto"',
    fontSize: "1.5rem",
    fontWeight: "550",
    letterSpacing: "-0.1rem",
    lineHeight: "1.2",
  },

  H5: {
    fontFamily: '"Noto Sans KR", "Roboto"',
    fontSize: "1.25rem",
    fontWeight: "550",
  },

  H6: {
    fontFamily: '"Noto Sans KR", "Roboto"',
    fontSize: "1rem",
    fontWeight: "550",
  },

  P: {
    marginTop: "0",
    marginBottom: "1rem",
    fontFamily: '"Noto Sans KR", "Roboto"',
    fontWeight: "350",
    wordBreak: "keep-all",
    letterSpacing: "-0.5px",
    color: "var(--textSub)",
  },

  Table: {
    borderSpacing: ".1rem",
  },
  Th: {
    padding: ".75rem",
    width: "20%",
    fontSize: ".75rem",
  },
  Td: {
    paddingTop: ".75rem",
    paddingBottom: ".75rem",
    fontFamily: '"Noto Sans KR", "Roboto"',
    lineHeight: "3",
  },

  Li: {
    marginBottom: "0.5rem",
    color: textSub,
    fontSize: "0.8rem",
  },

  Code: {
    overflow: "scroll",
  },

  // start button
  startBtn: {
    margin: "1rem",
    width: "12rem",
    height: "4.5rem",
    borderWidth: "0",
    borderRadius: "4rem",
    borderColor: "transparent",
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
  },
  topBtn: {
    background: bg,
  },
  btmBtn: {
    background: "-webkit-linear-gradient(left, #2979ff, #1BC6B4)",
  },

  startP: {
    marginTop: "1rem",
    fontFamily: '"Noto Sans KR", "Roboto"',
    fontWeight: "bold",
    fontSize: "1.25rem",
    textAlign: "center",
  },
  startPtop: {
    background: "-webkit-linear-gradient(left, #2979ff, #1BC6B4)",
    "-webkit-background-clip": "text",
    "-webkit-text-fill-color": "transparent",
  },
  startPbtm: {
    color: bg,
  },
});

export default introStyles;
