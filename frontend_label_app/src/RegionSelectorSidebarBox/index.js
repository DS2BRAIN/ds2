// @flow

import React, { Fragment, useState, useEffect, memo } from "react"
import SidebarBoxContainer from "../SidebarBoxContainer"
import { makeStyles, styled } from "@material-ui/core/styles"
import { grey } from "@material-ui/core/colors"
import RegionIcon from "@material-ui/icons/PictureInPicture"
import Grid from "@material-ui/core/Grid"
import ReorderIcon from "@material-ui/icons/SwapVert"
import PieChartIcon from "@material-ui/icons/PieChart"
import TrashIcon from "@material-ui/icons/Delete"
import LockIcon from "@material-ui/icons/Lock"
import UnlockIcon from "@material-ui/icons/LockOpen"
import VisibleIcon from "@material-ui/icons/Visibility"
import VisibleOffIcon from "@material-ui/icons/VisibilityOff"
import styles from "./styles"
import classnames from "classnames"
import isEqual from "lodash/isEqual"
import Button from "@material-ui/core/Button"
import InputLabel from "@material-ui/core/InputLabel"
import MenuItem from "@material-ui/core/MenuItem"
import FormControl from "@material-ui/core/FormControl"
import Select from "@material-ui/core/Select"
import Cookies from "../helpers/Cookies"
import { useTranslation } from "react-i18next"

const useStyles = makeStyles(styles)

const HeaderSep = styled("div")({
  borderTop: `1px solid ${grey[200]}`,
  marginTop: 2,
  marginBottom: 2,
})

const Chip = ({ state, region, color, text }) => {
  const classes = useStyles()
  const [flag, setFlag] = useState(0)

  useEffect(() => {
    state.mode && state.mode.mode.includes("DRAW") && region.highlighted
      ? setFlag(1)
      : setFlag(0)
  }, [state])

  return (
    <span className={classes.chip}>
      <div className="color" style={{ backgroundColor: color }} />
      <div
        className="text"
        style={{ wordBreak: "break-all", paddingLeft: "8px" }}
      >
        {text} (point:{" "}
        {region.points
          ? region.points.length - flag
          : region.type === "box"
          ? 4
          : region.type === "point"
          ? 1
          : 0}
        )
      </div>
    </span>
  )
}

const RowLayout = ({
  header,
  highlighted,
  order,
  classification,
  area,
  tags,
  trash,
  lock,
  visible,
  onClick,
}) => {
  const classes = useStyles()
  const [mouseOver, changeMouseOver] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => changeMouseOver(true)}
      onMouseLeave={() => changeMouseOver(false)}
      className={classnames(classes.row, { header, highlighted })}
    >
      <Grid container alignItems="center">
        <Grid item xs={2}>
          <div style={{ textAlign: "right", paddingRight: 10 }}>{order}</div>
        </Grid>
        <Grid item xs={6}>
          {classification}
        </Grid>
        <Grid item xs={1}>
          <div style={{ textAlign: "right", paddingRight: 6 }}>{area}</div>
        </Grid>
        <Grid item xs={1}>
          {trash}
        </Grid>
        <Grid item xs={1}>
          {lock}
        </Grid>
        <Grid item xs={1}>
          {visible}
        </Grid>
      </Grid>
    </div>
  )
}

const RowHeader = () => {
  return (
    <RowLayout
      header
      highlighted={false}
      order={<ReorderIcon className="icon" />}
      classification={<div style={{ paddingLeft: 10 }}>Class</div>}
      area={<PieChartIcon className="icon" />}
      trash={<TrashIcon className="icon" />}
      lock={<LockIcon className="icon" />}
      visible={<VisibleIcon className="icon" />}
    />
  )
}

const MemoRowHeader = memo(RowHeader)

const Row = ({
  state,
  region: r,
  highlighted,
  onSelectRegion,
  onDeleteRegion,
  onChangeRegion,
  visible,
  locked,
  color,
  cls,
  index,
}) => {
  return (
    <RowLayout
      header={false}
      highlighted={highlighted}
      onClick={() => onSelectRegion(r)}
      order={`#${index + 1}`}
      classification={
        <Chip
          state={state}
          region={r}
          text={cls || ""}
          color={color || "#ddd"}
        />
      }
      area=""
      trash={<TrashIcon onClick={() => onDeleteRegion(r)} className="icon2" />}
      lock={
        r.locked ? (
          <LockIcon
            onClick={() =>
              onChangeRegion({ ...r, locked: false, lockAction: true })
            }
            className="icon2"
          />
        ) : (
          <UnlockIcon
            onClick={() =>
              onChangeRegion({ ...r, locked: true, lockAction: true })
            }
            className="icon2"
          />
        )
      }
      visible={
        r.visible || r.visible === undefined ? (
          <VisibleIcon
            onClick={() =>
              onChangeRegion({ ...r, visible: false, visibleAction: true })
            }
            className="icon2"
          />
        ) : (
          <VisibleOffIcon
            onClick={() =>
              onChangeRegion({ ...r, visible: true, visibleAction: true })
            }
            className="icon2"
          />
        )
      }
    />
  )
}

