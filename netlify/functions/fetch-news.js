const normalizeUrl = (url) => {
  if (url.startsWith('//')) return 'https:' + url;
  if (!url.startsWith('http')) return 'https://' + url.replace(/^\/+/, '');
  return url;
};

exports.handler = async function (event, context) {
  try {
    const allItems = [];

    for (const feed of feeds) {
      try {
        const parsed = await parser.parseURL(feed);
        parsed.items.slice(0, 5).forEach(item => {
          allItems.push({
            title: item.title,
            link: normalizeUrl(item.link)
          });
        });
      } catch (innerErr) {
        console.error(`Failed to fetch ${feed}:`, innerErr);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(allItems)
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error fetching RSS feeds" })
    };
  }
};
