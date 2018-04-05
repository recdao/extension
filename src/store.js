import Vue from 'vue'
import Vuex from 'vuex'
import Web3 from 'web3';
import decamelize from 'decamelize';
import bases from 'bases';
import { NETWORKS } from './constants.json';
import RegistryArtifacts from 'artifacts/Registry.json';
import TokenArtifacts from 'artifacts/Token.json';
import ContentDAOArtifacts from 'artifacts/ContentDAO.json';
import ContentScoreArtifacts from 'artifacts/ContentScore.json';
import TipperArtifacts from 'artifacts/Tipper.json';

Vue.use(Vuex)

const state = {
  account: null,
  balance: null,
  blockNum: null,
  contracts: {},
  decimals: null,
  market: null,
  network: null,
  posts: {},
  tip: null,
  tipAllowance: 0,
  stakeAllowance: 0,
  popup: false,
  username: null,
  web3: null
}

const mutations = {
  SET_POST (state, post) {
    Vue.set(state.posts, post.id, post);
  }
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
      await dispatch("setBalance");
      await dispatch("setTipAllowance");
      await dispatch("setStakeAllowance");
      return await dispatch("setUsername");
    }
  },
  setTipAllowance ({commit, dispatch, state}) {
    let {Token, Tipper} = state.contracts;
    return Token.methods.allowance(state.account, Tipper._address).call().then(res=>commit("SET_TIP_ALLOWANCE", res/Math.pow(10, state.decimals)));
  },
  setStakeAllowance ({commit, dispatch, state}) {
    let {Token, ContentDAO} = state.contracts;
    return Token.methods.allowance(state.account, ContentDAO._address).call().then(res=>commit("SET_STAKE_ALLOWANCE", res/Math.pow(10, state.decimals)));
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
    let contracts = [ContentDAOArtifacts, ContentScoreArtifacts, TokenArtifacts, RegistryArtifacts, TipperArtifacts].reduce((prev, artifacts)=>{
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
  async syncActiveMarket ({ commit, state }) {
    let {ContentDAO} = state.contracts;
    let id = state.market.id;
    if(!id) return;
    let idBase10 = bases.fromBase36(id);
    let market = await ContentDAO.methods.getPost(idBase10).call({from: state.account});
    if(id !== state.market.id) {
      console.warn(`market has changed, disregarding ${id}`);
      return;
    }
    let stage = parseInt(market.stage);
    if(stage) {
      commit("SET_MARKET", {
        id: state.market.id,
        stage,
        ended: market.ended,
        feePaid: market.feePaid,
        liked: market.liked,
        stake: {
          false: parseInt(market.stakeDown)/Math.pow(10, state.decimals),
          true: parseInt(market.stakeUp)/Math.pow(10, state.decimals)
        },
        total: {
          false: parseInt(market.totalDown)/Math.pow(10, state.decimals),
          true: parseInt(market.totalUp)/Math.pow(10, state.decimals)
        },
        startedAt: parseInt(market.startedAt),
        track: parseInt(market.track),
        voted: market.voted,
      });
    }
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
