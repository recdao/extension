<template>
  <div
    class="score"
    style="display: block; position: relative;"
    v-on:mouseover="active = true"
    v-on:mouseout="active = false">
    <!-- <logo :height="12" style="position: relative; top: 2px;" /> -->
    {{score}}
    <div v-if="active" style="position: absolute; left: 100%; top: 100%; background-color: white; z-index: 100; transform: translateY(-70%); width: 60px; border: 1px solid black;">
      <div class="arrow up" v-on:click.stop="vote(1)"></div>
      <div class="score">{{score}} / {{karmaScore}}</div>
      <div class="arrow down" v-on:click.stop="vote(2)"></div>
    </div>
  </div>
</template>

<script>
import Logo from './Logo';

export default {
  components: {
    Logo
  },
  props: {
    id: Number
  },
  data(){
    return {
      active: null,
      score: 0,
      karmaScore: 0
    }
  },
  computed: {
    account(){ return this.$store.state.account; },
    blockNum(){ return this.$store.state.blockNum; },
    ContentScore(){ return this.$store.state.contracts.ContentScore; }
  },
  methods: {
    vote(prefId){
      // console.log(typeof prefId)
      this.ContentScore.methods.vote(0, this.id, prefId).send({from: this.account, gas: 200000})
        .then(console.log);
      // this.$store.dispatch("addTransaction", {
      //   label: `Vote ${prefId} @prop:${this.proposal.id}`,
      //   promise: ()=>RECDAO.methods.vote(this.proposal.id, prefId).send({from: this.account, gas: 200000}),
      //   success: ()=>this.$store.dispatch("setProposals")
      // });
    },
    getScore(){
      this.ContentScore.methods.postScores(this.id).call()
        .then(scores=>{
          // console.log(scores)
          this.score = parseInt(scores.numUp) - parseInt(scores.numDown);
          this.karmaScore = parseInt(scores.scoreUp) - parseInt(scores.scoreDown);
        })
    }
  },
  created(){
    this.getScore();
  }
}
</script>
