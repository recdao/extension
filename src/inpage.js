import Vue from 'vue'
import store from './store';
import { NETWORKS } from './constants.json';
import PostScore from './components/PostScore';
import CommentScore from './components/CommentScore';
import bases from 'bases';
import * as unique from 'array-unique';
import Registry from 'contracts/Registry';
import * as Promise from 'bluebird';

setNetwork()
  .then(()=>console.log(store.state.network))
  .then(()=>setAccount())
  .then(poll)
  .then(()=>setInterval(poll, 2000))
  .then(()=>preparePostScores())
  .then(()=>prepareCommentScores())
  .then(()=>prepareUsers());

function preparePostScores(){
  let idPrefix = "thing_t3";
  let $posts = document.querySelectorAll(`[id^='${idPrefix}']`);
  $posts.forEach(($post, idx) => {
    let idB36 = $post.id.replace(idPrefix, "");
    let id = bases.fromBase36(idB36);
    let span = document.createElement('span');
    let $redditScore = $post.getElementsByClassName('midcol')[0];
    $redditScore.insertBefore(span, $redditScore.getElementsByClassName('arrow down')[0]);
    const score = new Vue({
      ...PostScore,
      store,
      propsData: {id}
    })
    score.$mount(span);
  });
}

function prepareCommentScores(){
  let idPrefix = "thing_t1";
  let $comments = document.querySelectorAll(`[id^='${idPrefix}']`);
  $comments.forEach(($comment, idx) => {
    let idB36 = $comment.id.replace(idPrefix, "");
    let id = bases.fromBase36(idB36);
    let span = document.createElement('span');
    let $tagline = $comment.getElementsByClassName('tagline')[0];
    $tagline.insertBefore(span, $tagline.getElementsByTagName('time')[0]);
    const score = new Vue({
      ...CommentScore,
      store,
      propsData: {id}
    })
    score.$mount(span);
  });
}

function prepareUsers(){
  let $authors = document.querySelectorAll('.thing a[href*="reddit.com/user/"]');
  // const usernames = noDupe([...$authors].map(a=>a.innerText));
  let usernames = unique([...$authors].map(a=>a.innerText));
  console.log(usernames);
  return Promise.map(usernames, username=>{
    return Registry.methods.getOwner(web3.utils.asciiToHex(username)).call().then(address=>{
      if (address !== "0x0000000000000000000000000000000000000000") {
        let tags = document.querySelectorAll(`a[href$="reddit.com/user/${username}"]`);
        tags.forEach(t=>t.classList.add("is-reg"));
      }
    })
  });
}

function setNetwork(){
  return window.web3.eth.net.getId()
    .then(id=>{
      switch (id) {
        case 1:
          return store.commit("SET_NETWORK", NETWORKS.MAIN);
        case 2:
          return store.commit("SET_NETWORK", NETWORKS.MORDEN);
        case 3:
          return store.commit("SET_NETWORK", NETWORKS.ROPSTEN);
        case 4:
          return store.commit("SET_NETWORK", NETWORKS.RINKEBY);
        case 42:
          return store.commit("SET_NETWORK", NETWORKS.KOVAN);
        default:
          return store.commit("SET_NETWORK", NETWORKS.OTHER);
      }
    });
}

function setAccount(){
  return web3.eth.getAccounts()
    .then(accounts=>store.dispatch("setAccount", accounts[0]));
}

function poll(){
  web3.eth.getBlockNumber()
    .then(num=>store.commit("SET_BLOCK_NUM", num));
}
