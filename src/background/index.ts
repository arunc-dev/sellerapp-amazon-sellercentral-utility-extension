console.log('background is running')

// Cache CSRF token to avoid fetching dashboard HTML repeatedly
let csrfTokenCache: { token: string; timestamp: number } | null = null
const CSRF_TOKEN_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

async function getCsrfToken(): Promise<string> {
  // Return cached token if still valid
  if (csrfTokenCache && Date.now() - csrfTokenCache.timestamp < CSRF_TOKEN_CACHE_DURATION) {
    console.log('[Background] Using cached CSRF token')
    return csrfTokenCache.token
  }

  console.log('[Background] Fetching new CSRF token')
  const dashboardResponse = await fetch(
    'https://sellercentral.amazon.com/brand-analytics/dashboard/query-performance',
    {
      method: 'GET',
      credentials: 'include',
    },
  )

  if (!dashboardResponse.ok) {
    throw new Error(`Dashboard request failed with ${dashboardResponse.status}`)
  }

  const html = await dashboardResponse.text()
  const match = html.match(
    /<meta[^>]+name=["']anti-csrftoken-a2z["'][^>]*content=["']([^"']+)/i,
  )
  const csrfToken = match && match[1] ? match[1] : ''

  if (!csrfToken) {
    throw new Error('CSRF token not found in dashboard HTML')
  }

  // Cache the token
  csrfTokenCache = { token: csrfToken, timestamp: Date.now() }
  console.log('[Background] CSRF token cached')
  
  return csrfToken
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === 'COUNT') {
    console.log('background has received a message from popup, and count is ', request?.count)
  }

  if (request.type === 'GET_CUSTOMER_JOURNEY_METADATA') {
    ;(async () => {
      try {
        const dashboardResponse = await fetch(
          'https://sellercentral.amazon.com/brand-analytics/dashboard/customer-journey',
          {
            method: 'GET',
            credentials: 'include',
          },
        )

        if (!dashboardResponse.ok) {
          throw new Error(`Dashboard request failed with ${dashboardResponse.status}`)
        }

        const html = await dashboardResponse.text()
        const match = html.match(
          /<meta[^>]+name=["']anti-csrftoken-a2z["'][^>]*content=["']([^"']+)/i,
        )
        const csrfToken = match && match[1] ? match[1] : ''

        if (!csrfToken) {
          sendResponse({ error: 'CSRF token not found in dashboard HTML' })
          return
        }

        const metadataResponse = await fetch(
          'https://sellercentral.amazon.com/api/brand-analytics/v1/dashboard/customer-journey/metadata',
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
              'x-requested-with': 'XMLHttpRequest',
              'anti-csrftoken-a2z': csrfToken,
            },
            body: JSON.stringify({
              selectedCountries: request.selectedCountries ?? ['us'],
            }),
          },
        )

        if (!metadataResponse.ok) {
          throw new Error(`Metadata request failed with ${metadataResponse.status}`)
        }

        const customerJourneyData = await metadataResponse.json()
        
        // Also fetch Query Performance metadata for ASINs
        const queryPerfResponse = await fetch(
          'https://sellercentral.amazon.com/api/brand-analytics/v1/dashboard/query-performance/metadata',
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
              'x-requested-with': 'XMLHttpRequest',
              'anti-csrftoken-a2z': csrfToken,
            },
            body: JSON.stringify({
              selectedCountries: request.selectedCountries ?? ['us'],
            }),
          },
        )

        let queryPerfData = null
        if (queryPerfResponse.ok) {
          queryPerfData = await queryPerfResponse.json()
        }

        // Merge both metadata sources
        sendResponse({ 
          data: customerJourneyData,
          queryPerformanceData: queryPerfData 
        })
      } catch (error) {
        sendResponse({ error: String(error) })
      }
    })()

    // Return true to indicate we will respond asynchronously
    return true
  }

  if (request.type === 'DOWNLOAD_QUERY_PERFORMANCE_BRAND') {
    ;(async () => {
      try {
        const dashboardResponse = await fetch(
          'https://sellercentral.amazon.com/brand-analytics/dashboard/query-performance',
          {
            method: 'GET',
            credentials: 'include',
          },
        )

        if (!dashboardResponse.ok) {
          throw new Error(`Dashboard request failed with ${dashboardResponse.status}`)
        }

        const html = await dashboardResponse.text()
        const match = html.match(
          /<meta[^>]+name=["']anti-csrftoken-a2z["'][^>]*content=["']([^"']+)/i,
        )
        const csrfToken = match && match[1] ? match[1] : ''

        if (!csrfToken) {
          sendResponse({ error: 'CSRF token not found in dashboard HTML' })
          return
        }

        const {
          brand,
          reportingRange,
          period,
          selectedCountries = ['us'],
        } = request

        if (!brand || !reportingRange || !period) {
          sendResponse({ error: 'Missing brand/reportingRange/period selection' })
          return
        }

        const valueType = reportingRange.value
        let periodId = `${valueType}-value`

        if (valueType === 'weekly') {
          periodId = 'weekly-week'
        } else if (valueType === 'monthly') {
          periodId = 'monthly-month'
        } else if (valueType === 'quarterly') {
          periodId = 'quarterly-quarter'
        }

        // Build the filterSelections for the reports API
        const filterSelections = [
          { id: 'brand', value: brand.value, valueType: null },
          { id: 'reporting-range', value: reportingRange.value, valueType: null },
          { id: periodId, value: period.value, valueType },
        ];

        // Scrape all pages from the reports API
        const allRows = [];
        let pageNumber = 1;
        let totalItems = null;
        let pageSize = 100;
        let done = false;

        while (!done) {
          const reportsBody = {
            viewId: 'query-performance-brands-view',
            filterSelections,
            reportOperations: [
              {
                reportId: 'query-performance-brand-report-table',
                reportType: 'TABLE',
                pageNumber,
                pageSize,
                sortByColumnId: 'qp-query-rank',
                ascending: true,
              },
            ],
            selectedCountries,
            reportId: 'query-performance-brand-report-table',
          };

          const reportsResp = await fetch(
            'https://sellercentral.amazon.com/api/brand-analytics/v1/dashboard/query-performance/reports',
            {
              method: 'POST',
              credentials: 'include',
              headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'x-requested-with': 'XMLHttpRequest',
                'anti-csrftoken-a2z': csrfToken,
              },
              body: JSON.stringify(reportsBody),
            },
          );
          if (!reportsResp.ok) {
            throw new Error(`Reports request failed with ${reportsResp.status}`);
          }
          const reportsData = await reportsResp.json();
          const report = (reportsData.reportsV2 || []).find((r: any) => r.id === 'query-performance-brand-report-table');
          if (!report) {
            sendResponse({ error: 'No report data found' });
            return;
          }
          if (totalItems === null) {
            totalItems = report.totalItems;
            pageSize = report.pageSize;
          }
          allRows.push(...(report.rows || []));
          if (allRows.length >= totalItems) {
            done = true;
          } else {
            pageNumber++;
          }
        }
        console.log('[Brand Analytics] Final aggregated data:', { totalItems, rows: allRows });
        sendResponse({
          status: 'success',
          totalItems,
          rows: allRows,
        });
      } catch (error) {
        sendResponse({ error: String(error) })
      }
    })()

    return true
  }

  if (request.type === 'DOWNLOAD_QUERY_PERFORMANCE_ASIN') {
    ;(async () => {
      try {
        console.log('[Background] Starting ASIN report fetch...')
        
        // Use cached CSRF token
        const csrfToken = await getCsrfToken()

        const {
          viewId,
          reportId,
          filterSelections,
          selectedCountries = ['us'],
        } = request

        if (!viewId || !reportId || !filterSelections) {
          console.error('[Background] Missing required parameters')
          sendResponse({ error: 'Missing required parameters' })
          return
        }

        // Scrape all pages from the reports API
        const allRows = []
        let pageNumber = 1
        let totalItems = null
        let pageSize = 100
        let done = false

        while (!done) {
          const reportsBody = {
            viewId,
            filterSelections,
            reportOperations: [
              {
                reportId,
                reportType: 'TABLE',
                pageNumber,
                pageSize,
                sortByColumnId: 'qp-asin-query-rank',
                ascending: true,
              },
            ],
            selectedCountries,
            reportId,
          }

          console.log(`[Background] Fetching ASIN report page ${pageNumber}...`)
          const reportsResp = await fetch(
            'https://sellercentral.amazon.com/api/brand-analytics/v1/dashboard/query-performance/reports',
            {
              method: 'POST',
              credentials: 'include',
              headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'x-requested-with': 'XMLHttpRequest',
                'anti-csrftoken-a2z': csrfToken,
              },
              body: JSON.stringify(reportsBody),
            },
          )

          if (!reportsResp.ok) {
            const errorText = await reportsResp.text()
            console.error('[Background] Reports request failed:', reportsResp.status, errorText)
            throw new Error(`Reports request failed with ${reportsResp.status}`)
          }

          const reportsData = await reportsResp.json()
          const report = (reportsData.reportsV2 || []).find((r: any) => r.id === reportId)
          
          if (!report) {
            console.error('[Background] No report data found in response')
            sendResponse({ error: 'No report data found' })
            return
          }

          if (totalItems === null) {
            totalItems = report.totalItems
            pageSize = report.pageSize
            console.log(`[Background] Total items: ${totalItems}, Page size: ${pageSize}`)
          }

          allRows.push(...(report.rows || []))
          console.log(`[Background] Fetched ${allRows.length}/${totalItems} rows`)

          if (allRows.length >= totalItems) {
            done = true
          } else {
            pageNumber++
          }
        }

        console.log('[Background] Successfully fetched all ASIN report data:', { totalItems, rows: allRows.length })
        sendResponse({ 
          status: 'success',
          totalItems,
          rows: allRows 
        })
      } catch (error) {
        console.error('[Background] Error in ASIN report handler:', error)
        sendResponse({ error: String(error) })
      }
    })()

    return true
  }
})
