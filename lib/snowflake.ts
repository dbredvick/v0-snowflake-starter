// Type definition for CRUX data
export interface CruxData {
  AVG_FCP: number | null
  AVG_INP: number | null
  AVG_LCP: number | null
  AVG_TTFB: number | null
  DOMAIN: string
  DOMAIN_RANK: number
  FAST_INP: number | null
  FAST_LCP: number | null
  FAST_TTFB: number | null
  LARGE_CLS: number | null
  MEDIUM_CLS: number | null
  MONTH: string // ISO timestamp format
  P_75_CLS: number
  P_75_FCP: number
  P_75_INP: number | null
  P_75_LCP: number
  P_75_TTFB: number | null
  SLOW_FCP: number | null
  SLOW_INP: number | null
  SLOW_TTFB: number | null
  SLOW_LCP: number | null
  SMALL_CLS: number | null
  _polytomic_created_at: string // ISO timestamp format
  SFDC_ACCOUNT_ID: string
}

export async function getCruxData(domain: string): Promise<CruxData[]> {
  const proxyUrl = process.env.SNOWFLAKE_PROXY_URL
  const apiKey = process.env.SNOWFLAKE_PROXY_API_KEY
  const protectionBypass = process.env.VERCEL_PROTECTION_BYPASS

  if (!proxyUrl || !apiKey || !protectionBypass) {
    throw new Error('Missing required environment variables for Snowflake proxy')
  }

  const query = `
    SELECT * FROM DWH_PROD.PRISM.CRUX 
    WHERE DOMAIN = '${domain}'
    ORDER BY MONTH DESC
    LIMIT 10
  `

  try {
    const response = await fetch(`${proxyUrl}api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-vercel-protection-bypass': protectionBypass
      },
      body: JSON.stringify({ query })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(`Proxy API error: ${errorData.error || response.statusText}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(`Query failed: ${result.error || 'Unknown error'}`)
    }

    return result.data as CruxData[]
  } catch (error) {
    console.error('Error querying Snowflake proxy:', error)
    throw error
  }
}