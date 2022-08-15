# -*- coding: utf-8 -*-
import json
from datetime import datetime, timedelta

import pandas as pd
from googleads import adwords
from starlette.status import HTTP_200_OK, HTTP_400_BAD_REQUEST

from src.collecting.connector import Connector


class GoogleAdWords(Connector):
    def __init__(self, dictionary):
        super().__init__(dictionary)

        self.adWordsInfo = {
            'adwords': {
                'developer_token': dictionary.get('developerToken', ''),
                'client_customer_id': dictionary.get('clientCustomerId', ''),
                'client_id': dictionary.get('clientId', ''),
                'client_secret': dictionary.get('clientSecret', ''),
                'refresh_token': dictionary.get('refreshToken', ''),
            }
        }

        # adWords 클라이언트
        self.client = adwords.AdWordsClient.LoadFromString(str(self.adWordsInfo))

        # 보고서 객체
        self.reportDownloader = self.client.GetReportDownloader(version='v201809')

    def verify(self):
        # 기본 결과 변수 초기화
        columnInfo = []

        try:
            # 연결 테스트
            data = self.collect()

            # columnNames = self.default_fields(self.default_report_type())
            # print(columnNames)

        except Exception as e:
            return False, columnInfo, 'KeyInfo가 일치하지 않습니다.'

        return True, columnInfo, ''

    def collect(self, startDate=None, endDate=None, reportType=None, fields=None, ):
        datas = self.getData(startDate, endDate, reportType, fields)
        return datas

    def getData(self, startDate=None, endDate=None, reportType=None, fields=None):
        # 기본 변수 초기화
        reportType = self.default_report_type() if reportType is None else reportType
        fields = self.default_fields(reportType) if fields is None else fields
        endDate = datetime.now().strftime('%Y%m%d') if endDate is None else datetime.strptime(endDate, '%Y-%m-%d').strftime('%Y%m%d')
        day = 0 if startDate is None and reportType == 'CLICK_PERFORMANCE_REPORT' else 7
        startDate = (datetime.strptime(endDate, '%Y%m%d') - timedelta(days=day)).strftime('%Y%m%d') if startDate is None else datetime.strptime(startDate, '%Y-%m-%d').strftime('%Y%m%d')

        # 보고서 요청 양식
        report = {
            'reportName': 'Report',
            'dateRangeType': 'CUSTOM_DATE',
            'reportType': reportType,
            'downloadFormat': 'CSV',
            'selector': {
                'fields': fields,
                'dateRange': {
                    'min': startDate,
                    'max': endDate,
                },
            }
        }

        # zero 변수 표시 여부
        include_zero_impressions = False if reportType == 'CLICK_PERFORMANCE_REPORT' else True

        # 보고서 결과 가져오기
        reportResult = self.reportDownloader.DownloadReportAsString(
            report, skip_report_header=False, skip_column_header=False,
            skip_report_summary=False, include_zero_impressions=include_zero_impressions
        )

        # 결과 데이터 변환 => list[dictionary]
        splitedResult = reportResult.split('\n')  # name, columns, data, ... , total, space
        name, columns, datas = splitedResult[0], splitedResult[1], splitedResult[2:-2]
        datas = [{col: value for col, value in zip(fields, data.split(','))} for data in datas]

        # TODO:: 정렬을 꼭 해야하는 것인가에 대해 생각 후 수정 필요
        # datas = sorted(datas, key=lambda x: (x[fields[0]], x[fields[-2]], float(x[fields[-1]])))

        return pd.DataFrame(datas)

    def default_report_type(self):
        # return 'ACCOUNT_PERFORMANCE_REPORT'
        return 'AD_PERFORMANCE_REPORT'
        # return 'CAMPAIGN_PERFORMANCE_REPORT'
        # return 'CLICK_PERFORMANCE_REPORT'
        # return 'VIDEO_PERFORMANCE_REPORT'

    def default_fields(self, report_type):
        fields = {
            'ACCOUNT_PERFORMANCE_REPORT': [
                # Attribute
                'AccountCurrencyCode', 'AccountDescriptiveName', 'AccountTimeZone', 'CanManageClients',
                'CustomerDescriptiveName', 'ExternalCustomerId', 'IsAutoTaggingEnabled', 'IsTestAccount',
                # 'ConversionAdjustment',  # UnSupports zero impressions | Not compatible other field

                # Metric
                'AbsoluteTopImpressionPercentage', 'ActiveViewCpm', 'ActiveViewCtr', 'ActiveViewImpressions',
                'ActiveViewMeasurability', 'ActiveViewMeasurableCost', 'ActiveViewMeasurableImpressions',
                'ActiveViewViewability', 'AllConversionRate', 'AllConversions', 'AllConversionValue', 'AverageCost',
                'AverageCpc', 'AverageCpe', 'AverageCpm', 'AverageCpv', 'AveragePosition', 'Clicks',
                'ContentBudgetLostImpressionShare', 'ContentImpressionShare', 'ContentRankLostImpressionShare',
                'ConversionRate', 'Conversions', 'ConversionValue', 'Cost', 'CostPerAllConversion', 'CostPerConversion',
                'CrossDeviceConversions', 'Ctr', 'EngagementRate', 'Engagements', 'Impressions', 'InteractionRate',
                'Interactions', 'InteractionTypes', 'InvalidClickRate', 'InvalidClicks',
                'SearchBudgetLostImpressionShare', 'SearchExactMatchImpressionShare', 'SearchImpressionShare',
                'SearchRankLostImpressionShare', 'TopImpressionPercentage', 'ValuePerAllConversion',
                'ValuePerConversion', 'VideoViewRate', 'VideoViews', 'ViewThroughConversions',

                # Segment
                'Date',
            ],
            'AD_PERFORMANCE_REPORT': [
                # Attribute
                'AccentColor', 'AccountCurrencyCode', 'AccountDescriptiveName', 'AccountTimeZone', 'AdGroupId',
                'AdGroupName', 'AdGroupStatus', 'AdStrengthInfo', 'AdType', 'AllowFlexibleColor', 'Automated',
                'BaseAdGroupId', 'BaseCampaignId', 'BusinessName', 'CallOnlyPhoneNumber', 'CallToActionText',
                'CampaignId', 'CampaignName', 'CampaignStatus', 'CombinedApprovalStatus', 'CreativeDestinationUrl',
                'CreativeFinalAppUrls', 'CreativeFinalMobileUrls', 'CreativeFinalUrls', 'CreativeFinalUrlSuffix',
                'CreativeTrackingUrlTemplate', 'CreativeUrlCustomParameters', 'CustomerDescriptiveName', 'Description',
                'Description1', 'Description2', 'DevicePreference', 'DisplayUrl',
                'EnhancedDisplayCreativeLandscapeLogoImageMediaId', 'EnhancedDisplayCreativeLogoImageMediaId',
                'EnhancedDisplayCreativeMarketingImageMediaId', 'EnhancedDisplayCreativeMarketingImageSquareMediaId',
                'ExpandedDynamicSearchCreativeDescription2', 'ExpandedTextAdDescription2',
                'ExpandedTextAdHeadlinePart3', 'ExternalCustomerId', 'FormatSetting', 'GmailCreativeHeaderImageMediaId',
                'GmailCreativeLogoImageMediaId', 'GmailCreativeMarketingImageMediaId', 'GmailTeaserBusinessName',
                'GmailTeaserDescription', 'GmailTeaserHeadline', 'Headline', 'HeadlinePart1', 'HeadlinePart2', 'Id',
                'ImageAdUrl', 'ImageCreativeImageHeight', 'ImageCreativeImageWidth', 'ImageCreativeMimeType',
                'ImageCreativeName', 'LabelIds', 'Labels', 'LongHeadline', 'MainColor',
                'MarketingImageCallToActionText', 'MarketingImageCallToActionTextColor', 'MarketingImageDescription',
                'MarketingImageHeadline', 'MultiAssetResponsiveDisplayAdAccentColor',
                'MultiAssetResponsiveDisplayAdAllowFlexibleColor', 'MultiAssetResponsiveDisplayAdBusinessName',
                'MultiAssetResponsiveDisplayAdCallToActionText', 'MultiAssetResponsiveDisplayAdDescriptions',
                'MultiAssetResponsiveDisplayAdDynamicSettingsPricePrefix',
                'MultiAssetResponsiveDisplayAdDynamicSettingsPromoText', 'MultiAssetResponsiveDisplayAdFormatSetting',
                'MultiAssetResponsiveDisplayAdHeadlines', 'MultiAssetResponsiveDisplayAdLandscapeLogoImages',
                'MultiAssetResponsiveDisplayAdLogoImages', 'MultiAssetResponsiveDisplayAdLongHeadline',
                'MultiAssetResponsiveDisplayAdMainColor', 'MultiAssetResponsiveDisplayAdMarketingImages',
                'MultiAssetResponsiveDisplayAdSquareMarketingImages', 'MultiAssetResponsiveDisplayAdYouTubeVideos',
                'Path1', 'Path2', 'PolicySummary', 'PricePrefix', 'PromoText', 'ResponsiveSearchAdDescriptions',
                'ResponsiveSearchAdHeadlines', 'ResponsiveSearchAdPath1', 'ResponsiveSearchAdPath2', 'ShortHeadline',
                'Status', 'SystemManagedEntitySource', 'UniversalAppAdDescriptions', 'UniversalAppAdHeadlines',
                'UniversalAppAdHtml5MediaBundles', 'UniversalAppAdImages', 'UniversalAppAdMandatoryAdText',
                'UniversalAppAdYouTubeVideos',
                # 'ConversionAdjustment', 'IsNegative', # UnSupports zero impressions | Not compatible other field

                # Metric
                'AbsoluteTopImpressionPercentage', 'ActiveViewCpm', 'ActiveViewCtr', 'ActiveViewImpressions',
                'ActiveViewMeasurability', 'ActiveViewMeasurableCost', 'ActiveViewMeasurableImpressions',
                'ActiveViewViewability', 'AllConversionRate', 'AllConversions', 'AllConversionValue', 'AverageCost',
                'AverageCpc', 'AverageCpe', 'AverageCpm', 'AverageCpv', 'AveragePageviews', 'AveragePosition',
                'AverageTimeOnSite', 'BounceRate', 'ClickAssistedConversions',
                'ClickAssistedConversionsOverLastClickConversions', 'ClickAssistedConversionValue', 'Clicks',
                'ConversionRate', 'Conversions', 'ConversionValue', 'Cost', 'CostPerAllConversion', 'CostPerConversion',
                'CostPerCurrentModelAttributedConversion', 'CrossDeviceConversions', 'Ctr',
                'CurrentModelAttributedConversions', 'CurrentModelAttributedConversionValue', 'EngagementRate',
                'Engagements', 'GmailForwards', 'GmailSaves', 'GmailSecondaryClicks', 'ImpressionAssistedConversions',
                'ImpressionAssistedConversionsOverLastClickConversions', 'ImpressionAssistedConversionValue',
                'Impressions', 'InteractionRate', 'Interactions', 'InteractionTypes', 'PercentNewVisitors',
                'TopImpressionPercentage', 'ValuePerAllConversion', 'ValuePerConversion',
                'ValuePerCurrentModelAttributedConversion', 'VideoQuartile100Rate', 'VideoQuartile25Rate',
                'VideoQuartile50Rate', 'VideoQuartile75Rate', 'VideoViewRate', 'VideoViews', 'ViewThroughConversions',

                # Segment
                'Date'
            ],
            'CAMPAIGN_PERFORMANCE_REPORT': [
                # Attribute
                'AccountCurrencyCode', 'AccountDescriptiveName', 'AccountTimeZone', 'AdvertisingChannelSubType',
                'AdvertisingChannelType', 'Amount', 'BaseCampaignId', 'BiddingStrategyId', 'BiddingStrategyName',
                'BiddingStrategyType', 'BudgetId', 'CampaignDesktopBidModifier', 'CampaignGroupId', 'CampaignId',
                'CampaignMobileBidModifier', 'CampaignName', 'CampaignStatus', 'CampaignTabletBidModifier',
                'CampaignTrialType', 'CustomerDescriptiveName', 'EndDate', 'EnhancedCpcEnabled',
                'ExternalCustomerId', 'FinalUrlSuffix', 'HasRecommendedBudget', 'IsBudgetExplicitlyShared', 'LabelIds',
                'Labels', 'MaximizeConversionValueTargetRoas', 'Period', 'RecommendedBudgetAmount', 'ServingStatus',
                'StartDate', 'TotalAmount', 'TrackingUrlTemplate', 'UrlCustomParameters',
                # 'ConversionAdjustment',

                # Metric
                'AbsoluteTopImpressionPercentage', 'ActiveViewCpm', 'ActiveViewCtr', 'ActiveViewImpressions',
                'ActiveViewMeasurability', 'ActiveViewMeasurableCost', 'ActiveViewMeasurableImpressions',
                'ActiveViewViewability', 'AllConversionRate', 'AllConversions', 'AllConversionValue', 'AverageCost',
                'AverageCpc', 'AverageCpe', 'AverageCpm', 'AverageCpv', 'AverageFrequency', 'AveragePageviews',
                'AveragePosition', 'AverageTimeOnSite', 'BounceRate', 'ClickAssistedConversions',
                'ClickAssistedConversionsOverLastClickConversions', 'ClickAssistedConversionValue', 'Clicks',
                'ContentBudgetLostImpressionShare', 'ContentImpressionShare', 'ContentRankLostImpressionShare',
                'ConversionRate', 'Conversions', 'ConversionValue', 'Cost', 'CostPerAllConversion', 'CostPerConversion',
                'CostPerCurrentModelAttributedConversion', 'CrossDeviceConversions', 'Ctr',
                'CurrentModelAttributedConversions', 'CurrentModelAttributedConversionValue', 'EngagementRate',
                'Engagements', 'GmailForwards', 'GmailSaves', 'GmailSecondaryClicks', 'ImpressionAssistedConversions',
                'ImpressionAssistedConversionsOverLastClickConversions', 'ImpressionAssistedConversionValue',
                'ImpressionReach', 'Impressions', 'InteractionRate', 'Interactions', 'InteractionTypes',
                'InvalidClickRate', 'InvalidClicks', 'NumOfflineImpressions', 'NumOfflineInteractions',
                'OfflineInteractionRate', 'PercentNewVisitors', 'RelativeCtr', 'SearchAbsoluteTopImpressionShare',
                'SearchBudgetLostAbsoluteTopImpressionShare', 'SearchBudgetLostImpressionShare',
                'SearchBudgetLostTopImpressionShare', 'SearchClickShare', 'SearchExactMatchImpressionShare',
                'SearchImpressionShare', 'SearchRankLostAbsoluteTopImpressionShare', 'SearchRankLostImpressionShare',
                'SearchRankLostTopImpressionShare', 'SearchTopImpressionShare', 'TopImpressionPercentage',
                'ValuePerAllConversion', 'ValuePerConversion', 'ValuePerCurrentModelAttributedConversion',
                'VideoQuartile100Rate', 'VideoQuartile25Rate', 'VideoQuartile50Rate', 'VideoQuartile75Rate',
                'VideoViewRate', 'VideoViews', 'ViewThroughConversions',

                # Segment
                'Date',  # HourOfDay
            ],

            # 하루만 가능하고 모든 필드가 zero Impression이 지원되지 않음
            'CLICK_PERFORMANCE_REPORT': [
                # Attribute
                'AccountDescriptiveName', 'AdFormat', 'AdGroupId', 'AdGroupName', 'AdGroupStatus', 'AdNetworkType1',
                'AdNetworkType2', 'AdVariationControlTrialArmId', 'AdVariationTreatmentTrialArmId',
                'AdVariationTrialId', 'AoiCityCriteriaId', 'AoiCountryCriteriaId', 'AoiMetroCriteriaId',
                'AoiMostSpecificTargetId', 'AoiRegionCriteriaId', 'CampaignId', 'CampaignLocationTargetId',
                'CampaignName', 'CampaignStatus', 'Clicks', 'ClickType', 'CreativeId', 'CriteriaId',
                'CriteriaParameters', 'Date', 'Device', 'ExternalCustomerId', 'GclId', 'KeywordMatchType',
                'LopCityCriteriaId', 'LopCountryCriteriaId', 'LopMetroCriteriaId', 'LopMostSpecificTargetId',
                'LopRegionCriteriaId', 'MonthOfYear', 'Page', 'Slot', 'UserListId',
            ],
            'VIDEO_PERFORMANCE_REPORT': [
                # Attribute
                'AccountCurrencyCode', 'AccountDescriptiveName', 'AccountTimeZone', 'AdGroupId', 'AdGroupName',
                'AdGroupStatus', 'CampaignId', 'CampaignName', 'CampaignStatus', 'CreativeId', 'CreativeStatus',
                'CustomerDescriptiveName', 'ExternalCustomerId', 'VideoChannelId', 'VideoDuration', 'VideoId',
                'VideoTitle',

                # Metric
                'AllConversionRate', 'AllConversions', 'AllConversionValue', 'AverageCpm', 'AverageCpv', 'Clicks',
                'ConversionRate', 'Conversions', 'ConversionValue', 'Cost', 'CostPerAllConversion', 'CostPerConversion',
                'CrossDeviceConversions', 'Ctr', 'EngagementRate', 'Engagements', 'Impressions',
                'ValuePerAllConversion', 'VideoQuartile100Rate', 'VideoQuartile25Rate', 'VideoQuartile50Rate',
                'VideoQuartile75Rate', 'VideoViewRate', 'VideoViews', 'ViewThroughConversions',

                # Segment
                'Date',
            ],
        }

        return fields[report_type]


if __name__ == '__main__':
    developer_token = 'uiEac-DOrwlVN2cWf2_LsQ'
    client_customer_id = '843-616-6313'
    client_id = '173895437785-4ee7dhe83tfi2hpquff0jtfaku196nk8.apps.googleusercontent.com'
    client_secret = '79NF8XoN4BOocKzUk8afRfvG'
    refresh_token = '1//0e1ce-1iXREZXCgYIARAAGA4SNwF-L9IrTj6FypyahRIDZsmHbGId7tAYThbKVWx0ct446i4sgNuy6CGMea-Wd5Us8aEN7HeSdps'

    adwords_info = {
        'developerToken': developer_token,
        'clientCustomerId': client_customer_id,
        'clientId': client_id,
        'clientSecret': client_secret,
        'refreshToken': refresh_token,
    }

    ga = GoogleAdWords(adwords_info)

    # Verify
    print(ga.verify())

    # Collect
    result = ga.collect()
    print(result)

    # print(GoogleAds.verify(file_path))
