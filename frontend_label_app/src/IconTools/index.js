// @flow

import React, { useMemo } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faArrowsAlt,
  faMousePointer,
  faExpandArrowsAlt,
  faTag,
  faPaintBrush,
  faCrosshairs,
  faDrawPolygon,
  faVectorSquare,
  faHandPaper,
  faSearch,
  faMagic,
  faGripLines,
  faPlusCircle,
  faMinusCircle,
  faDotCircle,
} from "@fortawesome/free-solid-svg-icons"
import SmallToolButton, { SelectedTool } from "../SmallToolButton"
import { makeStyles } from "@material-ui/core/styles"
import { grey } from "@material-ui/core/colors"

const useStyles = makeStyles({
  iconTools: {
    display: "flex",
    padding: 4,
    flexDirection: "column",
    zIndex: 9,
    boxShadow: "0px 0px 5px rgba(0,0,0,0.1)",
    borderRight: `1px solid ${grey[300]}`,
    backgroundColor: grey[100],
  },
})

type Props = {
  showTags?: boolean,
  enabledTools?: Array<string>,
  selectedTool: string,
  onClickTool: (string) => any,
}

const defaultTools = [
  "select",
  "create-point",
  "create-box",
  "create-polyline",
  "create-polygon",
  "create-keypoint",
  "create-magic",
  "create-magic-positive",
  "create-magic-negative",
]

export const IconTools = ({
  showTags,
  selectedTool,
  onClickTool,
  enabledTools = defaultTools,
}: Props) => {
  const classes = useStyles()
  const selectedToolContextValue = useMemo(
    () => ({ enabledTools, selectedTool, onClickTool }),
    [enabledTools, selectedTool]
  )
  return (
    <div className={classes.iconTools}>
      <SelectedTool.Provider value={selectedToolContextValue}>
        <SmallToolButton
          id="select"
          name="Select Region (t)"
          icon={<FontAwesomeIcon size="xs" fixedWidth icon={faMousePointer} />}
        />
        <SmallToolButton
          alwaysShowing
          id="pan"
          name="Drag/Pan (Click &amp; Hold Mouse Wheel)"
          icon={<FontAwesomeIcon size="xs" fixedWidth icon={faHandPaper} />}
        />
        <SmallToolButton
          alwaysShowing
          id="zoom"
          name="Zoom In/Out (z)"
          icon={<FontAwesomeIcon size="xs" fixedWidth icon={faSearch} />}
        />
        {/* <SmallToolButton
          name="Move Region"
          icon={<FontAwesomeIcon size="xs" fixedWidth icon={faArrowsAlt} />}
        />
        <SmallToolButton
          name="Resize Region"
          icon={
            <FontAwesomeIcon size="xs" fixedWidth icon={faExpandArrowsAlt} />
          }
        /> */}
        <SmallToolButton
          alwaysShowing
          togglable
          id="show-tags"
          selected={showTags}
          name="Show Tags"
          icon={<FontAwesomeIcon size="xs" fixedWidth icon={faTag} />}
        />
        {/* <SmallToolButton
          alwaysShowing
          id="create-point"
          name="Add Key Point (g)"
          icon={<FontAwesomeIcon size="xs" fixedWidth icon={faCrosshairs} />}
        /> */}
        <SmallToolButton
          id="create-box"
          name="Add Bounding Box (q)"
          icon={<FontAwesomeIcon size="xs" fixedWidth icon={faVectorSquare} />}
        />
        <SmallToolButton
          id="create-polyline"
          name="Add Polyline (w)"
          icon={<FontAwesomeIcon size="xs" fixedWidth icon={faGripLines} />}
        />
        <SmallToolButton
          id="create-polygon"
          name="Add Polygon (e)"
          icon={<FontAwesomeIcon size="xs" fixedWidth icon={faDrawPolygon} />}
        />
        <SmallToolButton
          id="create-magic"
          name="Add Magic Tool (r)"
          icon={<FontAwesomeIcon size="xs" fixedWidth icon={faMagic} />}
        />
        {selectedTool && selectedTool.includes("create-magic") && (
          <>
            <SmallToolButton
              alwaysShowing
              id="create-magic-positive"
              name="Add Positive Point Tool"
              icon={
                <FontAwesomeIcon size="xs" fixedWidth icon={faPlusCircle} />
              }
            />
            <SmallToolButton
              alwaysShowing
              id="create-magic-negative"
              name="Add Negative Point Tool"
              icon={
                <FontAwesomeIcon size="xs" fixedWidth icon={faMinusCircle} />
              }
            />
          </>
        )}
        {/* <SmallToolButton
          id="create-pixel"
          name="Add Pixel Region"
          icon={<FontAwesomeIcon size="xs" fixedWidth icon={faPaintBrush} />}
        /> */}
      </SelectedTool.Provider>
    </div>
  )
}

export default IconTools
