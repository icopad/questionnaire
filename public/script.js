const url1 = "wss://flapjack-octopus-ws-server.glitch.me/message";
const url2 = "wss://flapjack-octopus-ws-server.glitch.me/vote";
const connection1 = new WebSocket(url1);
const connection2 = new WebSocket(url2);
const httpRequest = new XMLHttpRequest();

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

function choice(id, choice) {
  return new Promise((resolve, reject) => {
    httpRequest.open("POST", "/choice");
    httpRequest.setRequestHeader(
      "content-type",
      "application/x-www-form-urlencoded;charset=UTF-8"
    );
    httpRequest.send(`id=${id}&choice=${choice}`);

    httpRequest.onload = () => {
      if (httpRequest.readyState === 4 && httpRequest.status === 200) {
        // console.log(httpRequest.responseText);
        resolve(httpRequest.responseText);
      } else {
        reject(httpRequest.status);
      }
    };
    httpRequest.onerror = (e) => {
      reject(httpRequest.status);
    };
  });
}

function addListItem(text, id) {
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
    elemPostVoteRedButton.innerText = "Choice A";
    elemPostVoteBlueButton.innerText = "Choice B";

    elemPostVoteRed.append(elemPostVoteRedButton);
    elemPostVoteBlue.append(elemPostVoteBlueButton);
    elemPostVoteRed.addEventListener(
      "click",
      () => {
        choice(id, "a")
          .then(value => {
            console.log(value); // => resolve!!
            if (value) {
              elemPostVoteRed.disabled = true;
              elemPostVoteBlue.disabled = true;
            }
          })
          .catch(e => {
            console.log("promise reject A");
            console.log(e);
          });
      },
      false
    );
    elemPostVoteBlue.addEventListener(
      "click",
      () => {
        choice(id, "b")
          .then(value => {
            console.log(value); // => resolve!!
            if (value) {
              elemPostVoteRed.disabled = true;
              elemPostVoteBlue.disabled = true;
            }
          })
          .catch(e => {
            console.log("promise reject B");
            console.log(e);
          });
      },
      false
    );

    elemPostVote.append(elemPostVoteRed);
    elemPostVote.append(elemPostVoteBlue);

    elemPost.append(elemPostIndexNum);
    elemPost.append(elemPostText);
    elemPost.append(elemPostVote);
    elemList.append(elemPost);
  }
}
connection1.onmessage = e => {
  try {
    let json = JSON.parse(e.data);
    addListItem(json.text, json.id);
  } catch (err) {}
};

connection2.onmessage = e => {};

const elemInput = document.getElementById("js-text-send");
const elemInputCount = document.getElementById("js-text-count");
const elemBtnDelete = document.getElementById("js-btn-delete");
const elemBtnSend = document.getElementById("js-btn-send");

if (elemBtnDelete) {
  elemBtnDelete.addEventListener("click", () => {
    httpRequest.open("POST", "/reset");
    httpRequest.setRequestHeader(
      "content-type",
      "application/x-www-form-urlencoded;charset=UTF-8"
    );
    httpRequest.send();

    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState === 4 && httpRequest.status === 200) {
        // console.log(httpRequest.responseText);
      }
    };
  });
}

if (elemInput) {
  if (elemBtnSend) {
    elemBtnSend.addEventListener(
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

          httpRequest.open("POST", "/add");
          httpRequest.setRequestHeader(
            "content-type",
            "application/x-www-form-urlencoded;charset=UTF-8"
          );
          httpRequest.send(`text=${text}`);
          httpRequest.onreadystatechange = function() {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
              try {
                let json = JSON.parse(httpRequest.responseText);
                if (!json.error && json.addResult) {
                  console.log(json.addResult);
                  let sendData = {
                    id: json.addResult.lastID,
                    text: text
                  };
                  connection1.send(JSON.stringify(sendData));
                } else {
                  console.log("db error");
                }
              } catch (err) {
                console.log("json parse error");
              }
            }
          };
          elemInput.value = "";
        }
      },
      false
    );
  }

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

if (window.data && window.data.choiceData) {
  let choiceData = window.data.choiceData;
  Object.keys(choiceData).forEach(key => {
    addListItem(choiceData[key], key);
  });
}
