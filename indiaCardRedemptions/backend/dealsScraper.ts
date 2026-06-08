import http from 'http';
import https from 'https';

export interface PointSale {
  id: string;
  partner: string;
  bonusPercentage: number;
  basePointsBought: number;
  bonusPointsReceived: number;
  totalUsdCost: number;
  endDate: string;
  description: string;
}

// Fixed exchange rate to match frontend calculateCostPerPoint calculation
const USD_TO_INR = 85;

function stripEmojis(text: string): string {
  return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}]/gu, '');
}

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, '-')
    .replace(/&#\d+;/g, '')
    .trim();
}

export function parseRssFeed(xml: string): PointSale[] {
  const sales: PointSale[] = [];
  // Split feed by <item> tags
  const items = xml.split(/<item>/i);
  // Skip the first element which is the feed header metadata
  items.shift();

  for (const item of items) {
    // Extract title
    const titleMatch = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/is);
    if (!titleMatch) continue;
    let title = stripHtml(titleMatch[1]);
    title = stripEmojis(title);

    // Extract pubDate
    const pubDateMatch = item.match(/<pubDate>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/pubDate>/is);
    const pubDateStr = pubDateMatch ? stripHtml(pubDateMatch[1]) : '';
    
    // Format a display date like "June 18, 2026"
    let endDate = 'June 30, 2026'; // Default fallback
    if (pubDateStr) {
      try {
        const dateObj = new Date(pubDateStr);
        // Expiry is generally 14-30 days after publish. Let's make it 21 days from published date.
        dateObj.setDate(dateObj.getDate() + 21);
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        endDate = dateObj.toLocaleDateString('en-US', options);
      } catch {
        // Fallback to default
      }
    }

    // Extract description
    const descMatch = item.match(/<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/is);
    let description = descMatch ? stripHtml(descMatch[1]) : '';
    description = stripEmojis(description);

    // Filter rules: check if it's a deals post
    const searchArea = (title + ' ' + description).toLowerCase();
    const isDeal = 
      searchArea.includes('buy') || 
      searchArea.includes('purchase') || 
      searchArea.includes('bonus') || 
      searchArea.includes('transfer') || 
      searchArea.includes('points sale') ||
      searchArea.includes('miles sale');

    if (!isDeal) continue;

    // Detect partner
    let partner = '';
    let defaultRate = 1.20; // Default INR cost per point fallback
    
    if (searchArea.includes('virgin atlantic') || searchArea.includes('virgin points') || searchArea.includes('flying club')) {
      partner = 'Virgin Atlantic';
      defaultRate = 1.13;
    } else if (searchArea.includes('hilton')) {
      partner = 'Hilton Honors';
      defaultRate = 0.425;
    } else if (searchArea.includes('qatar') || searchArea.includes('privilege club')) {
      partner = 'Qatar Privilege Club';
      defaultRate = 1.36;
    } else if (searchArea.includes('marriott') || searchArea.includes('bonvoy')) {
      partner = 'Marriott Bonvoy';
      defaultRate = 1.00;
    } else if (searchArea.includes('hyatt') || searchArea.includes('world of hyatt')) {
      partner = 'World of Hyatt';
      defaultRate = 1.50;
    } else if (searchArea.includes('british airways') || searchArea.includes('ba executive') || (searchArea.includes('avios') && searchArea.includes('ba'))) {
      partner = 'British Airways';
      defaultRate = 1.36;
    } else if (searchArea.includes('flying blue') || searchArea.includes('air france') || searchArea.includes('klm')) {
      partner = 'Flying Blue';
      defaultRate = 1.20;
    }

    if (!partner) continue; // Skip if no partner identified

    // Parse bonus percentage
    const bonusMatch = title.match(/(\d+)%\s*(?:Bonus|promo|discount|more|extra)/i) || 
                       description.match(/(\d+)%\s*(?:Bonus|promo|discount|more|extra)/i);
    const bonusPercentage = bonusMatch ? parseInt(bonusMatch[1], 10) : 50; // Default to 50 if not found

    // Parse specific Buy rate if in title/description
    const rateMatch = title.match(/(?:Buy for|at)\s*(\d+(?:\.\d+)?)/i) ||
                      description.match(/(?:Buy for|at)\s*(\d+(?:\.\d+)?)\s*(?:Re|Rs|rupee|₹|INR)/i);
    const ratePerPoint = rateMatch ? parseFloat(rateMatch[1]) : defaultRate;

    // Standard base points bought mapping
    const basePointsBought = partner === 'Qatar Privilege Club' || partner === 'British Airways' ? 20000 : 10000;
    const bonusPointsReceived = Math.round(basePointsBought * (bonusPercentage / 100));
    const totalPoints = basePointsBought + bonusPointsReceived;

    // Mathematics backwards calculation to ensure frontend USD_TO_INR checks out
    const totalInrCost = totalPoints * ratePerPoint;
    const totalUsdCost = Math.round((totalInrCost / USD_TO_INR) * 100) / 100;

    // Generate readable id
    const cleanPartnerId = partner.toLowerCase().replace(/\s+/g, '_');
    const id = `${cleanPartnerId}_${bonusPercentage}_feed_${Date.now()}_${sales.length}`;

    // Formatting cleaned description without emojis
    const cleanDescription = description.split('The post')[0].trim() || description;

    sales.push({
      id,
      partner,
      bonusPercentage,
      basePointsBought,
      bonusPointsReceived,
      totalUsdCost,
      endDate,
      description: cleanDescription
    });
  }

  return sales;
}

export function fetchRssFeed(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch RSS feed. Status code: ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

export async function fetchAndParseDeals(url = 'https://livefromalounge.com/feed/'): Promise<PointSale[]> {
  try {
    const xml = await fetchRssFeed(url);
    return parseRssFeed(xml);
  } catch (err) {
    console.error('Error fetching/parsing remote deals feed:', err);
    throw err;
  }
}
