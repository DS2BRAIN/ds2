const projectStyle = {
    cardCategoryWhite: {
      "&,& a,& a:hover,& a:focus": {
        color: "rgba(255,255,255,.62)",
        margin: "0",
        fontSize: "14px",
        marginTop: "0",
        marginBottom: "0"
      },
      "& a,& a:hover,& a:focus": {
        color: "#FFFFFF"
      }
    },
    cardTitleWhite: {
      color: "#FFFFFF",
      marginTop: "0px",
      minHeight: "auto",
      fontWeight: "300",
      fontFamily: "'Noto Sans', 'Helvetica', 'Arial', sans-serif",
      marginBottom: "3px",
      textDecoration: "none",
      "& small": {
        color: "#777",
        fontSize: "65%",
        fontWeight: "400",
        lineHeight: "1"
      }
    },
    loading: {
      height: '480px', 
      padding: '30px 0 15px 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    button: {
      margin: '10px',
      minWidth: '100px',
      color: '#18A0FB',
      border: '2px solid #18A0FB',
      cursor: 'pointer',
    },
    closeBtn: {
      minWidth: '100px',
      margin: '10px',
      backgroundColor: 'rgba(24, 160, 251, 0.5)',
      "&:hover,&:focus": {
        backgroundColor: 'rgba(24, 160, 251, 1)',
      },
      cursor: 'pointer',
    },
    closeImg: {
      cursor:'pointer', 
      float:'right', 
      width: '20px',
    },
    table: {
      borderCollapse: 'separate',
      borderSpacing: '0 10px',
    },
    tableRow: {
      cursor: 'pointer',
      border: '1px solid white',
      background: 'rgba(23, 27, 45, 0.5)',
      "&:hover,&:focus": {
        backgroundColor: 'rgba(24, 160, 251, 0.3)',
      }
    },
    imageRow: {
      border: '1px solid white',
      backgroundColor: 'rgba(199, 199, 199, 0.1) !important',  
    },
    tableContainer: {
      width: 'auto',
      height: '300px', 
      marginTop: '20px', 
      overflowY: 'auto', 
      overflowScrolling: 'touch',
      display: 'flex', 
      alignItems: 'flex-start !important'
    },
    fileTable: {
      boxSizing: 'border-box',
      borderCollapse: 'collapse',
      width: '96%',
      border: 'none',
    },
    fileTd: {
      margin: '0 !important',
      border: 'none'
    },
    modalContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalContent: {
      position: 'absolute',
      width: '40%',
      minWidth: '550px',
      height: '30%',
      minHeight: '600px',
      backgroundColor: '#171B2D',
      border: '2px solid #999999',
      borderRadius: '20px',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 32px 24px'
    },
    dialog: {
      background: '#171B2D !important',
      borderRadius: '20px',
    },
    formControl: {
      width: '100%',
      margin: '10px 0'
    },
    modalButton: {
      margin: '10px 0',
      width: '100%',
      cursor: 'pointer',
      background: 'rgba(24, 160, 251, 0.3)',
      "&:hover,&:focus": {
          backgroundColor: 'rgba(24, 160, 251, 1)',
      }
    },
    root: {
      padding: '4px 8px',
      display: 'flex',
      alignItems: 'center',
      width: '80%',
      background: '#171B2D !important'
    },
    input: {
      marginLeft: '10px',
      flex: 1,
    },
    iconButton: {
      padding: 10,
    },
    divider: {
      height: 28,
      margin: 4,
    },
    tab: {
      flexGrow: 1,
      width: '150px',
      height: '44px',
      lineHeight: '44px',
      textAlign: 'center',
      fontSize: '15px',
      cursor: 'pointer',
      boxShadow: '10px 12px 20px -10px rgba(24, 160, 251,.28)',
  }, 
  planModalContent: {
    position: 'absolute',
    padding: '20px',
    width: '56%',
    minWidth: '1200px',
    height: '44%',
    minHeight: '600px',
    backgroundColor: '#171B2D',
    border: '2px solid #999999',
    borderRadius: '20px'
  },
  modalLoading: {
    position: 'absolute',
    width: '42%',
    minWidth: '560px',
    height: '30%',
    minHeight: '550px',
    backgroundColor: '#171B2D',
    border: '2px solid #999999',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '16px 32px 24px'
  },
  categoryItem: {
    width: '90%',
    paddingLeft: '10px', 
    wordBreak: 'break-all',
    cursor: 'pointer',
    "&:hover,&:focus": {
      background: 'rgba(24, 160, 251, 0.7)'
    },
  },
  listItem: {
    width: '90%',
    paddingLeft: '10px', 
    wordBreak: 'break-all',
    cursor: 'pointer',
    "&:hover,&:focus": {
        borderBottom: '2px solid #00d69e'
    },
  },
  fileCell: {
    wordBreak: 'break-all', 
    display: 'flex', 
    alignItems: 'center', 
    marginLeft: '10px'
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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
    startButton: {
        minWidth: '100px',
        margin: '10px',
        cursor: 'pointer',
        border: '2px solid #18A0FB',
        backgroundColor: '#18A0FB',
        "&:hover,&:focus": {
            backgroundColor: '#18A0FB',
        }
    },
};

export default projectStyle;