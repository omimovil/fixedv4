import type { Attribute, Schema } from '@strapi/strapi';

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::api-token',
      'oneToMany',
      'admin::api-token-permission'
    >;
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    token: Attribute.Relation<
      'admin::api-token-permission',
      'manyToOne',
      'admin::api-token'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Attribute.JSON & Attribute.DefaultTo<{}>;
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>;
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::role',
      'oneToMany',
      'admin::permission'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Attribute.String;
    registrationToken: Attribute.String & Attribute.Private;
    resetPasswordToken: Attribute.String & Attribute.Private;
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> &
      Attribute.Private;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    username: Attribute.String;
  };
}

export interface ApiAddressAddress extends Schema.CollectionType {
  collectionName: 'addresses';
  info: {
    description: '';
    displayName: 'Address';
    pluralName: 'addresses';
    singularName: 'address';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    address_one: Attribute.Text &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }> &
      Attribute.DefaultTo<'address'>;
    address_two: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    author: Attribute.Relation<
      'api::address.address',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    authorID: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    city: Attribute.String &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    country: Attribute.String &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::address.address',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    last_name: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::address.address',
      'oneToMany',
      'api::address.address'
    >;
    phone_number: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    product: Attribute.Relation<
      'api::address.address',
      'manyToOne',
      'api::product.product'
    >;
    purchase: Attribute.Relation<
      'api::address.address',
      'oneToOne',
      'api::purchase.purchase'
    >;
    state: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::address.address',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user_name: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    zip_code: Attribute.String &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
  };
}

