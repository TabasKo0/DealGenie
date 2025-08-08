const db = require('./db1');

function getCart(username) {
  return db.prepare(`SELECT * FROM carts WHERE username = ?`).all(username);
}

function addToCart(username, item,price) {
  db.prepare(`
    INSERT INTO carts (username, product_id, name, price)
    VALUES (?, ?, ?, ?)
  `).run(username, item, '0',price);
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
