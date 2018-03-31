import Vue from 'vue'
import Vuex from 'vuex'
import Web3 from 'web3';
import decamelize from 'decamelize';
import bases from 'bases';
import { NETWORKS } from './constants.json';
import RegistryArtifacts from 'artifacts/Registry.json';
import TokenArtifacts from 'artifacts/Token.json';
import ContentScoreArtifacts from 'artifacts/ContentScore.json';
import TipperArtifacts from 'artifacts/Tipper.json';

Vue.use(Vuex)

const state = {
  account: null,
  tipId: null,
  tipOpen: false,
  tipRecipient: null,
  allowance: 0,
  balance: null,
  blockNum: null,
  decimals: null,
  network: null,
  username: null,
  contracts: {},
  web3: null
}

const mutations = {
}

for (var key in state) {
  let defaultSetMutation = `SET_${decamelize(key).toUpperCase()}`;
  if(!(defaultSetMutation in mutations)) {
    mutations[defaultSetMutation] = createDefaultSetMutator(key);
    // console.log(defaultSetMutation, mutations[defaultSetMutation])
  }
}

function createDefaultSetMutator(key){
  return function(state, val){
    state[key] = val;
  }
}

const actions = {
  incrementAsync ({ commit }) {
    setTimeout(() => {
      commit('INCREMENT')
    }, 200)
  },
  async setAccount ({commit, dispatch, state}, account) {
    console.log("setAccount")
    commit("SET_ACCOUNT", account);
    if(!!account) {
      await dispatch("setAllowance");
      return dispatch("setUsername");
    }
  },
  setAllowance ({commit, dispatch, state}) {
    let {Token, Tipper} = state.contracts;
    return Token.methods.allowance(state.account, Tipper._address).call().then(res=>commit("SET_ALLOWANCE", res/Math.pow(10, state.decimals)));
  },
  setDecimals ({ commit, state }) {
    let {Token} = state.contracts;
    return Token.methods.decimals().call().then(res=>commit("SET_DECIMALS", res));
  },
  setBalance ({ commit, state }) {
    let {Token} = state.contracts;
    return Token.methods.balanceOf(state.account).call().then(res=>commit("SET_BALANCE", res/Math.pow(10, state.decimals)));
  },
  setContracts ({commit, dispatch, state}) {
    let contracts = [ContentScoreArtifacts, TokenArtifacts, RegistryArtifacts, TipperArtifacts].reduce((prev, artifacts)=>{
      prev[artifacts.contractName] = new web3.eth.Contract(artifacts.abi, artifacts.networks["4"].address);
      return prev;
    }, {});
    commit("SET_CONTRACTS", contracts);
  },
  setNetwork ({ commit, state }) {
    return window.web3.eth.net.getId()
      .then(id=>{
        switch (id) {
          case 1:
            commit("SET_NETWORK", NETWORKS.MAIN);
            return NETWORKS.MAIN;
          case 2:
            commit("SET_NETWORK", NETWORKS.MORDEN);
            return NETWORKS.MORDEN;
          case 3:
            commit("SET_NETWORK", NETWORKS.ROPSTEN);
            return NETWORKS.ROPSTEN;
          case 4:
            commit("SET_NETWORK", NETWORKS.RINKEBY);
            return NETWORKS.RINKEBY;
          case 42:
            commit("SET_NETWORK", NETWORKS.KOVAN);
            return NETWORKS.KOVAN;
          default:
            commit("SET_NETWORK", NETWORKS.OTHER);
            return NETWORKS.OTHER;
        }
      });
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
