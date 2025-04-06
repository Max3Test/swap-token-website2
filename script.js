

    // ================ VARS ================
    let provider;
    let signer;

    // ================ SWITCH NETWORK ================
    async function switchNetwork(chainIdHex) {
      if (!window.ethereum) {
        return alert(\"Please install a compatible wallet (e.g. Metamask)\");
      }
      try {
        await window.ethereum.request({
          method: \"wallet_switchEthereumChain\",
          params: [{ chainId: chainIdHex }]
        });
        alert(\"✅ Network switched!\");
      } catch (err) {
        console.error(\"Failed to switch network:\", err);
      }
    }

    // ================ CONNECT WALLET ================
    async function connectWallet() {
      const providerOptions = {
        walletconnect: {
          package: window.WalletConnectProvider.default,
          options: {
            infuraId: \"1c54aa3c993b4d94b73c84e833971254\"
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
        document.getElementById(\"connectBtn\").innerText = `🔗 ${shortAddress}`;
      } catch (err) {
        console.error(\"Connection failed:\", err);
        alert(\"❌ Failed to connect wallet\");
      }
    }

    // ================ TABS ================
    window.addEventListener('DOMContentLoaded', () => {
      showTab('stake');
    });

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

    // ================ STAKE (Wrap) ================
    async function stakeTokens() {
      const amount = document.getElementById(\"stakeAmount\").value;
      if (!amount || amount <= 0) {
        alert(\"Please enter a valid amount\");
        return;
      }
      try {
        const tokenAddress = \"0x69b4086C7B131ED691d428e2BBa7cAcD4A4C641e\"; // MAX
        const wrapperAddress = \"0x1cC6d610c190C7742FE7603987aBCa76e403CD0d\"; // StMAX

        const tokenABI = [\"function approve(address spender, uint256 amount) external returns (bool)\"];
        const wrapperABI = [\"function deposit(uint256 amount) external\"];

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
        alert(\"❌ Deposit failed\");
      }
    }

    // ================ UNSTAKE (Unwrap) ================
    async function unstakeTokens() {
      const amount = document.getElementById(\"unstakeAmount\").value;
      if (!amount || amount <= 0) {
        alert(\"Please enter a valid amount\");
        return;
      }
      try {
        const wrapperAddress = \"0x1cC6d610c190C7742FE7603987aBCa76e403CD0d\"; // StMAX
        const wrapperABI = [\"function withdraw(uint256 amount) external\"];
        const wrapper = new ethers.Contract(wrapperAddress, wrapperABI, signer);
        const value = ethers.utils.parseUnits(amount, 18);

        const tx = await wrapper.withdraw(value);
        await tx.wait();

        alert(`✅ Successfully withdrew ${amount} tokens`);
      } catch (err) {
        console.error(err);
        alert(\"❌ Withdraw failed\");
      }
    }

    // ================ AXELAR BRIDGE ================
    async function getDepositAddress() {
      const fromChain = document.getElementById('fromChain').value;
      const toChain = document.getElementById('toChain').value;
      const symbol = document.getElementById('bridgeToken').value;
      const amount = document.getElementById('bridgeAmount').value;

      if (!window.ethereum) return alert(\"Wallet not found\");

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const userAddress = accounts[0];

      try {
        // NOTE: Using global from UMD: AxelarQueryAPI
        const axelar = new AxelarQueryAPI({ environment: 'mainnet' });
        const depositAddress = await axelar.getDepositAddress({
          fromChain,
          toChain,
          destinationAddress: userAddress,
          symbol
        });
        document.getElementById(\"depositResult\").innerHTML =
          `Send <strong>${amount} ${symbol}</strong> to:<br><code>${depositAddress}</code>`;
      } catch (err) {
        console.error(\"Axelar Bridge Error:\", err);
        alert(\"Failed to generate deposit address\");
      }
    }

