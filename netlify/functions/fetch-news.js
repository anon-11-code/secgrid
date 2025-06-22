const fetch = require('node-fetch');
const Parser = require('rss-parser');
const parser = new Parser();

const FEEDS = [
  // Global tech and cybersecurity
  'https://www.wired.com/feed/rss', // Wired tech news
  'https://techcrunch.com/feed/', // TechCrunch
  'https://www.theverge.com/rss/index.xml', // The Verge
  'https://www.zdnet.com/news/rss.xml', // ZDNet
  // African tech news
  'https://techpoint.africa/feed/', // Techpoint Africa (Nigeria)
  'https://disrupt-africa.com/feed/', // Disrupt Africa (pan-African tech)
  'https://technext24.com/feed/', // TechNext (Nigeria)
  // GitHub
  'https://github.blog/feed/', // GitHub Blog
  'https://github.com/trending/developers.rss', // GitHub Trending Developers
  'https://github.com/security-advisories.atom' // GitHub Security Advisories (kept from your list)
];

exports.handler = async function(event, context) {
  try {
    const allItems = [];

    for (const feedUrl of FEEDS) {
      try {
        const feed = await parser.parseURL(feedUrl);
        const base = new URL(feedUrl);

        feed.items.forEach(item => {
          let fullLink = item.link;
          try {
            fullLink = fullLink?.startsWith('http') ? fullLink : new URL(item.link, base).href;
          } catch (linkError) {
            console.error('Link parsing error:', item.link, linkError);
            fullLink = '#'; // Fallback
          }
          allItems.push({
            title: item.title || 'No title',
            link: fullLink,
            pubDate: item.pubDate || new Date().toISOString(),
            source: feed.title || base.hostname,
          });
        });
      } catch (feedError) {
        console.error('Feed error:', feedUrl, feedError);
      }
    }

    if (!allItems.length) {
      return {
        statusCode: 200,
        body: JSON.stringify([{ title: 'Check back later – no headlines found.', link: '#', source: 'System', pubDate: new Date().toISOString() }]),
      };
    }

    allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    const latestItems = allItems.slice(0, 10);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(latestItems),
    };
  } catch (error) {
    console.error('General error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify([{ title: 'Error loading news feed.', link: '#', source: 'System', pubDate: new Date().toISOString() }]),
    };
  }
};