<template>
  <div
    class="score"
    style="display: block; position: relative;"
    v-on:mouseover="active = true"
    v-on:mouseout="active = false">
    <!-- <logo :height="12" style="position: relative; top: 2px;" /> -->
    {{score}}
    <div v-if="active" style="display: flex; align-items: center; padding: 0.25rem 1rem; position: absolute; left: 100%; top: 100%; background-color: white; z-index: 100; transform: translateY(-70%); border: 1px solid black;">
      <div style="margin-right: 0.5rem;">
        <div class="arrow up" v-on:click.stop="vote(1)"></div>
        <div class="score" style="display: block; white-space: nowrap;">{{score}} / {{karmaScore}}</div>
        <div class="arrow down" v-on:click.stop="vote(2)"></div>
      </div>
      <button v-on:click="popupTip">Tip</button>
      <button :disabled="!market || market.ended" v-on:click="popupStake" :style="stakeStyle">Stake</button>
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
      karmaScore: 0,
      karmaRatio: 0,
      score: 0,
      market: null
    }
  },
  computed: {
    account(){ return this.$store.state.account; },
    allowance(){ return this.$store.state.allowance; },
    // redditId(){ return bases.toBase36(this.$store.state.tipId); },
    blockNum(){ return this.$store.state.blockNum; },
    ContentDAO(){ return this.$store.state.contracts.ContentDAO; },
    ContentScore(){ return this.$store.state.contracts.ContentScore; },
    decimals(){ return this.$store.state.decimals; },
    stakeStyle(){
      let color = {true:"#f44336", false: "#4caf50"};
      return {
        marginLeft: "1rem",
        backgroundColor: color[this.marketLiked] || ""
      }
    }
  },
  methods: {
    popupTip(){
      console.log(this.id, bases.toBase36(this.id));
      this.$store.commit("SET_TIP", {
        contentType: 0,
        id: this.id,
        recipient: this.author,
        contentUrl: this.url
      });
      this.$store.commit("SET_POPUP", true);
    },
    popupStake(){
      console.log(this.id, bases.toBase36(this.id));
      this.$store.commit("SET_MARKET", this.market);
      this.$store.commit("SET_POPUP", true);
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
    async getScore(){
      let scores = await this.ContentScore.methods.postScores(bases.fromBase36(this.id)).call();
      this.score = parseInt(scores.numUp) - parseInt(scores.numDown);
      let karmaUp = parseInt(scores.scoreUp);
      let karmaDown = parseInt(scores.scoreDown);
      this.karmaScore = karmaUp - karmaDown;
      this.karmaRatio = Math.round(karmaUp*100/(karmaUp + karmaDown)) || 0;
    },
    async syncMarket () {
      let idBase10 = bases.fromBase36(this.id);
      let market = await this.ContentDAO.methods.getPost(idBase10).call({from: this.account});
      let stage = parseInt(market.stage);
      if(stage) {
        this.market = {
          id: this.id,
          stage,
          ended: market.ended,
          feePaid: market.feePaid,
          liked: market.liked,
          stake: {
            false: parseInt(market.stakeDown)/Math.pow(10, this.decimals),
            true: parseInt(market.stakeUp)/Math.pow(10, this.decimals)
          },
          total: {
            false: parseInt(market.totalDown)/Math.pow(10, this.decimals),
            true: parseInt(market.totalUp)/Math.pow(10, this.decimals)
          },
          startedAt: parseInt(market.startedAt),
          track: parseInt(market.track),
          voted: market.voted,
          contentUrl: this.url
        };
      } else {
        this.market = { id: this.id, stage };
      }
    }
  },
  async created(){
    await this.getScore();
    await this.syncMarket();
  }
}
</script>
