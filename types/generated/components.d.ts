import type { Schema, Struct } from '@strapi/strapi';

export interface CategoryCategory extends Struct.ComponentSchema {
  collectionName: 'components_category_categories';
  info: {
    displayName: 'category';
  };
  attributes: {};
}

export interface CategoryShoppingCart extends Struct.ComponentSchema {
  collectionName: 'components_category_shopping_carts';
  info: {
    displayName: 'ShoppingCart';
  };
  attributes: {
    title: Schema.Attribute.String;
  };
}

export interface ClothDetailsCategoryClothDetails
  extends Struct.ComponentSchema {
  collectionName: 'components_cloth_details_category_cloth_details';
  info: {
    displayName: 'ClothDetails';
    icon: 'user';
  };
  attributes: {
    careInstructions: Schema.Attribute.String;
    colors: Schema.Attribute.String;
    gender: Schema.Attribute.String;
    material: Schema.Attribute.String;
    seanson: Schema.Attribute.String;
    Size: Schema.Attribute.String;
    style: Schema.Attribute.String;
    typeOfGarment: Schema.Attribute.String;
  };
}

export interface ColorCategoryItemColors extends Struct.ComponentSchema {
  collectionName: 'components_color_category_item_colors';
  info: {
    displayName: 'item_colors';
    icon: 'apps';
  };
  attributes: {
    alt_color_name: Schema.Attribute.String;
    available: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    hex_code: Schema.Attribute.String;
    Image_color: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    price: Schema.Attribute.Decimal;
    quantity: Schema.Attribute.Integer;
    stock: Schema.Attribute.Integer;
  };
}

export interface OrderItemsOrdersItems extends Struct.ComponentSchema {
  collectionName: 'components_order_items_orders_items';
  info: {
    displayName: 'ordersItems';
  };
  attributes: {};
}

export interface PfapiTypesBool extends Struct.ComponentSchema {
  collectionName: 'components_pfapi_types_bools';
  info: {
    description: '';
    displayName: 'bool';
    icon: 'angle-right';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.Boolean;
  };
}

export interface PfapiTypesDecimal extends Struct.ComponentSchema {
  collectionName: 'components_pfapi_types_decimals';
  info: {
    description: '';
    displayName: 'Decimal';
    icon: 'angle-right';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.Decimal;
  };
}

export interface PfapiTypesInteger extends Struct.ComponentSchema {
  collectionName: 'components_pfapi_types_integers';
  info: {
    description: '';
    displayName: 'Integer';
    icon: 'angle-right';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.Integer;
  };
}

export interface PfapiTypesIpPrefix extends Struct.ComponentSchema {
  collectionName: 'components_pfapi_types_ip_prefixes';
  info: {
    description: '';
    displayName: 'IpPrefix';
    icon: 'align-left';
  };
  attributes: {
    comment: Schema.Attribute.String;
    ip_cidr: Schema.Attribute.String;
    prefix: Schema.Attribute.String;
    status: Schema.Attribute.Enumeration<['unlimited', 'blocked']> &
      Schema.Attribute.Required;
  };
}

export interface PfapiTypesJson extends Struct.ComponentSchema {
  collectionName: 'components_pfapi_types_jsons';
  info: {
    description: '';
    displayName: 'json';
    icon: 'angle-right';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.JSON;
  };
}

