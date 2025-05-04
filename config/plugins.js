// path: config/plugins.js

module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: "cloudinary",
      providerOptions: {
        cloud_name: env("CLOUDINARY_NAME"),
        api_key: env("CLOUDINARY_KEY"),
        api_secret: env("CLOUDINARY_SECRET"),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },

  // 🔍 Algolia Config
  "strapi-algolia": {
    enabled: false,
    config: {
      applicationId: env("ALGOLIA_APP_ID"),
      apiKey: env("ALGOLIA_ADMIN_KEY"),
      prefix: "prod",
      debug: false,
      contentTypes: [
        {
          name: "api::product.product",
          transformEntry({ entry }) {
            const safeText = (text, max = 255) =>
              typeof text === "string" ? text.slice(0, max) : "";

            const safeImage = (imgs) =>
              Array.isArray(imgs) && imgs.length > 0
                ? {
                    url: imgs[0].url,
                    alt: imgs[0].alternativeText || "",
                  }
                : null;

            return {
              objectID: entry.documentId,
              title: safeText(entry.title, 255),
              price: entry.price,
              stock: entry.stock,
              condition: entry.condition,
              shippingPrice: entry.shippingPrice,
              shipping_date: entry.shipping_date,
              returns: entry.returns,
              warranty: entry.warranty,
              images: safeImage(entry.images),
              sub_categories: (entry.sub_categories || [])
                .slice(0, 5)
                .map((s) => ({
                  title: safeText(s.title, 100),
                  url: safeText(s.url, 200),
                })),
              author: {
                username: safeText(entry.authorID?.username, 100),
              },
            };
          },
        },
      ],
    },
  },
});
