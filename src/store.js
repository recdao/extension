import Vue from 'vue'
import Vuex from 'vuex'
import Token from 'contracts/Token';
import Registry from 'contracts/Registry';

Vue.use(Vuex)

const state = {
  account: null,
  balance: null,
  blockNum: null,
  count: 0,
  decimals: null,
  network: null,
  username: null
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
  SET_NETWORK (state, network) {
    state.network = network;
  },
  SET_USERNAME (state, username) {
    state.username = username;
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
    return dispatch("setUsername");
  },
  setBalance ({ commit, state }) {
    return Token.methods.balanceOf(state.account).call().then(res=>commit("SET_BALANCE", res/Math.pow(10, state.decimals)));
  },
  setUsername ({ commit, dispatch, state }) {
    return Registry.methods.ownerToUsername(state.account).call()
      .then(web3.utils.hexToUtf8)
      .then(username=>commit("SET_USERNAME", username))
      .then(()=>dispatch("setBalance"));
  }
}

const store = new Vuex.Store({
  state,
  mutations,
  actions
})

export default store
