let provider;
let signer;

// Подключение кошелька
async function connectWallet() {
  const providerOptions = {
    walletconnect: {
      package: window.WalletConnectProvider.default,
      options: {
        infuraId: "1c54aa3c993b4d94b73c84e833971254"
      }
    }
  };

  const web3Modal = new window.Web3Modal.default({
    cacheProvider: false,
    providerOptions
  });

  try {
    const instance = await web3Modal.connect();
    provider = new ethers.providers.Web3Provider(instance);
    signer = provider.getSigner();

    const address = await signer.getAddress();
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
    document.getElementById("connectBtn").innerText = `🔗 ${shortAddress}`;
  } catch (err) {
    console.error("Connection failed:", err);
    alert("❌ Failed to connect wallet");
  }
}

async function stakeTokens() {
  const amount = document.getElementById("stakeAmount").value;
  if (!amount || amount <= 0) {
    alert("Please enter a valid amount");
    return;
  }

  try {
    const tokenAddress = "0xYourOriginalTokenAddress"; // 👉 ВСТАВЬ сюда адрес MAX
    const wrapperAddress = "0xYourWrappedTokenAddress"; // 👉 ВСТАВЬ сюда адрес контракта StMAX

    const tokenABI = ["function approve(address spender, uint256 amount) external returns (bool)"];
    const wrapperABI = ["function deposit(uint256 amount) external"];

    const token = new ethers.Contract(tokenAddress, tokenABI, signer);
    const wrapper = new ethers.Contract(wrapperAddress, wrapperABI, signer);
    const value = ethers.utils.parseUnits(amount, 18);

    const tx1 = await token.approve(wrapperAddress, value);
    await tx1.wait();

    const tx2 = await wrapper.deposit(value);
    await tx2.wait();

    alert(`✅ Successfully deposited ${amount} tokens`);
  } catch (err) {
    console.error(err);
    alert("❌ Deposit failed");
  }
}

async function unstakeTokens() {
  const amount = document.getElementById("unstakeAmount").value;
  if (!amount || amount <= 0) {
    alert("Please enter a valid amount");
    return;
  }

  try {
    const wrapperAddress = "0xYourWrappedTokenAddress"; // 👉 ВСТАВЬ сюда адрес StMAX
    const wrapperABI = ["function withdraw(uint256 amount) external"];
    const wrapper = new ethers.Contract(wrapperAddress, wrapperABI, signer);
    const value = ethers.utils.parseUnits(amount, 18);

    const tx = await wrapper.withdraw(value);
    await tx.wait();

    alert(`✅ Successfully withdrew ${amount} tokens`);
  } catch (err) {
    console.error(err);
    alert("❌ Withdraw failed");
  }
}
