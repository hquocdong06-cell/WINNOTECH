const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { Banner } = require('../models/BannerPaymentImage');

async function testBannerAPI() {
  await connectDB();
  console.log("Connected to DB for testing Banner...");

  try {
    // 1. Clean test banners
    await Banner.deleteMany({ name: { $regex: /^Test Banner/i } });

    // 2. Create Banner 1
    const b1 = new Banner({
      name: "Test Banner Summer Sale 2026",
      image: "/public/images/banners/banner1.png",
      position: 2,
      status: "active"
    });
    await b1.save();
    console.log("✅ Created Banner 1:", b1.name, "Position:", b1.position);

    // 3. Test Duplicate Name Check
    const trimmedName = "Test Banner Summer Sale 2026";
    const existing = await Banner.findOne({
      name: { $regex: new RegExp(`^${trimmedName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
    });
    if (existing) {
      console.log("✅ Duplicate name check correctly detected existing banner:", existing.name);
    } else {
      console.error("❌ Duplicate check failed!");
    }

    // 4. Create Banner 2 with position 1
    const b2 = new Banner({
      name: "Test Banner Build PC Pro 2026",
      image: "/public/images/banners/banner2.png",
      position: 1,
      status: "hidden"
    });
    await b2.save();
    console.log("✅ Created Banner 2:", b2.name, "Position:", b2.position);

    // 5. Test Fetch & Sort by position
    const sorted = await Banner.find({ name: { $regex: /^Test Banner/i } }).sort({ position: 1 });
    console.log("✅ Banners sorted by position:");
    sorted.forEach(b => console.log(`   - Position ${b.position}: ${b.name} (${b.status})`));

    // 6. Test Toggle Status
    b2.status = b2.status === 'active' ? 'hidden' : 'active';
    await b2.save();
    console.log("✅ Toggled Banner 2 status to:", b2.status);

    // Cleanup test data
    await Banner.deleteMany({ name: { $regex: /^Test Banner/i } });
    console.log("✅ Cleanup test banners complete.");
  } catch (err) {
    console.error("❌ Error in banner test:", err);
  } finally {
    await mongoose.disconnect();
  }
}

testBannerAPI();