export interface PfapiTypesMedia extends Struct.ComponentSchema {
  collectionName: 'components_pfapi_types_media';
  info: {
    description: '';
    displayName: 'media';
    icon: 'angle-right';
  };
  attributes: {
    media: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PfapiTypesMultimedia extends Struct.ComponentSchema {
  collectionName: 'components_pfapi_types_multimedia';
  info: {
    description: '';
    displayName: 'multimedia';
    icon: 'angle-right';
  };
  attributes: {
    media: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PfapiTypesRichtext extends Struct.ComponentSchema {
  collectionName: 'components_pfapi_types_richtexts';
  info: {
    description: '';
    displayName: 'richtext';
    icon: 'angle-right';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.RichText;
  };
}

export interface PfapiTypesText extends Struct.ComponentSchema {
  collectionName: 'components_pfapi_types_texts';
  info: {
    description: '';
    displayName: 'text';
    icon: 'angle-right';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.Text;
  };
}

export interface RepairToolsDetailRepairToolDetails
  extends Struct.ComponentSchema {
  collectionName: 'components_repair_tools_detail_repair_tool_details';
  info: {
    displayName: 'RepairToolDetails';
    icon: 'scissors';
  };
  attributes: {
    batteryLife: Schema.Attribute.String;
    certifications: Schema.Attribute.String;
    compatibility: Schema.Attribute.String;
    handle: Schema.Attribute.String;
    mainFunctions: Schema.Attribute.String;
    material: Schema.Attribute.String;
    numberOfPieces: Schema.Attribute.String;
    recommendedUses: Schema.Attribute.String;
    tipType: Schema.Attribute.String;
    toolType: Schema.Attribute.String;
    typeOfBettery: Schema.Attribute.String;
    warranty: Schema.Attribute.String;
    weight: Schema.Attribute.String;
  };
}

export interface SharedCookieButton extends Struct.ComponentSchema {
  collectionName: 'components_shared_cookie_buttons';
  info: {
    displayName: 'Cookie Button';
  };
  attributes: {
    buttonType: Schema.Attribute.Enumeration<['Primary', 'Secondary', 'Text']>;
    label: Schema.Attribute.String;
  };
}

export interface SharedItemColors extends Struct.ComponentSchema {
  collectionName: 'components_shared_item_colors';
  info: {
    displayName: 'item_colors';
    icon: 'apps';
  };
  attributes: {
    name: Schema.Attribute.String;
  };
}

export interface SharedMetaSocial extends Struct.ComponentSchema {
  collectionName: 'components_shared_meta_socials';
  info: {
    displayName: 'metaSocial';
  };
  attributes: {
    description: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 65;
      }>;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    socialNetwork: Schema.Attribute.Enumeration<['Facebook', 'Twitter']> &
      Schema.Attribute.Required;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'seo';
  };
  attributes: {
    canonicalURL: Schema.Attribute.String;
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
        minLength: 50;
      }>;
    metaImage: Schema.Attribute.Media<'images' | 'files' | 'videos'> &
      Schema.Attribute.Required;
    metaRobots: Schema.Attribute.String;
    metaSocial: Schema.Attribute.Component<'shared.meta-social', true>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    metaViewport: Schema.Attribute.String;
    structuredData: Schema.Attribute.JSON;
  };
}

export interface SizeCategoryItemSizes extends Struct.ComponentSchema {
  collectionName: 'components_size_category_item_sizes';
  info: {
    displayName: 'item_sizes';
    icon: 'hashtag';
  };
  attributes: {
    description: Schema.Attribute.String;
    name: Schema.Attribute.String;
    price: Schema.Attribute.Decimal;
    stock: Schema.Attribute.Integer;
    weight: Schema.Attribute.Decimal;
  };
}

export interface TechSpecsCategoryTechSpecs extends Struct.ComponentSchema {
  collectionName: 'components_tech_specs_category_tech_specs';
  info: {
    displayName: 'TechSpecs';
    icon: 'headphone';
  };
  attributes: {
    batteryLife: Schema.Attribute.String;
    camera: Schema.Attribute.String;
    countryPlugs: Schema.Attribute.String;
    graphicsCard: Schema.Attribute.String;
    keyboardType: Schema.Attribute.String;
    operatingSystem: Schema.Attribute.String;
    ports: Schema.Attribute.String;
    processor: Schema.Attribute.String;
    ram: Schema.Attribute.String;
    refresh_rate: Schema.Attribute.String;
    screenSize: Schema.Attribute.String;
    storage: Schema.Attribute.String;
    touchScreen: Schema.Attribute.Boolean;
    weight: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'category.category': CategoryCategory;
      'category.shopping-cart': CategoryShoppingCart;
      'cloth-details-category.cloth-details': ClothDetailsCategoryClothDetails;
      'color-category.item-colors': ColorCategoryItemColors;
      'order-items.orders-items': OrderItemsOrdersItems;
      'pfapi-types.bool': PfapiTypesBool;
      'pfapi-types.decimal': PfapiTypesDecimal;
      'pfapi-types.integer': PfapiTypesInteger;
      'pfapi-types.ip-prefix': PfapiTypesIpPrefix;
      'pfapi-types.json': PfapiTypesJson;
      'pfapi-types.media': PfapiTypesMedia;
      'pfapi-types.multimedia': PfapiTypesMultimedia;
      'pfapi-types.richtext': PfapiTypesRichtext;
      'pfapi-types.text': PfapiTypesText;
      'repair-tools-detail.repair-tool-details': RepairToolsDetailRepairToolDetails;
      'shared.cookie-button': SharedCookieButton;
      'shared.item-colors': SharedItemColors;
      'shared.meta-social': SharedMetaSocial;
      'shared.seo': SharedSeo;
      'size-category.item-sizes': SizeCategoryItemSizes;
      'tech-specs-category.tech-specs': TechSpecsCategoryTechSpecs;
    }
  }
}
