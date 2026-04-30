const TRADING_ECONOMICS_URL = 'https://tradingeconomics.com/commodities';

// In-memory cache: Map<cacheKey, { data, timestamp }>
const cache = new Map<string, { data: CommodityData[]; timestamp: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface CommodityData {
  name: string;
  price: string;
  change: string;
  percentChange: string;
  timestamp: string;
}

function parseCommodityTable(html: string): CommodityData[] {
  const commodities: CommodityData[] = [];
  const now = new Date().toISOString();

  // Match table rows — Trading Economics uses <tr> rows with <td> cells
  // Each data row typically has: commodity name, price, day change, % change, and other columns
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch: RegExpExecArray | null;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];

    // Extract all <td> cell contents from this row
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells: string[] = [];
    let cellMatch: RegExpExecArray | null;

    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      // Strip HTML tags and trim whitespace
      const text = cellMatch[1].replace(/<[^>]*>/g, '').trim();
      cells.push(text);
    }

    // We need at least 4 cells: name, price, change, percentChange
    if (cells.length >= 4) {
      const name = cells[0];
      const price = cells[1];
      const change = cells[2];
      const percentChange = cells[3];

      // Filter out header rows or empty rows
      if (
        name &&
        price &&
        name.toLowerCase() !== 'commodity' &&
        name.toLowerCase() !== 'name' &&
        // Price should contain a number
        /[\d.]/.test(price)
      ) {
        commodities.push({
          name,
          price,
          change,
          percentChange,
          timestamp: now,
        });
      }
    }
  }

  return commodities;
}

async function fetchCommodities(): Promise<CommodityData[]> {
  const cacheKey = 'all_commodities';
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    return cached.data;
  }

  const response = await fetch(TRADING_ECONOMICS_URL, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch commodity data: ${response.status} ${response.statusText}`
    );
  }

  const html = await response.text();
  const commodities = parseCommodityTable(html);

  if (commodities.length === 0) {
    throw new Error(
      'No commodity data could be parsed from the page. The page structure may have changed.'
    );
  }

  cache.set(cacheKey, { data: commodities, timestamp: Date.now() });
  return commodities;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const commodityFilter = searchParams.get('commodity');

    let commodities = await fetchCommodities();

    if (commodityFilter) {
      const filter = commodityFilter.toLowerCase();
      commodities = commodities.filter((c) =>
        c.name.toLowerCase().includes(filter)
      );
    }

    return Response.json(commodities, {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Commodities API error:', error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch commodity data',
        hint: 'The commodity data is scraped from Trading Economics. If this error persists, the page structure may have changed.',
      },
      { status: 500 }
    );
  }
}
