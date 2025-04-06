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
    const tokenAddress = "0x1234567890abcdef1234567890abcdef12345678"; // 🔹 FAKE MAX token on Base
    const wrapperAddress = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"; // 🔹 FAKE StMAX wrapper
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
    const wrapperAddress = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"; // 🔹 FAKE StMAX wrapper
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

// Bridge Interface
window.addEventListener('DOMContentLoaded', () => {
  showTab('stake');

  const container = document.getElementById("wormhole-bridge");
  container.innerHTML = `
    <div style="padding: 20px; color: white; text-align: center">
      <h3>Bridge MAX</h3>
      <input type="number" id="bridgeAmount" placeholder="Amount to bridge" style="padding:10px;border-radius:10px;margin-bottom:10px;width:80%"><br>
      <select id="direction" style="margin-bottom: 10px; padding: 10px; border-radius: 10px;">
        <option value="baseToBnb">Base → BNB</option>
        <option value="bnbToBase">BNB → Base</option>
      </select><br>
      <button onclick="bridgeViaWormhole()" style="padding:10px 20px;border-radius:10px;border:none;background:linear-gradient(to right,#00ffff,#007bff);color:white;cursor:pointer;">Bridge</button>
    </div>
  `;
});

async function bridgeViaWormhole() {
  const amount = document.getElementById("bridgeAmount").value;
  const direction = document.getElementById("direction").value;
  if (!amount || amount <= 0) return alert("Enter a valid amount");

  try {
    const config = {
      baseToBnb: {
        tokenBridgeAddress: "0x2EE2fC3F38808a3BdbC7D3eF270F25eBAeB3Fc3c", // ✅ checksummed for Base
        tokenAddress: "0x69b4086C7B131ED691d428e2BBa7cAcD4A4C641e",
        targetChainId: 56
      },
      bnbToBase: {
        tokenBridgeAddress: "0x98A0F4B96972B32fCb3Bd03CaeB014FA3C3Bb7E0", // ✅ checksummed for BNB
        tokenAddress: "0x5684bFD60f4aBdde4B23d5Fa03844dc990cc9f34",
        targetChainId: 30
      }
    };

    const { tokenBridgeAddress, tokenAddress, targetChainId } = config[direction];
    const recipient = await signer.getAddress();

    const bridgeABI = [
      "function transferTokens(address token, uint256 amount, uint16 recipientChain, bytes32 recipient, uint256 nonce) external payable"
    ];
    const bridge = new ethers.Contract(tokenBridgeAddress, bridgeABI, signer);

    const value = ethers.utils.parseUnits(amount, 18);
    const recipientBytes32 = ethers.utils.hexZeroPad(recipient, 32);
    const tx = await bridge.transferTokens(tokenAddress, value, targetChainId, recipientBytes32, Date.now());
    await tx.wait();
    alert(`✅ Sent ${amount} MAX ${direction === "baseToBnb" ? "to BNB" : "to Base"} via Wormhole.`);
  } catch (err) {
    console.error("Bridge failed:", err);
    alert("❌ Bridge failed:\n" + (err?.message || "Unknown error"));

  }
}

