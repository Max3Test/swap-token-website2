let provider;
let signer;

// Смена сети по chainId (в 16-ричной строке, напр. '0x1' для Ethereum mainnet)
async function switchNetwork(chainIdHex) {
  if (!window.ethereum) {
    return alert("Please install a compatible wallet (e.g. Metamask)");
  }
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }]
    });
    alert("✅ Network switched!");
  } catch (err) {
    // Если сеть не добавлена, можем предложить добавить
    console.error("Failed to switch network:", err);
    // Пример: if (err.code === 4902) { ... }
  }
}

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
    document.getElementById("connectBtn").innerText = `${shortAddress}`;
  } catch (err) {
    console.error("Connection failed:", err);
    alert("❌ Failed to connect wallet");
  }
}

// Stake (Wrap)
async function stakeTokens() {
  const amount = document.getElementById("stakeAmount").value;
  if (!amount || amount <= 0) {
    alert("Please enter a valid amount");
    return;
  }

  try {
    const tokenAddress = "0x69b4086C7B131ED691d428e2BBa7cAcD4A4C641e"; // Укажи адрес MAX
    const wrapperAddress = "0x1cC6d610c190C7742FE7603987aBCa76e403CD0d"; // Укажи адрес StMAX

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

// Unstake (Unwrap)
async function unstakeTokens() {
  const amount = document.getElementById("unstakeAmount").value;
  if (!amount || amount <= 0) {
    alert("Please enter a valid amount");
    return;
  }

async function bridgeWithAxelar(sourceChain, destChain, tokenSymbol, amount) {
  try {
    const environment = "mainnet";
    const axelar = new window.axelar.AxelarGMPRecoveryAPI({ environment });

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const userAddress = accounts[0];

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Указать адрес Axelar Gateway в вашей сети (например, Ethereum)
    const axelarGatewayAddress = "0x4cF4F9cD7f541E2070743b59D0aD016F28E9dC16"; // пример для Ethereum Mainnet
    const tokenAddress = "0x69b4086C7B131ED691d428e2BBa7cAcD4A4C641e"; // MAX

    const tokenABI = [
      "function approve(address spender, uint256 amount) external returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)"
    ];

    const gatewayABI = [
      "function sendToken(string calldata destinationChain, string calldata destinationAddress, string calldata symbol, uint256 amount) external"
    ];

    const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);
    const gatewayContract = new ethers.Contract(axelarGatewayAddress, gatewayABI, signer);

    const parsedAmount = ethers.utils.parseUnits(amount, 18);

    // Одобряем Gateway на перевод токена
    const allowance = await tokenContract.allowance(userAddress, axelarGatewayAddress);
    if (allowance.lt(parsedAmount)) {
      const approveTx = await tokenContract.approve(axelarGatewayAddress, parsedAmount);
      await approveTx.wait();
    }

    // Отправляем токен через Axelar Gateway
    const sendTx = await gatewayContract.sendToken(
      destChain,              // Целевая сеть (напр. "base")
      userAddress,            // Куда придут токены
      tokenSymbol,            // Символ токена (напр. "MAX")
      parsedAmount            // Сколько
    );

    await sendTx.wait();
    alert(`✅ Токен ${tokenSymbol} отправлен через Axelar в сеть ${destChain}`);

  } catch (err) {
    console.error("Axelar Bridge error:", err);
    alert("❌ Ошибка при попытке моста через Axelar");
  }
}


  try {
    const wrapperAddress = "0x1cC6d610c190C7742FE7603987aBCa76e403CD0d"; // Укажи адрес StMAX
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

