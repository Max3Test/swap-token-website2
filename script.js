<script>
  let web3Modal;
  let provider;
  let signer;
  let userAddress;

  async function toggleWalletInfo() {
    if (!provider) {
      await connectWallet();
      return;
    }
    const slideout = document.getElementById("walletSlideout");
    if (slideout.style.display === "none") {
      await updateBalances();
      slideout.style.display = "block";
    } else {
      slideout.style.display = "none";
    }
  }

  async function connectWallet() {
    const providerOptions = {
      injected: {
        display: {
          name: "MetaMask / Trust Wallet",
          description: "Connect using browser extension"
        },
        package: null
      },
      walletconnect: {
        package: window.WalletConnectProvider.default,
        options: {
          rpc: {
            1: "https://rpc.ankr.com/eth",
            56: "https://bsc-dataseed.binance.org/",
            137: "https://polygon-rpc.com",
            8453: "https://mainnet.base.org"
          },
          chainId: 8453
        }
      }
    };

    web3Modal = new window.Web3Modal.default({
      cacheProvider: false,
      providerOptions
    });

    try {
      const instance = await web3Modal.connect();
      provider = new ethers.providers.Web3Provider(instance);
      signer = provider.getSigner();
      userAddress = await signer.getAddress();

      document.getElementById("connectBtn").innerText = `🔌 ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
      document.getElementById("walletAddress").innerText = `Address: ${userAddress}`;
      await updateBalances();
    } catch (err) {
      console.error("Connection failed:", err);
      alert("❌ Failed to connect wallet");
    }
  }

  async function disconnectWallet() {
    if (web3Modal) {
      await web3Modal.clearCachedProvider();
      provider = null;
      signer = null;
      userAddress = null;
      document.getElementById("connectBtn").innerText = "🔗 Connect Wallet";
      document.getElementById("walletSlideout").style.display = "none";
      updateStakeBalances("0", "0");
    }
  }

  async function updateBalances() {
    if (!signer || !userAddress) return;

    const tokenAddress = "0x69b4086C7B131ED691d428e2BBa7cAcD4A4C641e"; //  MAX
    const wrapperAddress = "0x1cC6d610c190C7742FE7603987aBCa76e403CD0d"; // StMAX

    const abi = ["function balanceOf(address) view returns (uint256)"];
    const erc20 = new ethers.Contract(tokenAddress, abi, provider);
    const stmax = new ethers.Contract(wrapperAddress, abi, provider);

    const [balMax, balStmax] = await Promise.all([
      erc20.balanceOf(userAddress),
      stmax.balanceOf(userAddress)
    ]);

    const formattedMax = ethers.utils.formatUnits(balMax, 18);
    const formattedStmax = ethers.utils.formatUnits(balStmax, 18);

    document.getElementById("walletBalances").innerText = `MAX: ${formattedMax} | StMAX: ${formattedStmax}`;
    updateStakeBalances(formattedMax, formattedStmax);
  }
</script>
