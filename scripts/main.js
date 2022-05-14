const human = document.getElementById("human");
const ai = document.getElementById("ai");
const center = document.getElementById("center");
const drawPile = document.getElementById("draw");
const coin = document.getElementById("coin");
let humanCards = [];
let aiCards = [];
let boardCards = [];
let deck_id = null;

// will change when player can play
let canPlay = false;

/* balicek na prsi */
const hodnoty = ["A", "J", "Q", "K", "7", "8", "9", "0"];
const barvy = ["S", "D", "C", "H"];
let kartyNaPrsi = [];
hodnoty.map((x) => {
    barvy.map((y) => {
        kartyNaPrsi.push(x + "" + y);
    });
});

/* 
========================
 získa počáteční deckId
========================*/
const GetData = async () => {
    let res = await fetch(`https://deckofcardsapi.com/api/deck/new/shuffle/?cards=${kartyNaPrsi}`);
    let data = await res.json();
    deck_id = data.deck_id;
};

/* 
====================
lízne kartu na střed
====================*/
const DrawToCenter = async () => {
    let drawn_cards = await fetch(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=1`);
    drawn_cards = await drawn_cards.json();
    drawn_cards.cards.map((x) => {
        boardCards.push(x);
    });

    drawn_cards.cards.map((x) => {
        const card = document.createElement("img");
        card.src = x.image;

        center.appendChild(card);
        setTimeout(() => {
            card.classList.add("drown");
        }, 50);
    });
};

/* 
===============
 ai lízne kartu
===============*/
const DrawAi = async (amount) => {
    let drawn_cards = await fetch(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=${amount}`);
    drawn_cards = await drawn_cards.json();
    drawn_cards.cards.map((x) => {
        aiCards.push(x);
    });

    drawn_cards.cards.map((x) => {
        const card = document.createElement("img");
        card.src = "../images/card_back.png";

        ai.appendChild(card);
        setTimeout(() => {
            card.classList.add("drown");
        }, 50);
    });
};

/* 
===============
    tah ai
===============*/
const AiPlay = () => {
    let played = false;
    aiCards.map((x) => {
        if (Control(boardCards[0], x) && !played) {
            coin.style.backgroundImage = `url(/images/${x.suit}.png)`;
            boardCards.unshift(x);
            aiCards = aiCards.filter((y) => y.image != x.image);
            played = true;
            ai.removeChild(ai.lastChild);
            Renew();
        }
    });

    if (!played) {
        DrawAi(1);
    }

    CoinMove("human");
    canPlay = true;
};

/* 
===================
hráč si lízne kartu (přidá evenListenry pro manipulaci s kartama)
===================*/
const DrawPlayer = async (amount) => {
    let drawn_cards = await fetch(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=${amount}`);
    drawn_cards = await drawn_cards.json();
    drawn_cards.cards.map((x) => {
        humanCards.push(x);
    });

    /* event listeners */
    drawn_cards.cards.map((x) => {
        const card = document.createElement("img");
        card.src = x.image;

        /* přidá kartu do hráčovi ruky */
        human.appendChild(card);
        setTimeout(() => {
            card.classList.add("drown");
        }, 50);

        /* eventlisteners na prohlížení karet */
        card.addEventListener("mouseover", (e) => {
            e.target.style.zIndex = 1;
        });
        card.addEventListener("mouseleave", (e) => {
            e.target.style.zIndex = 0;
        });

        /* ===== eventlistener na zahrání karty ==== */
        card.addEventListener("click", (e) => {
            if (!canPlay) {
                WrongMove(e.target);
                return;
            }

            let viablePlay = false;

            /* najde data ke kartě a provede kontrola jestli je karta hratelná */
            humanCards.map((x) => {
                if (x.image == e.target.src) {
                    if (Control(boardCards[0], x)) {
                        viablePlay = true;
                    }
                }
            });

            /* jestli karta je hratelná odeber ji z ruky a přidej do středu */
            if (!viablePlay) {
                WrongMove(e.target);
                return;
            }

            humanCards.map((x) => {
                if (x.image == e.target.src) {
                    coin.style.backgroundImage = `url(/images/${x.suit}.png)`;
                    boardCards.unshift(x);
                }
            });
            humanCards = humanCards.filter((x) => x.image != e.target.src);

            Array.from(human.childNodes).map((c) => {
                if (c.src == e.target.src) c.remove();
            });

            canPlay = false;
            Renew();
            CoinMove("ai");
            setTimeout(() => {
                AiPlay();
            }, Math.floor(Math.random() * 2500) + 1000); // random int from 1000 - 3500
        });
    });
};

/* 
======================
animace pro neplatný tah
====================== */
const WrongMove = (target) => {
    target.classList.remove("shakeAnim");
    target.offsetWidth;
    target.classList.add("shakeAnim");
};

/* 
======================
kontrola platného tahu
====================== */
const Control = (card1, card2) => {
    // card 1 == karta ve středu
    if (card1.value == card2.value) return true;
    else if (card1.suit == card2.suit) return true;
    else return false;
};

/* 
======================
obnoví kartu uprostřed
======================*/
const Renew = () => {
    Array.from(center.childNodes).map((x) => {
        if (x.nodeType != 3) {
            x.classList.remove("drown");
            x.style.visibility = "hidden";
            setTimeout(() => {
                x.src = boardCards[0].image;
                setTimeout(() => {
                    x.style.visibility = "visible";
                    x.classList.add("drown");
                }, 100);

                setTimeout(() => {
                    if (aiCards.length == 0) {
                        Won("ai");
                    } else if (humanCards.length == 0) {
                        Won("human");
                    }
                }, 300); // to start after we place the last card to center
            }, 250);
        }
    });
};

/* 
===============
lízání na klik
===============*/
drawPile.addEventListener("click", () => {
    if (canPlay) {
        DrawPlayer(1);
        canPlay = false;
        CoinMove("ai");
        setTimeout(() => {
            AiPlay();
        }, Math.floor(Math.random() * 2500) + 1000); // random int from 1000 - 3500
    }
});

/* 
===============
kontrola výhry
===============*/
const Won = (who) => {
    if (who == "ai") {
        window.location.href = "../gameOver.html";
        alert("ai Won"); // vyměnit za přesun dat pro gameover stránku asi pomocí localStorage
    } else if (who == "human") {
        window.location.href = "../gameOver.html";
        alert("human Won");
    }
};

/* 
=============================
přehodí žeton na druhou stranu
=============================*/
const CoinMove = (where) => {
    if (where == "human") {
        coin.style.bottom = "5%";
    } else if (where == "ai") {
        coin.style.bottom = "70%";
    }
};

/*
===============
   Start hry
===============*/
const Start = async () => {
    await GetData();
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            DrawPlayer(1);
            DrawAi(1);
        }, i * 350);
    }

    setTimeout(() => {
        DrawToCenter();
    }, 350 * 5);

    canPlay = true;
};

Start();
