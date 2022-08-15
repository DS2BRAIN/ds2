import React from "react";
import { useTranslation } from "react-i18next";

import { Grid, IconButton } from "@mui/material";
import CloseIcon from "@material-ui/icons/Close";

import currentTheme from "assets/jss/custom.js";
import Button from "components/CustomButtons/Button";

const DataModalPublicData = ({
  closePublicDataModal,
  selectedData,
  tableHeads,
}) => {
  const classes = currentTheme();
  const { t } = useTranslation();

  const startDownload = () => {
    let url = selectedData.filePath;
    const link = document.createElement("a");
    link.href = url;
    link.download = selectedData.dataconnectorName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const secPublicDataInfo = (data, tableHeads) => {
    let imgUrl = data.sampleImageUrl;

    return (
      <>
        <Grid container>
          {imgUrl ? (
            <img
              src={imgUrl}
              style={{
                width: "280px",
                height: "210px",
                margin: "30px auto 30px auto",
                borderRadius: "3px",
              }}
            />
          ) : (
            <div style={{ height: "210px", margin: "20px" }} />
          )}
        </Grid>
        {tableHeads.map((tableHead, idx) => {
          if (idx > 1)
            return (
              <Grid
                container
                key={`publicDataColumn_${tableHead.type}`}
                style={{ padding: "20px" }}
              >
                <Grid item xs={2}>
                  <span style={{ fontSize: "16px", lineHeight: "23px" }}>
                    <b>{tableHead.value}</b>
                  </span>
                </Grid>
                <Grid item xs={10}>
                  <span style={{ fontSize: "16px", lineHeight: "23px" }}>
                    {data[tableHead.type]}
                  </span>
                  {tableHead.subUrl && (
                    <small style={{ marginTop: "4px", display: "block" }}>
                      {data[tableHead.subUrl]}
                    </small>
                  )}
                </Grid>
              </Grid>
            );
        })}
      </>
    );
  };

  const secPublicModalBtns = () => {
    return (
      <Grid sx={{ p: 2.5, display: "flex", justifyContent: "flex-end" }}>
        <Button
          id="startLabellingBtn"
          shape="greenOutlined"
          size="lg"
          onClick={startDownload}
        >
          {t("Download file")}
        </Button>
      </Grid>
    );
  };

  return (
    <Grid
      id="publicDataModal"
      className="dataModalContainer"
      direction="column"
      justifyContent="space-between"
    >
      <div>
        <Grid container justifyContent="space-between" sx={{ p: 2.5 }}>
          <b style={{ fontSize: "20px" }}>{t("Open Data")}</b>
          <IconButton
            id="closePublicDataModal"
            sx={{ p: 0 }}
            onClick={() => {
              closePublicDataModal(selectedData);
            }}
          >
            <CloseIcon />
          </IconButton>
        </Grid>
        <Grid sx={{ px: 2 }}>
          {selectedData && secPublicDataInfo(selectedData, tableHeads)}
        </Grid>
      </div>
      {secPublicModalBtns()}
    </Grid>
  );
};

export default DataModalPublicData;
