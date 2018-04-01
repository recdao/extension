<template>
  <div class="tipper" v-if="tipOpen">
    <span v-on:click="tipOpen = false" class="close">&#10060;</span>
    <div>
      Tip <a :href="`https://www.reddit.com/u/${tipRecipient}`" target="_blank">u/{{tipRecipient}}</a> for <a :href="`http://www.reddit.com${this.tipContentUrl}`" target="_blank">{{CONTENT_TYPES[this.tipContentType]}}:{{tipId}}</a>
    </div>
    <div style="margin: 1rem 0">
      <input type="number" v-model.number="amount" style="width: 5rem;" />
      <select v-model="token">
        <option value="REC">REC</option>
        <option value="mETH">mETH</option>
      </select>
      <div v-if="token !== 'mETH'">
        <p v-if="allowance < amount" style="margin: 0.25rem 0;">To send {{amount}} {{token}} you need to allow the RECDAO Tipper contract to transfer at least {{amount}} on your behalf.</p>
        <p style="margin: 0.25rem 0;">The contract is currently allowed to transfer {{allowance}} {{token}}.</p>
        <input type="number" v-model.number="allowanceInput" style="width: 5rem;" />
        <button v-on:click="updateAllowance" style="background-color: #4caf50">Update</button>
      </div>
    </div>
    <div>
      <button v-on:click="tipOpen = false" style="background-color: #f44336">Cancel</button>
      <button :disabled="allowance < amount" v-on:click="tip" style="background-color: #4caf50; float: right;">Send</button>
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
  },
  data(){
    return {
      amount: 1,
      token: "REC",
      CONTENT_TYPES,
      newAllowance: null
    }
  },
  computed: {
    account(){ return this.$store.state.account; },
    allowance(){ return this.$store.state.allowance; },
    allowanceInput: {
      get(){ return this.newAllowance !== null ? this.newAllowance : this.$store.state.allowance; },
      set(value){ this.newAllowance = value; }
    },
    blockNum(){ return this.$store.state.blockNum; },
    decimals(){ return this.$store.state.decimals; },
    tipContentType(){ return this.$store.state.tipContentType; },
    tipContentUrl(){ return this.$store.state.tipContentUrl; },
    tipId(){ return this.$store.state.tipId; },
    tipOpen: {
      get(){ return this.$store.state.tipOpen; },
      set(){ this.$store.commit("SET_TIP_OPEN", false); }
    },
    tipRecipient(){ return this.$store.state.tipRecipient; },
    ContentScore(){ return this.$store.state.contracts.ContentScore; },
    Registry(){ return this.$store.state.contracts.Registry; },
    Tipper(){ return this.$store.state.contracts.Tipper; },
    Token(){ return this.$store.state.contracts.Token; }
  },
  watch: {
    async token(value){
      console.log("Token", value)
    }
  },
  methods: {
    async tip(){
      console.log(this.token, this.amount, this.tipContentType);

      let owner = this.Registry.methods.getOwner(web3.utils.asciiToHex(this.tipRecipient)).call({from: this.account})
      if( owner === "0x0000000000000000000000000000000000000000" ) return console.log("not a registered member");
        // let tip = web3.utils.toWei("0.015", "ether");
      switch(this.token){
        case "REC":
          return await this.Tipper.methods.tipToken(
            this.tipContentType.toString(),
            bases.fromBase36(this.tipId).toString(),
            web3.utils.toHex(this.tipRecipient),
            this.$store.state.contracts.Token._address,
            this.amount*Math.pow(10, this.decimals)
          ).send({from: this.account, gas: 150000});
          break;
        case "mETH":
          let tip = web3.utils.toWei(this.amount.toString(), "finney");
          return await this.Tipper.methods.tipEther(
            this.tipContentType.toString(),
            bases.fromBase36(this.tipId).toString(),
            web3.utils.toHex(this.tipRecipient),
          ).send({from: coinbase, value: tip, gas: 100000});
          break;
      }
    },
    async updateAllowance(){
      console.log(this.newAllowance)
      await this.Token.methods.approve(this.Tipper._address, this.newAllowance*Math.pow(10, this.decimals)).send({from: this.account, gas: 100000});
      await this.$store.dispatch("setAllowance");
    }
  }
}
</script>
<style>
  .tipper {
    position: fixed;
    width: 300px;
    top: 16px;
    right: 16px;
    z-index: 100;
    background-color: white;
    border: 4px solid black;
    padding: 2rem 1rem 1rem 1rem;
    box-sizing: border-box;
  }
  .tipper > .close {
    position: absolute;
    right: 0.45rem;
    top: 0.25rem;
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
  }
</style>
