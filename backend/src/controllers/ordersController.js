const prisma = require('../db');
const { v4: uuidv4 } = require('uuid');

const getOrders = async (req, res) => {
  try {
    const orders = await prisma.orders.findMany({
      where: { user_id: req.user.userId },
      include: {
        items: {
          include: {
            variant: { include: { item: true, images: true } },
          },
        },
        address: true,
        event: true,
      },
      orderBy: { created_at: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createOrder = async (req, res) => {
  try {
    const { event_id, address_id, payment_method, items } = req.body;
    if (!address_id || !items?.length) {
      return res.status(400).json({ error: 'address_id and items are required' });
    }

    // Calculate totals
    let orderTotal = 0;
    let discountAmount = 0;

    const variantIds = items.map(i => parseInt(i.variant_id));
    const variants = await prisma.itemVariant.findMany({
      where: { id: { in: variantIds } },
      include: { item: true },
    });

    const variantMap = {};
    variants.forEach(v => { variantMap[v.id] = v; });

    const orderItemsData = [];
    for (const i of items) {
      const variant = variantMap[parseInt(i.variant_id)];
      if (!variant) continue;
      const price = parseFloat(variant.price);
      const disc = parseFloat(variant.item.base_discount || 0);
      const unitPrice = disc ? price * (1 - disc / 100) : price;
      const subTotal = unitPrice * parseInt(i.quantity);
      orderTotal += price * parseInt(i.quantity);
      discountAmount += (price - unitPrice) * parseInt(i.quantity);
      orderItemsData.push({
        variant_id: parseInt(i.variant_id),
        quantity: parseInt(i.quantity),
        unit_price: unitPrice,
        sub_total: subTotal,
      });
    }

    // Event discount
    if (event_id) {
      const eventDiscounts = await prisma.eventDiscount.findMany({
        where: { event_id: parseInt(event_id), is_active: true },
      });
      const afterProductDisc = orderTotal - discountAmount;
      const eventDisc = eventDiscounts
        .filter(d => afterProductDisc >= parseFloat(d.min_purchase_amount))
        .reduce((best, d) => Math.max(best, parseFloat(d.discount_amount)), 0);
      discountAmount += eventDisc;
    }

    const finalAmount = orderTotal - discountAmount;

    const order = await prisma.orders.create({
      data: {
        user_id: req.user.userId,
        event_id: event_id ? parseInt(event_id) : null,
        address_id: parseInt(address_id),
        status: 'PENDING',
        payment_method: payment_method || 'cod',
        payment_status: payment_method === 'cod' ? 'PENDING' : 'PENDING',
        order_total: orderTotal,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        items: { create: orderItemsData },
      },
    });

    // Create a payment transaction record
    await prisma.paymentTransaction.create({
      data: {
        order_id: order.id,
        transaction_id: uuidv4(),
        amount: finalAmount,
        status: payment_method === 'cod' ? 'PENDING' : 'PENDING',
        payment_gateway: payment_method === 'cod' ? 'COD' : 'SIMULATED',
      },
    });

    // Clear cart items for these variants+event combo
    await prisma.cart.deleteMany({
      where: {
        user_id: req.user.userId,
        variant_id: { in: variantIds },
        event_id: event_id ? parseInt(event_id) : null,
      },
    });

    res.status(201).json({ id: order.id, message: 'Order placed successfully' });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getOrders, createOrder };
