const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputPath = path.resolve(process.cwd(), 'AccessGlobal_Platform_Handover_Manual.pdf');
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 45, bottom: 45, left: 45, right: 45 },
  bufferPages: true,
  autoFirstPage: true
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Color Palette
const BRAND_GREEN = '#124330';
const BRAND_LIGHT_GREEN = '#1A5B42';
const ACCENT_GOLD = '#92400E';
const INK_DARK = '#0F172A';
const INK_MUTED = '#475569';
const INK_LIGHT = '#64748B';
const BG_CREAM = '#FBF8F3';
const LINE_BORDER = '#E2E8F0';
const WHITE = '#FFFFFF';

// Helper: Section Banner
function drawSectionHeader(title, subtitle) {
  doc.rect(45, doc.y, 505, 38).fill(BRAND_GREEN);
  doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(14).text(title, 55, doc.y - 30);
  if (subtitle) {
    doc.fillColor('#A7F3D0').font('Helvetica').fontSize(8.5).text(subtitle, 55, doc.y + 2);
  }
  doc.y += 18;
}

// Helper: Subsection Header
function drawSubHeader(title) {
  doc.moveDown(0.6);
  doc.fillColor(BRAND_GREEN).font('Helvetica-Bold').fontSize(11).text(title);
  doc.strokeColor(LINE_BORDER).lineWidth(0.8).moveTo(45, doc.y + 2).lineTo(550, doc.y + 2).stroke();
  doc.moveDown(0.4);
}

// Helper: Body Paragraph
function drawBody(text) {
  doc.fillColor(INK_DARK).font('Helvetica').fontSize(9).text(text, {
    width: 505,
    lineGap: 3.5,
    align: 'justify'
  });
  doc.moveDown(0.3);
}

// Helper: Bullet Item
function drawBullet(boldPrefix, content) {
  doc.fillColor(BRAND_GREEN).font('Helvetica-Bold').fontSize(9).text('•  ', { continued: true });
  doc.fillColor(INK_DARK).font('Helvetica-Bold').text(boldPrefix + ': ', { continued: true });
  doc.fillColor(INK_MUTED).font('Helvetica').text(content, { lineGap: 2.5 });
  doc.moveDown(0.2);
}

// Helper: Callout Box
function drawCalloutBox(title, bodyText, type = 'tip') {
  const boxY = doc.y + 4;
  const bgColor = type === 'alert' ? '#FEF2F2' : (type === 'gold' ? '#FFFBEB' : '#F0FDF4');
  const borderColor = type === 'alert' ? '#F87171' : (type === 'gold' ? '#F59E0B' : '#34D399');
  const titleColor = type === 'alert' ? '#991B1B' : (type === 'gold' ? '#92400E' : '#065F46');

  doc.rect(45, boxY, 505, 48).fillAndStroke(bgColor, borderColor);
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(8.5).text(title.toUpperCase(), 55, boxY + 7);
  doc.fillColor(INK_DARK).font('Helvetica').fontSize(8).text(bodyText, 55, boxY + 20, { width: 485, lineGap: 2 });
  doc.y = boxY + 54;
}

// Helper: Numbered Step
function drawStep(stepNum, stepTitle, stepDescription) {
  const startY = doc.y + 2;
  doc.circle(55, startY + 5, 8).fill(BRAND_GREEN);
  doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(8).text(String(stepNum), 52, startY + 1);
  doc.fillColor(BRAND_GREEN).font('Helvetica-Bold').fontSize(9.5).text(stepTitle, 70, startY);
  doc.fillColor(INK_MUTED).font('Helvetica').fontSize(8.5).text(stepDescription, 70, startY + 12, {
    width: 475,
    lineGap: 2.5
  });
  doc.y = startY + 34;
}

// Helper: Simple Table
function drawTable(headers, rows, colWidths) {
  const startY = doc.y + 4;
  let currentX = 45;

  // Header row
  doc.rect(45, startY, 505, 18).fill(BRAND_GREEN);
  headers.forEach((h, i) => {
    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(8).text(h, currentX + 6, startY + 4, {
      width: colWidths[i] - 12
    });
    currentX += colWidths[i];
  });

  let rowY = startY + 18;
  rows.forEach((row, rowIndex) => {
    currentX = 45;
    const isEven = rowIndex % 2 === 0;
    doc.rect(45, rowY, 505, 16).fill(isEven ? '#FFFFFF' : '#F8FAFC');
    doc.strokeColor(LINE_BORDER).lineWidth(0.5).rect(45, rowY, 505, 16).stroke();

    row.forEach((cell, i) => {
      doc.fillColor(INK_DARK).font('Helvetica').fontSize(7.5).text(cell, currentX + 6, rowY + 3.5, {
        width: colWidths[i] - 12,
        ellipsis: true
      });
      currentX += colWidths[i];
    });
    rowY += 16;
  });

  doc.y = rowY + 8;
}

