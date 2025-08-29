import * as snowflake from "snowflake-sdk"

snowflake.configure({ ocspFailOpen: false, logLevel: 'WARN'})

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
    const connection = await snowflake.createConnection({
      account: process.env.SNOWFLAKE_DATA_ACCOUNT || "",
      username: process.env.SNOWFLAKE_DATA_USER || "",
      password: process.env.SNOWFLAKE_DATA_PASSWORD || "",
      database: "DWH_PROD",
      warehouse: process.env.SNOWFLAKE_DATA_WAREHOUSE || "",
      role: process.env.SNOWFLAKE_DATA_ROLE || "",
    })
  
    await new Promise<void>((resolve, reject) => {
      connection.connect((err) => {
        if (err) {
          console.error("Error connecting to Snowflake:", err)
          reject(err)
        } else {
          resolve()
        }
      })
    })
  
    const query = `
      SELECT * FROM DWH_PROD.PRISM.CRUX 
      WHERE DOMAIN = '${domain}'
      ORDER BY MONTH DESC
      LIMIT 10
    `
  
    const rows: CruxData[] = await new Promise((resolve, reject) => {
      connection.execute({
        sqlText: query,
        complete: (err, stmt, rows) => {
          if (err) {
            reject(err)
            console.error("Error executing query:", err)
          } else {
            resolve(rows as CruxData[])
          }
        },
      })
    })
  
    return rows
  }
  