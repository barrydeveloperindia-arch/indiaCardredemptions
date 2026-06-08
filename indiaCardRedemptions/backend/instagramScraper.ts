import https from 'https';

export interface InstagramPost {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

// Fallback data pre-scraped from https://www.instagram.com/thegreatindianmiles/
const fallbackPosts: InstagramPost[] = [
  {
    title: "Hyatt Fast Track: Unlock Hyatt Globalist status with just 20 nights",
    link: "https://www.instagram.com/p/DZd9n7BTL26/",
    description: "Unlock Hyatt Globalist status with just 20 nights (usually 60) plus a 1-year status match to Hyatt Explorist — tag a friend who needs this. Hyatt’s 20-night fast track is back! ✈️ #creditcards #creditcard #pointsandmiles #worldofhyatt #hyatt",
    pubDate: "Mon, 08 Jun 2026 06:30:00 GMT"
  },
  {
    title: "1-on-1 Travel Strategy Sessions: Maximize your credit card points",
    link: "https://www.instagram.com/p/DZbv-DTTZk0/",
    description: "Stop wasting your points and miles! 🛑 If you have over 2 lakh credit card points but no clue how to use them for business class flights or luxury hotels, we can help. ✈️🏨 In our 1-on-1 strategy sessions, we will build a custom travel plan for you, showing you exactly where to transfer your points for maximum value. Stop guessing and start traveling smart. Link in bio to apply! 🔗",
    pubDate: "Mon, 08 Jun 2026 01:30:00 GMT"
  },
  {
    title: "Free Hotel Nights: 5 Indian Credit Cards that offer free stays annually",
    link: "https://www.instagram.com/p/DZbPqTSRc8p/",
    description: "5 Indian Credit Cards that get you FREE hotel nights every year. 🏨 Send this to anyone who loves free hotel stays! ✈️ #creditcards #creditcard #pointsandmiles #luxurytravel #travelhacks",
    pubDate: "Sun, 07 Jun 2026 19:30:00 GMT"
  },
  {
    title: "Amex Platinum Travel: Is the Platinum Travel Card worth the ₹5,000 fee?",
    link: "https://www.instagram.com/p/DZY2tMHRg5m/",
    description: "Is American Express Platinum Travel Card worth the ₹5,000 fee? 🤔 Send this to someone who wants a free holiday! ✈️ #amex #americanexpress #creditcards #pointsandmiles #luxurytravel",
    pubDate: "Sun, 07 Jun 2026 14:30:00 GMT"
  },
  {
    title: "Emirates Skywards Miles Promo: Miles worth double till August 31",
    link: "https://www.instagram.com/p/DZRYfD_zf0b/",
    description: "Your Emirates Skywards miles are worth double till Aug 31! 😮 Send this to anyone who loves Emirates! ✈️ #emirates #skywards #pointsandmiles #creditcards #luxurytravel",
    pubDate: "Sun, 07 Jun 2026 10:30:00 GMT"
  }
];

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '').trim();
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export function buildRssXml(posts: InstagramPost[]): string {
  let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Indian Points Array Feed</title>
    <link>https://www.instagram.com/thegreatindianmiles/</link>
    <description>Latest points and miles updates parsed from @thegreatindianmiles on Instagram</description>
    <language>en-in</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="http://localhost:3000/api/rss/instagram" rel="self" type="application/rss+xml" />
`;

  for (const post of posts) {
    xml += `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(post.link)}</link>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${post.pubDate}</pubDate>
      <guid>${escapeXml(post.link)}</guid>
    </item>
`;
  }

  xml += `  </channel>
</rss>`;

  return xml;
}

export function fetchInstagramHtml(url = 'https://www.instagram.com/thegreatindianmiles/'): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    }, (res) => {
      if (res.statusCode && (res.statusCode >= 300 && res.statusCode < 400) && res.headers.location) {
        // Handle redirect to login wall gracefully
        reject(new Error(`Redirected to login wall: ${res.headers.location}`));
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch Instagram. Status code: ${res.statusCode}`));
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

export function parseInstagramHtml(html: string): InstagramPost[] {
  const posts: InstagramPost[] = [];
  
  // Instagram renders profile data in JSON block
  const scriptMatch = html.match(/<script[^>]*>window\._sharedData\s*=\s*({.*?});<\/script>/i) ||
                      html.match(/<script[^>]*>\s*window\.__additionalDataLoaded\([^,]+,\s*({.*?})\s*\);<\/script>/i);
                      
  if (scriptMatch) {
    try {
      const data = JSON.parse(scriptMatch[1]);
      const user = data?.entry_data?.ProfilePage?.[0]?.graphql?.user || data?.graphql?.user;
      const edges = user?.edge_owner_to_timeline_media?.edges || [];
      
      for (const edge of edges) {
        const node = edge?.node;
        if (!node) continue;
        
        const caption = node.edge_media_to_caption?.edges?.[0]?.node?.text || '';
        const shortcode = node.shortcode || '';
        const link = `https://www.instagram.com/p/${shortcode}`;
        const cleanCaption = stripHtml(caption);
        const title = cleanCaption.split('\n')[0].slice(0, 80) || 'Instagram Update';
        
        const timestamp = node.taken_at_timestamp ? node.taken_at_timestamp * 1000 : Date.now();
        const pubDate = new Date(timestamp).toUTCString();
        
        posts.push({
          title,
          link,
          description: cleanCaption,
          pubDate
        });
      }
    } catch {
      // JSON parse error, fallback
    }
  }
  
  return posts;
}

export async function getInstagramRssFeed(): Promise<string> {
  try {
    const html = await fetchInstagramHtml();
    const posts = parseInstagramHtml(html);
    if (posts && posts.length > 0) {
      return buildRssXml(posts);
    }
  } catch {
    // Graceful fallback to static pre-scraped posts when blocked by login wall
  }
  
  return buildRssXml(fallbackPosts);
}

export async function getInstagramJsonFeed(): Promise<InstagramPost[]> {
  try {
    const html = await fetchInstagramHtml();
    const posts = parseInstagramHtml(html);
    if (posts && posts.length > 0) {
      return posts;
    }
  } catch {
    // Graceful fallback to static pre-scraped posts when blocked by login wall
  }
  
  return fallbackPosts;
}
