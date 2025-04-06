// script.js
let provider;
let signer;

async function switchNetwork(chainIdHex) {
  if (!window.ethereum) return alert("No wallet found.");
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }]
    });
    alert("✅ Network switched!");
  } catch (err) {
    console.error("Failed to switch network:", err);
    alert("❌ Switch network failed.");
  }
}

async function connectWallet() {
  const providerOptions = {
    walletconnect: {
      package: window.WalletConnectProvider.default,
      options: { infuraId: "1c54aa3c993b4d94b73c84e833971254" }
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
    document.getElementById("connectBtn").innerText = `${shortAddress}`;
  } catch (err) {
    console.error("Connection failed:", err);
    alert("❌ Failed to connect wallet");
  }
}

async function stakeTokens() {
  const amount = document.getElementById("stakeAmount").value;
  if (!amount || amount <= 0) return alert("Enter a valid amount");

  try {
    const tokenAddress = ""; // Укажи адрес MAX
    const wrapperAddress = ""; // Укажи адрес StMAX
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
  if (!amount || amount <= 0) return alert("Enter a valid amount");

  try {
    const wrapperAddress = ""; // Укажи адрес StMAX
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

function showTab(tab) {
  const stakeTab = document.getElementById('stakeTab');
  const unstakeTab = document.getElementById('unstakeTab');
  stakeTab.style.display = 'none';
  unstakeTab.style.display = 'none';
  stakeTab.classList.remove('fade');
  unstakeTab.classList.remove('fade');
  if (tab === 'stake') {
    stakeTab.style.display = 'block';
    stakeTab.classList.add('fade');
  } else {
    unstakeTab.style.display = 'block';
    unstakeTab.classList.add('fade');
  }
}

// Wormhole Connect (через SDK, без iframe)
window.addEventListener('DOMContentLoaded', () => {
  showTab('stake');

  window.wormholeConnect.render({
    container: "#wormhole-bridge",
    config: {
      networks: ["base", "bsc"],
      tokens: [
        {
          address: "0x69b4086C7B131ED691d428e2BBa7cAcD4A4C641e", // Base MAX
          chainId: 8453,
          symbol: "MAX",
          decimals: 18
        },
        {
          address: "0x5684bFD60f4aBdde4B23d5Fa03844dc990cc9f34", // BNB MAX
          chainId: 56,
          symbol: "MAX",
          decimals: 18
        }
      ],
      appName: "MAX CrossChain",
      theme: "dark"
    }
  });
});


