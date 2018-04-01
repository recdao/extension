<template>
  <div
    class="score"
    style="display: block; position: relative;"
    v-on:mouseover="active = true"
    v-on:mouseout="active = false">
    <!-- <logo :height="12" style="position: relative; top: 2px;" /> -->
    {{score}}
    <div v-if="active" style="padding: 8px 0; position: absolute; left: 100%; top: 100%; background-color: white; z-index: 100; transform: translateY(-70%); width: 60px; border: 1px solid black;">
      <div class="arrow up" v-on:click.stop="vote(1)"></div>
      <div class="score" style="display: block">{{score}} / {{karmaScore}}</div>
      <div class="arrow down" v-on:click.stop="vote(2)"></div>
      <button v-on:click="tipOpen" style="margin-top: 6px;">Tip</button>
    </div>
  </div>
</template>

<script>
import Logo from './Logo';
import bases from 'bases';

export default {
  components: {
    Logo
  },
  props: {
    id: String,
    author: String,
    url: String
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
    allowance(){ return this.$store.state.allowance; },
    // redditId(){ return bases.toBase36(this.$store.state.tipId); },
    blockNum(){ return this.$store.state.blockNum; },
    ContentScore(){ return this.$store.state.contracts.ContentScore; }
  },
  methods: {
    tipOpen(){
      console.log(this.id, bases.toBase36(this.id));
      this.$store.commit("SET_TIP_CONTENT_TYPE", 0);
      this.$store.commit("SET_TIP_ID", this.id);
      this.$store.commit("SET_TIP_RECIPIENT", this.author);
      this.$store.commit("SET_TIP_CONTENT_URL", this.url);
      this.$store.commit("SET_TIP_OPEN", true);
    },
    vote(prefId){
      // console.log(typeof prefId)
      this.ContentScore.methods.vote(0, bases.fromBase36(this.id), prefId).send({from: this.account, gas: 200000})
        .then(console.log);
      // this.$store.dispatch("addTransaction", {
      //   label: `Vote ${prefId} @prop:${this.proposal.id}`,
      //   promise: ()=>RECDAO.methods.vote(this.proposal.id, prefId).send({from: this.account, gas: 200000}),
      //   success: ()=>this.$store.dispatch("setProposals")
      // });
    },
    getScore(){
      // console.log(this.id, bases.fromBase36(this.id))
      this.ContentScore.methods.postScores(bases.fromBase36(this.id)).call()
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
