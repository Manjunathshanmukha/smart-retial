// Dashboard loader
(async function () {
  const data = await fetchAPI('/api/dashboard');
  document.getElementById('totalProducts').innerText = data.totalProducts;
  document.getElementById('lowStock').innerText = data.lowStock;
  document.getElementById('totalSales').innerText = '₹' + data.totalSales;

  const txTbody = document.getElementById('recentTxBody');
  txTbody.innerHTML = '';
  data.recentTransactions.forEach(tx => {
    const row = `<tr>
      <td>${new Date(tx.createdAt).toLocaleString()}</td>
      <td>${tx.items.length} items</td>
      <td>₹${tx.total}</td>
      <td>${tx.paymentMethod}</td>
    </tr>`;
    txTbody.innerHTML += row;
  });
})();