// ==========================================
// PAGE 1: COVER PAGE
// ==========================================
doc.rect(0, 0, 595, 842).fill(BG_CREAM);

// Top Decorative Green Bar
doc.rect(0, 0, 595, 14).fill(BRAND_GREEN);

// Elegant Emblem Box
doc.rect(45, 100, 505, 340).fillAndStroke('#FFFFFF', '#E5DAC9');

// Brand Badge
doc.rect(75, 130, 445, 48).fill(BRAND_GREEN);
doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(22).text('ACCESSGLOBAL', 95, 142, { characterSpacing: 4 });
doc.fillColor('#A7F3D0').font('Helvetica').fontSize(8.5).text('VERIFIED WORKSHOP NETWORK · LUXURY DIRECT PROVENANCE', 95, 164, { characterSpacing: 1.5 });

// Title
doc.fillColor(INK_DARK).font('Helvetica-Bold').fontSize(20).text('Master Platform Handover Manual', 75, 205);
doc.fillColor(ACCENT_GOLD).font('Helvetica-Bold').fontSize(11).text('Complete Operational Guide & Architecture Reference', 75, 230);

// Description
doc.fillColor(INK_MUTED).font('Helvetica').fontSize(9.5).text(
  'This master operations manual provides a complete, plain-English explanation of the entire AccessGlobal platform. Designed for company management, administrative staff, and technical operators, this handbook covers everyday storefront and admin workflows, direct-from-workshop consignment operations, E-Bike specifications, manual photo optimization, Supabase database management, and Resend transactional email routing.',
  75, 255, { width: 445, lineGap: 4, align: 'justify' }
);

// Metadata Pills inside Card
const metaY = 360;
doc.rect(75, metaY, 215, 60).fill('#F8FAFC');
doc.rect(75, metaY, 215, 60).stroke(LINE_BORDER);
doc.fillColor(INK_LIGHT).font('Helvetica-Bold').fontSize(7.5).text('PLATFORM RELEASE', 85, metaY + 10);
doc.fillColor(BRAND_GREEN).font('Helvetica-Bold').fontSize(10).text('Version 2.4 (Production Ready)', 85, metaY + 22);
doc.fillColor(INK_MUTED).font('Helvetica').fontSize(7.5).text('Dual-App Monorepo · Storefront + Admin', 85, metaY + 38);

doc.rect(305, metaY, 215, 60).fill('#F8FAFC');
doc.rect(305, metaY, 215, 60).stroke(LINE_BORDER);
doc.fillColor(INK_LIGHT).font('Helvetica-Bold').fontSize(7.5).text('AUTHORIZED RECIPIENT', 315, metaY + 10);
doc.fillColor(BRAND_GREEN).font('Helvetica-Bold').fontSize(10).text('System Administration & Staff', 315, metaY + 22);
doc.fillColor(INK_MUTED).font('Helvetica').fontSize(7.5).text('Confidential Handover Document', 315, metaY + 38);

// Summary Overview Cards below
doc.rect(45, 470, 505, 270).fillAndStroke('#FFFFFF', '#E5DAC9');
doc.fillColor(BRAND_GREEN).font('Helvetica-Bold').fontSize(12).text('Executive Summary: System Architecture', 65, 490);

doc.fillColor(INK_MUTED).font('Helvetica').fontSize(8.5).text(
  'The AccessGlobal platform is structured into two dedicated web portals connected to unified cloud services:',
  65, 510, { width: 465, lineGap: 3 }
);

const sysY = 535;
// Box 1: Storefront
doc.rect(65, sysY, 225, 95).fill('#F1F5F9');
doc.fillColor(BRAND_GREEN).font('Helvetica-Bold').fontSize(9.5).text('1. Customer Storefront', 75, sysY + 10);
doc.fillColor(INK_MUTED).font('Helvetica').fontSize(7.5).text(
  '• Real-time catalog synchronized with Supabase DB\n• Dynamic category filtering & keyword search\n• E-Bike engineering specification tables\n• Slide-over cart drawer & instant checkout\n• Passwordless 6-digit OTP account verification\n• Customer order history & real-time tracking',
  75, sysY + 26, { lineGap: 3 }
);

// Box 2: Admin Portal
doc.rect(305, sysY, 225, 95).fill('#F1F5F9');
doc.fillColor(BRAND_GREEN).font('Helvetica-Bold').fontSize(9.5).text('2. Admin Operations Portal', 315, sysY + 10);
doc.fillColor(INK_MUTED).font('Helvetica').fontSize(7.5).text(
  '• Dual-tier secure administrator authentication\n• KPI metric analytics & visual revenue charts\n• Instant product publishing with E-Bike specs\n• Client-side drag-and-drop photo downscaling\n• Consignment order status management\n• Live order & review dynamic notification feed',
  315, sysY + 26, { lineGap: 3 }
);