export interface ApiAvailableCategorieAvailableCategorie
  extends Schema.CollectionType {
  collectionName: 'available_categories';
  info: {
    description: '';
    displayName: 'availableCategorie';
    pluralName: 'available-categories';
    singularName: 'available-categorie';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    categories: Attribute.Relation<
      'api::available-categorie.available-categorie',
      'manyToMany',
      'api::category.category'
    >;
    category_image: Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    categoryID: Attribute.UID<
      'api::available-categorie.available-categorie',
      'name'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::available-categorie.available-categorie',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.Text;
    image: Attribute.Media<'images'>;
    name: Attribute.String & Attribute.Required & Attribute.Unique;
    products: Attribute.Relation<
      'api::available-categorie.available-categorie',
      'oneToMany',
      'api::product.product'
    >;
    slug: Attribute.UID<'api::available-categorie.available-categorie', 'name'>;
    small_image: Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::available-categorie.available-categorie',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiBrandBrand extends Schema.CollectionType {
  collectionName: 'brands';
  info: {
    displayName: 'brand';
    pluralName: 'brands';
    singularName: 'brand';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    categories: Attribute.Relation<
      'api::brand.brand',
      'manyToMany',
      'api::category.category'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::brand.brand',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::brand.brand',
      'oneToMany',
      'api::brand.brand'
    >;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    products: Attribute.Relation<
      'api::brand.brand',
      'manyToMany',
      'api::product.product'
    >;
    slug: Attribute.UID<'api::brand.brand', 'name'> &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::brand.brand',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCategoryCategory extends Schema.CollectionType {
  collectionName: 'categories';
  info: {
    description: '';
    displayName: 'Category';
    pluralName: 'categories';
    singularName: 'category';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    available_categories: Attribute.Relation<
      'api::category.category',
      'manyToMany',
      'api::available-categorie.available-categorie'
    >;
    brands: Attribute.Relation<
      'api::category.category',
      'manyToMany',
      'api::brand.brand'
    >;
    categories: Attribute.Relation<
      'api::category.category',
      'manyToMany',
      'api::category.category'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::category.category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.Text &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }> &
      Attribute.SetMinMaxLength<{
        maxLength: 40;
      }>;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::category.category',
      'oneToMany',
      'api::category.category'
    >;
    products: Attribute.Relation<
      'api::category.category',
      'manyToMany',
      'api::category.category'
    >;
    sub_categories: Attribute.Relation<
      'api::category.category',
      'manyToMany',
      'api::product.product'
    >;
    title: Attribute.String &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::category.category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    url: Attribute.UID<'api::category.category', 'title'>;
  };
}

export interface ApiColorColor extends Schema.CollectionType {
  collectionName: 'colors';
  info: {
    description: '';
    displayName: 'Color';
    pluralName: 'colors';
    singularName: 'color';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    colorID: Attribute.UID<'api::color.color', 'name'> &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::color.color',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    hexCode: Attribute.String &
      Attribute.Unique &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    Image_color: Attribute.Media<'images' | 'files' | 'videos' | 'audios'> &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::color.color',
      'oneToMany',
      'api::color.color'
    >;
    name: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    product_ids: Attribute.Relation<
      'api::color.color',
      'manyToMany',
      'api::product.product'
    >;
    shopping_carts: Attribute.Relation<
      'api::color.color',
      'manyToMany',
      'api::shopping-cart.shopping-cart'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::color.color',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiContactAddressContactAddress extends Schema.SingleType {
  collectionName: 'contact_addresses';
  info: {
    displayName: 'contactAddress';
    pluralName: 'contact-addresses';
    singularName: 'contact-address';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    address_one: Attribute.String;
    address_two: Attribute.String;
    authorID: Attribute.String;
    city: Attribute.String;
    country: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::contact-address.contact-address',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    lastname: Attribute.String;
    phone_number: Attribute.String;
    publishedAt: Attribute.DateTime;
    state: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::contact-address.contact-address',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    username: Attribute.String;
  };
}

export interface ApiCookieCategoryCookieCategory extends Schema.CollectionType {
  collectionName: 'cookie_categories';
  info: {
    displayName: 'Cookie Categories';
    pluralName: 'cookie-categories';
    singularName: 'cookie-category';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    i18n: {
      localized: true;
    };
  };
  attributes: {
    cookies: Attribute.Relation<
      'api::cookie-category.cookie-category',
      'oneToMany',
      'api::cookie.cookie'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::cookie-category.cookie-category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.Text &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::cookie-category.cookie-category',
      'oneToMany',
      'api::cookie-category.cookie-category'
    >;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::cookie-category.cookie-category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCookiePopupCookiePopup extends Schema.CollectionType {
  collectionName: 'cookie_popups';
  info: {
    displayName: 'Cookie Popups';
    pluralName: 'cookie-popups';
    singularName: 'cookie-popup';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    i18n: {
      localized: true;
    };
  };
  attributes: {
    buttons: Attribute.Component<'shared.cookie-button', true> &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::cookie-popup.cookie-popup',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.RichText &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::cookie-popup.cookie-popup',
      'oneToMany',
      'api::cookie-popup.cookie-popup'
    >;
    title: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::cookie-popup.cookie-popup',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCookieCookie extends Schema.CollectionType {
  collectionName: 'cookies';
  info: {
    displayName: 'Cookies';
    pluralName: 'cookies';
    singularName: 'cookie';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    i18n: {
      localized: true;
    };
  };
  attributes: {
    category: Attribute.Relation<
      'api::cookie.cookie',
      'manyToOne',
      'api::cookie-category.cookie-category'
    > &
      Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::cookie.cookie',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.Text &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    duration: Attribute.JSON;
    host: Attribute.String & Attribute.Required;
    isVisible: Attribute.Boolean &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }> &
      Attribute.DefaultTo<true>;
    key: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::cookie.cookie',
      'oneToMany',
      'api::cookie.cookie'
    >;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    party: Attribute.Enumeration<
      ['First-party', 'Second-party', 'Third-party']
    > &
      Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::cookie.cookie',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCostumerCostumer extends Schema.CollectionType {
  collectionName: 'costumers';
  info: {
    displayName: 'Costumer';
    pluralName: 'costumers';
    singularName: 'costumer';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::costumer.costumer',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    publishedAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::costumer.costumer',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    username: Attribute.String;
  };
}

export interface ApiDeliveryDateDeliveryDate extends Schema.CollectionType {
  collectionName: 'delivery_dates';
  info: {
    description: '';
    displayName: 'DeliveryDate';
    pluralName: 'delivery-dates';
    singularName: 'delivery-date';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::delivery-date.delivery-date',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    deliveryDateName: Attribute.String;
    products: Attribute.Relation<
      'api::delivery-date.delivery-date',
      'manyToMany',
      'api::product.product'
    >;
    publishedAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::delivery-date.delivery-date',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiFavoriteProductFavoriteProduct
  extends Schema.CollectionType {
  collectionName: 'favorite_products';
  info: {
    description: '';
    displayName: 'FavoriteProduct';
    pluralName: 'favorite-products';
    singularName: 'favorite-product';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    admin_users: Attribute.Relation<
      'api::favorite-product.favorite-product',
      'oneToMany',
      'admin::user'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::favorite-product.favorite-product',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::favorite-product.favorite-product',
      'oneToMany',
      'api::favorite-product.favorite-product'
    >;
    productID: Attribute.Relation<
      'api::favorite-product.favorite-product',
      'manyToOne',
      'api::product.product'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::favorite-product.favorite-product',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::favorite-product.favorite-product',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    userID: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
  };
}

export interface ApiOrderProductOrderProduct extends Schema.SingleType {
  collectionName: 'order_products';
  info: {
    displayName: 'OrderProduct';
    pluralName: 'order-products';
    singularName: 'order-product';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::order-product.order-product',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    orders: Attribute.Relation<
      'api::order-product.order-product',
      'oneToMany',
      'api::order.order'
    >;
    products: Attribute.Relation<
      'api::order-product.order-product',
      'oneToMany',
      'api::product.product'
    >;
    publishedAt: Attribute.DateTime;
    quantity: Attribute.Decimal;
    shipping_state: Attribute.Relation<
      'api::order-product.order-product',
      'oneToOne',
      'api::shipping-state.shipping-state'
    >;
    totalPrice: Attribute.BigInteger;
    unitPrice: Attribute.BigInteger;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::order-product.order-product',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiOrderOrder extends Schema.CollectionType {
  collectionName: 'orders';
  info: {
    description: '';
    displayName: 'Order ';
    pluralName: 'orders';
    singularName: 'order';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    admin_users: Attribute.Relation<
      'api::order.order',
      'oneToMany',
      'admin::user'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::order.order',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    delivered: Attribute.Boolean &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::order.order',
      'oneToMany',
      'api::order.order'
    >;
    products: Attribute.Relation<
      'api::order.order',
      'manyToMany',
      'api::product.product'
    >;
    publishedAt: Attribute.DateTime;
    return: Attribute.Boolean &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    shipped: Attribute.Boolean &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    shipping_state: Attribute.Relation<
      'api::order.order',
      'oneToOne',
      'api::shipping-state.shipping-state'
    > &
      Attribute.Private;
    to_ship: Attribute.Boolean &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }> &
      Attribute.DefaultTo<true>;
    total_price: Attribute.Decimal &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::order.order',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    users_permissions_user: Attribute.Relation<
      'api::order.order',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiPaymentMethodPaymentMethod extends Schema.CollectionType {
  collectionName: 'payment_methods';
  info: {
    displayName: 'PaymentMethod';
    pluralName: 'payment-methods';
    singularName: 'payment-method';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    content: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::payment-method.payment-method',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String;
    products: Attribute.Relation<
      'api::payment-method.payment-method',
      'manyToMany',
      'api::product.product'
    >;
    publishedAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::payment-method.payment-method',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiPaymentPayment extends Schema.CollectionType {
  collectionName: 'payments';
  info: {
    displayName: 'Payment';
    pluralName: 'payments';
    singularName: 'payment';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::payment.payment',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::payment.payment',
      'oneToMany',
      'api::payment.payment'
    >;
    publishedAt: Attribute.DateTime;
    solds: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::payment.payment',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiPersonalAddressPersonalAddress
  extends Schema.CollectionType {
  collectionName: 'personal_addresses';
  info: {
    description: '';
    displayName: 'PersonalAddress';
    pluralName: 'personal-addresses';
    singularName: 'personal-address';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    address_one: Attribute.String;
    address_two: Attribute.String;
    authorID: Attribute.String & Attribute.Unique;
    city: Attribute.String;
    country: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::personal-address.personal-address',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    lastname: Attribute.String;
    phone_number: Attribute.String;
    state: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::personal-address.personal-address',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::personal-address.personal-address',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    username: Attribute.String;
    zip_code: Attribute.String;
  };
}

export interface ApiProductInCartProductInCart extends Schema.CollectionType {
  collectionName: 'product_in_carts';
  info: {
    displayName: 'ProductInCart';
    pluralName: 'product-in-carts';
    singularName: 'product-in-cart';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::product-in-cart.product-in-cart',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::product-in-cart.product-in-cart',
      'oneToMany',
      'api::product-in-cart.product-in-cart'
    >;
    publishedAt: Attribute.DateTime;
    title: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::product-in-cart.product-in-cart',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiProductProduct extends Schema.CollectionType {
  collectionName: 'products';
  info: {
    description: '';
    displayName: 'Products';
    pluralName: 'products';
    singularName: 'product';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    admin_user: Attribute.Relation<
      'api::product.product',
      'oneToOne',
      'admin::user'
    > &
      Attribute.SetPluginOptions<{
        translate: {
          translate: 'translate';
        };
      }>;
    author: Attribute.Relation<
      'api::product.product',
      'oneToOne',
      'plugin::users-permissions.user'
    > &
      Attribute.SetPluginOptions<{
        translate: {
          translate: 'translate';
        };
      }>;
    authorID: Attribute.Relation<
      'api::product.product',
      'oneToOne',
      'plugin::users-permissions.user'
    > &
      Attribute.SetPluginOptions<{
        translate: {
          translate: 'translate';
        };
      }>;
    available_category: Attribute.Relation<
      'api::product.product',
      'manyToOne',
      'api::available-categorie.available-categorie'
    > &
      Attribute.SetPluginOptions<{
        translate: {
          translate: 'translate';
        };
      }>;
    brand: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
        translate: {
          translate: 'translate';
        };
      }>;
    brands: Attribute.Relation<
      'api::product.product',
      'manyToMany',
      'api::brand.brand'
    > &
      Attribute.SetPluginOptions<{
        translate: {
          translate: 'translate';
        };
      }>;
    colors: Attribute.Relation<
      'api::product.product',
      'manyToMany',
      'api::color.color'
    > &
      Attribute.SetPluginOptions<{
        translate: {
          translate: 'translate';
        };
      }>;
    condition: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
        translate: {
          translate: 'translate';
        };
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::product.product',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    delivery_dates: Attribute.Relation<
      'api::product.product',
      'manyToMany',
      'api::delivery-date.delivery-date'
    > &
      Attribute.SetPluginOptions<{
        translate: {
          translate: 'translate';
        };
      }>;
    description: Attribute.RichText &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
        translate: {
          translate: 'translate';
        };
      }>;
    favorite_products: Attribute.Relation<
      'api::product.product',
      'oneToMany',
      'api::favorite-product.favorite-product'
    > &
      Attribute.SetPluginOptions<{
        translate: {
          translate: 'translate';
        };
      }>;
    fullDescription: Attribute.RichText &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
        translate: {
          translate: 'translate';
        };
      }>;
    images: Attribute.Media<'images' | 'files' | 'videos' | 'audios', true> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
        translate: {
          translate: 'translate';
        };
      }>;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::product.product',
      'oneToMany',
      'api::product.product'
    >;
    on_offer: Attribute.Boolean &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    orders: Attribute.Relation<
      'api::product.product',
      'manyToMany',
      'api::order.order'
    > &
      Attribute.SetPluginOptions<{
        translate: {
          translate: 'translate';
        };
      }>;
    payment_methods: Attribute.Relation<
      'api::product.product',
      'manyToMany',
      'api::payment-method.payment-method'
    > &
      Attribute.SetPluginOptions<{
        translate: {
          translate: 'translate';
        };
      }>;
    price: Attribute.Decimal &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }> &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    productID: Attribute.String &
      Attribute.Unique &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
        translate: {
          translate: 'translate';
        };
      }>;
    returns: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
        translate: {
          translate: 'translate';
        };
      }>;
    shipping_date: Attribute.String &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
        translate: {
          translate: 'translate';
        };
      }> &
      Attribute.DefaultTo<'24 - 48 horas'>;
    shipping_state: Attribute.Relation<
      'api::product.product',
      'manyToOne',
      'api::shipping-state.shipping-state'
    > &
      Attribute.SetPluginOptions<{
        translate: {
          translate: 'translate';
        };
      }>;
    shippingPrice: Attribute.String &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
        translate: {
          translate: 'translate';
        };
      }>;
    shopping_carts: Attribute.Relation<
      'api::product.product',
      'manyToMany',
      'api::shopping-cart.shopping-cart'
    > &
      Attribute.SetPluginOptions<{
        translate: {
          translate: 'translate';
        };
      }>;
    size: Attribute.Relation<
      'api::product.product',
      'manyToMany',
      'api::size.size'
    > &
      Attribute.SetPluginOptions<{
        translate: {
          translate: 'translate';
        };
      }>;
    sku: Attribute.UID<'api::product.product', 'productID'> &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    soldTimes: Attribute.Integer &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    stock: Attribute.Integer &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }> &
      Attribute.DefaultTo<0>;
    sub_categories: Attribute.Relation<
      'api::product.product',
      'manyToMany',
      'api::category.category'
    > &
      Attribute.SetPluginOptions<{
        translate: {
          translate: 'translate';
        };
      }>;
    title: Attribute.Text &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
        translate: {
          translate: 'translate';
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::product.product',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    uuid: Attribute.UID<'api::product.product', 'title'> &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    VideoUrl: Attribute.Media<'images' | 'files' | 'videos' | 'audios'> &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
        translate: {
          translate: 'translate';
        };
      }>;
    warranty: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
        translate: {
          translate: 'translate';
        };
      }>;
    wish_itemIDS: Attribute.Relation<
      'api::product.product',
      'oneToMany',
      'api::address.address'
    > &
      Attribute.SetPluginOptions<{
        translate: {
          translate: 'translate';
        };
      }>;
  };
}

export interface ApiPurchasePurchase extends Schema.CollectionType {
  collectionName: 'purchases';
  info: {
    description: '';
    displayName: 'purchase';
    pluralName: 'purchases';
    singularName: 'purchase';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::purchase.purchase',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    image: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    product_related: Attribute.Relation<
      'api::purchase.purchase',
      'oneToOne',
      'api::address.address'
    >;
    productID: Attribute.String & Attribute.Required;
    publishedAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::purchase.purchase',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiRatingRating extends Schema.CollectionType {
  collectionName: 'ratings';
  info: {
    displayName: 'rating';
    pluralName: 'ratings';
    singularName: 'rating';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::rating.rating',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    publishedAt: Attribute.DateTime;
    ratingAuthor: Attribute.Relation<
      'api::rating.rating',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    StarQuantity: Attribute.Integer;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::rating.rating',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiReviewReview extends Schema.CollectionType {
  collectionName: 'reviews';
  info: {
    description: '';
    displayName: 'Review';
    pluralName: 'reviews';
    singularName: 'review';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    content: Attribute.RichText &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
        translate: {
          translate: 'translate';
        };
      }> &
      Attribute.DefaultTo<'type a comment'>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::review.review',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::review.review',
      'oneToMany',
      'api::review.review'
    >;
    publishedAt: Attribute.DateTime;
    reviewImage: Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    > &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
        translate: {
          translate: 'translate';
        };
      }>;
    reviews_author: Attribute.Relation<
      'api::review.review',
      'oneToOne',
      'plugin::users-permissions.user'
    > &
      Attribute.SetPluginOptions<{
        translate: {
          translate: 'translate';
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::review.review',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiShippingStateShippingState extends Schema.CollectionType {
  collectionName: 'shipping_states';
  info: {
    description: '';
    displayName: 'shippingState';
    pluralName: 'shipping-states';
    singularName: 'shipping-state';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::shipping-state.shipping-state',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    delivered: Attribute.Boolean &
      Attribute.Required &
      Attribute.DefaultTo<false>;
    order: Attribute.Relation<
      'api::shipping-state.shipping-state',
      'oneToOne',
      'api::order.order'
    >;
    products: Attribute.Relation<
      'api::shipping-state.shipping-state',
      'oneToMany',
      'api::product.product'
    >;
    publishedAt: Attribute.DateTime;
    return: Attribute.Boolean & Attribute.Required & Attribute.DefaultTo<false>;
    shipped: Attribute.Boolean &
      Attribute.Required &
      Attribute.DefaultTo<false>;
    to_ship: Attribute.Boolean & Attribute.Required & Attribute.DefaultTo<true>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::shipping-state.shipping-state',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiShoppingCartShoppingCart extends Schema.CollectionType {
  collectionName: 'shopping_carts';
  info: {
    description: '';
    displayName: 'ShoppingCart';
    pluralName: 'shopping-carts';
    singularName: 'shopping-cart';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    active: Attribute.Boolean & Attribute.DefaultTo<true>;
    authorID: Attribute.Relation<
      'api::shopping-cart.shopping-cart',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    availability: Attribute.Boolean & Attribute.DefaultTo<false>;
    brand: Attribute.String;
    cartId: Attribute.UID &
      Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    color: Attribute.Relation<
      'api::shopping-cart.shopping-cart',
      'manyToMany',
      'api::color.color'
    >;
    colorID: Attribute.String;
    colorName: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::shopping-cart.shopping-cart',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    discount: Attribute.Decimal;
    image: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    price: Attribute.Decimal;
    product_ids: Attribute.Relation<
      'api::shopping-cart.shopping-cart',
      'manyToMany',
      'api::product.product'
    >;
    productID: Attribute.String & Attribute.Required;
    quantity: Attribute.Integer & Attribute.Required;
    size: Attribute.Relation<
      'api::shopping-cart.shopping-cart',
      'manyToMany',
      'api::size.size'
    >;
    sizeID: Attribute.String;
    subtotal: Attribute.Decimal;
    title: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::shopping-cart.shopping-cart',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    uploaded_at: Attribute.Date;
  };
}

export interface ApiSizeSize extends Schema.CollectionType {
  collectionName: 'sizes';
  info: {
    description: '';
    displayName: 'size';
    pluralName: 'sizes';
    singularName: 'size';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    available: Attribute.Boolean & Attribute.DefaultTo<true>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::size.size', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    label: Attribute.String;
    productId: Attribute.Relation<
      'api::size.size',
      'manyToMany',
      'api::product.product'
    >;
    publishedAt: Attribute.DateTime;
    quantity: Attribute.BigInteger;
    shopping_carts: Attribute.Relation<
      'api::size.size',
      'manyToMany',
      'api::shopping-cart.shopping-cart'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'api::size.size', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String & Attribute.Required;
    releasedAt: Attribute.DateTime;
    scheduledAt: Attribute.DateTime;
    status: Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Attribute.Required;
    timezone: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Schema.CollectionType {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    entry: Attribute.Relation<
      'plugin::content-releases.release-action',
      'morphToOne'
    >;
    isEntryValid: Attribute.Boolean;
    locale: Attribute.String;
    release: Attribute.Relation<
      'plugin::content-releases.release-action',
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Attribute.Enumeration<['publish', 'unpublish']> & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginI18NLocale extends Schema.CollectionType {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String &
      Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Attribute.String;
    caption: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    ext: Attribute.String;
    folder: Attribute.Relation<
      'plugin::upload.file',
      'manyToOne',
      'plugin::upload.folder'
    > &
      Attribute.Private;
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    height: Attribute.Integer;
    mime: Attribute.String & Attribute.Required;
    name: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>;
    size: Attribute.Decimal & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    url: Attribute.String & Attribute.Required;
    width: Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.folder'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    files: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.file'
    >;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    parent: Attribute.Relation<
      'plugin::upload.folder',
      'manyToOne',
      'plugin::upload.folder'
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Schema.CollectionType {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    type: Attribute.String & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    addresses: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::address.address'
    >;
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    favorite_products: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::favorite-product.favorite-product'
    >;
    lastname: Attribute.String;
    orders: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::order.order'
    >;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    personal_address: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'api::personal-address.personal-address'
    >;
    products: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::product.product'
    >;
    provider: Attribute.String;
    resetPasswordToken: Attribute.String & Attribute.Private;
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    shopping_carts: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::shopping-cart.shopping-cart'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::address.address': ApiAddressAddress;
      'api::available-categorie.available-categorie': ApiAvailableCategorieAvailableCategorie;
      'api::brand.brand': ApiBrandBrand;
      'api::category.category': ApiCategoryCategory;
      'api::color.color': ApiColorColor;
      'api::contact-address.contact-address': ApiContactAddressContactAddress;
      'api::cookie-category.cookie-category': ApiCookieCategoryCookieCategory;
      'api::cookie-popup.cookie-popup': ApiCookiePopupCookiePopup;
      'api::cookie.cookie': ApiCookieCookie;
      'api::costumer.costumer': ApiCostumerCostumer;
      'api::delivery-date.delivery-date': ApiDeliveryDateDeliveryDate;
      'api::favorite-product.favorite-product': ApiFavoriteProductFavoriteProduct;
      'api::order-product.order-product': ApiOrderProductOrderProduct;
      'api::order.order': ApiOrderOrder;
      'api::payment-method.payment-method': ApiPaymentMethodPaymentMethod;
      'api::payment.payment': ApiPaymentPayment;
      'api::personal-address.personal-address': ApiPersonalAddressPersonalAddress;
      'api::product-in-cart.product-in-cart': ApiProductInCartProductInCart;
      'api::product.product': ApiProductProduct;
      'api::purchase.purchase': ApiPurchasePurchase;
      'api::rating.rating': ApiRatingRating;
      'api::review.review': ApiReviewReview;
      'api::shipping-state.shipping-state': ApiShippingStateShippingState;
      'api::shopping-cart.shopping-cart': ApiShoppingCartShoppingCart;
      'api::size.size': ApiSizeSize;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
