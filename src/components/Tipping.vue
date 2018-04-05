<template>
  <div>
    <h3>Tipping</h3>
    <p>
      Tip <a :href="`https://www.reddit.com/u/${tip.recipient}`" target="_blank">u/{{tip.recipient}}</a> for <a :href="`http://www.reddit.com${this.tip.contentUrl}`" target="_blank">{{CONTENT_TYPES[this.tip.contentType]}}:{{tip.id}}</a>
    </p>
    <div style="margin: 1rem 0">
      <input type="number" v-model.number="amount" style="width: 5rem;" />
      <select v-model="token">
        <option value="REC">REC</option>
        <option value="mETH">mETH</option>
      </select>
      <div v-if="token !== 'mETH'">
        <p v-if="allowance < amount" style="margin: 0.25rem 0;">To send {{amount}} {{token}} you need to allow the RECDAO Tipper contract to transfer at least {{amount}} on your behalf.</p>
        <p style="margin: 0.25rem 0;">The Tipper contract is currently allowed to transfer {{allowance}} {{token}}.</p>
        <input type="number" v-model.number="allowanceInput" style="width: 5rem;" />
        <button v-on:click="updateAllowance" style="background-color: #4caf50">Update</button>
      </div>
    </div>
    <div style="display: flex; justify-content: flex-end;">
      <button :disabled="allowance < amount" v-on:click="doTip" style="background-color: #4caf50;">Send</button>
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
    tip: Object
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
    allowance(){ return this.$store.state.tipAllowance; },
    allowanceInput: {
      get(){ return this.newAllowance !== null ? this.newAllowance : this.$store.state.tipAllowance; },
      set(value){ this.newAllowance = value; }
    },
    blockNum(){ return this.$store.state.blockNum; },
    decimals(){ return this.$store.state.decimals; },
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
    async doTip(){
      console.log(this.token, this.amount, this.tip.contentType);

      let owner = this.Registry.methods.getOwner(web3.utils.asciiToHex(this.tip.recipient)).call({from: this.account})
      if( owner === "0x0000000000000000000000000000000000000000" ) return console.log("not a registered member");
        // let tip = web3.utils.toWei("0.015", "ether");
      switch(this.token){
        case "REC":
          return await this.Tipper.methods.tipToken(
            this.tip.contentType.toString(),
            bases.fromBase36(this.tip.id).toString(),
            web3.utils.toHex(this.tip.recipient),
            this.$store.state.contracts.Token._address,
            this.amount*Math.pow(10, this.decimals)
          ).send({from: this.account, gas: 150000});
          break;
        case "mETH":
          let tip = web3.utils.toWei(this.amount.toString(), "finney");
          return await this.Tipper.methods.tipEther(
            this.tip.contentType.toString(),
            bases.fromBase36(this.tip.id).toString(),
            web3.utils.toHex(this.tip.recipient),
          ).send({from: this.account, value: tip, gas: 100000});
          break;
      }
    },
    async updateAllowance(){
      console.log(this.newAllowance)
      await this.Token.methods.approve(this.Tipper._address, this.newAllowance*Math.pow(10, this.decimals)).send({from: this.account, gas: 100000});
      await this.$store.dispatch("setTipAllowance");
    }
  }
}
</script>
