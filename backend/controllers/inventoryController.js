const Inventory = require('../models/Inventory');

exports.getItems = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let query = { tenantId: req.user.tenantId };
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (status) query.status = status;

    const items = await Inventory.find(query).sort({ createdAt: -1 });
    const lowStock = items.filter(i => i.quantity <= i.minStock).length;
    const outOfStock = items.filter(i => i.quantity === 0).length;

    res.json({ items, total: items.length, lowStock, outOfStock });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createItem = async (req, res) => {
  try {
    const { quantity, minStock, name, unit } = req.body;
    let status = 'in-stock';
    if (Number(quantity) === 0) status = 'out-of-stock';
    else if (Number(quantity) <= Number(minStock)) status = 'low-stock';

    const item = await Inventory.create({ ...req.body, status, tenantId: req.user.tenantId });

    // Low stock ya out of stock pe notification
    if (status === 'low-stock' || status === 'out-of-stock') {
      try {
        const Notification = require('../models/Notification');
        await Notification.create({
          tenantId: req.user.tenantId,
          title: status === 'out-of-stock' ? 'Out of Stock Alert' : 'Low Stock Alert',
          message: `${name} is ${status === 'out-of-stock' ? 'out of stock' : `running low (${quantity} ${unit || 'pcs'} remaining)`}`,
          type: 'inventory',
          icon: status === 'out-of-stock' ? '🚨' : '⚠️',
          link: '/inventory',
        });
      } catch (e) {
        console.error('Notification error:', e.message);
      }
    }

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { quantity, minStock, name, unit } = req.body;
    let status = 'in-stock';
    if (Number(quantity) === 0) status = 'out-of-stock';
    else if (Number(quantity) <= Number(minStock)) status = 'low-stock';

    const item = await Inventory.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      { ...req.body, status },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Low stock ya out of stock pe notification
    if (status === 'low-stock' || status === 'out-of-stock') {
      try {
        const Notification = require('../models/Notification');
        await Notification.create({
          tenantId: req.user.tenantId,
          title: status === 'out-of-stock' ? 'Out of Stock Alert' : 'Low Stock Alert',
          message: `${name || item.name} is ${status === 'out-of-stock' ? 'out of stock' : `running low (${quantity} ${unit || item.unit || 'pcs'} remaining)`}`,
          type: 'inventory',
          icon: status === 'out-of-stock' ? '🚨' : '⚠️',
          link: '/inventory',
        });
      } catch (e) {
        console.error('Notification error:', e.message);
      }
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    await Inventory.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};