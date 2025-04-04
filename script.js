const rate = 1; // Можно изменить: например, 1 MAX = 0.95 StMAX

function calculateStMAX() {
  const input = document.getElementById("maxAmount").value;
  const output = input * rate;
  document.getElementById("stmaxOutput").innerText = `You will receive: ${output || 0} StMAX`;
}

async function connectWallet() {
  if (!window.ethereum) {
    alert("Please install Metamask to connect your wallet");
    return;
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    // Показываем сокращённый адрес в кнопке
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
    document.getElementById("connectBtn").innerText = `🔗 ${shortAddress}`;
  } catch (err) {
    console.error(err);
    alert("❌ Failed to connect wallet");
  }
}

async function swapTokens() {
  const amount = document.getElementById("maxAmount").value;
  if (!amount || amount <= 0) {
    alert("Please enter a valid amount");
    return;
  }

  // Здесь должен быть вызов контракта
  alert(`Swapping ${amount} MAX for StMAX... (this is a placeholder)`);
}