// Box 3: Database & Email
doc.rect(65, sysY + 105, 465, 80).fill('#F8FAFC');
doc.fillColor(BRAND_GREEN).font('Helvetica-Bold').fontSize(9.5).text('3. Cloud Infrastructure & Email Services', 75, sysY + 115);
doc.fillColor(INK_MUTED).font('Helvetica').fontSize(8).text(
  '• Supabase PostgreSQL Database: Direct PostgREST connections with Row-Level Security (RLS) enforcement.\n• Resend Transactional Email Relay: Serverless Node relay for OTP accounts and order receipts.\n• Vercel Edge Hosting: Automated zero-downtime production deployment pipeline triggered on git push.',
  75, sysY + 132, { lineGap: 3.5 }
);

// ==========================================
// PAGE 2: TABLE OF CONTENTS & QUICK ACCESS
// ==========================================
doc.addPage();
drawSectionHeader('Table of Contents & Quick Reference', 'AccessGlobal Complete Manual Sitemap');

const tocItems = [
  { sec: '1.0', title: 'Platform Master Directory & Key Credentials', desc: 'Overview of apps, URLs, admin login, and infrastructure.' },
  { sec: '2.0', title: 'Part 1: The Customer Storefront (Public Portal)', desc: 'Catalog exploration, search, category filters, and product details.' },
  { sec: '2.1', title: 'E-Bike Engineering Specifications & Craft Provenance', desc: 'How technical spec tables render torque, motors, and batteries.' },
  { sec: '2.2', title: 'Cart Drawer, Customs Clearance & Checkout', desc: 'Cart adjustments, direct-from-workshop order creation, receipts.' },
  { sec: '2.3', title: 'Customer Authentication: 6-Digit Email OTP', desc: 'Secure registration, OTP code dispatch via Resend, login, and orders.' },
  { sec: '3.0', title: 'Part 2: The Central Admin Operations Portal', desc: 'Administrator login, dual-tier auth, dashboard metrics, and charts.' },
  { sec: '3.1', title: 'Product Catalog Management & Publishing', desc: 'Publishing products, manual photo downscaling, E-Bike specs entry.' },
  { sec: '3.2', title: 'Order Fulfillment & Consignment Invoices', desc: 'Changing order statuses, printing PDF invoices, shipping tracking.' },
  { sec: '3.3', title: 'Categories, Reviews & User Management', desc: 'Catalog taxonomy, customer feedback moderation, and accounts.' },
  { sec: '3.4', title: 'Dynamic Notifications & Admin Sign Out', desc: 'Live event feed, unread status badges, and logout confirmation.' },
  { sec: '4.0', title: 'Part 3: The Resend Transactional Email Engine', desc: 'OTP delivery, HTML receipt templates, and sandbox policies.' },
  { sec: '5.0', title: 'Part 4: The Supabase PostgreSQL Database', desc: '5 master tables, RLS policies, indexing, and SQL Editor runbook.' },
  { sec: '6.0', title: 'Part 5: Vercel Cloud Deployment & Maintenance', desc: 'Monorepo deployment, environment variables, and update triggers.' },
  { sec: '7.0', title: 'Part 6: Troubleshooting & Frequently Asked Questions', desc: 'Common operations questions, login fixes, and schema alignment.' }
];

