// prisma/seed.js
// Run with: npx prisma db seed
// Add to package.json: "prisma": { "seed": "node prisma/seed.js" }

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

const img = (w, h, seed) => `https://picsum.photos/seed/${seed}/${w}/${h}`;
const banner  = (seed) => img(1200, 400, seed);
const product = (seed) => img(600, 600, seed);

async function main() {
  console.log("Seeding ShopMasti...");

  // 1. ROLES
  await prisma.role.upsert({ where:{id:1}, update:{}, create:{id:2, name:"Admin", description:"Full access"} });
  await prisma.role.upsert({ where:{id:2}, update:{}, create:{id:1, name:"User",  description:"Regular customer"} });

  // 2. USERS
  const adminPass = await bcrypt.hash("admin123", 10);
  const userPass  = await bcrypt.hash("user123",  10);
  await prisma.user.upsert({ where:{email:"admin@shopmasti.com"},    update:{}, create:{username:"admin",    email:"admin@shopmasti.com",    password:adminPass, role_id:2, mobile_number:"9000000001", country:"India"} });
  await prisma.user.upsert({ where:{email:"testuser@shopmasti.com"}, update:{}, create:{username:"testuser", email:"testuser@shopmasti.com", password:userPass,  role_id:1, mobile_number:"9000000002", country:"India"} });

  // 3. UPPER CATEGORIES
  const [ucF, ucE, ucH, ucB] = await Promise.all([
    prisma.upperCategory.upsert({ where:{name:"Fashion"},               update:{}, create:{name:"Fashion",               description:"Clothing, footwear & accessories"} }),
    prisma.upperCategory.upsert({ where:{name:"Electronics"},           update:{}, create:{name:"Electronics",           description:"Phones, laptops, gadgets"} }),
    prisma.upperCategory.upsert({ where:{name:"Home & Kitchen"},        update:{}, create:{name:"Home & Kitchen",        description:"Furniture, cookware & home essentials"} }),
    prisma.upperCategory.upsert({ where:{name:"Beauty & Personal Care"}, update:{}, create:{name:"Beauty & Personal Care", description:"Skincare, haircare & grooming"} }),
  ]);

  // 4. CATEGORIES
  const cats = {};
  const catDefs = [
    {name:"Men's Clothing",   uc:ucF.id}, {name:"Women's Clothing", uc:ucF.id},
    {name:"Kids' Clothing",   uc:ucF.id}, {name:"Men's Footwear",   uc:ucF.id},
    {name:"Women's Footwear", uc:ucF.id}, {name:"Accessories",      uc:ucF.id},
    {name:"Mobiles & Tablets",uc:ucE.id}, {name:"Laptops & Computers",uc:ucE.id},
    {name:"Audio & Headphones",uc:ucE.id},{name:"TVs & Displays",   uc:ucE.id},
    {name:"Furniture",        uc:ucH.id}, {name:"Kitchen & Dining", uc:ucH.id},
    {name:"Bed & Bath",       uc:ucH.id}, {name:"Home Decor",       uc:ucH.id},
    {name:"Home Appliances",  uc:ucH.id}, {name:"Skincare",         uc:ucB.id},
    {name:"Haircare",         uc:ucB.id}, {name:"Makeup",           uc:ucB.id},
    {name:"Men's Grooming",   uc:ucB.id}, {name:"Fragrances",       uc:ucB.id},
  ];
  for (const c of catDefs) {
    cats[c.name] = await prisma.category.upsert({ where:{name:c.name}, update:{}, create:{name:c.name, upper_category_id:c.uc} });
  }

  // 5. SUBCATEGORIES
  const subs = {};
  const subDefs = [
    {name:"Formal Shirts",         cat:"Men's Clothing"},
    {name:"Casual T-Shirts",       cat:"Men's Clothing"},
    {name:"Trousers & Jeans",      cat:"Men's Clothing"},
    {name:"Ethnic Wear",           cat:"Men's Clothing"},
    {name:"Innerwear",             cat:"Men's Clothing"},
    {name:"Sarees",                cat:"Women's Clothing"},
    {name:"Kurtis & Suits",        cat:"Women's Clothing"},
    {name:"Western Wear",          cat:"Women's Clothing"},
    {name:"Lehengas",              cat:"Women's Clothing"},
    {name:"Boys' Clothing",        cat:"Kids' Clothing"},
    {name:"Girls' Clothing",       cat:"Kids' Clothing"},
    {name:"Formal Shoes",          cat:"Men's Footwear"},
    {name:"Sneakers",              cat:"Men's Footwear"},
    {name:"Sandals & Slippers",    cat:"Men's Footwear"},
    {name:"Heels",                 cat:"Women's Footwear"},
    {name:"Flats & Ballerinas",    cat:"Women's Footwear"},
    {name:"Women's Sandals",       cat:"Women's Footwear"},
    {name:"Watches",               cat:"Accessories"},
    {name:"Bags & Wallets",        cat:"Accessories"},
    {name:"Jewellery",             cat:"Accessories"},
    {name:"Smartphones",           cat:"Mobiles & Tablets"},
    {name:"Tablets",               cat:"Mobiles & Tablets"},
    {name:"Mobile Accessories",    cat:"Mobiles & Tablets"},
    {name:"Laptops",               cat:"Laptops & Computers"},
    {name:"Desktops",              cat:"Laptops & Computers"},
    {name:"Laptop Accessories",    cat:"Laptops & Computers"},
    {name:"Earphones & Earbuds",   cat:"Audio & Headphones"},
    {name:"Headphones",            cat:"Audio & Headphones"},
    {name:"Bluetooth Speakers",    cat:"Audio & Headphones"},
    {name:"Smart TVs",             cat:"TVs & Displays"},
    {name:"Monitors",              cat:"TVs & Displays"},
    {name:"Sofas & Seating",       cat:"Furniture"},
    {name:"Beds & Mattresses",     cat:"Furniture"},
    {name:"Storage & Wardrobes",   cat:"Furniture"},
    {name:"Study & Office Furniture", cat:"Furniture"},
    {name:"Cookware",              cat:"Kitchen & Dining"},
    {name:"Kitchen Storage",       cat:"Kitchen & Dining"},
    {name:"Dining & Table",        cat:"Kitchen & Dining"},
    {name:"Bedsheets & Covers",    cat:"Bed & Bath"},
    {name:"Pillows & Cushions",    cat:"Bed & Bath"},
    {name:"Towels & Bath",         cat:"Bed & Bath"},
    {name:"Lamps & Lighting",      cat:"Home Decor"},
    {name:"Curtains & Rugs",       cat:"Home Decor"},
    {name:"Wall Art & Decor",      cat:"Home Decor"},
    {name:"Washing Machines",      cat:"Home Appliances"},
    {name:"Refrigerators",         cat:"Home Appliances"},
    {name:"Air Conditioners",      cat:"Home Appliances"},
    {name:"Face Wash & Scrubs",    cat:"Skincare"},
    {name:"Moisturisers & Serums", cat:"Skincare"},
    {name:"Sunscreen",             cat:"Skincare"},
    {name:"Shampoo & Conditioner", cat:"Haircare"},
    {name:"Hair Oils",             cat:"Haircare"},
    {name:"Hair Styling",          cat:"Haircare"},
    {name:"Foundation & Concealer",cat:"Makeup"},
    {name:"Lip Colour",            cat:"Makeup"},
    {name:"Eye Makeup",            cat:"Makeup"},
    {name:"Shaving",               cat:"Men's Grooming"},
    {name:"Beard Care",            cat:"Men's Grooming"},
    {name:"Perfumes",              cat:"Fragrances"},
    {name:"Deodorants",            cat:"Fragrances"},
  ];
  for (const s of subDefs) {
    const catRow = cats[s.cat];
    subs[s.name] = await prisma.subCategory.upsert({
      where:{ name_category_id:{ name:s.name, category_id:catRow.id } },
      update:{}, create:{ name:s.name, category_id:catRow.id },
    });
  }

  // 6. EVENTS
  const evs = {};
  const evDefs = [
    { name:"Wedding",              desc:"Everything for the big day — bridal wear, jewellery, décor, electronics.", img:banner("wedding-1") },
    { name:"New Home Setup",       desc:"Moving in? Get furniture, appliances, kitchen essentials and décor.",      img:banner("home-1") },
    { name:"Relocation Abroad",    desc:"Relocating? Pack smart with travel essentials, electronics and clothing.", img:banner("travel-1") },
    { name:"Birthday Celebration", desc:"Make birthdays special with gifts, fashion and accessories.",              img:banner("birthday-1") },
    { name:"College Move-In",      desc:"Starting college? Gear up with gadgets, bedding and study essentials.",    img:banner("college-1") },
  ];
  for (const e of evDefs) {
    evs[e.name] = await prisma.eventType.upsert({ where:{name:e.name}, update:{}, create:{name:e.name, description:e.desc, banner_image:e.img, is_active:true} });
  }

  // 7. EVENT DISCOUNTS
  const discDefs = [
    {ev:"Wedding",             min:5000,  amt:500},  {ev:"Wedding",             min:15000, amt:2000}, {ev:"Wedding",             min:30000, amt:5000},
    {ev:"New Home Setup",      min:10000, amt:1000}, {ev:"New Home Setup",      min:25000, amt:3000},
    {ev:"Relocation Abroad",   min:8000,  amt:800},  {ev:"Relocation Abroad",   min:20000, amt:2500},
    {ev:"Birthday Celebration",min:2000,  amt:200},  {ev:"Birthday Celebration",min:5000,  amt:600},
    {ev:"College Move-In",     min:3000,  amt:300},  {ev:"College Move-In",     min:10000, amt:1200},
  ];
  for (const d of discDefs) {
    await prisma.eventDiscount.create({ data:{ event_id:evs[d.ev].id, min_purchase_amount:d.min, discount_amount:d.amt, is_active:true } }).catch(()=>{});
  }

  // 8. EVENT-SUBCATEGORY MAPPINGS
  const esMap = [
    {ev:"Wedding", sub:"Sarees",              desc:"Bridal and party sarees for the wedding season"},
    {ev:"Wedding", sub:"Lehengas",            desc:"Gorgeous lehengas for the bride and bridesmaids"},
    {ev:"Wedding", sub:"Ethnic Wear",         desc:"Sherwanis and kurtas for the groom's side"},
    {ev:"Wedding", sub:"Jewellery",           desc:"Bridal jewellery sets and accessories"},
    {ev:"Wedding", sub:"Formal Shoes",        desc:"Wedding footwear for all occasions"},
    {ev:"Wedding", sub:"Heels",               desc:"Bridal heels and matching footwear"},
    {ev:"Wedding", sub:"Perfumes",            desc:"Luxury fragrances for the wedding day"},
    {ev:"Wedding", sub:"Wall Art & Decor",    desc:"Decorative items to set the wedding mood"},
    {ev:"Wedding", sub:"Smartphones",         desc:"Capture every moment with the right phone"},
    {ev:"New Home Setup", sub:"Sofas & Seating",      desc:"Comfortable seating for your new living room"},
    {ev:"New Home Setup", sub:"Beds & Mattresses",    desc:"Quality beds and mattresses for restful nights"},
    {ev:"New Home Setup", sub:"Storage & Wardrobes",  desc:"Smart storage solutions for every room"},
    {ev:"New Home Setup", sub:"Cookware",             desc:"Everything you need for a functional kitchen"},
    {ev:"New Home Setup", sub:"Bedsheets & Covers",   desc:"Premium bedsheets and pillow covers"},
    {ev:"New Home Setup", sub:"Lamps & Lighting",     desc:"Light up your new home beautifully"},
    {ev:"New Home Setup", sub:"Washing Machines",     desc:"Home appliances for the modern household"},
    {ev:"New Home Setup", sub:"Refrigerators",        desc:"Keep your food fresh with the right fridge"},
    {ev:"New Home Setup", sub:"Smart TVs",            desc:"Entertainment for your new home"},
    {ev:"Relocation Abroad", sub:"Laptops",             desc:"Stay productive with a reliable laptop"},
    {ev:"Relocation Abroad", sub:"Earphones & Earbuds", desc:"Essential audio gear for long journeys"},
    {ev:"Relocation Abroad", sub:"Formal Shirts",       desc:"Work-ready clothing for your new city"},
    {ev:"Relocation Abroad", sub:"Casual T-Shirts",     desc:"Comfortable basics for everyday wear"},
    {ev:"Relocation Abroad", sub:"Trousers & Jeans",    desc:"Versatile bottoms for work and leisure"},
    {ev:"Relocation Abroad", sub:"Sneakers",            desc:"Walk-friendly shoes for exploring a new city"},
    {ev:"Relocation Abroad", sub:"Bags & Wallets",      desc:"Travel-ready bags and organisers"},
    {ev:"Relocation Abroad", sub:"Shaving",             desc:"Grooming essentials for the road"},
    {ev:"Relocation Abroad", sub:"Sunscreen",           desc:"Protect your skin in any climate"},
    {ev:"Birthday Celebration", sub:"Watches",           desc:"Gifting a watch is always timeless"},
    {ev:"Birthday Celebration", sub:"Jewellery",         desc:"Beautiful jewellery gifts for birthdays"},
    {ev:"Birthday Celebration", sub:"Perfumes",          desc:"Luxury fragrances make perfect gifts"},
    {ev:"Birthday Celebration", sub:"Western Wear",      desc:"Birthday outfits for a night out"},
    {ev:"Birthday Celebration", sub:"Bluetooth Speakers",desc:"Party-ready speakers for celebrations"},
    {ev:"College Move-In", sub:"Laptops",                desc:"The most important tool for college life"},
    {ev:"College Move-In", sub:"Bedsheets & Covers",     desc:"Set up your hostel room comfortably"},
    {ev:"College Move-In", sub:"Pillows & Cushions",     desc:"Rest well after long study sessions"},
    {ev:"College Move-In", sub:"Study & Office Furniture",desc:"Desks and chairs for productive study"},
    {ev:"College Move-In", sub:"Earphones & Earbuds",    desc:"For classes, music and focus"},
    {ev:"College Move-In", sub:"Casual T-Shirts",        desc:"Casual campus wear basics"},
    {ev:"College Move-In", sub:"Sneakers",               desc:"Comfortable footwear for campus life"},
    {ev:"College Move-In", sub:"Shampoo & Conditioner",  desc:"Haircare essentials for hostel living"},
  ];
  for (const m of esMap) {
    const ev  = evs[m.ev];
    const sub = subs[m.sub];
    if (!ev || !sub) { console.warn("  Skip:", m.ev, m.sub); continue; }
    await prisma.eventSubCategory.upsert({
      where:{ event_id_subcategory_id:{ event_id:ev.id, subcategory_id:sub.id } },
      update:{ description:m.desc },
      create:{ event_id:ev.id, subcategory_id:sub.id, description:m.desc },
    }).catch(()=>{});
  }

  // 9. ITEMS & VARIANTS
  console.log("Creating products...");
  const items = [
    { name:"Premium Cotton Formal Shirt",    desc:"100% premium cotton formal shirt with spread collar. Wrinkle-resistant, ideal for office wear.", disc:15, sub:"Formal Shirts",     seed:"shirt-1",
      variants:[{c:"White",size:"S",p:1299,st:50},{c:"White",size:"M",p:1299,st:80},{c:"White",size:"L",p:1299,st:60},{c:"White",size:"XL",p:1399,st:40},{c:"Blue",size:"M",p:1299,st:70},{c:"Blue",size:"L",p:1299,st:55}] },
    { name:"Slim Fit Oxford Shirt",          desc:"Classic Oxford weave slim fit shirt for formal and semi-formal occasions.", disc:10, sub:"Formal Shirts",     seed:"shirt-2",
      variants:[{c:"Light Blue",size:"M",p:1599,st:45},{c:"Light Blue",size:"L",p:1599,st:55},{c:"Striped",size:"M",p:1699,st:30},{c:"Pink",size:"M",p:1599,st:25}] },
    { name:"Essential Round Neck T-Shirt",   desc:"Soft 100% cotton round neck T-shirt for college, travel and everyday wear.", disc:20, sub:"Casual T-Shirts",   seed:"tshirt-1",
      variants:[{c:"Black",size:"S",p:499,st:100},{c:"Black",size:"M",p:499,st:150},{c:"Black",size:"L",p:499,st:120},{c:"White",size:"M",p:499,st:130},{c:"Navy",size:"M",p:499,st:110},{c:"Grey",size:"M",p:499,st:95}] },
    { name:"Graphic Oversized T-Shirt",      desc:"Trendy oversized fit with bold graphic prints. 100% cotton. Perfect for campus.", disc:15, sub:"Casual T-Shirts",   seed:"tshirt-2",
      variants:[{c:"Off White",size:"M",p:699,st:60},{c:"Off White",size:"L",p:699,st:70},{c:"Black",size:"M",p:699,st:55},{c:"Black",size:"L",p:699,st:65}] },
    { name:"Slim Fit Chino Trousers",        desc:"Premium cotton-blend slim fit chinos. Versatile for office and casual wear.", disc:12, sub:"Trousers & Jeans",  seed:"chino-1",
      variants:[{c:"Khaki",size:"30",p:1299,st:60},{c:"Khaki",size:"32",p:1299,st:80},{c:"Olive",size:"32",p:1299,st:65},{c:"Navy",size:"32",p:1299,st:50}] },
    { name:"Slim Fit Stretch Jeans",         desc:"Comfortable stretch denim slim fit jeans. 5-pocket design.", disc:18, sub:"Trousers & Jeans",  seed:"jeans-1",
      variants:[{c:"Dark Blue",size:"30",p:1599,st:70},{c:"Dark Blue",size:"32",p:1599,st:90},{c:"Dark Blue",size:"34",p:1599,st:60},{c:"Black",size:"32",p:1599,st:75}] },
    { name:"Embroidered Kurta Pyjama Set",   desc:"Silk-blend kurta with matching pyjama. Subtle embroidery for weddings and festivals.", disc:10, sub:"Ethnic Wear",       seed:"kurta-1",
      variants:[{c:"Cream",size:"M",p:2999,st:30},{c:"Cream",size:"L",p:2999,st:35},{c:"Maroon",size:"M",p:3199,st:20},{c:"Maroon",size:"L",p:3199,st:28},{c:"Navy",size:"L",p:2999,st:22}] },
    { name:"Banarasi Silk Saree",            desc:"Traditional Banarasi silk saree with zari work. Comes with blouse piece. Perfect for weddings.", disc:8, sub:"Sarees",           seed:"saree-1",
      variants:[{c:"Red",size:"Free Size",p:4999,st:20},{c:"Green",size:"Free Size",p:5299,st:15},{c:"Blue",size:"Free Size",p:4999,st:18},{c:"Maroon",size:"Free Size",p:5499,st:12},{c:"Gold",size:"Free Size",p:5999,st:10}] },
    { name:"Kanjivaram Silk Saree",          desc:"Pure Kanjivaram silk with temple border design. A wedding-season essential.", disc:5, sub:"Sarees",           seed:"saree-2",
      variants:[{c:"Magenta",size:"Free Size",p:7999,st:8},{c:"Peacock Blue",size:"Free Size",p:8499,st:6},{c:"Crimson",size:"Free Size",p:7999,st:10}] },
    { name:"Bridal Embroidered Lehenga Set", desc:"Heavy embroidered bridal lehenga set with dupatta. Blouse + skirt + dupatta.", disc:10, sub:"Lehengas",          seed:"lehenga-1",
      variants:[{c:"Red & Gold",size:"S",p:12999,st:5},{c:"Red & Gold",size:"M",p:12999,st:8},{c:"Red & Gold",size:"L",p:13499,st:6},{c:"Pink & Silver",size:"M",p:13999,st:5}] },
    { name:"Straight Cut Cotton Kurti",      desc:"Comfortable everyday cotton kurti with block print. Goes with jeans or palazzos.", disc:20, sub:"Kurtis & Suits",   seed:"kurti-1",
      variants:[{c:"Blue Print",size:"S",p:699,st:60},{c:"Blue Print",size:"M",p:699,st:80},{c:"Blue Print",size:"L",p:699,st:70},{c:"Green Print",size:"M",p:699,st:65},{c:"Pink Print",size:"M",p:699,st:50}] },
    { name:"Women's High-Waist Jeans",       desc:"Trendy high-waist slim fit jeans in stretch denim. Flattering fit for all body types.", disc:15, sub:"Western Wear",      seed:"wjeans-1",
      variants:[{c:"Dark Blue",size:"26",p:1399,st:55},{c:"Dark Blue",size:"28",p:1399,st:70},{c:"Dark Blue",size:"30",p:1399,st:60},{c:"Black",size:"28",p:1399,st:50},{c:"Black",size:"30",p:1399,st:55}] },
    { name:"Leather Oxford Dress Shoes",     desc:"Genuine leather oxford shoes with cushioned insole. For office and formal occasions.", disc:12, sub:"Formal Shoes",      seed:"shoes-1",
      variants:[{c:"Black",size:"7",p:2499,st:25},{c:"Black",size:"8",p:2499,st:35},{c:"Black",size:"9",p:2499,st:30},{c:"Tan",size:"8",p:2699,st:20},{c:"Tan",size:"9",p:2699,st:22}] },
    { name:"Everyday Running Sneakers",      desc:"Lightweight mesh sneakers with cushioned sole. For college, travel and everyday use.", disc:18, sub:"Sneakers",           seed:"sneakers-1",
      variants:[{c:"White",size:"7",p:1799,st:40},{c:"White",size:"8",p:1799,st:55},{c:"White",size:"9",p:1799,st:50},{c:"Black",size:"8",p:1799,st:45},{c:"Black",size:"9",p:1799,st:40},{c:"Navy Blue",size:"8",p:1899,st:30}] },
    { name:"Block Heel Sandals",             desc:"Comfortable block heels with ankle strap. For parties, weddings and semi-formal wear.", disc:10, sub:"Heels",             seed:"heels-1",
      variants:[{c:"Nude",size:"5",p:1599,st:25},{c:"Nude",size:"6",p:1599,st:35},{c:"Nude",size:"7",p:1599,st:30},{c:"Black",size:"6",p:1599,st:28},{c:"Gold",size:"6",p:1799,st:15}] },
    { name:"Minimalist Analog Watch",        desc:"Slim stainless steel analog watch with leather strap. Water resistant to 30m.", disc:15, sub:"Watches",           seed:"watch-1",
      variants:[{c:"Silver / Black Strap",size:"Free Size",p:2999,st:30},{c:"Gold / Brown Strap",size:"Free Size",p:3299,st:25},{c:"Rose Gold / Pink Strap",size:"Free Size",p:3199,st:20}] },
    { name:"Gold-Plated Bridal Jewellery Set", desc:"Traditional gold-plated necklace set with earrings and maang tikka. For weddings.", disc:8, sub:"Jewellery",         seed:"jewel-1",
      variants:[{c:"Gold",size:"Free Size",p:3999,st:15},{c:"Gold & Red",size:"Free Size",p:4299,st:12},{c:"Gold & Green",size:"Free Size",p:4299,st:10}] },
    { name:"Android Smartphone 5G 128GB",    desc:"6.5-inch FHD+, 48MP triple camera, 5000mAh, 5G. Best mid-range performance.", disc:8, sub:"Smartphones",       seed:"phone-1",
      variants:[{c:"Midnight Black",size:"128GB",p:18999,st:40},{c:"Midnight Black",size:"256GB",p:21999,st:25},{c:"Ocean Blue",size:"128GB",p:18999,st:35},{c:"Glacier White",size:"128GB",p:18999,st:30}] },
    { name:"Budget Smartphone 4G 64GB",      desc:"6.0-inch HD, 13MP camera, 4000mAh. Great entry-level phone.", disc:12, sub:"Smartphones",       seed:"phone-2",
      variants:[{c:"Black",size:"64GB",p:8999,st:80},{c:"Black",size:"128GB",p:10999,st:50},{c:"Blue",size:"64GB",p:8999,st:65}] },
    { name:"15.6-inch Laptop i5 16GB RAM",   desc:"Intel i5 12th Gen, 16GB DDR4, 512GB SSD, Full HD. For students and professionals.", disc:10, sub:"Laptops",            seed:"laptop-1",
      variants:[{c:"Space Grey",size:"512GB SSD",p:55999,st:20},{c:"Space Grey",size:"1TB SSD",p:62999,st:12},{c:"Silver",size:"512GB SSD",p:55999,st:18}] },
    { name:"13-inch Ultrabook Laptop",       desc:"Slim ultrabook with 12-hour battery. 13.3-inch FHD IPS, 8GB RAM, 256GB SSD.", disc:8, sub:"Laptops",            seed:"laptop-2",
      variants:[{c:"Silver",size:"256GB",p:44999,st:15},{c:"Silver",size:"512GB",p:51999,st:10},{c:"Rose Gold",size:"256GB",p:44999,st:12}] },
    { name:"True Wireless Earbuds",          desc:"Active noise cancellation, 30h playtime, IPX5 water resistant. Crystal clear calls.", disc:20, sub:"Earphones & Earbuds",seed:"earbuds-1",
      variants:[{c:"White",size:"Free Size",p:2999,st:60},{c:"Black",size:"Free Size",p:2999,st:70},{c:"Navy Blue",size:"Free Size",p:2999,st:45},{c:"Sage Green",size:"Free Size",p:3199,st:30}] },
    { name:"Wired Earphones with Mic",       desc:"3.5mm jack with inline mic and volume control. Clear audio for calls and music.", disc:25, sub:"Earphones & Earbuds",seed:"earphones-1",
      variants:[{c:"Black",size:"Free Size",p:399,st:200},{c:"White",size:"Free Size",p:399,st:180}] },
    { name:"Portable Bluetooth Speaker",     desc:"360-degree surround, IPX7 waterproof, 12h battery. Party-ready with LED mode.", disc:15, sub:"Bluetooth Speakers", seed:"speaker-1",
      variants:[{c:"Black",size:"Free Size",p:3499,st:40},{c:"Blue",size:"Free Size",p:3499,st:35},{c:"Red",size:"Free Size",p:3499,st:30}] },
    { name:"43-inch 4K Android Smart TV",    desc:"4K Ultra HD, Android 11, Google Assistant, 3 HDMI. Dolby Vision & Atmos.", disc:10, sub:"Smart TVs",          seed:"tv-1",
      variants:[{c:"Black",size:"43 inch",p:32999,st:15},{c:"Black",size:"50 inch",p:41999,st:12},{c:"Black",size:"55 inch",p:49999,st:8}] },
    { name:"3-Seater Fabric Sofa",           desc:"3-seater sofa in premium woven fabric. High-density foam, sturdy wooden legs.", disc:12, sub:"Sofas & Seating",   seed:"sofa-1",
      variants:[{c:"Grey",size:"3 Seater",p:24999,st:8},{c:"Beige",size:"3 Seater",p:24999,st:7},{c:"Navy Blue",size:"3 Seater",p:26999,st:5}] },
    { name:"Queen Size Platform Bed with Storage", desc:"Hydraulic storage platform bed. Engineered wood with fabric headboard.", disc:15, sub:"Beds & Mattresses",  seed:"bed-1",
      variants:[{c:"Walnut Brown",size:"Queen (60x72)",p:19999,st:10},{c:"Grey",size:"Queen (60x72)",p:19999,st:8},{c:"Walnut Brown",size:"King (72x78)",p:24999,st:6}] },
    { name:"Memory Foam Mattress",           desc:"7-inch memory foam with orthopedic support and cool-gel top layer. 10-year warranty.", disc:20, sub:"Beds & Mattresses",  seed:"mattress-1",
      variants:[{c:"White",size:"Single (36x75)",p:8999,st:20},{c:"White",size:"Double (48x75)",p:12999,st:15},{c:"White",size:"Queen (60x75)",p:15999,st:12}] },
    { name:"Non-Stick Cookware Set 5 Piece", desc:"Non-stick kadhai, tawa, saucepan, fry pan and lid. PFOA-free coating.", disc:18, sub:"Cookware",           seed:"cookware-1",
      variants:[{c:"Black",size:"5 Piece Set",p:2999,st:30},{c:"Red",size:"5 Piece Set",p:3199,st:20}] },
    { name:"Pure Cotton Double Bedsheet Set",desc:"400 thread count double bedsheet with 2 pillow covers. Soft and breathable.", disc:25, sub:"Bedsheets & Covers", seed:"bedsheet-1",
      variants:[{c:"White",size:"Double (90x100)",p:999,st:80},{c:"Blue Floral",size:"Double (90x100)",p:999,st:70},{c:"Grey Stripes",size:"Double (90x100)",p:999,st:65},{c:"White",size:"King (108x108)",p:1299,st:45}] },
    { name:"7kg Front Load Washing Machine", desc:"15 wash programs, in-built heater, auto drum cleaning, energy star rated.", disc:8, sub:"Washing Machines",   seed:"washer-1",
      variants:[{c:"White",size:"7 kg",p:32999,st:10},{c:"Silver",size:"7 kg",p:33999,st:8},{c:"White",size:"8 kg",p:37999,st:7}] },
    { name:"Double Door Frost-Free Refrigerator", desc:"253L frost-free with inverter compressor. 5-year warranty. 3-star energy rating.", disc:10, sub:"Refrigerators",      seed:"fridge-1",
      variants:[{c:"Silver",size:"253 Litres",p:27999,st:8},{c:"Dark Steel",size:"253 Litres",p:28999,st:6}] },
    { name:"Bedside Table Lamp",             desc:"Warm white LED with adjustable brightness and 3 colour modes. Touch-sensitive base.", disc:15, sub:"Lamps & Lighting",   seed:"lamp-1",
      variants:[{c:"White",size:"Free Size",p:1299,st:40},{c:"Gold",size:"Free Size",p:1499,st:25},{c:"Black",size:"Free Size",p:1299,st:30}] },
    { name:"Laptop Backpack 30L",            desc:"Water-resistant 30L backpack with 15.6-inch laptop sleeve and USB port.", disc:20, sub:"Bags & Wallets",     seed:"bag-1",
      variants:[{c:"Black",size:"30 Litres",p:1799,st:50},{c:"Navy Blue",size:"30 Litres",p:1799,st:45},{c:"Olive",size:"30 Litres",p:1899,st:30}] },
    { name:"Vitamin C Face Wash",            desc:"Gentle foaming face wash with Vitamin C and turmeric. Brightens skin.", disc:20, sub:"Face Wash & Scrubs",  seed:"facewash-1",
      variants:[{c:"N/A",size:"100ml",p:299,st:150},{c:"N/A",size:"200ml",p:499,st:100}] },
    { name:"Anti-Dandruff Shampoo",          desc:"Zinc pyrithione formula proven to reduce dandruff in 2 weeks.", disc:15, sub:"Shampoo & Conditioner", seed:"shampoo-1",
      variants:[{c:"N/A",size:"200ml",p:349,st:120},{c:"N/A",size:"400ml",p:599,st:80}] },
    { name:"Woody Oud Eau de Parfum",        desc:"Rich oud fragrance with sandalwood and amber. 8-10 hour projection. Unisex.", disc:12, sub:"Perfumes",           seed:"perfume-1",
      variants:[{c:"N/A",size:"50ml",p:1999,st:35},{c:"N/A",size:"100ml",p:3299,st:25}] },
    { name:"Fresh Citrus Eau de Toilette",   desc:"Light citrus fragrance with bergamot and white musk. For daily wear.", disc:15, sub:"Perfumes",           seed:"perfume-2",
      variants:[{c:"N/A",size:"50ml",p:1499,st:45},{c:"N/A",size:"100ml",p:2499,st:30}] },
    { name:"Electric Rotary Shaver",         desc:"3-head rotary electric shaver, wet & dry, 60-min runtime. Pop-up trimmer.", disc:18, sub:"Shaving",            seed:"shaver-1",
      variants:[{c:"Black & Silver",size:"Free Size",p:3499,st:30},{c:"Blue & Silver",size:"Free Size",p:3499,st:25}] },
    { name:"SPF 50 Sunscreen Lotion",        desc:"Broad spectrum SPF 50 PA+++ sunscreen. Lightweight and non-greasy.", disc:20, sub:"Sunscreen",          seed:"sunscreen-1",
      variants:[{c:"N/A",size:"50ml",p:399,st:120},{c:"N/A",size:"100ml",p:649,st:80}] },
    { name:"Study Desk with Bookshelf",      desc:"Compact study desk with integrated bookshelf and cable management.", disc:12, sub:"Study & Office Furniture", seed:"desk-1",
      variants:[{c:"Walnut",size:"120 x 60 cm",p:8999,st:15},{c:"White",size:"120 x 60 cm",p:8999,st:18},{c:"Walnut",size:"150 x 60 cm",p:10999,st:10}] },
  ];

  for (const def of items) {
    const sub = subs[def.sub];
    if (!sub) { console.warn("  Skip (no subcat):", def.sub); continue; }
    const item = await prisma.item.create({ data:{ name:def.name, description:def.desc, base_discount:def.disc, subcategory_id:sub.id, is_active:true } });
    for (const v of def.variants) {
      const variant = await prisma.itemVariant.create({ data:{ item_id:item.id, color:v.c, size:v.size, price:v.p, stock:v.st, is_active:true } });
      await prisma.variantImage.create({ data:{ variant_id:variant.id, image_url:product(`${def.seed}-${v.c.replace(/[\s/&]/g,"-").toLowerCase()}`), is_primary:true } });
      await prisma.variantImage.create({ data:{ variant_id:variant.id, image_url:product(`${def.seed}-alt-${v.c.replace(/[\s/&]/g,"-").toLowerCase()}`), is_primary:false } });
    }
    console.log("  +", def.name);
  }

  // 10. SAMPLE ADDRESS
  const testUser = await prisma.user.findUnique({ where:{ email:"testuser@shopmasti.com" } });
  if (testUser) {
    const existing = await prisma.address.findFirst({ where:{ user_id:testUser.id } });
    if (!existing) {
      await prisma.address.create({ data:{ user_id:testUser.id, full_name:"Test User", mobile_number:"9000000002",
        house_no:"42", street:"MG Road", city:"Guntur", state:"Andhra Pradesh", pincode:"522001",
        country:"India", address_type:"Home", is_default:true } });
    }
  }

  console.log("\nDone!");
  console.log("  Admin:    admin@shopmasti.com / admin123");
  console.log("  User:     testuser@shopmasti.com / user123");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
