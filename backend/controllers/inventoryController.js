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
    const { quantity, minStock } = req.body;
    let status = 'in-stock';
    if (quantity === 0) status = 'out-of-stock';
    else if (quantity <= minStock) status = 'low-stock';

    const item = await Inventory.create({ ...req.body, status, tenantId: req.user.tenantId });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { quantity, minStock } = req.body;
    let status = 'in-stock';
    if (quantity === 0) status = 'out-of-stock';
    else if (quantity <= minStock) status = 'low-stock';

    const item = await Inventory.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      { ...req.body, status },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });
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