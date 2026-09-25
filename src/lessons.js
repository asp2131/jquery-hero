// The runner checks observable DOM state, never a particular spelling of a solution.
const text = (selector, value) => ({ type: "text", selector, value });
const count = (selector, value) => ({ type: "count", selector, value });
const css = (selector, property, value) => ({
  type: "css",
  selector,
  property,
  value,
});
const hasClass = (selector, value, present = true) => ({
  type: "class",
  selector,
  value,
  present,
});
const attribute = (selector, name, value) => ({
  type: "attribute",
  selector,
  name,
  value,
});
const visible = (selector, value) => ({ type: "visible", selector, value });
const click = (selector) => ({ type: "click", selector });
const check = (...assertions) => ({ type: "check", assertions });
const value = (selector, value) => ({ type: "value", selector, value });
const event = (selector, name, key) => ({ type: "event", selector, name, key });
const test = (label, assertions, options = {}) => ({
  label,
  assertions,
  ...options,
});

// Every quest is a battle on the same arena (see arena.js).
// scene: [selector, kind, spawn points [x, y, level?], on?] — the Nth match of a
// selector stands on its Nth spawn point. `on` marks the state the spell is after
// (a goblin hit, the hero charged, the gate open). The hero stands at 2,4 unless
// the lesson places #hero; the villager's lookout block is -1,4,1.
const VILLAGER = [[-1, 4, 1]];
export const lessons = [
  {
    id: 0,
    title: "Wake the hero",
    chapter: "Goblin encounter",
    concept: "Libraries, ID selectors & .text()",
    description:
      "Goblins are coming and the hero is still asleep. Change the hero's text to wake them up. Leave the villager alone.",
    objectives: [
      "Change the text of #hero from Sleeping to Ready.",
      "Keep #villager reading Help.",
    ],
    steps: [
      'Find the starter line $("#hero"). The # selects the element with id="hero".',
      'Put the quoted string "Ready" inside .text().',
      'Run spell. The hero should say "Ready"; the villager still says "Help".',
    ],
    syntax: '$("#element-id").text("New text");',
    explanation:
      'A library is a collection of reusable code. jQuery is a JavaScript library for working with HTML, styles, and events. A normal website must import it before using it; this workshop already loads real jQuery for you. $ is the jQuery function. $("#hero") selects the element with id="hero", and .text("Ready") replaces its text. Every character in the arena is an element in index.html; the cyan tag under it is its selector.',
    starter:
      '// Wake the hero: put "Ready" in quotes inside .text().\n$("#hero").text( );',
    html: '<section id="battle"><p id="hero">Sleeping</p><p id="villager">Help</p><p class="goblin">Goblin</p><p class="goblin">Goblin</p></section>',
    scene: [
      ["#hero", "hero", [[2, 4]], (el) => el.textContent === "Ready"],
      ["#villager", "villager", VILLAGER],
      [".goblin", "goblin", [[5, 1], [6, 3]]],
    ],
    hints: [
      "An ID selector starts with #. Use #hero, not hero.",
      "A word passed to .text() must be a quoted string.",
      'Try $("#hero").text("Ready");',
    ],
    solution: '$("#hero").text("Ready");',
    reward: 20,
    source:
      "Lecture: jQuery — slides 3–9, What is a library?, jQuery Syntax, and Code Along",
    tests: [
      test("The hero reads Ready", [text("#hero", "Ready")]),
      test("The villager is untouched", [
        count("#hero", 1),
        text("#villager", "Help"),
      ]),
    ],
  },
  {
    id: 1,
    title: "Spot the goblins",
    chapter: "Goblin encounter",
    concept: "Class selectors & groups",
    description:
      "Three goblins are sneaking up. Mark all of them at once with one class selection, without touching the villager.",
    objectives: [
      "Give every .goblin the text Spotted.",
      "Keep #villager reading Help and keep all three goblins.",
    ],
    steps: [
      'Keep $(".goblin") as your selection. The dot selects every element with class="goblin".',
      'Replace the empty string in .text("") with "Spotted". One call updates all three.',
      "Don't select every p: that would change #villager too. Run spell.",
    ],
    syntax: '$(".class-name").text("New text");',
    explanation:
      'An ID names one element; a class can be shared by many. $(".goblin") finds every element with class="goblin". Calling .text() on that collection changes every match. A leading dot means class, while a leading # means ID.',
    starter:
      '// Spot every goblin: replace the empty string with "Spotted".\n$(".goblin").text("");',
    html: '<section id="battle"><p class="goblin">Sneaking</p><p class="goblin">Sneaking</p><p class="goblin">Sneaking</p><p id="villager">Help</p></section>',
    scene: [
      [".goblin", "goblin", [[5, 1], [6, 3], [4, 5]], (el) => el.textContent === "Spotted"],
      ["#villager", "villager", VILLAGER],
    ],
    hints: [
      "Select .goblin, including the dot.",
      'The same .text("Spotted") call can update all three goblins.',
      "Selecting every p would also change the villager. Narrow your selection.",
    ],
    solution: '$(".goblin").text("Spotted");',
    reward: 20,
    source:
      "Lecture: jQuery — slides 9 and 15, selectors and jQuery: Element Access",
    tests: [
      test("All three goblins are spotted", [
        count(".goblin", 3),
        text(".goblin", "Spotted"),
      ]),
      test("The villager is untouched", [text("#villager", "Help")]),
    ],
  },
  {
    id: 2,
    title: "Color the battle lines",
    chapter: "Goblin encounter",
    concept: "Changing CSS properties",
    description:
      "Your slime allies need blue ground under them and the hero needs an orange glow. The goblin's tan ground stays as it is.",
    objectives: [
      "Set background-color to blue on both .slime elements.",
      "Set the text color of #hero to orange.",
      "Keep the background-color of #goblin tan.",
    ],
    steps: [
      'Find the .css() call on $(".slime"). Keep "background-color" and replace "gray" with "blue".',
      'On a new line, select $("#hero") and call .css("color", "orange"): two quoted arguments separated by a comma.',
      "Leave #goblin alone. Run spell.",
    ],
    syntax: '$("#element-id").css("color", "orange");',
    explanation:
      '.css("property", "value") changes a CSS property on the selected elements. Named colors like blue, orange, and tan work; the browser may report them as rgb values. In the arena, background-color paints the ground under a character and color makes it glow.',
    starter:
      '// Change the slimes\' background from gray to blue.\n$(".slime").css("background-color", "gray");\n// Add a line selecting #hero and setting its color to orange.',
    html: '<section id="battle"><p class="slime" style="background-color:gray">Slime</p><p class="slime" style="background-color:gray">Slime</p><p id="hero" style="color:gray">Hero</p><p id="goblin" style="background-color:tan">Goblin</p></section>',
    scene: [
      [".slime", "slime", [[1, 5], [0, 3]]],
      ["#hero", "hero", [[2, 4]]],
      ["#goblin", "goblin", [[5, 2]]],
    ],
    hints: [
      'Use .css("background-color", "blue") for the slimes.',
      "The hero needs the color property, not background-color.",
      "Make two selections: .slime and #hero.",
    ],
    solution:
      '$(".slime").css("background-color", "blue");\n$("#hero").css("color", "orange");',
    reward: 20,
    source:
      "Lecture: jQuery — slides 6, 9, 24, and 26, .css() and jQuery Reference",
    tests: [
      test("Both slimes stand on blue", [
        count(".slime", 2),
        css(".slime", "background-color", "rgb(0, 0, 255)"),
      ]),
      test("The hero glows orange", [css("#hero", "color", "rgb(255, 165, 0)")]),
      test("The goblin's ground stays tan", [
        css("#goblin", "background-color", "rgb(210, 180, 140)"),
      ]),
    ],
  },
  {
    id: 3,
    title: "Choose your targets",
    chapter: "Goblin ambush",
    concept: "Adding & removing classes",
    description: "Hit the goblins. Protect the villager.",
    objectives: [
      "Remove the shielded class from every .goblin.",
      "Add the hit class to every .goblin, keeping their goblin class.",
      "Leave #villager with its safe class and Help text.",
    ],
    steps: [
      'Use the two $(".goblin") selections in quest.js.',
      'Fill .removeClass() with "shielded" and .addClass() with "hit". No dots in class names.',
      "Don't replace the whole class attribute: goblins must keep the goblin class. Run spell.",
    ],
    syntax: '$(".selector").removeClass("old-state").addClass("new-state");',
    explanation:
      'Classes can describe state as well as appearance. .removeClass("shielded") removes just that class, and .addClass("hit") adds one without replacing the others. Don\'t include a dot in these method arguments: the dot belongs in a selector, not in a class name.',
    starter:
      '// Break the shields, then mark the goblins hit.\n// Class names go in quotes, without a dot.\n$(".goblin").removeClass("");\n$(".goblin").addClass("");',
    html: '<section id="battle"><p class="goblin shielded">Goblin</p><p class="goblin shielded">Goblin</p><p id="villager" class="safe">Help</p></section>',
    scene: [
      [".goblin", "goblin", [[4, 1], [5, 3]], (el) => el.matches(".hit:not(.shielded)")],
      ["#villager", "villager", VILLAGER],
    ],
    hints: [
      "The selector is .goblin; the class names are shielded and hit, without dots.",
      "Remove shielded, then add hit.",
      "Don't overwrite the whole class attribute: goblin must survive.",
    ],
    solution: '$(".goblin").removeClass("shielded");\n$(".goblin").addClass("hit");',
    reward: 20,
    source:
      "Lecture: jQuery — slides 9, 24, and 26, .addClass() and .removeClass()",
    tests: [
      test("Both goblins are hit, not shielded", [
        count(".goblin", 2),
        hasClass(".goblin", "hit"),
        hasClass(".goblin", "shielded", false),
      ]),
      test("The villager is protected", [
        hasClass("#villager", "safe"),
        text("#villager", "Help"),
      ]),
    ],
  },
  {
    id: 4,
    title: "Clear the smoke",
    chapter: "Goblin ambush",
    concept: ".hide() & .show()",
    description:
      "Goblins threw smoke bombs to hide an ambush. Hide both smoke clouds and reveal the hidden goblin, without deleting anything.",
    objectives: [
      "Hide both .smoke elements.",
      "Show the hidden #goblin.",
      "Keep the smoke in the DOM and keep #hero visible.",
    ],
    steps: [
      'Keep $(".smoke").hide(). It hides both clouds without deleting them.',
      'Below it, select $("#goblin") and call .show() with empty parentheses.',
      "Don't use .remove() or .empty(). Run spell.",
    ],
    syntax: '$(".class-name").hide();\n$("#element-id").show();',
    explanation:
      ".hide() sets an element’s display so it disappears, but the element still exists in the document. .show() restores it. This is useful when you want to reveal or conceal something again later. Removing an element is a different operation.",
    starter:
      '// Hide both smoke clouds without deleting them.\n$(".smoke").hide();\n// Add a line selecting #goblin and calling .show().',
    html: '<section id="battle"><p id="hero">Hero</p><p class="smoke">Smoke</p><p class="smoke">Smoke</p><p id="goblin" style="display:none">Ambush!</p></section>',
    scene: [
      ["#hero", "hero", [[2, 4]]],
      [".smoke", "smoke", [[4, 2], [5, 4]]],
      ["#goblin", "goblin", [[5, 3]]],
    ],
    hints: [
      "Use a class selector for the two smoke clouds.",
      'Use $("#goblin").show() to reveal the ambush.',
      "Don't use .remove() or .empty(): the smoke must still exist.",
    ],
    solution: '$(".smoke").hide();\n$("#goblin").show();',
    reward: 20,
    source:
      "Lecture: jQuery — slides 5, 13, and 15, .hide(), .show(), and Element Access",
    tests: [
      test("Both smoke clouds are hidden, not deleted", [
        count(".smoke", 2),
        visible(".smoke", false),
      ]),
      test("The ambush is revealed and the hero is visible", [
        visible("#goblin", true),
        visible("#hero", true),
        text("#goblin", "Ambush!"),
      ]),
    ],
  },
  {
    id: 5,
    title: "Summon an ally",
    chapter: "Goblin ambush",
    concept: "Creating, appending & attributes",
    description:
      "The villager needs backup. Create a slime ally inside #party and put it on the hero's team.",
    objectives: [
      "Create exactly one p element with id slime inside #party.",
      'Give it the text Ally and the attribute data-team="hero".',
      "Keep #villager in the party.",
    ],
    steps: [
      'Keep the line that creates $ally with $("<p>"). Angle brackets create a new paragraph.',
      'Call .attr("id", "slime") and .attr("data-team", "hero") on $ally, then .text("Ally").',
      'Finish with $ally.appendTo("#party") so it joins the battle. Run spell.',
    ],
    syntax:
      'const $item = $("<p>");\n$item.attr("id", "new-item").text("A label").appendTo("#container");',
    explanation:
      '$("p") selects existing paragraphs; $("<p>") creates a new one. A new element isn\'t on the page until you insert it. .attr("id", "slime") sets an attribute, .text() sets its words, and .appendTo("#party") places it inside the party.',
    starter:
      'const $ally = $("<p>");\n// Use .attr() for id=slime and data-team=hero.\n// Use .text() for Ally, then .appendTo() to add it to #party.',
    html: '<section id="battle"><div id="party"><p id="villager">Help</p></div><p class="goblin">Goblin</p><p class="goblin">Goblin</p></section>',
    scene: [
      ["#villager", "villager", VILLAGER],
      ["#slime", "slime", [[1, 5]], (el) => el.dataset.team === "hero"],
      [".goblin", "goblin", [[5, 1], [6, 3]]],
    ],
    hints: [
      "Save the new element in $ally so you can keep working on it.",
      "Set two attributes: id to slime and data-team to hero.",
      'Finish with $ally.appendTo("#party");',
    ],
    solution:
      'const $ally = $("<p>");\n$ally.attr("id", "slime");\n$ally.attr("data-team", "hero");\n$ally.text("Ally");\n$ally.appendTo("#party");',
    reward: 20,
    source:
      "Lecture: jQuery — slides 14, 21, 24–26, Element Creation and jQuery Reference",
    tests: [
      test("A slime ally joins the party", [
        count("#slime", 1),
        count("#party > p#slime", 1),
        text("#slime", "Ally"),
      ]),
      test("The slime is on the hero's team and the villager stays", [
        attribute("#slime", "data-team", "hero"),
        text("#party > #villager", "Help"),
      ]),
    ],
  },
  {
    id: 6,
    title: "Rescue the villager",
    chapter: "Goblin camp",
    concept: ".empty(), .detach() & moving nodes",
    description:
      "The villager is locked in a goblin cage. Move them to camp first, then clear the cage. A copy is not the same villager.",
    objectives: [
      "Move the original #villager from #cage into #camp.",
      "Empty #cage completely, but keep the cage itself.",
      "Keep the villager's brave class and Help text.",
    ],
    steps: [
      'Add .detach() after $("#villager") in the const line. $villager keeps the original.',
      'Next, call $("#cage").empty() to clear out the guards. Only after detaching!',
      "Call $villager.appendTo(\"#camp\"). Don't create a new villager. Run spell.",
    ],
    syntax: 'const $saved = $("#item").detach();\n$saved.appendTo("#new-home");',
    explanation:
      ".detach() takes an element out of the document but keeps the same element for reuse. Save it, clear the old container with .empty(), and append the saved element to its new home. .empty() removes a container's contents, not the container. Detach the villager before emptying the cage.",
    starter:
      'const $villager = $("#villager");\n// Add .detach() above, then call .empty() on #cage.\n// Use $villager.appendTo() to move them into #camp.',
    html: '<section id="battle"><div id="cage"><p class="goblin">Guard</p><p id="villager" class="brave">Help</p><p class="goblin">Guard</p></div><div id="camp"></div></section>',
    scene: [
      ["#cage > #villager", "villager", [[5, 2]]],
      ["#villager", "villager", VILLAGER],
      ["#cage", "jail", [[5, 2]]],
      [".goblin", "goblin", [[3, 2], [4, 4]]],
    ],
    hints: [
      'Save $("#villager").detach() in a variable before clearing the cage.',
      '$("#cage").empty() clears everything left inside.',
      "Append the saved villager to #camp; don't create a new paragraph.",
    ],
    solution:
      'const $villager = $("#villager").detach();\n$("#cage").empty();\n$villager.appendTo("#camp");',
    reward: 20,
    source:
      "Lecture: jQuery — slides 9, 23, and 26, cached jQueries, .empty(), and .detach()",
    tests: [
      test(
        "The original villager reaches camp",
        [
          {
            type: "sameNode",
            selector: "#camp > #villager",
            original: "#villager",
          },
          count("#villager", 1),
        ],
        { remember: ["#villager"] },
      ),
      test("The cage is empty and the villager is still brave", [
        count("#cage", 1),
        count("#cage > *", 0),
        text("#cage", ""),
        hasClass("#camp > #villager", "brave"),
        text("#villager", "Help"),
      ]),
    ],
  },
  {
    id: 7,
    title: "Power up the hero",
    chapter: "Goblin camp",
    concept: "Chaining & cached selections",
    description:
      "One reference, many upgrades. Give the hero new text, a class, a color, and a title in one chain.",
    objectives: [
      "Set #hero text to Ready and add the charged class.",
      "Set its color to limegreen and its title to Goblin slayer.",
      "Keep the hero class and leave #villager untouched.",
    ],
    steps: [
      'Keep const $hero = $("#hero"); and the .text("Ready") call.',
      'Chain .addClass("charged"), .css("color", "limegreen"), and .attr("title", "Goblin slayer"). Move the semicolon to the very end.',
      "Leave #villager alone. Run spell.",
    ],
    syntax: 'const $item = $("#element-id");\n$item.text("Updated").addClass("active");',
    explanation:
      'Most jQuery setters return the selection, so you can chain them: $hero.text("Ready").addClass("charged"). Saving a selection in a variable avoids looking it up again. The $ in $hero is a naming convention, not special syntax. The checks care about the result, not whether you chain or write separate lines.',
    starter:
      'const $hero = $("#hero");\n$hero.text("Ready");\n// Chain .addClass("charged"), .css() for limegreen,\n// and .attr() for the title Goblin slayer.',
    html: '<section id="battle"><p id="hero" class="hero" title="Rookie" style="color:gray">Tired</p><p id="villager" title="Farmer">Help</p><p class="goblin">Goblin</p><p class="goblin">Goblin</p><p class="goblin">Goblin</p></section>',
    scene: [
      ["#hero", "hero", [[2, 4]], (el) => el.matches(".charged")],
      ["#villager", "villager", VILLAGER],
      [".goblin", "goblin", [[5, 1], [6, 3], [5, 5]]],
    ],
    hints: [
      'Continue the chain with .addClass("charged").',
      'Use .css("color", "limegreen") and .attr("title", "Goblin slayer").',
      "Put the semicolon at the end of a chain, not between its methods.",
    ],
    solution:
      'const $hero = $("#hero");\n$hero\n  .text("Ready")\n  .addClass("charged")\n  .css("color", "limegreen")\n  .attr("title", "Goblin slayer");',
    reward: 20,
    source:
      "Lecture: jQuery — slides 22–24, Some jQuery Tricks: chaining, cached selections, and attributes",
    tests: [
      test("The hero is ready and charged", [
        text("#hero", "Ready"),
        hasClass("#hero", "charged"),
        hasClass("#hero", "hero"),
      ]),
      test("The hero glows limegreen with a new title", [
        css("#hero", "color", "rgb(50, 205, 50)"),
        attribute("#hero", "title", "Goblin slayer"),
      ]),
      test("The villager keeps their identity", [
        text("#villager", "Help"),
        attribute("#villager", "title", "Farmer"),
      ]),
    ],
  },
  {
    id: 8,
    title: "Pull the lever",
    chapter: "Goblin fortress",
    concept: "Click events & function references",
    description:
      "Wire the fortress lever. Nothing happens until someone clicks; then each pull toggles the gate between Closed and Open.",
    objectives: [
      "Keep #gate reading Closed until #lever is clicked.",
      "Make each click alternate #gate between Open and Closed.",
      "Register the function itself; don't call it while registering.",
    ],
    steps: [
      "Write your code inside the braces of toggleGate.",
      'Read $("#gate").text(). If it === "Closed", set "Open"; else set "Closed".',
      'Keep $("#lever").on("click", toggleGate); without (). Run spell: the tests pull the lever for you.',
    ],
    syntax:
      'if ($("#element-id").text() === "Waiting") {\n  $("#element-id").text("Ready");\n} else {\n  $("#element-id").text("Waiting");\n}',
    explanation:
      'An event handler is a function saved for later. .on("click", toggleGate) tells jQuery to call toggleGate when a click happens. Writing toggleGate() calls it immediately instead. Inside the handler, .text() with no argument reads the current text; if/else picks the next state.',
    starter:
      'function toggleGate() {\n  // Read #gate with .text(). Closed becomes Open; otherwise set Closed.\n}\n\n// Pass the function without () so nothing changes before a click.\n$("#lever").on("click", toggleGate);',
    html: '<section id="battle"><p id="gate">Closed</p><button id="lever" type="button">Pull lever</button><p id="villager">Safe</p></section>',
    scene: [
      ["#gate", "gate", [[4, 0]], (el) => el.textContent === "Open"],
      ["#lever", "lever", [[1, 2]]],
      ["#villager", "villager", VILLAGER],
    ],
    hints: [
      'Read $("#gate").text() inside the function.',
      "If it equals Closed, set Open. Otherwise set Closed.",
      'Use .on("click", toggleGate), not .on("click", toggleGate()).',
    ],
    solution:
      'function toggleGate() {\n  if ($("#gate").text() === "Closed") {\n    $("#gate").text("Open");\n  } else {\n    $("#gate").text("Closed");\n  }\n}\n\n$("#lever").on("click", toggleGate);',
    reward: 20,
    source:
      "Lecture: jQuery — slides 5 and 16–20, jQuery Events and Event Handler Functions: No ()!",
    tests: [
      test("The gate waits for a click", [
        text("#gate", "Closed"),
        text("#villager", "Safe"),
      ]),
      test("The first pull opens the gate", [text("#gate", "Open")], {
        steps: [click("#lever")],
      }),
      test(
        "Repeated pulls keep toggling",
        [text("#gate", "Open"), text("#villager", "Safe")],
        {
          steps: [
            click("#lever"),
            check(text("#gate", "Open")),
            click("#lever"),
            check(text("#gate", "Closed")),
            click("#lever"),
          ],
        },
      ),
    ],
  },
  {
    id: 9,
    title: "Roll to hit",
    chapter: "Goblin fortress",
    concept: "Random branches & click handlers",
    description:
      "Every swing is a coin flip. Decide Hit or Miss on each click and count every swing.",
    objectives: [
      "Leave #result as Ready and #swings as 0 before the first click.",
      "On each #attack click, show Hit if Math.random() > 0.5; otherwise Miss.",
      "Increase #swings by exactly one on every click.",
    ],
    steps: [
      "Keep let swings = 0; outside swing() so the count survives between clicks. Write inside swing().",
      'Use if (Math.random() > 0.5) to set #result to "Hit"; else "Miss". Exactly 0.5 is a Miss.',
      'After the if/else: swings += 1; then $("#swings").text(swings). Keep the .on("click", swing) line. Run spell.',
    ],
    syntax:
      "if (Math.random() > 0.5) {\n  // The higher half of the range.\n} else {\n  // The lower half, including 0.5.\n}",
    explanation:
      "Math.random() returns a number from 0 up to, but not including, 1. Draw inside the click handler so every click gets a fresh result. A variable declared outside the handler remembers the count between clicks. The checks supply predictable random values so both branches can be verified.",
    starter:
      'let swings = 0;\n\nfunction swing() {\n  // If a fresh Math.random() is above 0.5, set #result to Hit; else Miss.\n  // Then add 1 to swings and show it in #swings.\n}\n\n$("#attack").on("click", swing);',
    html: '<section id="battle"><p id="result">Ready</p><p>Swings: <span id="swings">0</span></p><button id="attack" type="button">Attack</button></section>',
    scene: [
      ["#result", "goblin", [[5, 2]], (el) => el.textContent === "Hit"],
      ["#swings", "label", [[2, 6]]],
    ],
    hints: [
      "Use if (Math.random() > 0.5) inside swing.",
      "Set #result to Hit in the if branch and Miss in the else branch.",
      'After either branch, write swings += 1; and $("#swings").text(swings);',
    ],
    solution:
      'let swings = 0;\n\nfunction swing() {\n  if (Math.random() > 0.5) {\n    $("#result").text("Hit");\n  } else {\n    $("#result").text("Miss");\n  }\n  swings += 1;\n  $("#swings").text(swings);\n}\n\n$("#attack").on("click", swing);',
    reward: 20,
    source:
      "Lecture: jQuery — slides 10–11 and 18–20, coin flip challenge and event handler references",
    tests: [
      test("Nothing happens before a click", [
        text("#result", "Ready"),
        text("#swings", "0"),
      ]),
      test(
        "A high draw is a Hit",
        [text("#result", "Hit"), text("#swings", "1")],
        { random: [0.9], steps: [click("#attack")] },
      ),
      test(
        "A low draw is a Miss",
        [text("#result", "Miss"), text("#swings", "1")],
        { random: [0.1], steps: [click("#attack")] },
      ),
      test("Exactly 0.5 is a Miss", [text("#result", "Miss")], {
        random: [0.5],
        steps: [click("#attack")],
      }),
      test(
        "Every click draws again and is counted",
        [text("#result", "Hit"), text("#swings", "3")],
        {
          random: [0.9, 0.1, 0.8],
          steps: [
            click("#attack"),
            check(text("#result", "Hit"), text("#swings", "1")),
            click("#attack"),
            check(text("#result", "Miss"), text("#swings", "2")),
            click("#attack"),
          ],
        },
      ),
    ],
  },
  {
    id: 10,
    title: "Name your hero",
    chapter: "Goblin fortress",
    concept: "Keyboard & change events",
    description:
      "Type a name and pick an aura color. The hero updates on every keyup and every change.",
    objectives: [
      "On keyup in #hero-name, copy its value into #hero.",
      "On change of #aura, set the color of #hero to the selected value.",
      "Update only when the event arrives, every time it arrives.",
    ],
    steps: [
      'Inside paintName, pass $("#hero-name").val() to $("#hero").text(), even when it is empty.',
      'Inside paintAura, call .css("color", $("#aura").val()) on #hero. Don\'t hard-code a color.',
      "Keep both .on() lines outside the functions, without (). Run spell: the tests type and pick colors for you.",
    ],
    syntax: 'const currentValue = $("#input-id").val();\n$("#preview-id").text(currentValue);',
    explanation:
      'Events aren\'t only clicks. keyup fires when a key is released; change reports a committed form choice. .val() reads an input or select value, while .text() updates visible text. Read the value inside the handler so it is fresh every time. .on("keyup", handler) and .on("change", handler) follow the same function-reference pattern as click.',
    starter:
      'function paintName() {\n  // Read #hero-name with .val() and copy it into #hero with .text().\n}\n\nfunction paintAura() {\n  // Read #aura with .val() and use .css() to set #hero\'s color.\n}\n\n$("#hero-name").on("keyup", paintName);\n$("#aura").on("change", paintAura);',
    html: '<section id="battle"><label>Hero name <input id="hero-name" value="Sparky"></label><label>Aura <select id="aura"><option value="blue">Blue</option><option value="green">Green</option><option value="gold">Gold</option></select></label><p id="hero" style="color:blue">Sparky</p><p class="goblin">Goblin</p></section>',
    scene: [
      ["#hero", "hero", [[2, 4]]],
      [".goblin", "goblin", [[5, 2]]],
    ],
    hints: [
      'Inside paintName, use $("#hero").text($("#hero-name").val());',
      'Inside paintAura, use .css("color", $("#aura").val()).',
      "Keep both .on() calls outside the handler functions so each is registered once.",
    ],
    solution:
      'function paintName() {\n  $("#hero").text($("#hero-name").val());\n}\n\nfunction paintAura() {\n  $("#hero").css("color", $("#aura").val());\n}\n\n$("#hero-name").on("keyup", paintName);\n$("#aura").on("change", paintAura);',
    reward: 20,
    source:
      "Lecture: jQuery — slides 16–17 and 26, keyboard events, form events, and event registration",
    tests: [
      test(
        "The name changes only when keyup arrives",
        [text("#hero", "Moonwake")],
        {
          steps: [
            value("#hero-name", "Moonwake"),
            check(text("#hero", "Sparky")),
            event("#hero-name", "keyup", "e"),
          ],
        },
      ),
      test(
        "Later typing replaces the old name, including clearing it",
        [text("#hero", "")],
        {
          steps: [
            value("#hero-name", "Coral Runner"),
            event("#hero-name", "keyup", "r"),
            check(text("#hero", "Coral Runner")),
            value("#hero-name", ""),
            event("#hero-name", "keyup", "Backspace"),
          ],
        },
      ),
      test(
        "A change event turns the aura green",
        [css("#hero", "color", "rgb(0, 128, 0)")],
        {
          steps: [
            value("#aura", "green"),
            check(css("#hero", "color", "rgb(0, 0, 255)")),
            event("#aura", "change"),
          ],
        },
      ),
      test(
        "Repeated color choices keep working",
        [css("#hero", "color", "rgb(255, 215, 0)"), text("#hero", "Sparky")],
        {
          steps: [
            value("#aura", "green"),
            event("#aura", "change"),
            check(css("#hero", "color", "rgb(0, 128, 0)")),
            value("#aura", "gold"),
            event("#aura", "change"),
          ],
        },
      ),
    ],
  },
  {
    id: 11,
    title: "Roll for damage",
    chapter: "Final battle",
    concept: "Build an interactive dice app",
    description:
      "The goblin boss is here. Build a six-sided damage die: every face possible, every click counted.",
    objectives: [
      "Keep #damage as Ready and #roll-count as 0 until #roll is clicked.",
      "On every click, show a whole number from 1 through 6 in #damage from a fresh Math.random().",
      "Use six equal ranges: Math.floor(Math.random() * 6) + 1.",
      "Increase #roll-count once per click and keep #villager reading Safe.",
    ],
    steps: [
      "Keep rolls, $damage, and $count outside rollDie. Write inside rollDie.",
      "const result = Math.floor(Math.random() * 6) + 1; then $damage.text(result).",
      'rolls += 1; then $count.text(rolls). Keep $("#roll").on("click", rollDie). Run spell.',
    ],
    syntax: 'const result = Math.floor(Math.random() * 6) + 1;\n$damage.text(result);',
    explanation:
      "Combine selection, setters, variables, functions, and events into a complete little app. Math.random() * 6 gives 0 up to 6; Math.floor rounds down to 0–5; adding 1 makes 1–6. Calculate inside the handler and keep the counter outside it. The checks visit all six faces, then roll several times in a row.",
    starter:
      'let rolls = 0;\nconst $damage = $("#damage");\nconst $count = $("#roll-count");\n\nfunction rollDie() {\n  // Calculate a fresh integer from 1 to 6 and show it with $damage.text().\n  // Then add 1 to rolls and show it with $count.text().\n}\n\n$("#roll").on("click", rollDie);',
    html: '<section id="battle"><p id="damage">Ready</p><p>Rolls: <span id="roll-count">0</span></p><button id="roll" type="button">Roll the die</button><p id="villager">Safe</p></section>',
    scene: [
      ["#damage", "boss", [[5, 2]], (el) => /^[1-6]$/.test(el.textContent)],
      ["#roll-count", "label", [[2, 6]]],
      ["#villager", "villager", VILLAGER],
    ],
    hints: [
      "The die value is Math.floor(Math.random() * 6) + 1.",
      "Inside rollDie, set $damage.text(result), increase rolls, then set $count.text(rolls).",
      "Register rollDie without parentheses. Draw inside the function, not once at the top.",
    ],
    solution:
      'let rolls = 0;\nconst $damage = $("#damage");\nconst $count = $("#roll-count");\n\nfunction rollDie() {\n  const result = Math.floor(Math.random() * 6) + 1;\n  $damage.text(result);\n  rolls += 1;\n  $count.text(rolls);\n}\n\n$("#roll").on("click", rollDie);',
    reward: 20,
    source:
      "Lecture: jQuery — slides 16–24 and 28, events, refactoring, and jQuery Mini Project: Dice App",
    tests: [
      test("The die waits for its first roll", [
        text("#damage", "Ready"),
        text("#roll-count", "0"),
      ]),
      ...[0, 0.2, 0.4, 0.6, 0.8, 0.999999].map((draw, index) =>
        test(
          `Face ${index + 1} can be rolled`,
          [
            text("#damage", String(index + 1)),
            text("#roll-count", "1"),
            text("#villager", "Safe"),
          ],
          { random: [draw], steps: [click("#roll")] },
        ),
      ),
      test(
        "Repeated rolls draw fresh values and keep count",
        [
          text("#damage", "3"),
          text("#roll-count", "3"),
          text("#villager", "Safe"),
        ],
        {
          random: [0, 0.999999, 0.4],
          steps: [
            click("#roll"),
            check(text("#damage", "1"), text("#roll-count", "1")),
            click("#roll"),
            check(text("#damage", "6"), text("#roll-count", "2")),
            click("#roll"),
          ],
        },
      ),
    ],
  },
];
