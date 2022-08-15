// @flow

import React, { memo, useEffect, useState } from "react"
import SidebarBoxContainer from "../SidebarBoxContainer"
import DescriptionIcon from "@material-ui/icons/Description"
import { styled } from "@material-ui/core/styles"
import { grey } from "@material-ui/core/colors"
import Markdown from "react-markdown"
import { useTranslation } from "react-i18next";
import * as api from "../api.js"


const MarkdownContainer = styled("div")({
  paddingLeft: 16,
  paddingRight: 16,
  fontSize: 12,
  "& h1": { fontSize: 18 },
  "& h2": { fontSize: 14 },
  "& h3": { fontSize: 12 },
  "& h4": { fontSize: 12 },
  "& h5": { fontSize: 12 },
  "& h6": { fontSize: 12 },
  "& p": { fontSize: 12 },
  "& a": {},
  "& img": { width: "100%" },
})

export const TaskDescriptionSidebarBox = ({ description, labelProjectId, chart }) => {
  const { t } = useTranslation();
  const [ labelChart, setLabelChart ] = useState({});

  // useEffect(()=>{
  //   if(labelProjectId){
  //     api.getListObjects({sorting: 'status', count: 10, start: 1, labelprojectId: labelProjectId, tab: 'all'})
  //     .then((res)=>{
  //         setLabelChart(res.data.chart)
  //     })
  //   }
  // }, [labelProjectId])
  useEffect(()=>{
    setLabelChart(chart)
  }, [chart])

  return (
    <SidebarBoxContainer
      title={t("프로젝트 상세")}
      icon={<DescriptionIcon style={{ color: grey[700] }} />}
      expandedByDefault
    >
      <MarkdownContainer>
        <Markdown style={{fontSize: '14px !important'}} source={description} />
        <div style={{display: 'flex', marginBottom: '16px', alignItems : 'center', fontSize: '14px'}}>
          <div>
            {t('진행률')} :
          </div>
          {
          labelChart && 
          <div style={{marginLeft: '4px'}}>
            {(labelChart.done / labelChart.all * 100).toFixed(2)}% ( {labelChart.done}/{labelChart.all} )
          </div>
          }
        </div>
      </MarkdownContainer>
    </SidebarBoxContainer>
  )
}

export default memo(TaskDescriptionSidebarBox)
