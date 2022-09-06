import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import produce from "immer";

import PublishPredictFormTitle from "./PublishPredictFormTitle";
import Button from "components/CustomButtons/Button.js";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Select from "@mui/material/Select";

const PublishPredictNormalForm = ({ model }) => {
  const dummyFileStructure = `[{"id": 328953, "created_at": "2022-07-28 14:18:04", "updated_at": "2022-07-28 14:19:53", "columnName": "나이__1. BankMarketing.csv", "index": 1, "miss": 0, "data_count": 34827, "unique": 77, "uniqueValues": [58, 47, 35, 28, 43, 41, 29, 57, 51, 60, 56, 39, 52, 36, 49, 44, 54, 38, 46, 53, 33, 59, 55, 45, 42, 30, 34, 32, 23, 48, 50, 40, 26, 61, 31, 37, 24, 25, 27, 22, 21, 20, 66, 62, 83, 75, 67, 70, 65, 68, 64, 69, 72, 71, 19, 76, 85, 63, 82, 73, 74, 78, 80, 94, 79, 77, 95, 81, 18, 89, 84, 86, 87, 92, 90, 93, 88], "type": "number", "min": 18.0, "max": 95.0, "std": 10.803776, "mean": 41.151717, "top": null, "freq": null, "isForGan": null, "dataconnector": 112026, "use": "true", "dataconnectorName": "1. BankMarketing.csv", "originalColumnName": "나이"}, {"id": 328954, "created_at": "2022-07-28 14:18:04", "updated_at": "2022-07-28 14:19:53", "columnName": "직업__1. BankMarketing.csv", "index": 2, "miss": 0, "data_count": 34827, "unique": 12, "uniqueValues": ["management", "blue-collar", "retired", "technician", "admin.", "services", "entrepreneur", "self-employed", "housemaid", "unemployed", "student", "unknown"], "type": "object", "min": null, "max": null, "std": null, "mean": null, "top": null, "freq": null, "isForGan": null, "dataconnector": 112026, "use": "true", "dataconnectorName": "1. BankMarketing.csv", "originalColumnName": "직업"}, {"id": 328955, "created_at": "2022-07-28 14:18:04", "updated_at": "2022-07-28 14:19:53", "columnName": "혼인여부__1. BankMarketing.csv", "index": 3, "miss": 0, "data_count": 34827, "unique": 3, "uniqueValues": ["married", "single", "divorced"], "type": "object", "min": null, "max": null, "std": null, "mean": null, "top": null, "freq": null, "isForGan": null, "dataconnector": 112026, "use": "true", "dataconnectorName": "1. BankMarketing.csv", "originalColumnName": "혼인여부"}, {"id": 328956, "created_at": "2022-07-28 14:18:04", "updated_at": "2022-07-28 14:19:53", "columnName": "학업__1. BankMarketing.csv", "index": 4, "miss": 0, "data_count": 34827, "unique": 4, "uniqueValues": ["tertiary", "unknown", "primary", "secondary"], "type": "object", "min": null, "max": null, "std": null, "mean": null, "top": null, "freq": null, "isForGan": null, "dataconnector": 112026, "use": "true", "dataconnectorName": "1. BankMarketing.csv", "originalColumnName": "학업"}, {"id": 328957, "created_at": "2022-07-28 14:18:05", "updated_at": "2022-07-28 14:19:53", "columnName": "신용카드 소지 여부__1. BankMarketing.csv", "index": 5, "miss": 0, "data_count": 34827, "unique": 2, "uniqueValues": ["no", "yes"], "type": "object", "min": null, "max": null, "std": null, "mean": null, "top": null, "freq": null, "isForGan": null, "dataconnector": 112026, "use": "true", "dataconnectorName": "1. BankMarketing.csv", "originalColumnName": "신용카드 소지 여부"}, {"id": 328958, "created_at": "2022-07-28 14:18:05", "updated_at": "2022-07-28 14:19:53", "columnName": "연봉__1. BankMarketing.csv", "index": 6, "miss": 0, "data_count": 34827, "unique": 6201, "uniqueValues": null, "type": "number", "min": 51.0, "max": 102127.0, "std": 3342.825947, "mean": 1800.912398, "top": null, "freq": null, "isForGan": null, "dataconnector": 112026, "use": "true", "dataconnectorName": "1. BankMarketing.csv", "originalColumnName": "연봉"}, {"id": 328959, "created_at": "2022-07-28 14:18:05", "updated_at": "2022-07-28 14:19:53", "columnName": "집담보 대출__1. BankMarketing.csv", "index": 7, "miss": 0, "data_count": 34827, "unique": 2, "uniqueValues": ["yes", "no"], "type": "object", "min": null, "max": null, "std": null, "mean": null, "top": null, "freq": null, "isForGan": null, "dataconnector": 112026, "use": "true", "dataconnectorName": "1. BankMarketing.csv", "originalColumnName": "집담보 대출"}, {"id": 328960, "created_at": "2022-07-28 14:18:05", "updated_at": "2022-07-28 14:19:53", "columnName": "기타 대출__1. BankMarketing.csv", "index": 8, "miss": 0, "data_count": 34827, "unique": 2, "uniqueValues": ["no", "yes"], "type": "object", "min": null, "max": null, "std": null, "mean": null, "top": null, "freq": null, "isForGan": null, "dataconnector": 112026, "use": "true", "dataconnectorName": "1. BankMarketing.csv", "originalColumnName": "기타 대출"}, {"id": 328961, "created_at": "2022-07-28 14:18:05", "updated_at": "2022-07-28 14:19:54", "columnName": "연락 방법__1. BankMarketing.csv", "index": 9, "miss": 0, "data_count": 34827, "unique": 3, "uniqueValues": ["unknown", "cellular", "telephone"], "type": "object", "min": null, "max": null, "std": null, "mean": null, "top": null, "freq": null, "isForGan": null, "dataconnector": 112026, "use": "true", "dataconnectorName": "1. BankMarketing.csv", "originalColumnName": "연락 방법"}, {"id": 328962, "created_at": "2022-07-28 14:18:05", "updated_at": "2022-07-28 14:19:54", "columnName": "최근 연락한 날 (일)__1. BankMarketing.csv", "index": 10, "miss": 0, "data_count": 34827, "unique": 31, "uniqueValues": [5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 19, 20, 21, 23, 26, 27, 28, 29, 30, 2, 3, 4, 11, 17, 18, 24, 25, 1, 10, 22, 31], "type": "number", "min": 1.0, "max": 31.0, "std": 8.280014, "mean": 15.678965, "top": null, "freq": null, "isForGan": null, "dataconnector": 112026, "use": "true", "dataconnectorName": "1. BankMarketing.csv", "originalColumnName": "최근 연락한 날 (일)"}, {"id": 328963, "created_at": "2022-07-28 14:18:05", "updated_at": "2022-07-28 14:19:54", "columnName": "최근 연락한 날 (월)__1. BankMarketing.csv", "index": 11, "miss": 0, "data_count": 34827, "unique": 12, "uniqueValues": ["may", "jun", "jul", "aug", "oct", "nov", "dec", "jan", "feb", "mar", "apr", "sep"], "type": "object", "min": null, "max": null, "std": null, "mean": null, "top": null, "freq": null, "isForGan": null, "dataconnector": 112026, "use": "true", "dataconnectorName": "1. BankMarketing.csv", "originalColumnName": "최근 연락한 날 (월)"}, {"id": 328964, "created_at": "2022-07-28 14:18:05", "updated_at": "2022-07-28 14:19:54", "columnName": "최근 연락 기간__1. BankMarketing.csv", "index": 12, "miss": 0, "data_count": 34827, "unique": 1511, "uniqueValues": null, "type": "number", "min": 0.0, "max": 4918.0, "std": 262.307252, "mean": 262.613472, "top": null, "freq": null, "isForGan": null, "dataconnector": 112026, "use": "true", "dataconnectorName": "1. BankMarketing.csv", "originalColumnName": "최근 연락 기간"}, {"id": 328965, "created_at": "2022-07-28 14:18:05", "updated_at": "2022-07-28 14:19:54", "columnName": "최근 켐페인 참가 여부__1. BankMarketing.csv", "index": 13, "miss": 0, "data_count": 34827, "unique": 46, "uniqueValues": [1, 2, 3, 5, 4, 6, 7, 8, 9, 10, 11, 13, 12, 19, 14, 16, 32, 18, 22, 15, 17, 21, 25, 51, 63, 41, 26, 28, 55, 50, 38, 23, 20, 24, 29, 31, 37, 30, 46, 58, 27, 33, 35, 36, 34, 44], "type": "number", "min": 1.0, "max": 63.0, "std": 2.949237, "mean": 2.699179, "top": null, "freq": null, "isForGan": null, "dataconnector": 112026, "use": "true", "dataconnectorName": "1. BankMarketing.csv", "originalColumnName": "최근 켐페인 참가 여부"}, {"id": 328966, "created_at": "2022-07-28 14:18:05", "updated_at": "2022-07-28 14:19:54", "columnName": "최근 켐페인 이후 시간 소요 (일)__1. BankMarketing.csv", "index": 14, "miss": 0, "data_count": 34827, "unique": 542, "uniqueValues": [-1, 151, 91, 86, 147, 89, 140, 176, 101, 174, 170, 167, 195, 165, 129, 188, 196, 172, 118, 119, 104, 171, 117, 164, 132, 131, 159, 186, 111, 123, 116, 173, 178, 166, 115, 96, 103, 150, 175, 110, 181, 185, 154, 145, 138, 126, 193, 180, 109, 168, 97, 182, 127, 130, 194, 125, 105, 102, 26, 179, 183, 155, 112, 120, 137, 124, 187, 190, 113, 162, 152, 134, 169, 189, 8, 144, 191, 184, 177, 5, 99, 133, 93, 92, 10, 100, 156, 198, 106, 153, 146, 128, 7, 121, 160, 107, 90, 27, 197, 136, 139, 122, 157, 149, 135, 114, 98, 192, 163, 34, 95, 141, 31, 94, 108, 143, 268, 247, 226, 244, 239, 245, 231, 238, 258, 230, 254, 265, 246, 223, 240, 204, 205, 266, 259, 241, 260, 234, 253, 251, 261, 161, 199, 262, 248, 255, 220, 227, 206, 224, 158, 249, 235, 228, 263, 2, 270, 232, 252, 200, 269, 256, 273, 272, 242, 264, 222, 208, 203, 221, 271, 250, 202, 216, 201, 257, 214, 210, 217, 75, 213, 73, 207, 76, 267, 211, 215, 77, 236, 82, 6, 209, 274, 1, 243, 212, 233, 275, 80, 276, 9, 279, 12, 88, 277, 85, 84, 219, 24, 21, 225, 282, 41, 294, 49, 329, 307, 331, 308, 287, 330, 332, 302, 323, 318, 333, 60, 326, 335, 312, 305, 325, 327, 336, 309, 328, 322, 314, 39, 316, 313, 292, 295, 300, 320, 317, 289, 57, 321, 142, 339, 301, 315, 337, 334, 340, 319, 280, 17, 74, 341, 299, 148, 344, 324, 342, 346, 304, 345, 281, 343, 338, 14, 303, 347, 291, 348, 349, 306, 285, 350, 25, 237, 283, 278, 81, 4, 87, 83, 79, 70, 13, 28, 293, 37, 78, 63, 296, 355, 66, 35, 360, 354, 15, 351, 362, 358, 298, 286, 364, 47, 365, 361, 288, 363, 366, 352, 359, 356, 357, 297, 367, 353, 42, 368, 67, 370, 369, 371, 284, 71, 50, 36, 290, 373, 374, 372, 310, 375, 378, 311, 59, 379, 18, 19, 40, 29, 43, 20, 69, 38, 385, 56, 55, 44, 391, 72, 390, 32, 399, 393, 65, 377, 395, 388, 386, 412, 62, 229, 61, 405, 434, 64, 394, 382, 459, 440, 397, 383, 68, 461, 462, 463, 422, 51, 457, 430, 442, 403, 454, 392, 410, 474, 477, 478, 54, 476, 380, 479, 45, 46, 495, 58, 48, 518, 52, 515, 520, 511, 536, 387, 218, 33, 544, 555, 433, 436, 446, 558, 469, 616, 561, 553, 384, 592, 467, 585, 480, 421, 667, 626, 426, 595, 381, 376, 648, 521, 452, 449, 633, 398, 53, 460, 389, 551, 414, 557, 687, 404, 651, 686, 425, 504, 578, 674, 416, 411, 756, 450, 776, 396, 683, 529, 439, 415, 456, 407, 458, 532, 481, 791, 701, 531, 792, 413, 445, 535, 784, 419, 455, 491, 542, 435, 717, 437, 728, 828, 524, 761, 492, 775, 493, 464, 760, 466, 465, 656, 831, 490, 432, 427, 749, 838, 769, 587, 778, 854, 779, 850, 771, 594, 842, 589, 603, 484, 489, 486, 409, 444, 680, 808, 485, 503, 690, 772, 774, 526, 431, 420, 528, 500, 826, 804, 508, 547, 805, 541, 543, 871, 22, 550, 530], "type": "number", "min": -1.0, "max": 871.0, "std": 102.30963, "mean": 42.946336, "top": null, "freq": null, "isForGan": null, "dataconnector": 112026, "use": "true", "dataconnectorName": "1. BankMarketing.csv", "originalColumnName": "최근 켐페인 이후 시간 소요 (일)"}, {"id": 328967, "created_at": "2022-07-28 14:18:06", "updated_at": "2022-07-28 14:19:54", "columnName": "최근 켐페인 이후 연락 횟수__1. BankMarketing.csv", "index": 15, "miss": 0, "data_count": 34827, "unique": 41, "uniqueValues": [0, 3, 4, 2, 1, 11, 16, 6, 10, 5, 12, 7, 18, 9, 21, 8, 15, 14, 26, 37, 13, 20, 27, 38, 29, 24, 25, 17, 51, 275, 23, 22, 19, 30, 58, 28, 32, 40, 55, 35, 41], "type": "number", "min": 0.0, "max": 275.0, "std": 2.487006, "mean": 0.63693, "top": null, "freq": null, "isForGan": null, "dataconnector": 112026, "use": "true", "dataconnectorName": "1. BankMarketing.csv", "originalColumnName": "최근 켐페인 이후 연락 횟수"}, {"id": 328968, "created_at": "2022-07-28 14:18:06", "updated_at": "2022-07-28 14:19:54", "columnName": "이전 마케팅 성공 여부 __1. BankMarketing.csv", "index": 16, "miss": 0, "data_count": 34827, "unique": 4, "uniqueValues": ["unknown", "failure", "other", "success"], "type": "object", "min": null, "max": null, "std": null, "mean": null, "top": null, "freq": null, "isForGan": null, "dataconnector": 112026, "use": "true", "dataconnectorName": "1. BankMarketing.csv", "originalColumnName": "이전 마케팅 성공 여부 "}, {"id": 328969, "created_at": "2022-07-28 14:18:06", "updated_at": "2022-07-28 14:19:54", "columnName": "과금 여부__1. BankMarketing.csv", "index": 17, "miss": 0, "data_count": 34827, "unique": 2, "uniqueValues": [1, 2], "type": "number", "min": 1.0, "max": 2.0, "std": 0.337453, "mean": 1.131044, "top": null, "freq": null, "isForGan": null, "dataconnector": 112026, "use": "null", "dataconnectorName": "1. BankMarketing.csv", "originalColumnName": "과금 여부"}]`;
  // const parsedColumns = JSON.parse(dummyFileStructure);

  const { t } = useTranslation();

  const [parsedColumns, setParsedColumns] = useState(null);

  const changeInputHandler = (event, index, type) => {
    const value = event.target[type];

    setParsedColumns(
      produce((draft) => {
        draft[index][type] = value;
      })
    );
  };

  useEffect(() => {
    const tmpColumns = JSON.parse(dummyFileStructure);

    tmpColumns.map((v, i) => {
      v.checked = false;
      v.value = v.uniqueValues ? v.uniqueValues[0] : null;
    });

    setParsedColumns(tmpColumns);
  }, []);

  return (
    <Grid container justifyContent="center">
      <PublishPredictFormTitle type="normal" />

      <Box component="form" noValidate autoComplete="off">
        <Grid container alignItems="center">
          {parsedColumns?.map((column, index) => {
            return (
              <Grid key={column.id} item xs={12} md={6} sx={{ mb: 2, p: 1 }}>
                <Grid container alignItems="center" wrap="nowrap">
                  <Grid item xs={5} sx={{ mx: 2, textAlign: "center" }}>
                    <InputLabel
                      sx={{ fontSize: 16, fontWeight: 600, margin: 0 }}
                    >
                      {column.originalColumnName}
                    </InputLabel>
                  </Grid>

                  <Grid item xs>
                    <Grid
                      container
                      alignItems="center"
                      wrap="nowrap"
                      sx={{ minWidth: 120 }}
                    >
                      <Grid item xs>
                        {column.checked ? (
                          <TextField
                            label={null}
                            variant="outlined"
                            fullWidth
                            type={column.type === "number" ? "number" : "text"}
                            onChange={(e) =>
                              changeInputHandler(e, index, "value")
                            }
                            sx={{
                              "& legend": { display: "none" },
                              "& fieldset": { height: "100%", top: 0 },
                            }}
                            placeholder={t("Please enter the value.")}
                          />
                        ) : (
                          <FormControl fullWidth>
                            <Select
                              id="predict_column_select_box"
                              className="no-background-color"
                              defaultValue={
                                column.uniqueValues
                                  ? column.uniqueValues[0]
                                  : null
                              }
                              value={column.value}
                              label={null}
                              onChange={(e) =>
                                changeInputHandler(e, index, "value")
                              }
                              sx={{
                                "& legend": { display: "none" },
                                "& fieldset": { height: "100%", top: 0 },
                              }}
                            >
                              {column.uniqueValues ? (
                                column.uniqueValues.map((v) => {
                                  return (
                                    <MenuItem key={column.id + v} value={v}>
                                      {v}
                                    </MenuItem>
                                  );
                                })
                              ) : (
                                <MenuItem value={null}>-</MenuItem>
                              )}
                            </Select>
                          </FormControl>
                        )}
                      </Grid>
                      <Grid item sx={{ ml: 1 }}>
                        <FormControl component="fieldset">
                          <FormControlLabel
                            control={
                              <Checkbox
                                onChange={(e) =>
                                  changeInputHandler(e, index, "checked")
                                }
                                checked={column.checked}
                                size="small"
                                sx={{
                                  "& svg": { fill: "rgba(0, 0, 0, 0.5)" },
                                }}
                              />
                            }
                            label={
                              <span style={{ fontSize: 12 }}>
                                {t("custom")}
                              </span>
                            }
                            labelPlacement="bottom"
                            sx={{ m: 0, color: "rgba(0, 0, 0, 0.6)" }}
                          />
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Grid>
  );
};

export default PublishPredictNormalForm;
