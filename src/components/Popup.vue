<template>
  <div class="popup" v-if="popup">
    <span v-on:click="popup = false" class="close">&#10060;</span>
    <tipping v-if="tip" :tip="tip"></tipping>
    <hr v-if="market && tip" style="margin: 1rem 0;"/>
    <staking v-if="market" :market="market"></staking>
  </div>
</template>

<script>
import Staking from './Staking';
import Tipping from './Tipping';

export default {
  components: {
    Staking,
    Tipping
  },
  props: {
  },
  data(){
    return {
    }
  },
  computed: {
    tip(){ return this.$store.state.tip; },
    popup: {
      get(){ return this.$store.state.popup; },
      set(){ this.$store.commit("SET_POPUP", false); }
    },
    market(){ return this.$store.state.market; }
  },
  methods: {
  }
}
</script>
<style>
  .popup {
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
  .popup > .close {
    position: absolute;
    right: 0.45rem;
    top: 0.25rem;
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
  }
</style>
