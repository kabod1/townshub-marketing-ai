import { BetaAnalyticsDataClient } from '@google-analytics/data'

function getAnalyticsClient(): BetaAnalyticsDataClient | null {
  const json = process.env.GA_SERVICE_ACCOUNT_JSON
  if (!json) return null
  try {
    const credentials = JSON.parse(json)
    return new BetaAnalyticsDataClient({ credentials })
  } catch {
    return null
  }
}

export interface GAMetrics {
  activeUsers: number
  sessions: number
  pageViews: number
  bounceRate: number
  daily: { date: string; pageViews: number; users: number }[]
  topPages: { path: string; views: number }[]
}

export async function getGAMetrics(): Promise<GAMetrics | null> {
  const client = getAnalyticsClient()
  const propertyId = process.env.GA_PROPERTY_ID
  if (!client || !propertyId) return null

  try {
    const [totalsRes, dailyRes, pagesRes] = await Promise.all([
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
        ],
      }),
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 5,
      }),
    ])

    const totals = totalsRes[0].rows?.[0]?.metricValues

    return {
      activeUsers: parseInt(totals?.[0]?.value || '0'),
      sessions: parseInt(totals?.[1]?.value || '0'),
      pageViews: parseInt(totals?.[2]?.value || '0'),
      bounceRate: Math.round(parseFloat(totals?.[3]?.value || '0') * 100),
      daily: (dailyRes[0].rows || []).map((row) => ({
        date: row.dimensionValues?.[0]?.value || '',
        pageViews: parseInt(row.metricValues?.[0]?.value || '0'),
        users: parseInt(row.metricValues?.[1]?.value || '0'),
      })),
      topPages: (pagesRes[0].rows || []).map((row) => ({
        path: row.dimensionValues?.[0]?.value || '/',
        views: parseInt(row.metricValues?.[0]?.value || '0'),
      })),
    }
  } catch (err) {
    console.error('GA Data API error:', err)
    return null
  }
}
