let provider;
let signer;
let bridge;

const bridgeAddress = "0x69b4086C7B131ED691d428e2BBa7cAcD4A4C641e";
const tokenAddress = "0x69b4086C7B131ED691d428e2BBa7cAcD4A4C641e";       // Адрес MAX токена
const wrapperAddress = "0x1cC6d610c190C7742FE7603987aBCa76e403CD0d";   // Адрес обёрнутого StMAX

const bridgeABI = [
  "function bridgeOut(uint256 amount, string toChain, address targetAddress) external",
  "function bridgeIn(address user, uint256 amount, string fromChain) external"
];

const tokenABI = [
  "function approve(address spender, uint256 amount) external returns (bool)"
];

const wrapperABI = [
  "function deposit(uint256 amount) external",
  "function withdraw(uint256 amount) external"
];

// Подключение кошелька
async function connectWallet() {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    bridge = new ethers.Contract(bridgeAddress, bridgeABI, signer);
    const address = await signer.getAddress();
    document.getElementById("connectBtn").innerText = `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`;
  } else {
    alert("❌ No wallet found");
  }
}

// Stake (Wrap)
async function stakeTokens() {
  const amount = document.getElementById("stakeAmount").value;
  if (!amount || amount <= 0) {
    alert("⚠️ Please enter a valid amount");
    return;
  }

  try {
    const token = new ethers.Contract(tokenAddress, tokenABI, signer);
    const wrapper = new ethers.Contract(wrapperAddress, wrapperABI, signer);
    const value = ethers.utils.parseUnits(amount, 18);

    const tx1 = await token.approve(wrapperAddress, value);
    await tx1.wait();

    const tx2 = await wrapper.deposit(value);
    await tx2.wait();

    alert(`✅ Successfully staked ${amount} MAX`);
  } catch (err) {
    console.error(err);
    alert("❌ Stake failed");
  }
}

// Unstake (Unwrap)
async function unstakeTokens() {
  const amount = document.getElementById("unstakeAmount").value;
  if (!amount || amount <= 0) {
    alert("⚠️ Please enter a valid amount");
    return;
  }

  try {
    const wrapper = new ethers.Contract(wrapperAddress, wrapperABI, signer);
    const value = ethers.utils.parseUnits(amount, 18);

    const tx = await wrapper.withdraw(value);
    await tx.wait();

    alert(`✅ Successfully unstaked ${amount} StMAX`);
  } catch (err) {
    console.error(err);
    alert("❌ Unstake failed");
  }
}

// Bridge OUT
async function bridgeOut() {
  const amount = document.getElementById("burnAmount").value;
  const toChain = document.getElementById("toChain").value;
  const targetAddress = document.getElementById("targetAddress").value;
  if (!amount || !toChain || !targetAddress) {
    alert("⚠️ Fill all fields for bridge out");
    return;
  }

  try {
    const tx = await bridge.bridgeOut(ethers.utils.parseUnits(amount, 18), toChain, targetAddress);
    await tx.wait();
    alert("✅ BridgeOut successful");
  } catch (err) {
    console.error(err);
    alert("❌ BridgeOut failed");
  }
}

// Bridge IN
async function bridgeIn() {
  const amount = document.getElementById("mintAmount").value;
  const fromChain = document.getElementById("sourceChain").value;
  const mintTo = document.getElementById("mintTo").value;
  if (!amount || !fromChain || !mintTo) {
    alert("⚠️ Fill all fields for bridge in");
    return;
  }

  try {
    const tx = await bridge.bridgeIn(mintTo, ethers.utils.parseUnits(amount, 18), fromChain);
    await tx.wait();
    alert("✅ BridgeIn successful");
  } catch (err) {
    console.error(err);
    alert("❌ BridgeIn failed");
  }
}


