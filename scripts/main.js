const human = document.getElementById("human");
const ai = document.getElementById("ai");
const center = document.getElementById("center");
const drawPile = document.getElementById("draw");
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
const getData = async () => {
    let res = await fetch(`https://deckofcardsapi.com/api/deck/new/shuffle/?cards=${kartyNaPrsi}`);
    let data = await res.json();
    deck_id = data.deck_id;
};

/* 
====================
lízne kartu na střed
====================*/
const drawToCenter = async () => {
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
const drawAi = async (amount) => {
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
const aiPlay = () => {
    let played = false;
    aiCards.map((x) => {
        if (control(boardCards[0], x) && !played) {
            boardCards.unshift(x);
            aiCards = aiCards.filter((y) => y.image != x.image);
            played = true;
            ai.removeChild(ai.lastChild);
            renew();
        }
    });

    if (!played) {
        drawAi(1);
    }

    canPlay = true;
};

/* 
===================
hráč si lízne kartu (přidá evenListenry pro manipulaci s kartama)
===================*/
const drawPlayer = async (amount) => {
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

        /* eventlistener na zahrání karty */
        card.addEventListener("click", (e) => {
            if (canPlay) {
                let viablePlay = false;

                /* najde data ke kartě a provede kontrola jestli je karta hratelná */
                humanCards.map((x) => {
                    if (x.image == e.target.src) {
                        if (control(boardCards[0], x)) {
                            viablePlay = true;
                        }
                    }
                });

                /* jestli karta je hratelná odeber ji z ruky a přidej do středu */
                if (viablePlay) {
                    humanCards.map((x) => {
                        if (x.image == e.target.src) {
                            boardCards.unshift(x);
                        }
                    });
                    humanCards = humanCards.filter((x) => x.image != e.target.src);

                    Array.from(human.childNodes).map((c) => {
                        if (c.src == e.target.src) c.remove();
                    });

                    canPlay = false;
                    renew();
                    setTimeout(() => {
                        aiPlay();
                    }, 1000);

                    /* animace když karta není hratelná */
                } else {
                    e.target.classList.remove("shakeAnim");
                    e.target.offsetWidth;
                    e.target.classList.add("shakeAnim");
                }
            }
        });
    });
};

/* 
======================
kontrola platného tahu
====================== */
const control = (card1, card2) => {
    // card 1 == karta ve středu
    if (card1.value == card2.value) return true;
    else if (card1.suit == card2.suit) return true;
    else return false;
};

/* 
======================
obnoví kartu uprostřed
======================*/
const renew = () => {
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
                        won("ai");
                    } else if (humanCards.length == 0) {
                        won("human");
                    }
                }, 300); // to start after we place the last card to center
            }, 250);
        }
    });
};

/* 
===============
   start hry
===============*/
const start = async () => {
    await getData();
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            drawPlayer(1);
            drawAi(1);
        }, i * 350);
    }

    setTimeout(() => {
        drawToCenter();
    }, 350 * 5);

    canPlay = true;
};

start();

/* 
===============
lízání na klik
===============*/
drawPile.addEventListener("click", () => {
    if (canPlay) {
        drawPlayer(1);
        canPlay = false;
        setTimeout(() => {
            aiPlay();
        }, 1000);
    }
});

/* 
===============
kontrola výhry
===============*/
const won = (who) => {
    if (who == "ai") {
        window.location.href = "../gameOver.html";
        alert("ai won"); // vyměnit za přesun dat pro gameover stránku asi pomocí localStorage
    } else if (who == "human") {
        window.location.href = "../gameOver.html";
        alert("human won");
    }
};
