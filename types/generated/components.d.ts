import type { Attribute, Schema } from '@strapi/strapi';

export interface CategoryCategory extends Schema.Component {
  collectionName: 'components_category_categories';
  info: {
    displayName: 'category';
  };
  attributes: {};
}

export interface CategoryShoppingCart extends Schema.Component {
  collectionName: 'components_category_shopping_carts';
  info: {
    displayName: 'ShoppingCart';
  };
  attributes: {
    title: Attribute.String;
  };
}

export interface PfapiTypesBool extends Schema.Component {
  collectionName: 'components_pfapi_types_bools';
  info: {
    description: '';
    displayName: 'bool';
    icon: 'angle-right';
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    value: Attribute.Boolean;
  };
}

export interface PfapiTypesDecimal extends Schema.Component {
  collectionName: 'components_pfapi_types_decimals';
  info: {
    description: '';
    displayName: 'Decimal';
    icon: 'angle-right';
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    value: Attribute.Decimal;
  };
}

export interface PfapiTypesInteger extends Schema.Component {
  collectionName: 'components_pfapi_types_integers';
  info: {
    description: '';
    displayName: 'Integer';
    icon: 'angle-right';
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    value: Attribute.Integer;
  };
}

export interface PfapiTypesIpPrefix extends Schema.Component {
  collectionName: 'components_pfapi_types_ip_prefixes';
  info: {
    description: '';
    displayName: 'IpPrefix';
    icon: 'align-left';
  };
  attributes: {
    comment: Attribute.String;
    ip_cidr: Attribute.String;
    prefix: Attribute.String;
    status: Attribute.Enumeration<['unlimited', 'blocked']> &
      Attribute.Required;
  };
}

export interface PfapiTypesJson extends Schema.Component {
  collectionName: 'components_pfapi_types_jsons';
  info: {
    description: '';
    displayName: 'json';
    icon: 'angle-right';
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    value: Attribute.JSON;
  };
}

export interface PfapiTypesMedia extends Schema.Component {
  collectionName: 'components_pfapi_types_media';
  info: {
    description: '';
    displayName: 'media';
    icon: 'angle-right';
  };
  attributes: {
    media: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    name: Attribute.String & Attribute.Required;
  };
}

export interface PfapiTypesMultimedia extends Schema.Component {
  collectionName: 'components_pfapi_types_multimedia';
  info: {
    description: '';
    displayName: 'multimedia';
    icon: 'angle-right';
  };
  attributes: {
    media: Attribute.Media<'images' | 'files' | 'videos' | 'audios', true>;
    name: Attribute.String & Attribute.Required;
  };
}

export interface PfapiTypesRichtext extends Schema.Component {
  collectionName: 'components_pfapi_types_richtexts';
  info: {
    description: '';
    displayName: 'richtext';
    icon: 'angle-right';
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    value: Attribute.RichText;
  };
}

export interface PfapiTypesText extends Schema.Component {
  collectionName: 'components_pfapi_types_texts';
  info: {
    description: '';
    displayName: 'text';
    icon: 'angle-right';
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    value: Attribute.Text;
  };
}

export interface SharedCookieButton extends Schema.Component {
  collectionName: 'components_shared_cookie_buttons';
  info: {
    displayName: 'Cookie Button';
  };
  attributes: {
    buttonType: Attribute.Enumeration<['Primary', 'Secondary', 'Text']>;
    label: Attribute.String;
  };
}

export interface SharedMetaSocial extends Schema.Component {
  collectionName: 'components_shared_meta_socials';
  info: {
    displayName: 'metaSocial';
  };
  attributes: {
    description: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 65;
      }>;
    image: Attribute.Media<'images' | 'files' | 'videos'>;
    socialNetwork: Attribute.Enumeration<['Facebook', 'Twitter']> &
      Attribute.Required;
    title: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
  };
}

export interface SharedSeo extends Schema.Component {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'seo';
  };
  attributes: {
    canonicalURL: Attribute.String;
    keywords: Attribute.Text;
    metaDescription: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 160;
        minLength: 50;
      }>;
    metaImage: Attribute.Media<'images' | 'files' | 'videos'> &
      Attribute.Required;
    metaRobots: Attribute.String;
    metaSocial: Attribute.Component<'shared.meta-social', true>;
    metaTitle: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    metaViewport: Attribute.String;
    structuredData: Attribute.JSON;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'category.category': CategoryCategory;
      'category.shopping-cart': CategoryShoppingCart;
      'pfapi-types.bool': PfapiTypesBool;
      'pfapi-types.decimal': PfapiTypesDecimal;
      'pfapi-types.integer': PfapiTypesInteger;
      'pfapi-types.ip-prefix': PfapiTypesIpPrefix;
      'pfapi-types.json': PfapiTypesJson;
      'pfapi-types.media': PfapiTypesMedia;
      'pfapi-types.multimedia': PfapiTypesMultimedia;
      'pfapi-types.richtext': PfapiTypesRichtext;
      'pfapi-types.text': PfapiTypesText;
      'shared.cookie-button': SharedCookieButton;
      'shared.meta-social': SharedMetaSocial;
      'shared.seo': SharedSeo;
    }
  }
}
