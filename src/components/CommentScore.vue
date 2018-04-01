<template>
  <span
    class="score"
    style="display: inline; position: relative; margin-left: 2px;"
    v-on:mouseover="active = true; over = true"
    v-on:mouseout="over = false">
    <logo :height="12" style="position: relative; top: 2px;" />
    <span v-if="active">{{score}}</span>
    <div v-if="over" style="display: flex; align-items: center; padding: 0.25rem 1rem; position: absolute; left: 100%; top: 0; background-color: white; z-index: 100; border: 1px solid black;">
      <div style="margin-right: 0.5rem;">
        <div class="arrow up" v-on:click.stop="vote(1)"></div>
        <div class="arrow down" v-on:click.stop="vote(2)"></div>
      </div>
      <button v-on:click="tipOpen">Tip</button>
    </div>
  </span>
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
    tipOpen(){
      console.log(this.id);
      this.$store.commit("SET_TIP_CONTENT_TYPE", 1);
      this.$store.commit("SET_TIP_ID", this.id);
      this.$store.commit("SET_TIP_RECIPIENT", this.author);
      this.$store.commit("SET_TIP_CONTENT_URL", this.url);
      this.$store.commit("SET_TIP_OPEN", true);
    },
    vote(prefId){
      console.log(typeof prefId)
      this.ContentScore.methods.vote(1, bases.fromBase36(this.id), prefId).send({from: this.account, gas: 200000})
        .then(console.log);
      // this.$store.dispatch("addTransaction", {
      //   label: `Vote ${prefId} @prop:${this.proposal.id}`,
      //   promise: ()=>RECDAO.methods.vote(this.proposal.id, prefId).send({from: this.account, gas: 200000}),
      //   success: ()=>this.$store.dispatch("setProposals")
      // });
    },
    getScore(){
      this.ContentScore.methods.commentScores(bases.fromBase36(this.id)).call()
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
