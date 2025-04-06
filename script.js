
window.bridgeWithAxelar = async function (sourceChain, destChain, tokenSymbol, amount) {
  try {
    console.log("🚀 bridgeWithAxelar called with:", sourceChain, destChain, tokenSymbol, amount);

    const environment = "mainnet";
    const axelar = new window.axelar.AxelarGMPRecoveryAPI({ environment });

    if (!window.ethereum) {
      alert("❌ No wallet detected");
      return;
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const userAddress = accounts[0];

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const axelarGatewayAddress = "0x4cF4F9cD7f541E2070743b59D0aD016F28E9dC16"; // Base Mainnet Gateway
    const tokenAddress = "0x..."; // ⬅️ Вставьте адрес вашего токена MAX

    console.log("Token Address:", tokenAddress);
    console.log("Gateway Address:", axelarGatewayAddress);

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

    const allowance = await tokenContract.allowance(userAddress, axelarGatewayAddress);
    if (allowance.lt(parsedAmount)) {
      const approveTx = await tokenContract.approve(axelarGatewayAddress, parsedAmount);
      await approveTx.wait();
      console.log("✅ Token approved");
    }

    const sendTx = await gatewayContract.sendToken(
      destChain,
      userAddress,
      tokenSymbol,
      parsedAmount
    );

    await sendTx.wait();
    alert(`✅ Токен ${tokenSymbol} отправлен через Axelar в сеть ${destChain}`);
    console.log("✅ Bridge transaction completed");

  } catch (err) {
    console.error("Axelar Bridge error:", err);
    alert("❌ Ошибка при попытке моста через Axelar");
  }
};