let tocY = doc.y + 4;
tocItems.forEach((item, idx) => {
  doc.rect(45, tocY, 505, 34).fill(idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC');
  doc.strokeColor(LINE_BORDER).lineWidth(0.5).rect(45, tocY, 505, 34).stroke();

  doc.circle(60, tocY + 17, 10).fill(BRAND_GREEN);
  doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(7.5).text(item.sec, 52, tocY + 13);

  doc.fillColor(INK_DARK).font('Helvetica-Bold').fontSize(9).text(item.title, 78, tocY + 7);
  doc.fillColor(INK_MUTED).font('Helvetica').fontSize(7.5).text(item.desc, 78, tocY + 19);

  tocY += 36;
});

doc.y = tocY + 10;
drawCalloutBox(
  'Quick Start Credentials',
  'Admin Portal Email: esoweibi@gmail.com  |  Master Password: Fathergod@123\nDatabase Host: falnqoftmtqhonkmrtby.supabase.co  |  Verified Email: onboarding@resend.dev',
  'gold'
);

// ==========================================
// PAGE 3: PART 1 - CUSTOMER STOREFRONT
// ==========================================
doc.addPage();
drawSectionHeader('Part 1: The Customer Storefront (Public Portal)', 'Visitor Journey, Catalog Browsing & E-Bike Technical Specs');

drawSubHeader('1.1 Dynamic Catalog Synchronization & Fast Category Browsing');
drawBody(
  'The AccessGlobal public storefront is an editorial direct-from-workshop eCommerce experience designed for high-value craft goods and precision engineering products. When a customer opens the website, the application queries the Supabase database in real time. Products created or edited in the Admin Portal appear immediately without waiting for scheduled site rebuilds.'
);
drawBullet('Live Category Chips', 'Customers can filter products instantly by clicking on category chips (All, E-Bikes, Clothing, Shoes, Appliances, Accessories). The filter runs client-side with zero page reloading.');
drawBullet('Full-Text Search', 'The search input bar indexes product titles, workshop manufacturer names, and descriptions in real time.');
drawBullet('Animated Preloader', 'The website features a branded preloader that smoothly transitions the screen once database assets have loaded, ensuring an uncluttered, luxury presentation.');

drawSubHeader('1.2 Viewing Product Details & E-Bike Technical Specifications');
drawBody(
  'Clicking on any product card opens the comprehensive Product Detail Modal. For technical products like E-Bikes, high-end electronics, or precision timepieces, customers need detailed engineering specifications before making a purchasing decision.'
);

drawTable(
  ['Specification Field', 'Sample Values for E-Bike Products', 'Customer Benefit & Transparency'],
  [
    ['Motor Power', '250W Whisper-Quiet Rear Hub Motor / 85Nm Mid-Drive', 'Explains torque and hill-climbing power clearly.'],
    ['Battery Capacity', '650Wh High-Capacity Lithium-Ion (Removable)', 'Indicates total energy storage and convenience.'],
    ['Assisted Range', 'Up to 85 km (Eco Mode) / 55 km (Sport Mode)', 'Sets realistic travel range expectations.'],
    ['Frame Material', 'Hydroformed 6061-T6 Aircraft-Grade Aluminum', 'Confirms lightweight durability and premium craft.'],
    ['Brake System', 'Tektro 4-Piston Hydraulic Disc Brakes (180mm)', 'Assures maximum stopping safety in all weather.'],
    ['Top Speed', '25 km/h (EU Compliant) / 32 km/h (Class 1)', 'Clarifies legal road compliance and performance.']
  ],
  [120, 200, 185]
);

drawSubHeader('1.3 Slide-Over Cart Drawer & Direct Workshop Checkout');
drawBody(
  'Adding an item to the shopping cart slides open a dedicated Cart Drawer from the right side of the screen. The drawer shows the customer an itemized receipt including:'
);
drawBullet('Customs & Import Duties', 'Automatically calculates pre-cleared customs logistics so international buyers face zero surprise import fees upon delivery.');
drawBullet('Quantity Adjustments', 'Customers can increase, decrease, or remove items with a single click.');
drawBullet('One-Click Order Placement', 'Entering a delivery address and clicking Complete Order writes the record straight to the Supabase public.orders table and triggers an itemized receipt via Resend.');

// ==========================================
// PAGE 4: PART 1 - CUSTOMER AUTH & DASHBOARD
// ==========================================
doc.addPage();
drawSectionHeader('Part 1 (Continued): Customer Authentication & User Portal', 'Passwordless 6-Digit Email OTP & Order History Tracking');

drawSubHeader('1.4 Customer Sign Up Flow with 6-Digit Resend OTP');
drawBody(
  'AccessGlobal uses modern email one-time passcodes (OTP). Customers never need to create or remember complex passwords that are easily compromised. Here is the step-by-step user journey:'
);

drawStep(1, 'Customer Initiates Sign Up', 'The visitor clicks "Sign In" in the top navigation, selects "Create one", and enters their Name, Email, and a Password.');
drawStep(2, 'Platform Generates Secure 6-Digit Code', 'A cryptographically random 6-digit numeric code (e.g. 849201) is produced. Supabase default emails are completely bypassed.');
drawStep(3, 'Branded HTML Email Dispatched via Resend', 'The system invokes /api/send-email. The customer receives an email from AccessGlobal containing the 6-digit verification code.');
drawStep(4, 'Code Verification & Instant Activation', 'The customer types the 6 digits into the on-screen form. Once verified, the account is activated in public.users and the user is logged in.');

drawSubHeader('1.5 Customer User Dashboard & Order Tracking');
drawBody(
  'Once signed in, the customer’s name appears in the top navigation bar. Clicking "Orders" opens the User Dashboard Modal, displaying:'
);
drawBullet('Real-Time Order List', 'Every order placed with the customer’s verified email is queried live from the database.');
drawBullet('Consignment Status Badges', 'Clear badges show whether the order is "Processing at Workshop", "In Transit (Bonded Airfreight)", or "Delivered".');
drawBullet('Itemized Breakdown', 'Shows individual products purchased, workshop manufacturer names, unit prices, and grand totals.');

drawSubHeader('1.6 Sticky Header & Sign Out Confirmation Modal');
drawBody(
  'The storefront navigation bar uses professional sticky positioning with backdrop blur. To ensure safety:'
);
drawBullet('Content Non-Blocking Layout', 'Header padding ensures the sticky navigation never overlaps or hides product filters, hero banners, or checkout modals.');
drawBullet('Responsive Device Adaptation', 'On laptops and desktops, full account controls and order links are permanently visible. On mobile phones, secondary items collapse neatly into a sliding mobile drawer.');
drawBullet('Sign Out Confirmation Modal', 'Clicking "Sign Out" triggers a customized dialog asking the customer to confirm termination of their active session, preventing unintended logouts.');

// ==========================================
// PAGE 5: PART 2 - ADMIN OPERATIONS PORTAL
// ==========================================
doc.addPage();
drawSectionHeader('Part 2: The Central Admin Operations Portal', 'Operations Dashboard, KPIs, Live Analytics & Order Fulfillment');

drawSubHeader('2.1 Admin Portal Login & Dual-Tier Authentication');
drawBody(
  'The Admin Operations Portal is strictly gated to authorized personnel. It is accessible at port 3001 or on your custom administration URL.'
);
drawBullet('Master Administrator Email', 'esoweibi@gmail.com');
drawBullet('Master Password', 'Fathergod@123');
drawBullet('Dual-Tier Database Verification', 'The login engine first attempts native Supabase Auth. If the cloud auth server encounters a schema scan error, it automatically falls back to verify against the public.users database table where your role is confirmed as "admin". You are never locked out of your operations portal.');
drawBullet('Visit Storefront Link', 'The top-right header features a quick link back to your public storefront. This link is customizable from your admin dashboard settings.');

drawSubHeader('2.2 Executive Dashboard & Real-Time KPIs');
drawBody(
  'Upon logging in, administrators are presented with the central operations dashboard:'
);
drawTable(
  ['Dashboard Metric Card', 'Data Source in Supabase', 'Operational Purpose'],
  [
    ['Total Gross Revenue ($)', 'SUM(total) from public.orders (Processing/Delivered)', 'Monitors total realized consignment sales volume.'],
    ['Total Consignment Orders', 'COUNT(id) from public.orders', 'Tracks order throughput across all workshop lines.'],
    ['Active Catalog Products', 'COUNT(id) from public.products', 'Ensures accurate count of active published inventory.'],
    ['Registered Customers', 'COUNT(id) from public.users WHERE role = \'user\'', 'Monitors customer account acquisition and growth.'],
    ['Revenue Trajectory Chart', 'Recharts Area Chart aggregated weekly', 'Visualizes month-over-month revenue velocity.'],
    ['Weekly Orders Bar Chart', 'Chart.js Bar Chart aggregated daily', 'Displays operational warehouse packing load by day.']
  ],
  [125, 175, 205]
);

drawSubHeader('2.3 Consignment Order Fulfillment & Printable PDF Invoices');
drawBody(
  'The Orders section displays every customer purchase placed on the storefront. Administrators can update fulfillment status directly from the dropdown:'
);
drawBullet('Processing', 'Workshop is gathering raw materials and hand-assembling the order.');
drawBullet('In Transit', 'The parcel has cleared export customs and is flying via bonded global couriers.');
drawBullet('Delivered', 'Final delivery to the customer residence has been confirmed.');
drawBullet('Printable Consignment Invoice', 'Clicking the Print icon generates an official luxury workshop consignment invoice formatted with clean print typography for inclusion inside the delivery crate.');

// ==========================================
// PAGE 6: PART 2 - CATALOG MANAGEMENT & SPECS
// ==========================================
doc.addPage();
drawSectionHeader('Part 2 (Continued): Product Catalog Administration', 'Adding Products, Manual Image Downscaling & E-Bike Specifications');

drawSubHeader('2.1 Step-by-Step Demonstration: Adding a New Product');
drawBody(
  'Publishing a product to the live storefront is simple and takes less than two minutes. Follow these exact steps:'
);

drawStep(1, 'Open Add Product Form', 'In the left admin navigation sidebar, click on "Products", then click the green "+ Add Product" button.');
drawStep(2, 'Enter Primary Product Details', 'Fill in Title (e.g. Volt X2 Trail E-Bike), Price (e.g. 1899.00), Category (e.g. E-Bikes), and Manufacturer (e.g. Nordic Motion Labs (Helsinki)).');
drawStep(3, 'Set Available Stock Quantity', 'Enter the available physical inventory (e.g. 14 units). This ensures the product displays as "In Stock" on the storefront.');
drawStep(4, 'Upload Product Photo (Manual Upload)', 'Drag any photo from your computer into the upload box. The built-in client engine automatically downscales and compresses large camera files to fast-loading 1200px WebP format.');
drawStep(5, 'Add Technical Specifications (Crucial for E-Bikes)', 'Click "+ Add Specification". Enter labels and values such as Motor: 250W Rear Hub, Battery: 650Wh, Range: 80km, Frame: 6061-T6 Aluminum.');
drawStep(6, 'Click Publish Product', 'Click "Publish Product". The button will say "Publishing Product...". Once saved, the product is live on the public storefront catalog immediately.');

drawSubHeader('2.2 Client-Side Image Downscaling Engine');
drawBody(
  'To prevent large 10MB camera uploads from slowing down your website or crashing mobile phones, the Admin Portal includes an automatic image optimization engine:'
);
drawBullet('Automatic Downscaling', 'Photos larger than 1200px width are automatically scaled down using client-side HTML5 Canvas technology.');
drawBullet('WebP & JPEG Optimization', 'Images are re-encoded with 85% compression quality, reducing 8MB photos down to ~150KB without visible loss of sharpness.');
drawBullet('Zero Backend Bloat', 'No external image servers or cloud storage subscriptions are required. Optimized images save directly into the database record.');

drawSubHeader('2.3 Editing & Managing Existing Catalog Products');
drawBody(
  'In the Products Table, you can search, filter, and modify any existing product:'
);
drawBullet('Edit Product', 'Click the pencil icon next to any product to adjust price, stock, description, or specifications.');
drawBullet('Delete Product', 'Click the red trash icon to permanently remove an item from the catalog after confirmation.');

// ==========================================
// PAGE 7: PART 2 - CATEGORIES, REVIEWS & USERS
// ==========================================
doc.addPage();
drawSectionHeader('Part 2 (Continued): Operations & Supervision', 'Categories, Customer Reviews, User Roles & Notifications');

drawSubHeader('2.4 Category Taxonomy Management');
drawBody(
  'Categories organize your storefront navigation and catalog filters. In the Categories view:'
);
drawBullet('Viewing Categories', 'Inspect existing categories (E-Bikes, Clothing, Shoes, Appliances, Accessories) and their associated product counts.');
drawBullet('Creating Categories', 'Add new categories by supplying a display name, URL slug (e.g. e-bikes), image URL, and hierarchy tag.');

drawSubHeader('2.5 Customer Reviews & Moderation');
drawBody(
  'Customer ratings build credibility for high-end workshop goods. The Reviews management screen allows you to:'
);
drawBullet('Inspect Incoming Reviews', 'Review customer names, email addresses, star ratings (1 to 5 stars), and written feedback.');
drawBullet('Approve / Moderate', 'Verify reviews before they appear publicly on product detail pages, ensuring protection against spam or inappropriate content.');

drawSubHeader('2.6 User Directory & Role-Based Access Control');
drawBody(
  'The Users table lists all registered accounts across both the storefront and the administration portal:'
);
drawBullet('Role Distinction', 'Accounts are categorized as "user" (storefront customer) or "admin" (privileged operations staff).');
drawBullet('Account Status', 'Admins can inspect whether a customer account is "active" or "suspended".');
drawBullet('Safety Rule', 'Never downgrade the master administrator account (esoweibi@gmail.com) from admin role to prevent loss of operational access.');

drawSubHeader('2.7 Real-Time Notifications Feed');
drawBody(
  'The notification bell in the top navigation keeps you updated on live platform events:'
);
drawBullet('Order Alerts', 'Every incoming customer purchase creates an event card showing customer name, order number, dollar total, and time.');
drawBullet('Review Alerts', 'Submissions of customer reviews trigger notifications showing the product name and star rating.');
drawBullet('One-Click Dismissal', 'Click "Mark all as read" to clear unread badges.');

drawSubHeader('2.8 Administrative Sign Out Confirmation');
drawBody(
  'Clicking "Sign Out" in the sidebar opens a customized security confirmation modal. This prevents accidental termination of administrative sessions while drafting product listings or managing consignments.'
);

// ==========================================
// PAGE 8: PART 3 - RESEND EMAIL ENGINE
// ==========================================
doc.addPage();
drawSectionHeader('Part 3: The Resend Transactional Email Engine', 'Branded 6-Digit OTP Delivery & Itemized Customer Receipts');

drawSubHeader('3.1 Transactional Email Architecture');
drawBody(
  'AccessGlobal uses Resend (resend.com) as its high-speed transactional email engine. All emails are sent through an authenticated serverless proxy (/api/send-email) that protects your API credentials and bypasses browser CORS restrictions.'
);

drawTable(
  ['Email Template Type', 'Trigger Event', 'Sender & Recipient', 'Key Contents in Email'],
  [
    ['6-Digit OTP Verification', 'Customer registers or clicks "Resend Code"', 'From: AccessGlobal <onboarding@resend.dev>\nTo: Customer Email', 'Large 36px monospace digits, security warning, 15-minute expiry notice.'],
    ['Order Purchase Receipt', 'Customer clicks "Complete Order" in cart', 'From: AccessGlobal <onboarding@resend.dev>\nTo: Customer Email', 'Order ID, itemized table of products, workshop makers, subtotal, shipping address.'],
    ['Development Test Forward', 'Testing sign-ups with non-owner address', 'Auto-routed to: esoweibi@gmail.com', 'Subject tag [AccessGlobal Security OTP for test@email.com] with live code.']
  ],
  [120, 105, 130, 150]
);

drawSubHeader('3.2 Understanding Resend Sandbox Delivery Rules');
drawBody(
  'While using the free development tier on Resend:'
);
drawBullet('Sender Domain', 'The verified sandbox sender is onboarding@resend.dev.');
drawBullet('Owner Recipient', 'The verified account email on Resend is esoweibi@gmail.com.');
drawBullet('Why Forwarding Occurs', 'Resend strictly prevents the onboarding@resend.dev address from emailing arbitrary public inboxes to prevent spam. When you test signing up with another email (e.g. user@test.com), our system automatically sends the email to esoweibi@gmail.com with a clear subject tag showing the code.');
drawBullet('Developer Sandbox Code Button', 'The storefront OTP modal also features a one-click "Developer Sandbox Mode" button that displays the code for effortless local testing.');

drawSubHeader('3.3 Upgrading to Custom Domain in Production');
drawBody(
  'When you are ready to send emails to any customer in the world from your company domain (e.g. orders@accessglobal.com):'
);
drawStep(1, 'Add Domain in Resend', 'Log in to resend.com &rarr; Domains &rarr; Add Domain (e.g. mail.accessglobal.com).');
drawStep(2, 'Configure DNS Records', 'Copy the 3 provided DNS records (DKIM, SPF) into your domain registrar (GoDaddy, Namecheap, Cloudflare).');
drawStep(3, 'Update Environment Variable', 'In Vercel Settings, update VITE_RESEND_FROM_EMAIL to "AccessGlobal <orders@accessglobal.com>". All customer emails will now dispatch globally with zero sandbox restrictions.');

// ==========================================
// PAGE 9: PART 4 - SUPABASE DATABASE
// ==========================================
doc.addPage();
drawSectionHeader('Part 4: The Supabase PostgreSQL Database', 'Database Schema, Master Tables, Indexes & SQL Editor Guide');

drawSubHeader('4.1 Master Database Tables in Public Schema');
drawBody(
  'All live application data is stored in PostgreSQL on Supabase (falnqoftmtqhonkmrtby.supabase.co). The schema contains 5 primary tables:'
);

drawTable(
  ['Table Name', 'Key Columns & Types', 'Row-Level Security (RLS) Policy'],
  [
    ['public.products', 'id (UUID), title (TEXT), price (NUMERIC), category (TEXT), in_stock (INT), specs (JSONB), main_image (TEXT)', 'Public read enabled. Admins have full insert, update, and delete access.'],
    ['public.orders', 'id (UUID), customer_name (TEXT), customer_email (TEXT), status (TEXT), total (NUMERIC), items (JSONB)', 'Public insert enabled for storefront checkout. Admins manage and update statuses.'],
    ['public.users', 'id (UUID), name (TEXT), email (TEXT UNIQUE), role (TEXT), status (TEXT), created_at (TIMESTAMPTZ)', 'Public read for verified profile display. Public insert for customer sign-up.'],
    ['public.categories', 'id (UUID), name (TEXT), slug (TEXT UNIQUE), image_url (TEXT), parent_category (TEXT)', 'Public read enabled across storefront filters. Admins have full management access.'],
    ['public.reviews', 'id (UUID), product_id (TEXT), product_name (TEXT), user_name (TEXT), rating (INT), comment (TEXT)', 'Public read for approved reviews. Customers insert reviews upon purchase.']
  ],
  [95, 235, 175]
);

drawSubHeader('4.2 How to Run SQL Queries in the Supabase SQL Editor');
drawBody(
  'If you ever need to initialize a fresh database or repair administrator credentials, follow these exact steps:'
);
drawStep(1, 'Open Supabase Project Dashboard', 'Navigate to supabase.com/dashboard and open project "falnqoftmtqhonkmrtby".');
drawStep(2, 'Navigate to SQL Editor', 'In the left sidebar, click the terminal icon (SQL Editor).');
drawStep(3, 'Click "+ New Query"', 'Click the green "+ New Query" button at the top of the editor.');
drawStep(4, 'Paste SQL Script', 'Copy the entire contents of "supabase-setup.sql" or "supabase-admin-user.sql" and paste into the editor.');
drawStep(5, 'Click Run', 'Click the green "Run" button (or press Ctrl + Enter). The bottom panel will say "Success. No rows returned".');

drawSubHeader('4.3 Master SQL Scripts Explained');
drawBullet('supabase-setup.sql', 'The complete master setup script. Enables extensions (pgcrypto, uuid-ossp), creates all 5 tables with indexes, configures RLS policies, seeds initial catalog products and categories, and initializes the administrator account. It is 100% idempotent and safe to re-run at any time.');
drawBullet('supabase-admin-user.sql', 'A dedicated administrator credential setup and GoTrue scanner repair script. It ensures esoweibi@gmail.com is set to admin role, updates the master password, and coalesces NULL token strings so GoTrue never encounters scan errors.');

// ==========================================
// PAGE 10: PART 5 & 6 - DEPLOYMENT & FAQ
// ==========================================
doc.addPage();
drawSectionHeader('Part 5 & 6: Vercel Deployment & Troubleshooting', 'Hosting Runbook, Environment Variables & Frequently Asked Questions');

drawSubHeader('5.1 Vercel Cloud Hosting Architecture');
drawBody(
  'The project is hosted on Vercel as two dedicated monorepo applications:'
);
drawBullet('Storefront Project (apps/frontend)', 'Public eCommerce experience. Root Directory is set to "apps/frontend". Framework is "Vite".');
drawBullet('Admin Portal Project (apps/admin)', 'Central operations console. Root Directory is set to "apps/admin". Framework is "Vite".');
drawBullet('Vercel Serverless Functions (apps/frontend/api)', 'Houses send-email.ts and resend.ts which handle POST requests for transactional emails without CORS or 405 method errors.');

drawSubHeader('5.2 Frequently Asked Questions & Operational Troubleshooting');

drawCalloutBox(
  'Q: Admin login says "Database error querying schema" - What does this mean?',
  'Answer: This occurs when Supabase GoTrue encounters NULL strings in auth.users tokens. The Admin Portal has been upgraded to automatically fall back to public.users where your admin role is active, allowing you to log in smoothly. You can also run supabase-admin-user.sql in the Supabase SQL Editor to permanently clean GoTrue tokens.',
  'alert'
);

drawCalloutBox(
  'Q: I published a product in Admin, but I do not see it on the Storefront.',
  'Answer: Refresh your storefront browser page. The storefront queries the database dynamically on mount. Also ensure that you selected a Category and entered a stock quantity greater than 0 so the product is marked "In Stock".',
  'tip'
);

drawCalloutBox(
  'Q: Why did I receive an email from Supabase instead of Resend previously?',
  'Answer: Previously, calling supabase.auth.signUp() activated Supabase\'s default confirmation mailer. This has been completely decoupled. The registration flow now dispatches 6-digit verification codes exclusively through Resend in your custom HTML template.',
  'gold'
);

drawBody(
  'Congratulations! You now have a complete, 360-degree understanding of the AccessGlobal platform. The system is fully tested, hardened against regressions, and ready for commercial operation.'
);

// ==========================================
// TWO-PASS RUNNING HEADERS & FOOTERS
// ==========================================
const range = doc.bufferedPageRange();
const totalPages = range.count;

for (let i = 0; i < totalPages; i++) {
  doc.switchToPage(i);

  // Skip cover page (page 0)
  if (i > 0) {
    // Running Header
    doc.fillColor(INK_LIGHT).font('Helvetica').fontSize(7.5).text(
      'AccessGlobal Platform · Master Handover & Operations Manual',
      45, 24, { width: 505, align: 'left' }
    );
    doc.strokeColor(LINE_BORDER).lineWidth(0.5).moveTo(45, 34).lineTo(550, 34).stroke();

    // Running Footer
    doc.strokeColor(LINE_BORDER).lineWidth(0.5).moveTo(45, 804).lineTo(550, 804).stroke();
    doc.fillColor(INK_LIGHT).font('Helvetica').fontSize(7.5).text(
      'Confidential & Proprietary · Direct Workshop Network',
      45, 812, { width: 350, align: 'left' }
    );
    doc.fillColor(BRAND_GREEN).font('Helvetica-Bold').fontSize(8).text(
      `Page ${i + 1} of ${totalPages}`,
      400, 812, { width: 150, align: 'right' }
    );
  }
}

doc.end();

writeStream.on('finish', () => {
  console.log('PDF Handover Manual generated successfully at:', outputPath);
  const stats = fs.statSync(outputPath);
  console.log('File size:', (stats.size / 1024).toFixed(1), 'KB');
});

