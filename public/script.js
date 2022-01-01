const url1 = "wss://flapjack-octopus-ws-server.glitch.me/message";
const url2 = "wss://flapjack-octopus-ws-server.glitch.me/vote";
const connection1 = new WebSocket(url1);
const connection2 = new WebSocket(url2);

const elemList = document.getElementById("js-list");
const maxTextSize = 140;
let postIndexNum = 0;

connection1.onopen = () => {
  console.log("open1");
};
connection2.onopen = () => {
  console.log("open2");
};

connection1.onerror = error => {
  console.log(`WebSocket error1: ${error}`);
};
connection2.onerror = error => {
  console.log(`WebSocket error2: ${error}`);
};

function addListItem(text) {
  if (elemList) {
    postIndexNum++;
    let elemPost = document.createElement("div");
    let elemPostText = document.createElement("span");
    let elemPostIndexNum = document.createElement("span");

    let elemPostVote = document.createElement("div");
    let elemPostVoteRed = document.createElement("div");
    let elemPostVoteBlue = document.createElement("div");
    let elemPostVoteRedButton = document.createElement("button");
    let elemPostVoteBlueButton = document.createElement("button");
    
    elemPostText.innerHTML = text;
    elemPostIndexNum.innerText = postIndexNum.toString();

    elemPost.classList.add("post-item");
    elemPostIndexNum.classList.add("post-item-index");
    elemPostVote.classList.add("post-item-vote");
    elemPostVoteRed.classList.add("post-item-vote-red");
    elemPostVoteBlue.classList.add("post-item-vote-blue");
    elemPostVoteRedButton.innerText = "A Choice";
    elemPostVoteBlueButton.innerText = "B Choice";

    elemPostVoteRed.append(elemPostVoteRedButton);
    elemPostVoteBlue.append(elemPostVoteBlueButton);

    elemPostVote.append(elemPostVoteRed);
    elemPostVote.append(elemPostVoteBlue);

    elemPost.append(elemPostIndexNum);
    elemPost.append(elemPostText);
    elemPost.append(elemPostVote);

    elemList.append(elemPost);
  }
}

connection1.onmessage = e => {
  addListItem(e.data);
};

connection2.onmessage = e => {};

const elemInput = document.getElementById("js-text-send");
const elemInputCount = document.getElementById("js-text-count");
if (elemInput) {
  document.getElementById("js-btn-send").addEventListener(
    "click",
    () => {
      let text = elemInput.value.substr(0, maxTextSize);
      if (text) {
        // replace 削ってはいけない
        text = text.replace(/&/g, "&amp;");
        text = text.replace(/</g, "&lt");
        text = text.replace(/>/g, "&gt");
        text = text.replace(/"/g, "&quot");
        text = text.replace(/'/g, "&#39");
        connection1.send(text);
        elemInput.value = "";
      }
    },
    false
  );

  elemInput.addEventListener(
    "keyup",
    () => {
      if (elemInputCount) {
        let count = elemInput.value.length;
        if (count <= maxTextSize) {
          elemInputCount.innerText = count.toString();
        } else {
          elemInputCount.innerText = maxTextSize.toString();
          elemInput.value = elemInput.value.substr(0, maxTextSize);
        }
      }
    },
    false
  );
}
