<template>
  <span
    class="score"
    style="display: inline; position: relative;"
    v-on:mouseover="active = true; over = true"
    v-on:mouseout="over = false">
    <logo :height="12" style="position: relative; top: 2px;" />
    <span v-if="active">{{score}}</span>
    <div v-if="over" style="position: absolute; left: 100%; top: 0; background-color: white; z-index: 100;">
      <div class="arrow up" v-on:click.stop="vote(1)"></div>
      <div class="arrow down" v-on:click.stop="vote(2)"></div>
    </div>
  </span>
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
      over: null,
      score: 0
    }
  },
  watch: {
    active(){this.getScore();}
  },
  computed: {
    account(){ return this.$store.state.account; },
    blockNum(){ return this.$store.state.blockNum; },
    ContentScore(){ return this.$store.state.contracts.ContentScore; }
  },
  methods: {
    vote(prefId){
      console.log(typeof prefId)
      this.ContentScore.methods.vote(1, this.id, prefId).send({from: this.account, gas: 200000})
        .then(console.log);
      // this.$store.dispatch("addTransaction", {
      //   label: `Vote ${prefId} @prop:${this.proposal.id}`,
      //   promise: ()=>RECDAO.methods.vote(this.proposal.id, prefId).send({from: this.account, gas: 200000}),
      //   success: ()=>this.$store.dispatch("setProposals")
      // });
    },
    getScore(){
      this.ContentScore.methods.commentScores(this.id).call()
        .then(scores=>{
          this.score = scores.numUp - scores.numDown;
          // this.score = this.scoreUp - this.scoreDown;
        })
        // .then(console.log)
        // .then(score=>this.score=score);
    }
  },
  created(){
    // this.getScore();
  }
}
</script>
