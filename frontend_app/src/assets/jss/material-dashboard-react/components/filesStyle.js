import {
  currentTheme,
  drawerWidth,
  transition,
  boxShadow,
  defaultFont,
  primaryColor,
  primaryBoxShadow,
  infoColor,
  successColor,
  warningColor,
  dangerColor,
  whiteColor,
  grayColor,
  blackColor,
  hexToRgb
} from "assets/jss/material-dashboard-react.js";

const filesStyle = {
    loading: {
        padding: '30px 0 15px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    button: {
        minWidth: '100px',
        margin: '10px',
        color: currentTheme.highlight1,
        border: '2px solid ' + currentTheme.highlight1,
        cursor: 'pointer',
    },
    startButton: {
        minWidth: '100px',
        margin: '10px',
        cursor: 'pointer',
        border: '2px solid ' + currentTheme.highlight1,
        backgroundColor: currentTheme.highlight1,
        "&:hover,&:focus": {
            backgroundColor: currentTheme.highlight1,
        }
    },
    root: {
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        width: '80%',
        background: currentTheme.background2 + '  !important',
        marginBottom: '20px'
    },
      input: {
        marginLeft: '10px',
        flex: 1,
    },
    folderContainer : {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'no-wrap',
    },
    divider: {
        height: 28,
        margin: 4,
    },
    modalContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContent: {
        position: 'absolute',
        width: '350px',
        backgroundColor: currentTheme.background2,
        border: '2px solid ' + currentTheme.border1,
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 32px 24px'
    },
    modalButton: {
        margin: '10px 0',
        width: '100%',
        minWidth: '100px',
        cursor: 'pointer',
        background: currentTheme.container2,
        "&:hover,&:focus": {
            backgroundColor: 'rgba(24, 160, 251, 1)',
        }
    },
    fileUploadContent: {
        position: 'absolute',
        width: '42%',
        minWidth: '560px',
        height: '40%',
        minHeight: '600px',
        backgroundColor: currentTheme.background2,
        border: '2px solid ' + currentTheme.border1,
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 32px 24px'
    },
    typography: {
        cursor: 'pointer',
        background: 'rgba(13,16,27,0.8)',
        padding: '5px',
    },
    table: {
        borderCollapse: 'separate',
        borderSpacing: '0 10px',
    },
    tableRow: {
        cursor: 'pointer',
        border: 'none',
        background: currentTheme.tableRow1,
        "&:hover,&:focus": {
          backgroundColor: currentTheme.container2,
        }
    },
    modelTab: {
        width: '80px',
        height: '40px',
        lineHeight: '40px',
        textAlign: 'center',
        cursor: 'pointer',
        boxShadow: '10px 12px 20px -10px rgba(24, 160, 251,.28)',
        background: currentTheme.container2,
        "&:hover,&:focus": {
            backgroundColor: 'rgba(24, 160, 251, 1)',
        }
    },
     contentContainer: {
    padding: '0px 30px',
    width: '100%',
  },
  line: {
    width: '100%',
    background: 'white',
  },
  item: {
    height: '50px',
    lineHeight: '50px'
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    letterSpacing: '0.3em !important'
  },
  infoBtn: {
    minWidth: '100px',
    margin: '10px',
    alignSelf: 'center',
    color: '#18A0FB',
    border: '2px solid #18A0FB',
    cursor: 'pointer'
  },
  closeImg: {
    cursor:'pointer',
    float:'right',
  },
  tab: {
    width: '120px',
    height: '50px',
    lineHeight: '50px',
    textAlign: 'center',
    fontSize: '15px',
    cursor: 'pointer',
    boxShadow: '10px 12px 20px -10px rgba(24, 160, 251,.28)',
  },
};

export default filesStyle;