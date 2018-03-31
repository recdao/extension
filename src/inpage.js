import Vue from 'vue'
import store from './store';
import { NETWORKS } from './constants.json';
import PostScore from './components/PostScore';
import CommentScore from './components/CommentScore';
import Tip from './components/Tip';
import bases from 'bases';
import * as unique from 'array-unique';
import * as Promise from 'bluebird';

const start = async () => {
  let hasWeb3 = await store.dispatch("setWeb3");
  if(!hasWeb3) return;
  let network = await store.dispatch("setNetwork");
  if(![NETWORKS.RINKEBY, NETWORKS.OTHER].includes(network)) return;
  store.dispatch("setContracts");
  await store.dispatch("setDecimals");
  let defaultAccount = await setDefaultAccount();
  if(defaultAccount){
    await store.dispatch("setAllowance");
    await store.dispatch("setBalance");
  }
  styleOverrides();
  mountTipper();
  preparePostScores();
  prepareCommentScores();
  await prepareUsers();
  poll();
  setInterval(poll, 2000);
}

// window.store = store;

start();

function styleOverrides(){
  let styles = document.createElement('style');
  styles.innerText = `
.midcol {
  overflow: visible;
}`;
  document.body.appendChild(styles);
}

function mountTipper(){
  let div = document.createElement('div');
  document.body.appendChild(div);
  const tipper = new Vue({
    ...Tip,
    store,
    propsData: {}
  })
  tipper.$mount(div);
}

window.bases = bases;

function preparePostScores(){
  let idPrefix = "thing_t3_";
  let $posts = document.querySelectorAll(`[id^='${idPrefix}']`);
  $posts.forEach(($post, idx) => {
    let id = $post.id.replace(idPrefix, "");
    // let idB36 = $post.id.replace(idPrefix, "");
    // let id = bases.fromBase36(idB36);
    // console.log(id)
    let author = $post.querySelectorAll(".author")[0].innerHTML;
    let span = document.createElement('span');
    let $redditScore = $post.getElementsByClassName('midcol')[0];
    $redditScore.insertBefore(span, $redditScore.getElementsByClassName('arrow down')[0]);
    const score = new Vue({
      ...PostScore,
      store,
      propsData: {id, author}
    })
    score.$mount(span);
  });
}

function prepareCommentScores(){
  let idPrefix = "thing_t1_";
  let $comments = document.querySelectorAll(`[id^='${idPrefix}']`);
  $comments.forEach(($comment, idx) => {
    let id = $comment.id.replace(idPrefix, "");
    // let idB36 = $comment.id.replace(idPrefix, "");
    // let id = bases.fromBase36(idB36);
    let author = $comment.querySelectorAll(".author")[0].innerHTML;
    let span = document.createElement('span');
    let $tagline = $comment.getElementsByClassName('tagline')[0];
    $tagline.appendChild(span);
    // $tagline.insertBefore(span, $tagline.getElementsByTagName('time')[0]);
    const score = new Vue({
      ...CommentScore,
      store,
      propsData: {id, author}
    })
    score.$mount(span);
  });
}

async function prepareUsers(){
  let $authors = document.querySelectorAll('.thing a[href*="reddit.com/user/"]');
  // const usernames = noDupe([...$authors].map(a=>a.innerText));
  let usernames = unique([...$authors].map(a=>a.innerText));
  // console.log(usernames);
  let Registry = store.state.contracts.Registry;
  return Promise.map(usernames, username=>{
    return Registry.methods.getOwner(web3.utils.asciiToHex(username)).call().then(address=>{
      if (address !== "0x0000000000000000000000000000000000000000") {
        let tags = document.querySelectorAll(`a[href$="reddit.com/user/${username}"]`);
        tags.forEach(t=>t.classList.add("is-reg"));
      }
    })
  });
}

async function setDefaultAccount(){
  return web3.eth.getAccounts()
    .then(accounts=>{
      store.dispatch("setAccount", accounts[0])
      return accounts[0];
    });
}

function poll(){
  web3.eth.getBlockNumber()
    .then(num=>store.commit("SET_BLOCK_NUM", num));
}
