const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function checkCart() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/WINNOTech');
  const UserModel = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'User');
  const CartItemModel = mongoose.model('Cartitem', new mongoose.Schema({}, { strict: false }), 'Cartitem');

  const user = await UserModel.findOne({ username: 'hquocdong06' });
  console.log('User hquocdong06:', user ? user._id : 'Not found');

  if (user) {
    const items = await CartItemModel.find({ u_id: { $in: [user._id, user._id.toString()] } });
    console.log('Cart items for hquocdong06:', items.length);
    items.forEach(i => console.log('Item:', i._id, 'variant:', i.variant_id, 'qty:', i.quantity));
  }

  const allItems = await CartItemModel.find({});
  console.log('Total cart items in DB:', allItems.length);
  allItems.forEach(i => console.log('DB item u_id:', i.u_id, 'variant:', i.variant_id, 'qty:', i.quantity));

  await mongoose.disconnect();
}

checkCart().catch(console.error);
