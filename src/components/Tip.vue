<template>
  <div class="tipper" v-if="tipOpen">
    <div>
      Tip {{tipRecipient}} for contributing {{tipId}}
    </div>
    <input type="number" v-model.number="amount" size="10" />
    <select v-model="token">
      <option value="REC">REC</option>
      <option value="mETH">mETH</option>
    </select>
    <button v-on:click="tip">Send</button>
    <button v-on:click="tipOpen = false">Cancel</button>
  </div>
</template>

<script>
import bases from 'bases';

export default {
  components: {
  },
  props: {
  },
  data(){
    return {
      amount: 1,
      token: "REC",
    }
  },
  computed: {
    account(){ return this.$store.state.account; },
    allowance(){ return this.$store.state.allowance; },
    blockNum(){ return this.$store.state.blockNum; },
    decimals(){ return this.$store.state.decimals; },
    tipId(){ return this.$store.state.tipId; },
    tipOpen: {
      get(){ return this.$store.state.tipOpen; },
      set(){ this.$store.commit("SET_TIP_OPEN", false); }
    },
    tipRecipient(){ return this.$store.state.tipRecipient; },
    ContentScore(){ return this.$store.state.contracts.ContentScore; },
    Registry(){ return this.$store.state.contracts.Registry; },
    Tipper(){ return this.$store.state.contracts.Tipper; }
  },
  methods: {
    async tip(){
      console.log(this.token, this.amount);

      let owner = this.Registry.methods.getOwner(web3.utils.asciiToHex(this.tipRecipient)).call({from: this.account})
      if( owner === "0x0000000000000000000000000000000000000000" ) return console.log("not a registered member");
        // let tip = web3.utils.toWei("0.015", 'ether');
        // await Tipper.methods.tipEther("1", commentId.toString(), web3.utils.toHex(recipient)).send({from: coinbase, value: tip, gas: 100000});
      await this.Tipper.methods.tipToken(
        "0",
        bases.fromBase36(this.tipId).toString(),
        web3.utils.toHex(this.tipRecipient),
        this.$store.state.contracts.Token._address,
        this.amount*Math.pow(10, this.decimals)
      ).send({from: this.account, gas: 200000});
    }
  }
}
</script>
<style>
  .tipper {
    position: fixed;
    top: 10%;
    right: 10%;
    z-index: 100;
    background-color: white;
    border: 1px solid black;
    padding: 6px;
  }
</style>
