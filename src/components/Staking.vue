<template>
  <div>
    <h3>Staking</h3>
    <p v-if="market.ended">
      This market has ended. For now, please use the <a target="_blank" href="http://curator.recdao.org:3000">main dapp</a> for withdrawing.
    </p>
    <p v-else-if="market.stage === 2">
      This market is in adjudication. For now, please use the <a target="_blank" href="http://curator.recdao.org:3000">main dapp</a> to adjudicate this market.
    </p>
    <div v-else>
      <p v-if="market.stage === 0">
        The minimum stake to open this market is 10 REC.
      </p>
      <p v-else>
        This market is currently <span style="font-weight: bold;">{{market.liked ? "supported" : "rejected"}}</span> and needs stakes amounting to {{toFlip}} REC to flip.
      </p>
      <input type="number" v-model.number="stake" style="width: 5rem;" /> REC
      <p v-if="allowance < amount" style="margin: 0.25rem 0;">To send {{amount}} {{token}} you need to allow the RECDAO Tipper contract to transfer at least {{amount}} on your behalf.</p>
      <p style="margin: 0.25rem 0;">The smart contract is currently allowed to transfer {{allowance}} REC.</p>
      <input type="number" v-model.number="allowanceInput" style="width: 5rem;" />
      <button v-on:click="updateAllowance" style="background-color: #4caf50">Update</button>
      <div style="display: flex; justify-content: space-between; margin-top: 1rem;">
        <button :disabled="allowance < amount || market.liked === false" v-on:click="doStake(false)" style="background-color: #f44336;">Reject</button>
        <button :disabled="allowance < amount || market.liked === true" v-on:click="doStake(true)" style="background-color: #4caf50;">Support</button>
      </div>
    </div>
  </div>
</template>

<script>
import bases from "bases";
import {CONTENT_TYPES} from "../constants";

export default {
  components: {
  },
  props: {
    market: Object
  },
  data(){
    return {
      amount: null,
      newAllowance: null
    }
  },
  computed: {
    account(){ return this.$store.state.account; },
    balance(){ return this.$store.state.balance; },
    allowance(){ return this.$store.state.stakeAllowance; },
    allowanceInput: {
      get(){ return this.newAllowance !== null ? this.newAllowance : this.$store.state.stakeAllowance; },
      set(value){ this.newAllowance = value; }
    },
    stake: {
      get(){ return this.amount !== null ? this.amount : this.market.stage ? this.toFlip : 10 },
      set(value){ this.amount = value; }
    },
    toFlip(){ return 2*this.market.total[this.market.liked] - this.market.total[!this.market.liked]; },
    blockNum(){ return this.$store.state.blockNum; },
    decimals(){ return this.$store.state.decimals; },
    Token(){ return this.$store.state.contracts.Token; },
    ContentDAO(){ return this.$store.state.contracts.ContentDAO; }
  },
  watch: {
  },
  methods: {
    async doStake(vote){
      console.log(this.market, this.stake);
      if(this.stake > this.balance) {
        alert(`You cannot stake an amount (${this.stake}) greater than your REC balance (${this.balance}).`);
        return;
      }
      if(this.stake > this.allowance) {
        alert(`Please increase your allowance to at least ${this.stake}.`);
        return;
      }
      let args = [bases.fromBase36(this.market.id), vote, this.stake*Math.pow(10, this.decimals)]
      console.log(args)
      // this.$store.dispatch("watch", this.post);
      let tx = await this.ContentDAO.methods.stake(...args).send({from: this.account, gas: 250000});
      await this.$store.dispatch("syncActiveMarket");
    },
    async updateAllowance(){
      console.log(this.newAllowance)
      await this.Token.methods.approve(this.ContentDAO._address, this.newAllowance*Math.pow(10, this.decimals)).send({from: this.account, gas: 100000});
      await this.$store.dispatch("setStakeAllowance");
    }
  }
}
</script>
