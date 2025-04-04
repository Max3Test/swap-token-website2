let provider;
let signer;
let contract;

const CONTRACT_ADDRESS = "0x..."; // 👉 вставь сюда адрес своего смарт-контракта
const ABI = [
  // Минимальный ABI для вызова swap функции
  "function swap(uint256 amount) public"
];

async function connect() {
  if (!window.ethereum) return alert("Установи MetaMask!");

  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();

  contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  document.getElementById("status").innerText = "✅ Wallet connected!";
}

async function swap() {
  if (!contract) return alert("Сначала подключи кошелек!");

  const amount = document.getElementById("amount").value;
  if (!amount) return alert("Введите количество!");

  try {
    const tx = await contract.swap(ethers.utils.parseEther(amount));
    document.getElementById("status").innerText = "⏳ Swapping...";
    await tx.wait();
    document.getElementById("status").innerText = "✅ Swap successful!";
  } catch (err) {
    console.error(err);
    document.getElementById("status").innerText = "❌ Ошибка при обмене";
  }
}