const MemoRow = memo(
  Row,
  (prevProps, nextProps) =>
    prevProps.highlighted === nextProps.highlighted &&
    prevProps.visible === nextProps.visible &&
    prevProps.locked === nextProps.locked &&
    prevProps.id === nextProps.id &&
    prevProps.index === nextProps.index &&
    prevProps.cls === nextProps.cls &&
    prevProps.color === nextProps.color &&
    prevProps.points === nextProps.points
)

export const RegionSelectorSidebarBox = ({
  state,
  regions,
  onDeleteRegion,
  onChangeRegion,
  onSelectRegion,
  images,
  onChangeLastClass,
  classNameFromShortcut,
  classColorFromShortcut,
}) => {
  const classes = useStyles()
  const { t } = useTranslation()
  const [myClasses, setMyClasses] = useState([])
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedClass, setSelectedClass] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const clsInfo = images[0].clsInfo
    setMyClasses(clsInfo)
    setSelectedClass(images[0].lastClass)
    setSelectedColor(images[0].lastClassColor)
  }, [images])

  useEffect(() => {
    if (classNameFromShortcut) setSelectedColor(classNameFromShortcut)
  }, [classNameFromShortcut])

  useEffect(() => {
    if (classColorFromShortcut) setSelectedColor(classColorFromShortcut)
  }, [classColorFromShortcut])

  const handleChange = (event) => {
    setSelectedClass(event.target.value)
    let color = "blue"
    images[0].clsInfo.forEach((each) => {
      if (each.name === event.target.value) color = each.color
    })
    onChangeLastClass(event.target.value, color)
    Cookies.setCookie("lastClass", event.target.value, 90)
    Cookies.setCookie("lastClassColor", color, 90)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleOpen = () => {
    setOpen(true)
  }

  const changeColor = (color) => {
    setSelectedColor(color)
  }
  return (
    <SidebarBoxContainer
      title={t("라벨링 정보")}
      subTitle=""
      icon={<RegionIcon style={{ color: grey[700] }} />}
      expandedByDefault
    >
      <div className={classes.container}>
        <div style={{ paddingLeft: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            {selectedColor && (
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "5px",
                  marginRight: "5px",
                  background: selectedColor,
                }}
              ></div>
            )}
            <FormControl
              className={classes.formControl}
              style={{ paddingLeft: "10px" }}
            >
              <Select
                open={open}
                onClose={handleClose}
                onOpen={handleOpen}
                value={selectedClass}
                defaultValue={selectedClass}
                onChange={handleChange}
                inputProps={{
                  name: "selectedClass",
                  id: "demo-controlled-open-select",
                }}
              >
                {myClasses.map((each, idx) => {
                  return (
                    <MenuItem
                      value={each.name}
                      onClick={() => {
                        changeColor(each.color)
                      }}
                    >
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "5px",
                          marginRight: "5px",
                          background: each.color,
                        }}
                      ></span>
                      <span>{each.name} </span>
                      <span style={{ marginLeft: "8px" }}>
                        (
                        {each.completedLabelCount
                          ? each.completedLabelCount
                          : 0}
                        )
                      </span>
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>
          </div>
          {/* <div>
          {
          myClasses.map((region)=>{
            return <Button style={{marginRight: '4px', height: '24px', fontSize: '10px',padding: '2px', border: `3px solid ${region.color}`}}>{region.name}</Button>
          })      
          }
          </div> */}
        </div>
        <HeaderSep />
        {regions.map((r, i) => (
          <MemoRow
            key={r.id}
            {...r}
            state={state}
            region={r}
            index={i}
            onSelectRegion={onSelectRegion}
            onDeleteRegion={onDeleteRegion}
            onChangeRegion={onChangeRegion}
          />
        ))}
      </div>
    </SidebarBoxContainer>
  )
}

const mapUsedRegionProperties = (r) => [
  r.id,
  r.color,
  r.locked,
  r.visible,
  r.highlighted,
  r.points,
]

export default memo(RegionSelectorSidebarBox, (prevProps, nextProps) =>
  isEqual(
    prevProps.regions.map(mapUsedRegionProperties),
    nextProps.regions.map(mapUsedRegionProperties)
  )
)
