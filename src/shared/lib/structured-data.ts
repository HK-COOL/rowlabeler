type BreadcrumbItem = {
  name: string;
  url: string;
};

type WebApplicationInput = {
  name: string;
  url: string;
  description: string;
};

export function buildBreadcrumbJsonLd(
  _path: string,
  items: BreadcrumbItem[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildWebApplicationJsonLd({
  name,
  url,
  description,
}: WebApplicationInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    url,
    description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}
