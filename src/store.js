import Vue from 'vue'
import Vuex from 'vuex'
import Web3 from 'web3';
import RegistryArtifacts from 'artifacts/Registry.json';
import TokenArtifacts from 'artifacts/Token.json';
import ContentScoreArtifacts from 'artifacts/ContentScore.json';

Vue.use(Vuex)

const state = {
  account: null,
  balance: null,
  blockNum: null,
  count: 0,
  decimals: null,
  network: null,
  username: null,
  contracts: {},
  web3: null
}

const mutations = {
  INCREMENT (state, account) {
    state.count++;
  },
  SET_ACCOUNT (state, account) {
    state.account = account;
  },
  SET_BLOCK_NUM (state, blockNum) {
    state.blockNum = blockNum;
  },
  SET_BALANCE (state, balance) {
    state.balance = balance;
  },
  SET_CONTRACTS (state, contracts) {
    state.contracts = contracts;
  },
  SET_NETWORK (state, network) {
    state.network = network;
  },
  SET_USERNAME (state, username) {
    state.username = username;
  },
  SET_WEB3 (state, web3) {
    state.web3 = web3;
  }
}

const actions = {
  incrementAsync ({ commit }) {
    setTimeout(() => {
      commit('INCREMENT')
    }, 200)
  },
  setAccount ({commit, dispatch, state}, account) {
    console.log("setAccount")
    commit("SET_ACCOUNT", account);
    if(!!account) return dispatch("setUsername");
  },
  setBalance ({ commit, state }) {
    let {Token} = state.contracts;
    return Token.methods.balanceOf(state.account).call().then(res=>commit("SET_BALANCE", res/Math.pow(10, state.decimals)));
  },
  setContracts ({commit, dispatch, state}) {
    let contracts = [ContentScoreArtifacts, TokenArtifacts, RegistryArtifacts].reduce((prev, artifacts)=>{
      prev[artifacts.contractName] = new web3.eth.Contract(artifacts.abi, artifacts.networks["4"].address);
      return prev;
    }, {});
    commit("SET_CONTRACTS", contracts);
  },
  setUsername ({ commit, dispatch, state }) {
    let {Registry} = state.contracts;
    return Registry.methods.ownerToUsername(state.account).call()
      .then(web3.utils.hexToUtf8)
      .then(username=>commit("SET_USERNAME", username))
      .then(()=>dispatch("setBalance"));
  },
  setWeb3 ({ commit, state }) {
    return new Promise((resolve, reject)=>{
      if (typeof web3 !== 'undefined') {
        console.log('Web3 injected browser: OK.')
        window.web3 = new Web3(window.web3.currentProvider);
        commit("SET_WEB3", window.web3)
        resolve(web3);
      } else {
        reject("Web3 not found. Install the MetaMask browser plugin or use a dapp browser like Mist.")
      }
    })
  }
}

const store = new Vuex.Store({
  state,
  mutations,
  actions
})

export default store
