let cart = [];

// Product search by name or barcode
async function searchProduct(query) {
  const products = await fetchAPI('/api/products');
  return products.find(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) || p.barcode === query
  );
}

function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  renderCart();
}

function renderCart() {
  const cartList = document.getElementById('cartItems');
  cartList.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}
      <button onclick="removeFromCart('${item.id}')">X</button>`;
    cartList.appendChild(li);
    total += item.price * item.quantity;
  });
  document.getElementById('cartTotal').innerText = total;
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  renderCart();
}

function openPaymentModal() {
  document.getElementById('paymentModal').style.display = 'flex';
}

function closePaymentModal() {
  document.getElementById('paymentModal').style.display = 'none';
}

async function payNow() {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (total <= 0) return alert('Cart is empty');

  const method = document.getElementById('paymentMethod').value;

  if (method === 'razorpay') {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = async () => {
      const order = await fetchAPI('/api/payment/create-order', {
        method: 'POST',
        body: JSON.stringify({ amount: total })
      });

      const options = {
        key: 'rzp_test_Sj4wrP3jW8hurt',
        amount: order.amount,
        currency: order.currency,
        name: 'Smart Retail',
        order_id: order.id,
        handler: async function (response) {
          const verify = await fetchAPI('/api/payment/verify', {
            method: 'POST',
            body: JSON.stringify({
              ...response,
              cartItems: cart.map(item => ({ id: item.id, quantity: item.quantity }))
            })
          });
          if (verify.success) {
            await fetchAPI('/api/transactions', {
              method: 'POST',
              body: JSON.stringify({ items: cart, total, paymentMethod: 'razorpay' })
            });
            generateReceipt();
            cart = [];
            renderCart();
            closePaymentModal();
          } else {
            alert('Payment failed');
          }
        }
      };
      const rzp = new Razorpay(options);
      rzp.open();
    };
    document.body.appendChild(script);

  } else if (method === 'upi') {
    await fetchAPI('/api/transactions', {
      method: 'POST',
      body: JSON.stringify({ items: cart, total, paymentMethod: 'upi' })
    });
    for (const item of cart) {
      const products = await fetchAPI('/api/products');
      const product = products.find(p => p.id === item.id);
      await fetchAPI(`/api/products/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: product.quantity - item.quantity })
      });
    }
    generateReceipt();
    cart = [];
    renderCart();
    closePaymentModal();
  }
}

function generateReceipt() {
  const receipt = window.open('', '', 'width=400,height=600');
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const date = new Date().toLocaleString();
  const itemsHTML = cart.map(i =>
    `<tr><td>${i.name}</td><td>${i.quantity}</td><td>₹${i.price * i.quantity}</td></tr>`
  ).join('');
  receipt.document.write(`
    <html>
    <head><title>Invoice</title></head>
    <body>
      <h2>Smart Retail</h2>
      <p>Date: ${date}</p>
      <table border="1">${itemsHTML}</table>
      <h3>Total: ₹${total}</h3>
      <button onclick="window.print()">Print</button>
    </body>
    </html>
  `);
}
