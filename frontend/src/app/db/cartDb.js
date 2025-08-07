const db = require('./db');

function getCart(username) {
  return db.prepare(`SELECT * FROM carts WHERE username = ?`).all(username);
}

function addToCart(username, item) {
  db.prepare(`
    INSERT INTO carts (username, product_id, name, price)
    VALUES (?, ?, ?, ?)
  `).run(username, item.product_id, item.name, item.price);
}

function removeFromCart(username, productId) {
  db.prepare(`
    DELETE FROM carts WHERE username = ? AND product_id = ?
  `).run(username, productId);
}

function clearCart(username) {
  db.prepare(`DELETE FROM carts WHERE username = ?`).run(username);
}

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
};
