"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "km";

export interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

export const translations = {
  en: {
    // Navigation
    nav_home: "Home",
    nav_catalog: "Products",
    nav_cart: "Cart",
    nav_orders: "Orders",
    nav_settings: "Settings",
    support_nav: "Help",
    support_title: "Customer Service",
    support_subtitle: "We’re here to help with your orders and account.",
    support_card_eyebrow: "NEED A HAND?",
    support_telegram_title: "Chat with us on Telegram",
    support_telegram_desc: "Message our support team for help with orders, products, or your account.",
    support_handle: "@CPLPLAYInsiderHub",
    support_hours: "Monday–Saturday · 8:00 AM–8:00 PM",
    support_cta: "Open Telegram",
    support_faq_title: "Frequently asked questions",
    support_faq_subtitle: "Quick answers to common questions.",
    support_faq_order_q: "How can I place an order?",
    support_faq_order_a: "Browse the catalog, add products to your cart, then continue to checkout and confirm your delivery details.",
    support_faq_delivery_q: "How do I update my delivery location?",
    support_faq_delivery_a: "Open Settings and use the delivery location card to set or update your map pin.",
    support_faq_payment_q: "When do I pay for my order?",
    support_faq_payment_a: "Orders use cash on delivery. Pay the delivery team when your goods arrive.",
    support_faq_status_q: "Where can I check my order status?",
    support_faq_status_a: "Open Orders to see the latest status and details for each order.",

    // Home Storefront
    home_partner_store: "Partner Store",
    home_verified: "Verified",
    home_welcome: "Welcome",
    home_welcome_partner: "Valued Partner",
    home_complete_reg: "Complete Partner Registration",
    home_search_placeholder: "Search products, SKUs, or codes...",
    home_partner_access: "Partner Access",
    home_reg_to_unlock: "Register to Unlock Ordering",
    home_reg_desc:
      "Browse products freely. Complete your partner company profile to order wholesale with delivery.",
    home_register_now: "Register Account",
    home_wholesale_categories: "Wholesale Categories",
    home_featured_products: "Featured Wholesale Products",
    home_items: "items",
    home_item: "item",
    home_in_stock: "In Stock",
    home_out_of_stock: "Out",
    home_wholesale: "Wholesale",
    home_full_catalog: "Full Catalog",
    home_order_history: "Order History",
    home_recent_order: "Recent Order",
    home_active_orders: "Active Orders",

    // Catalog & Detail
    catalog_title: "Product Catalog",
    catalog_subtitle: "Wholesale inventory & direct ordering",
    catalog_all: "All Items",
    catalog_options: "options",
    catalog_search_placeholder: "Search by name, SKU, or code...",
    catalog_no_products: "No products found",
    catalog_try_search: "Try searching for another item or clear your filter.",
    detail_add_to_cart: "Add to Cart",
    detail_added: "Added to Cart!",
    detail_order_now: "Order Now",
    detail_direct_dispatch: "Direct Dispatch",
    detail_dispatch_desc: "Staff coordinates delivery",
    detail_cod: "Cash on Delivery",
    detail_cod_desc: "Zero online payment",
    detail_choose_variant: "Choose Variant",
    detail_quantity: "Quantity",
    detail_code: "Code",

    // Cart
    cart_title: "Shopping Cart",
    cart_subtitle: "Review partner order items",
    cart_empty_title: "Your Cart is Empty",
    cart_empty_subtitle:
      "Add wholesale products from our catalog to build your delivery order.",
    cart_explore_catalog: "Explore Catalog",
    cart_clear: "Clear",
    cart_items_subtotal: "Items Subtotal",
    cart_payment_method: "Payment Method",
    cart_cod_label: "Cash on Delivery",
    cart_total_due: "Total Due",
    cart_cod_notice_title: "Manual Cash on Delivery",
    cart_cod_notice_desc:
      "Payment is collected in cash when your goods are physically delivered to your location.",
    cart_proceed_checkout: "Proceed to Checkout",
    cart_register_and_order: "Register & Place Order",

    // Checkout
    checkout_title: "Review & Order",
    checkout_subtitle: "Confirm delivery & items",
    checkout_delivery_point: "Delivery Point",
    checkout_registered_address: "Registered Address",
    checkout_different_location: "Different Location",
    checkout_primary_profile_address: "Primary Profile Address",
    checkout_pinned: "Pinned",
    checkout_change_order_location: "Change for this order",
    checkout_custom_delivery_point: "Custom Delivery Point",
    checkout_repin_on_map: "Re-pin on Map",
    checkout_select_on_map: "Select on Map",
    checkout_order_items: "Order Items",
    checkout_delivery_instruction: "Delivery Note / Remark",
    checkout_instruction_placeholder:
      "Add instructions (e.g. Call before arrival, gate number...)",
    checkout_place_order: "Place Order",
    checkout_submitting: "Submitting Order...",
    checkout_return_catalog: "Return to Catalog",

    // Orders
    orders_title: "My Orders",
    orders_all: "All Orders",
    orders_active: "Active",
    orders_history: "History",
    orders_no_orders: "No orders found",
    orders_no_orders_desc: "When you place an order, it will appear here.",
    orders_start_shopping: "Start Shopping",
    orders_items: "items",
    orders_total: "Total",

    // Order Detail & Decision
    order_action_required: "Action Required: Staff Inquiry",
    order_staff_question: "Question from Staff:",
    order_default_question:
      "We have limited stock available for your order. Would you like to accept the available items now, wait for full restock, or cancel your order?",
    order_accept_available: "Accept Available Now",
    order_accept_general: "Accept & Confirm Order",
    order_accept_subtext: "Proceed with available units immediately",
    order_wait_full: "Wait for Full Order",
    order_wait_restock: "Wait for Restock",
    order_wait_subtext: "Hold and dispatch all items together once restocked",
    order_cancel_btn: "Cancel Order",
    order_cancel_subtext: "Cancel this order if items are needed sooner",
    order_cancel_confirm: "Are you sure you want to cancel this order?",
    order_custom_msg_title: "Communication & Updates",
    order_custom_msg_placeholder: "Type a reply to staff...",
    order_telegram_reply_hint: "You can also reply directly in your Telegram chat.",
    order_units: "units",

    // Settings
    settings_title: "Account & Settings",
    settings_subtitle: "Manage profile, language & delivery preferences",
    settings_partner_identity: "Partner Profile",
    settings_telegram_handle: "Telegram Handle",
    settings_primary_delivery: "Primary Delivery Location",
    settings_pinned_location: "Pinned Location Coordinates",
    settings_no_pinned_location:
      "No coordinates pinned yet. Tap button below to locate your shop on the map.",
    settings_change_pin: "Change Delivery Pin on Map",
    settings_set_pin: "Set Delivery Point on Map",
    settings_quick_hub: "Quick Links",
    settings_order_history_desc: "Track ongoing shipments and past orders",
    settings_browse_catalog_desc: "View latest wholesale goods & inventory",
    settings_cart_desc: "Review selected products ready for checkout",
    settings_language: "Language / ភាសា",
    settings_language_desc: "Choose between English and ភាសាខ្មែរ",
    settings_language_en: "English",
    settings_language_km: "ភាសាខ្មែរ",
    settings_logout: "Log Out",
    settings_logout_desc: "Disconnect session and clear local partner cache",
    settings_logout_confirm_title: "Log out of Partner Account?",
    settings_logout_confirm_desc:
      "This will disconnect your local partner session and reset the cache on this device. You can reconnect anytime through Telegram.",
    settings_logout_cancel: "Cancel",
    settings_logout_confirm: "Yes, Log Out",
    settings_refreshed: "Account data refreshed",
    settings_saved: "Delivery location updated successfully",

    // Registration
    reg_modal_title: "Partner Registration",
    reg_company_name: "Company / Shop Name *",
    reg_company_placeholder: "e.g. Phnom Penh Retailers Ltd",
    reg_contact_name: "Contact Person Name *",
    reg_contact_placeholder: "e.g. Sokha Chan",
    reg_phone: "Phone Number *",
    reg_phone_placeholder: "e.g. 012 345 678",
    reg_fast_title: "Fast Registration",
    reg_fast_desc:
      "No map pinning required now! You can set or change your delivery location anytime in Settings or during checkout.",
    reg_submit: "Submit Registration",
    reg_submitting: "Submitting...",
    reg_skip: "Skip for Now & Browse Catalog",
    reg_complete_title: "Welcome Aboard!",
    reg_complete_desc:
      "Your partner account is active. You can browse wholesale catalog, configure your delivery location in Settings, and place orders directly.",
    reg_start_ordering: "Start Ordering",

    // Common
    common_verified: "Verified",
    common_unregistered: "Unregistered",
    common_loading: "Loading...",
  },
  km: {
    // Navigation
    nav_home: "ទំព័រដើម",
    nav_catalog: "ផលិតផល",
    nav_cart: "កន្ត្រក",
    nav_orders: "ការបញ្ជាទិញ",
    nav_settings: "ការកំណត់",
    support_nav: "ជំនួយ",
    support_title: "សេវាបម្រើអតិថិជន",
    support_subtitle: "យើងខ្ញុំនៅទីនេះដើម្បីជួយអំពីការបញ្ជាទិញ និងគណនីរបស់អ្នក។",
    support_card_eyebrow: "ត្រូវការជំនួយមែនទេ?",
    support_telegram_title: "ជជែកជាមួយយើងតាម Telegram",
    support_telegram_desc: "ផ្ញើសារទៅក្រុមជំនួយរបស់យើង ប្រសិនបើអ្នកត្រូវការជំនួយអំពីការបញ្ជាទិញ ទំនិញ ឬគណនី។",
    support_handle: "@CPLPLAYInsiderHub",
    support_hours: "ថ្ងៃចន្ទ–ថ្ងៃសៅរ៍ · ម៉ោង ៨:០០ ព្រឹក–៨:០០ យប់",
    support_cta: "បើក Telegram",
    support_faq_title: "សំណួរដែលសួរញឹកញាប់",
    support_faq_subtitle: "ចម្លើយរហ័សចំពោះសំណួរទូទៅ។",
    support_faq_order_q: "តើខ្ញុំអាចបញ្ជាទិញដោយរបៀបណា?",
    support_faq_order_a: "រកមើលទំនិញក្នុងកាតាឡុក ដាក់ទំនិញចូលកន្ត្រក រួចបន្តទៅការបញ្ជាក់ការបញ្ជាទិញ និងព័ត៌មានដឹកជញ្ជូន។",
    support_faq_delivery_q: "តើខ្ញុំធ្វើបច្ចុប្បន្នភាពទីតាំងដឹកជញ្ជូនដោយរបៀបណា?",
    support_faq_delivery_a: "ចូលទៅកាន់ការកំណត់ រួចប្រើផ្នែកទីតាំងដឹកជញ្ជូនដើម្បីកំណត់ ឬកែប្រែទីតាំងលើផែនទី។",
    support_faq_payment_q: "តើខ្ញុំត្រូវបង់ប្រាក់នៅពេលណា?",
    support_faq_payment_a: "ការបញ្ជាទិញទូទាត់ជាសាច់ប្រាក់ពេលទទួលទំនិញ។ សូមបង់ប្រាក់ទៅក្រុមដឹកជញ្ជូនពេលទំនិញមកដល់។",
    support_faq_status_q: "តើខ្ញុំអាចពិនិត្យស្ថានភាពការបញ្ជាទិញនៅឯណា?",
    support_faq_status_a: "ចូលទៅកាន់ការបញ្ជាទិញ ដើម្បីមើលស្ថានភាពថ្មីៗ និងព័ត៌មានលម្អិត។",

    // Home Storefront
    home_partner_store: "ហាងដៃគូ",
    home_verified: "បានផ្ទៀងផ្ទាត់",
    home_welcome: "សូមស្វាគមន៍",
    home_welcome_partner: "ដៃគូជាទីរាប់អាន",
    home_complete_reg: "បំពេញការចុះឈ្មោះដៃគូ",
    home_search_placeholder: "ស្វែងរកឈ្មោះទំនិញ ឬកូដទំនិញ...",
    home_partner_access: "សិទ្ធិចូលប្រើប្រាស់ដៃគូ",
    home_reg_to_unlock: "ចុះឈ្មោះដើម្បីបញ្ជាទិញទំនិញ",
    home_reg_desc:
      "លោកអ្នកអាចមើលទំនិញបានដោយសេរី។ សូមចុះឈ្មោះព័ត៌មានក្រុមហ៊ុនដើម្បីបញ្ជាទិញតម្លៃបោះដុំជាមួយនឹងសេវាដឹកជញ្ជូន។",
    home_register_now: "ចុះឈ្មោះឥឡូវនេះ",
    home_wholesale_categories: "ប្រភេទទំនិញបោះដុំ",
    home_featured_products: "ទំនិញបោះដុំពិសេសៗ",
    home_items: "មុខ",
    home_item: "មុខ",
    home_in_stock: "មានស្តុក",
    home_out_of_stock: "អស់ស្តុក",
    home_wholesale: "តម្លៃបោះដុំ",
    home_full_catalog: "កាតាឡុកទាំងអស់",
    home_order_history: "ប្រវត្តិបញ្ជាទិញ",
    home_recent_order: "ការបញ្ជាទិញថ្មីៗ",
    home_active_orders: "ការបញ្ជាទិញកំពុងដំណើរការ",

    // Catalog & Detail
    catalog_title: "កាតាឡុកទំនិញ",
    catalog_subtitle: "ស្តុកទំនិញបោះដុំ & ការបញ្ជាទិញផ្ទាល់",
    catalog_all: "ទាំងអស់",
    catalog_options: "ជម្រើស",
    catalog_search_placeholder: "ស្វែងរកតាមឈ្មោះ, SKU ឬកូដ...",
    catalog_no_products: "រកមិនឃើញទំនិញទេ",
    catalog_try_search: "សូមសាកល្បងស្វែងរកពាក្យផ្សេង ឬលុបការច្រោះទំនិញ។",
    detail_add_to_cart: "ដាក់ចូលកន្ត្រក",
    detail_added: "បានដាក់ចូលកន្ត្រក!",
    detail_order_now: "បញ្ជាទិញឥឡូវ",
    detail_direct_dispatch: "ដឹកជញ្ជូនផ្ទាល់",
    detail_dispatch_desc: "បុគ្គលិករៀបចំការដឹកជញ្ជូន",
    detail_cod: "ទូទាត់ពេលទទួលទំនិញ",
    detail_cod_desc: "មិនបាច់ទូទាត់ប្រាក់ជាមុន",
    detail_choose_variant: "ជ្រើសរើសជម្រើសទំនិញ",
    detail_quantity: "ចំនួន",
    detail_code: "កូដ",

    // Cart
    cart_title: "កន្ត្រកទំនិញ",
    cart_subtitle: "ពិនិត្យទំនិញដែលបានជ្រើសរើស",
    cart_empty_title: "កន្ត្រករបស់អ្នកទទេស្អាត",
    cart_empty_subtitle:
      "សូមជ្រើសរើសទំនិញពីកាតាឡុកដើម្បីបង្កើតការបញ្ជាទិញដឹកជញ្ជូន។",
    cart_explore_catalog: "មើលកាតាឡុកទំនិញ",
    cart_clear: "សម្អាត",
    cart_items_subtotal: "តម្លៃទំនិញសរុប",
    cart_payment_method: "វិធីសាស្រ្តទូទាត់",
    cart_cod_label: "ទូទាត់ប្រាក់សុទ្ធពេលទទួល",
    cart_total_due: "ទឹកប្រាក់ត្រូវទូទាត់",
    cart_cod_notice_title: "ទូទាត់ប្រាក់សុទ្ធផ្ទាល់ពេលដឹកដល់",
    cart_cod_notice_desc:
      "ការទូទាត់ប្រាក់សុទ្ធនឹងត្រូវប្រមូលពេលទំនិញដឹកជញ្ជូនទៅដល់ទីតាំងរបស់អ្នក។",
    cart_proceed_checkout: "បន្តទៅការទូទាត់",
    cart_register_and_order: "ចុះឈ្មោះ & បញ្ជាទិញ",

    // Checkout
    checkout_title: "ពិនិត្យ & បញ្ជាក់ការបញ្ជាទិញ",
    checkout_subtitle: "បញ្ជាក់ទីតាំងដឹកជញ្ជូន និងទំនិញ",
    checkout_delivery_point: "ទីតាំងដឹកជញ្ជូន",
    checkout_registered_address: "អាសយដ្ឋានចុះឈ្មោះ",
    checkout_different_location: "ទីតាំងផ្សេង",
    checkout_primary_profile_address: "អាសយដ្ឋានចម្បងក្នុងគណនី",
    checkout_pinned: "បានខ្ទាស់ទីតាំង",
    checkout_change_order_location: "ប្តូរសម្រាប់តែការបញ្ជាទិញនេះ",
    checkout_custom_delivery_point: "ទីតាំងដឹកជញ្ជូនផ្ទាល់ខ្លួន",
    checkout_repin_on_map: "ខ្ទាស់ឡើងវិញលើផែនទី",
    checkout_select_on_map: "ជ្រើសរើសលើផែនទី",
    checkout_order_items: "ទំនិញដែលបានបញ្ជាទិញ",
    checkout_delivery_instruction: "ចំណាំបន្ថែមសម្រាប់ការដឹកជញ្ជូន",
    checkout_instruction_placeholder:
      "កំណត់ចំណាំ (ឧ. សូមទូរស័ព្ទមុនមកដល់, លេខទ្វារ...)",
    checkout_place_order: "បញ្ជាក់ការបញ្ជាទិញ",
    checkout_submitting: "កំពុងបញ្ជូនការបញ្ជាទិញ...",
    checkout_return_catalog: "ត្រឡប់ទៅកាតាឡុក",

    // Orders
    orders_title: "ការបញ្ជាទិញរបស់ខ្ញុំ",
    orders_all: "ការបញ្ជាទិញទាំងអស់",
    orders_active: "កំពុងដំណើរការ",
    orders_history: "ប្រវត្តិ",
    orders_no_orders: "មិនមានការបញ្ជាទិញទេ",
    orders_no_orders_desc: "នៅពេលអ្នកបញ្ជាទិញ ទំនិញនឹងបង្ហាញនៅទីនេះ។",
    orders_start_shopping: "ចាប់ផ្តើមទិញទំនិញ",
    orders_items: "មុខ",
    orders_total: "សរុប",

    // Order Detail & Decision
    order_action_required: "ត្រូវការការសម្រេចចិត្ត៖ សារសាកសួរពីបុគ្គលិក",
    order_staff_question: "សំណួរពីបុគ្គលិក៖",
    order_default_question:
      "យើងខ្ញុំមានស្តុកកំណត់សម្រាប់ទំនិញរបស់អ្នក។ តើអ្នកចង់ទទួលយកចំនួនដែលមានឥឡូវនេះ រង់ចាំការបំពេញស្តុកគ្រប់ចំនួន ឬបោះបង់ការបញ្ជាទិញ?",
    order_accept_available: "យល់ព្រមយកចំនួនដែលមានឥឡូវនេះ",
    order_accept_general: "យល់ព្រម & បញ្ជាក់ការបញ្ជាទិញ",
    order_accept_subtext: "បន្តដំណើរការដឹកជញ្ជូនទំនិញដែលមានក្នុងស្តុកភ្លាមៗ",
    order_wait_full: "រង់ចាំទំនិញគ្រប់ចំនួន",
    order_wait_restock: "រង់ចាំការបំពេញស្តុកថ្មី",
    order_wait_subtext: "រង់ចាំទំនិញគ្រប់ចំនួន រួចដឹកជញ្ជូនរួមគ្នាតែម្តង",
    order_cancel_btn: "បោះបង់ការបញ្ជាទិញ",
    order_cancel_subtext: "បោះបង់ការបញ្ជាទិញនេះ ប្រសិនបើអ្នកត្រូវការទំនិញជាបន្ទាន់",
    order_cancel_confirm: "តើអ្នកពិតជាចង់បោះបង់ការបញ្ជាទិញនេះមែនទេ?",
    order_custom_msg_title: "ការទំនាក់ទំនង & ការជូនដំណឹង",
    order_custom_msg_placeholder: "សរសេរសារឆ្លើយតបទៅកាន់បុគ្គលិក...",
    order_telegram_reply_hint: "អ្នកក៏អាចឆ្លើយតបដោយផ្ទាល់នៅក្នុងការជជែក Telegram របស់អ្នកផងដែរ។",
    order_units: "ឯកតា",

    // Settings
    settings_title: "គណនី & ការកំណត់",
    settings_subtitle: "គ្រប់គ្រងព័ត៌មានផ្ទាល់ខ្លួន ភាសា និងទីតាំងដឹកជញ្ជូន",
    settings_partner_identity: "ព័ត៌មានដៃគូ",
    settings_telegram_handle: "គណនី Telegram",
    settings_primary_delivery: "អាសយដ្ឋានដឹកជញ្ជូនចម្បង",
    settings_pinned_location: "កូអរដោនេទីតាំងលើផែនទី",
    settings_no_pinned_location:
      "មិនទាន់បានខ្ទាស់ទីតាំងនៅឡើយទេ។ ចុចប៊ូតុងខាងក្រោមដើម្បីកំណត់ទីតាំងហាងរបស់អ្នកលើផែនទី។",
    settings_change_pin: "ប្តូរទីតាំងលើផែនទី",
    settings_set_pin: "កំណត់ទីតាំងលើផែនទី",
    settings_quick_hub: "ផ្លូវកាត់រហ័ស",
    settings_order_history_desc: "តាមដានទំនិញកំពុងដឹក និងប្រវត្តិបញ្ជាទិញ",
    settings_browse_catalog_desc: "មើលទំនិញបោះដុំថ្មីៗ & ស្តុក",
    settings_cart_desc: "ពិនិត្យទំនិញដែលបានជ្រើសរើសក្នុងកន្ត្រក",
    settings_language: "ភាសា / Language",
    settings_language_desc: "ជ្រើសរើសភាសាខ្មែរ ឬ English",
    settings_language_en: "English",
    settings_language_km: "ភាសាខ្មែរ",
    settings_logout: "ចាកចេញពីគណនី",
    settings_logout_desc: "ផ្តាច់សម័យ និងសម្អាតទិន្នន័យដៃគូនៅលើឧបករណ៍នេះ",
    settings_logout_confirm_title: "តើអ្នកពិតជាចង់ចាកចេញមែនទេ?",
    settings_logout_confirm_desc:
      "វានឹងផ្តាច់សម័យប្រើប្រាស់បច្ចុប្បន្នរបស់អ្នក។ អ្នកអាចចូលប្រើប្រាស់ឡើងវិញបានគ្រប់ពេលតាម Telegram។",
    settings_logout_cancel: "បោះបង់",
    settings_logout_confirm: "បាទ/ចាស ចាកចេញ",
    settings_refreshed: "បានផ្ទុកទិន្នន័យឡើងវិញជោគជ័យ",
    settings_saved: "បានរក្សាទុកទីតាំងដឹកជញ្ជូនជោគជ័យ",

    // Registration
    reg_modal_title: "ចុះឈ្មោះដៃគូ",
    reg_company_name: "ឈ្មោះក្រុមហ៊ុន / ហាង *",
    reg_company_placeholder: "ឧ. ហាងលក់រាយ ភ្នំពេញ",
    reg_contact_name: "ឈ្មោះអ្នកទំនាក់ទំនង *",
    reg_contact_placeholder: "ឧ. ចាន់ សុខា",
    reg_phone: "លេខទូរស័ព្ទ *",
    reg_phone_placeholder: "ឧ. 012 345 678",
    reg_fast_title: "ចុះឈ្មោះរហ័ស",
    reg_fast_desc:
      "មិនបាច់កំណត់ទីតាំងលើផែនទីពេលនេះទេ! អ្នកអាចកំណត់ ឬផ្លាស់ប្តូរទីតាំងដឹកជញ្ជូនបានគ្រប់ពេលនៅក្នុងការកំណត់ ឬពេលទូទាត់ប្រាក់។",
    reg_submit: "ដាក់ពាក្យចុះឈ្មោះ",
    reg_submitting: "កំពុងបញ្ជូន...",
    reg_skip: "រំលងសិន & មើលកាតាឡុក",
    reg_complete_title: "សូមស្វាគមន៍មកកាន់ប្រព័ន្ធដៃគូ!",
    reg_complete_desc:
      "គណនីដៃគូរបស់អ្នកបានដំណើរការហើយ។ អ្នកអាចមើលកាតាឡុកទំនិញ កំណត់ទីតាំងដឹកជញ្ជូន និងបញ្ជាទិញបានភ្លាមៗ។",
    reg_start_ordering: "ចាប់ផ្តើមបញ្ជាទិញ",

    // Common
    common_verified: "បានផ្ទៀងផ្ទាត់",
    common_unregistered: "មិនទាន់ចុះឈ្មោះ",
    common_loading: "កំពុងដំណើរការ...",
  },
};

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("app_language") as Language | null;
      if (savedLang === "en" || savedLang === "km") {
        setLanguageState(savedLang);
      } else {
        // Check browser language or Telegram language if available
        const navLang = navigator.language.toLowerCase();
        if (navLang.startsWith("km")) {
          setLanguageState("km");
        }
      }
    } catch {}
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("app_language", lang);
      // Set lang attribute on html tag
      if (typeof document !== "undefined") {
        document.documentElement.lang = lang;
        if (lang === "km") {
          document.body.classList.add("font-khmer");
        } else {
          document.body.classList.remove("font-khmer");
        }
      }
    } catch {}
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "km" : "en");
  };

  const t = (key: string, fallback?: string): string => {
    const dict = translations[language] as Record<string, string>;
    if (dict && dict[key]) {
      return dict[key];
    }
    const enDict = translations.en as Record<string, string>;
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
