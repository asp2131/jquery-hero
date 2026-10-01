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
const event = (selector, name, key, which) => ({
  type: "event",
  selector,
  name,
  key,
  which,
});
const times = (n, action) => Array(n).fill(action);
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
      '// Select the element with the ID hero, then use the .text() method\n// to change its text to "Ready".\n$("#hero").text( );',
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
      '// Select all elements with the class goblin and use the .text()\n// method to set their text to "Spotted".\n$(".goblin").text("");',
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
      '// Select all elements with the class slime, then use the .css()\n// method to set their background color to blue. Then select the\n// element with the ID hero and set its text color to orange.\n$(".slime").css("background-color", "gray");',
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
      '// Select all elements with the class goblin, remove the shielded\n// class from them, then add the hit class to them.\n$(".goblin").removeClass("");\n$(".goblin").addClass("");',
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
      '// Select all elements with the class smoke and hide them. Then\n// select the element with the ID goblin and show it.\n$(".smoke").hide();',
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
      '// Create a new paragraph element, give it the ID slime and a\n// data-team attribute of hero, set its text to "Ally", and append\n// it inside the element with the ID party.\nconst $ally = $("<p>");',
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
      '// Select the villager and detach it from the page, empty everything\n// inside the cage, then append the villager inside the camp.\nconst $villager = $("#villager");',
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
      '// Select the element with the ID hero, set its text to "Ready", add\n// the charged class, change its text color to limegreen, and set its\n// title attribute to "Goblin slayer".\nconst $hero = $("#hero");\n$hero.text("Ready");',
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
      '// When the lever is clicked, check the text of the element with the\n// ID gate. If the text is "Closed", change it to "Open". Otherwise,\n// change it to "Closed".\nfunction toggleGate() {\n\n}\n\n$("#lever").on("click", toggleGate);',
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
      '// Start the swing count at 0. When the element with the ID attack is\n// clicked, run the swing function. Generate a random number to decide\n// whether the result is a "Hit" or "Miss", update the text of #result,\n// increase the swing count by 1, and display the new count in #swings.\nlet swings = 0;\n\nfunction swing() {\n\n}\n\n$("#attack").on("click", swing);',
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
      '// When the user types in the hero-name input, get the input\'s value\n// and use .text() to display it on the hero. When the aura dropdown\n// changes, get its value and use .css() to change the hero\'s text color.\nfunction paintName() {\n\n}\n\nfunction paintAura() {\n\n}\n\n$("#hero-name").on("keyup", paintName);\n$("#aura").on("change", paintAura);',
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
    chapter: "Goblin boss",
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
      '// Select and store the damage and roll-count elements. When the #roll\n// element is clicked, generate a random whole number from 1 to 6,\n// display it as the damage, increase the roll count by 1, and display\n// the updated count.\nlet rolls = 0;\nconst $damage = $("#damage");\nconst $count = $("#roll-count");\n\nfunction rollDie() {\n\n}\n\n$("#roll").on("click", rollDie);',
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
  {
    id: 12,
    title: "Steer the hero",
    chapter: "Dungeon gate",
    concept: "Conditional chains & keydown",
    description:
      "The hero takes orders from the arrow keys. Read which key was pressed and call out the direction. Any other key is unsupported.",
    objectives: [
      "On keydown, set #hero to Left, Up, Right, or Down for keys 37, 38, 39, and 40.",
      "Set #hero to Unsupported for any other key.",
      "Keep #hero reading Waiting until a key is pressed.",
    ],
    steps: [
      'Inside handleKeyDown, start the chain with if (event.which === 37) and set #hero to "Left".',
      'Add else if branches for 38 ("Up"), 39 ("Right"), and 40 ("Down").',
      'Finish with an else that sets "Unsupported". Keep the $(document).on("keydown", handleKeyDown) line. Run spell: the tests press keys for you.',
    ],
    syntax:
      "if (event.which === 37) {\n  // runs for key 37\n} else if (event.which === 38) {\n  // runs for key 38\n} else {\n  // runs when nothing above was true\n}",
    explanation:
      "An if starts a conditional chain, and each else if adds another (condition). JavaScript checks them from top to bottom and runs only the first branch whose condition is true. If none are true, the else runs. A keydown handler receives an event object; event.which is the number of the key: 37 is left, 38 up, 39 right, and 40 down.",
    starter:
      '// When any key is pressed, run handleKeyDown. If the key is 37, set\n// the hero\'s text to "Left"; 38 is "Up", 39 is "Right", and 40 is\n// "Down". Any other key sets it to "Unsupported".\nfunction handleKeyDown(event) {\n\n}\n\n$(document).on("keydown", handleKeyDown);',
    html: '<section id="battle"><p id="hero">Waiting</p><p class="goblin">Goblin</p><p class="goblin">Goblin</p></section>',
    scene: [
      ["#hero", "hero", [[2, 4]]],
      [
        ".goblin",
        "goblin",
        [
          [5, 1],
          [6, 3],
        ],
      ],
    ],
    hints: [
      "The handler's event parameter holds the key number: event.which.",
      "Compare with ===, for example event.which === 38.",
      "Only the final else has no (condition).",
    ],
    solution:
      'function handleKeyDown(event) {\n  if (event.which === 37) {\n    $("#hero").text("Left");\n  } else if (event.which === 38) {\n    $("#hero").text("Up");\n  } else if (event.which === 39) {\n    $("#hero").text("Right");\n  } else if (event.which === 40) {\n    $("#hero").text("Down");\n  } else {\n    $("#hero").text("Unsupported");\n  }\n}\n\n$(document).on("keydown", handleKeyDown);',
    reward: 20,
    source:
      "Lecture: Advanced Conditionals — slide 2, Review: conditional chains",
    tests: [
      test("The hero waits for a key", [text("#hero", "Waiting")]),
      ...[
        [37, "Left"],
        [38, "Up"],
        [39, "Right"],
        [40, "Down"],
      ].map(([which, direction]) =>
        test(`Key ${which} reads ${direction}`, [text("#hero", direction)], {
          steps: [event("#battle", "keydown", `Arrow${direction}`, which)],
        }),
      ),
      test("Other keys are unsupported", [text("#hero", "Unsupported")], {
        steps: [event("#battle", "keydown", "a", 65)],
      }),
      test("Every key press is checked again", [text("#hero", "Left")], {
        steps: [
          event("#battle", "keydown", "ArrowRight", 39),
          check(text("#hero", "Right")),
          event("#battle", "keydown", "a", 65),
          check(text("#hero", "Unsupported")),
          event("#battle", "keydown", "ArrowLeft", 37),
        ],
      }),
    ],
  },
  {
    id: 13,
    title: "Check your health",
    chapter: "Dungeon gate",
    concept: "Chain order & comparison operators",
    description:
      "Every goblin hit takes 10 HP. Show the hero's condition after each hit. Order matters: only the first true condition runs.",
    objectives: [
      "On each #hit click, lower hp by 10 and show it in #hp (already written).",
      "Set #hero to Defeated at 0 or less, Critical below 30, Wounded below 70, and Healthy otherwise.",
      "Keep #hero reading Healthy and #hp reading 100 before the first hit.",
    ],
    steps: [
      'Below $("#hp").text(hp), start the chain with if (hp <= 0) and set #hero to "Defeated".',
      'Add else if (hp < 30) for "Critical", then else if (hp < 70) for "Wounded".',
      'End with else for "Healthy". Run spell: the tests let the goblin hit you.',
    ],
    syntax:
      'if (score >= 90) {\n  grade = "A";\n} else if (score >= 80) {\n  grade = "B";\n} else {\n  grade = "C";\n}',
    explanation:
      "Comparison operators (>, >=, <, <=, ===, !==) are boolean expressions: each one resolves to true or false. In a chain, order matters. 0 is also below 30 and below 70, so the Defeated check must come first; the first true condition wins and the rest are skipped. 70 is not < 70, so 70 HP still counts as Healthy.",
    starter:
      '// Start hp at 100. When #hit is clicked, lower hp by 10 and show it\n// in #hp. Then set the hero\'s text to "Defeated" at 0 or less,\n// "Critical" below 30, "Wounded" below 70, and "Healthy" otherwise.\nlet hp = 100;\n\nfunction takeHit() {\n  hp -= 10;\n  $("#hp").text(hp);\n\n}\n\n$("#hit").on("click", takeHit);',
    html: '<section id="battle"><p id="hero">Healthy</p><p>HP: <span id="hp">100</span></p><button id="hit" type="button">Goblin attack</button><p class="goblin">Goblin</p></section>',
    scene: [
      ["#hero", "hero", [[2, 4]]],
      ["#hp", "label", [[2, 6]]],
      [".goblin", "goblin", [[4, 3]]],
    ],
    hints: [
      "Check the most extreme case first: hp <= 0.",
      "hp < 30 must come before hp < 70, or 20 HP would read Wounded.",
      "70 HP is not < 70, so it falls through to the else.",
    ],
    solution:
      'let hp = 100;\n\nfunction takeHit() {\n  hp -= 10;\n  $("#hp").text(hp);\n  if (hp <= 0) {\n    $("#hero").text("Defeated");\n  } else if (hp < 30) {\n    $("#hero").text("Critical");\n  } else if (hp < 70) {\n    $("#hero").text("Wounded");\n  } else {\n    $("#hero").text("Healthy");\n  }\n}\n\n$("#hit").on("click", takeHit);',
    reward: 20,
    source:
      "Lecture: Advanced Conditionals — slides 2–3, conditional chains and comparison operators",
    tests: [
      test("The hero starts healthy", [
        text("#hero", "Healthy"),
        text("#hp", "100"),
      ]),
      test(
        "70 HP is still Healthy",
        [text("#hp", "70"), text("#hero", "Healthy")],
        {
          steps: times(3, click("#hit")),
        },
      ),
      test("60 HP is Wounded", [text("#hero", "Wounded")], {
        steps: times(4, click("#hit")),
      }),
      test("30 HP is Wounded, 20 HP is Critical", [text("#hero", "Critical")], {
        steps: [
          ...times(7, click("#hit")),
          check(text("#hp", "30"), text("#hero", "Wounded")),
          click("#hit"),
        ],
      }),
      test(
        "Below 0 HP stays Defeated",
        [text("#hp", "-10"), text("#hero", "Defeated")],
        {
          steps: times(11, click("#hit")),
        },
      ),
      test("0 HP is Defeated", [text("#hp", "0"), text("#hero", "Defeated")], {
        steps: times(10, click("#hit")),
      }),
    ],
  },
  {
    id: 14,
    title: "Speak the password",
    chapter: "Dungeon gate",
    concept: "Comparing strings: === & !==",
    description:
      "The dungeon door opens only for the exact password moonbeam. Anything else, even Moonbeam, is the wrong word.",
    objectives: [
      "When #speak is clicked, read #password with .val().",
      "If the value !== moonbeam, set #door to Wrong word; otherwise set it to Open.",
      "Keep #door reading Locked until #speak is clicked.",
    ],
    steps: [
      'Inside speak, save the value: const word = $("#password").val();',
      'Write if (word !== "moonbeam") and set #door to "Wrong word".',
      'Add an else that sets #door to "Open". Run spell: the tests type passwords for you.',
    ],
    syntax:
      'if (answer !== "yes") {\n  // runs for anything except exactly "yes"\n} else {\n  // runs only for "yes"\n}',
    explanation:
      '=== is true only when both sides are exactly the same, and !== is its opposite: true whenever they differ. String comparison is exact, so "Moonbeam", "moonbeam " with a trailing space, and "" are all different from "moonbeam". Read the value inside the handler so each click checks what is typed right now.',
    starter:
      '// When #speak is clicked, get the value of the password input. If it\n// is not exactly "moonbeam", set the door\'s text to "Wrong word".\n// Otherwise, set it to "Open".\nfunction speak() {\n\n}\n\n$("#speak").on("click", speak);',
    html: '<section id="battle"><label>Password <input id="password" value=""></label><button id="speak" type="button">Speak</button><p id="door">Locked</p><p id="hero">Hero</p></section>',
    scene: [
      ["#door", "gate", [[4, 0]], (el) => el.textContent === "Open"],
      ["#hero", "hero", [[3, 3]]],
    ],
    hints: [
      'Use $("#password").val() inside the function.',
      'Compare with !== "moonbeam": lowercase, in quotes.',
      'The else branch sets "Open".',
    ],
    solution:
      'function speak() {\n  const word = $("#password").val();\n  if (word !== "moonbeam") {\n    $("#door").text("Wrong word");\n  } else {\n    $("#door").text("Open");\n  }\n}\n\n$("#speak").on("click", speak);',
    reward: 20,
    source:
      "Lecture: Advanced Conditionals — slide 3, Boolean Expressions: comparison operators",
    tests: [
      test("The door waits for a word", [text("#door", "Locked")]),
      test("A wrong word keeps it shut", [text("#door", "Wrong word")], {
        steps: [value("#password", "sunbeam"), click("#speak")],
      }),
      test("Capitals don't count", [text("#door", "Wrong word")], {
        steps: [value("#password", "Moonbeam"), click("#speak")],
      }),
      test("An empty password is wrong", [text("#door", "Wrong word")], {
        steps: [click("#speak")],
      }),
      test(
        "Every attempt is checked; moonbeam opens it",
        [text("#door", "Open")],
        {
          steps: [
            value("#password", "open sesame"),
            click("#speak"),
            check(text("#door", "Wrong word")),
            value("#password", "moonbeam"),
            click("#speak"),
          ],
        },
      ),
    ],
  },
  {
    id: 15,
    title: "Roll to dodge",
    chapter: "Treasure vault",
    concept: "Functions that return booleans",
    description:
      "Goblin archers guard the vault. Every volley, a dodge roll decides whether the hero takes damage.",
    objectives: [
      "Make dodgeRoll() return true when Math.random() > 0.5 and false otherwise.",
      "On each #fire click, if dodgeRoll() is true, set #hero to Dodged!.",
      "Otherwise set #hero to Ouch!, lower hp by 10, and show it in #hp.",
    ],
    steps: [
      "Inside dodgeRoll, write if (Math.random() > 0.5) { return true; } with an else that returns false.",
      'Inside fireArrows, write if (dodgeRoll()) and set #hero to "Dodged!".',
      'In the else: set #hero to "Ouch!", then hp -= 10; and $("#hp").text(hp). Run spell.',
    ],
    syntax:
      "function isTall(height) {\n  if (height > 180) {\n    return true;\n  } else {\n    return false;\n  }\n}\n\nif (isTall(200)) {\n  // runs, because isTall(200) returned true\n}",
    explanation:
      "A boolean expression doesn't have to be a comparison. A function call that returns true or false works too: if (dodgeRoll()) runs dodgeRoll, then uses the boolean it returns. Keep the () this time: you are calling the function for its answer, not handing it to an event. Call it inside the handler so every volley gets a fresh roll.",
    starter:
      '// dodgeRoll returns true if a random number is above 0.5 and false\n// otherwise. When #fire is clicked, call dodgeRoll as the condition:\n// if it returns true, set the hero\'s text to "Dodged!". Otherwise,\n// set it to "Ouch!", lower hp by 10, and show it in #hp.\nlet hp = 50;\n\nfunction dodgeRoll() {\n\n}\n\nfunction fireArrows() {\n\n}\n\n$("#fire").on("click", fireArrows);',
    html: '<section id="battle"><p id="hero">Ready</p><p>HP: <span id="hp">50</span></p><button id="fire" type="button">Goblins fire</button><p class="goblin">Archer</p><p class="goblin">Archer</p></section>',
    scene: [
      ["#hero", "hero", [[2, 4]]],
      ["#hp", "label", [[2, 6]]],
      [
        ".goblin",
        "goblin",
        [
          [5, 1],
          [6, 3],
        ],
      ],
    ],
    hints: [
      "dodgeRoll needs return true; in one branch and return false; in the other.",
      "if (dodgeRoll()) calls the function, so keep the parentheses there.",
      "Only the else branch lowers hp.",
    ],
    solution:
      'let hp = 50;\n\nfunction dodgeRoll() {\n  if (Math.random() > 0.5) {\n    return true;\n  } else {\n    return false;\n  }\n}\n\nfunction fireArrows() {\n  if (dodgeRoll()) {\n    $("#hero").text("Dodged!");\n  } else {\n    $("#hero").text("Ouch!");\n    hp -= 10;\n    $("#hp").text(hp);\n  }\n}\n\n$("#fire").on("click", fireArrows);',
    reward: 20,
    source:
      "Lecture: Advanced Conditionals — slide 3, Boolean Expressions: function calls",
    tests: [
      test("Nothing fires before a click", [
        text("#hero", "Ready"),
        text("#hp", "50"),
      ]),
      test(
        "A high roll dodges",
        [text("#hero", "Dodged!"), text("#hp", "50")],
        {
          random: [0.9],
          steps: [click("#fire")],
        },
      ),
      test("A low roll hurts", [text("#hero", "Ouch!"), text("#hp", "40")], {
        random: [0.1],
        steps: [click("#fire")],
      }),
      test("Exactly 0.5 is not a dodge", [text("#hero", "Ouch!")], {
        random: [0.5],
        steps: [click("#fire")],
      }),
      test(
        "Every volley rolls again",
        [text("#hero", "Dodged!"), text("#hp", "30")],
        {
          random: [0.1, 0.2, 0.9],
          steps: [
            click("#fire"),
            check(text("#hero", "Ouch!"), text("#hp", "40")),
            click("#fire"),
            check(text("#hero", "Ouch!"), text("#hp", "30")),
            click("#fire"),
          ],
        },
      ),
    ],
  },
  {
    id: 16,
    title: "Raise the shield",
    chapter: "Treasure vault",
    concept: "Boolean variables & the ! operator",
    description:
      "One button raises and lowers the hero's shield. A boolean variable remembers which one it is.",
    objectives: [
      "On each #shield click, flip shieldUp with the ! operator.",
      "If shieldUp is true, add the shielded class to #hero and set its text to Shield up.",
      "Otherwise remove the shielded class and set its text to Shield down.",
    ],
    steps: [
      "Inside toggleShield, first write shieldUp = !shieldUp; to flip the boolean.",
      'Then if (shieldUp): call .addClass("shielded") and .text("Shield up") on #hero.',
      'In the else: .removeClass("shielded") and .text("Shield down"). Run spell.',
    ],
    syntax:
      "let isOpen = false;\nisOpen = !isOpen; // now true\n\nif (isOpen) {\n  // runs when isOpen is true\n}",
    explanation:
      "A variable can hold a boolean value: true or false. if (shieldUp) needs no comparison, because shieldUp is already a boolean. The ! (NOT) operator flips a boolean: !true is false and !false is true. Writing shieldUp = !shieldUp; turns one button into a toggle.",
    starter:
      '// shieldUp starts as false. When #shield is clicked, flip it with the\n// ! operator. If shieldUp is true, add the shielded class to the hero\n// and set its text to "Shield up". Otherwise, remove the shielded\n// class and set its text to "Shield down".\nlet shieldUp = false;\n\nfunction toggleShield() {\n\n}\n\n$("#shield").on("click", toggleShield);',
    html: '<section id="battle"><p id="hero">Shield down</p><button id="shield" type="button">Shield</button><p class="goblin">Goblin</p><p class="goblin">Goblin</p></section>',
    scene: [
      ["#hero", "hero", [[2, 4]]],
      [
        ".goblin",
        "goblin",
        [
          [5, 1],
          [6, 3],
        ],
      ],
    ],
    hints: [
      "shieldUp = !shieldUp; goes first inside the function.",
      "if (shieldUp) works without === true.",
      'Class names go without a dot: .addClass("shielded").',
    ],
    solution:
      'let shieldUp = false;\n\nfunction toggleShield() {\n  shieldUp = !shieldUp;\n  if (shieldUp) {\n    $("#hero").addClass("shielded").text("Shield up");\n  } else {\n    $("#hero").removeClass("shielded").text("Shield down");\n  }\n}\n\n$("#shield").on("click", toggleShield);',
    reward: 20,
    source:
      "Lecture: Advanced Conditionals — slides 3–4, constant booleans and the ! operator",
    tests: [
      test("The shield starts down", [
        text("#hero", "Shield down"),
        hasClass("#hero", "shielded", false),
      ]),
      test(
        "One click raises it",
        [text("#hero", "Shield up"), hasClass("#hero", "shielded")],
        { steps: [click("#shield")] },
      ),
      test(
        "A second click lowers it",
        [text("#hero", "Shield down"), hasClass("#hero", "shielded", false)],
        { steps: times(2, click("#shield")) },
      ),
      test(
        "It keeps toggling",
        [text("#hero", "Shield up"), hasClass("#hero", "shielded")],
        {
          steps: [
            click("#shield"),
            click("#shield"),
            check(hasClass("#hero", "shielded", false)),
            click("#shield"),
          ],
        },
      ),
    ],
  },
  {
    id: 17,
    title: "Open the vault",
    chapter: "Treasure vault",
    concept: "The && (AND) operator",
    description:
      "The treasure vault has two locks. It opens only when the hero holds the red key and the blue key.",
    objectives: [
      "When #open is clicked, set #vault to Open only if hasRedKey && hasBlueKey.",
      "Otherwise set #vault to Locked.",
      "Leave the key buttons working as given.",
    ],
    steps: [
      "Inside openVault, write if (hasRedKey && hasBlueKey).",
      'Set #vault to "Open" in that branch and "Locked" in the else.',
      "Leave the key functions and .on() lines as they are. Run spell: the tests pick up keys for you.",
    ],
    syntax:
      "if (hasTicket && hasSeat) {\n  // runs only when both are true\n} else {\n  // runs when either one is false\n}",
    explanation:
      "Logical operators act on boolean expressions and resolve to a new boolean. && (AND) is true only when both sides are true: true && true is true, while true && false, false && true, and false && false are all false. One key is not enough.",
    starter:
      '// Clicking a key button picks up that key. When #open is clicked, if\n// the hero has the red key AND the blue key, set the vault\'s text to\n// "Open". Otherwise, set it to "Locked".\nlet hasRedKey = false;\nlet hasBlueKey = false;\n\nfunction takeRedKey() {\n  hasRedKey = true;\n  $("#red-key").text("Taken");\n}\n\nfunction takeBlueKey() {\n  hasBlueKey = true;\n  $("#blue-key").text("Taken");\n}\n\nfunction openVault() {\n\n}\n\n$("#red-key").on("click", takeRedKey);\n$("#blue-key").on("click", takeBlueKey);\n$("#open").on("click", openVault);',
    html: '<section id="battle"><button id="red-key" type="button">Red key</button><button id="blue-key" type="button">Blue key</button><button id="open" type="button">Open vault</button><p id="vault">Sealed</p></section>',
    scene: [
      ["#vault", "gate", [[4, 0]], (el) => el.textContent === "Open"],
      ["#red-key", "label", [[1, 2]]],
      ["#blue-key", "label", [[3, 2]]],
    ],
    hints: [
      "Both variables already exist: hasRedKey and hasBlueKey.",
      "&& sits between the two conditions inside one pair of parentheses.",
      "The else covers every other case.",
    ],
    solution:
      'let hasRedKey = false;\nlet hasBlueKey = false;\n\nfunction takeRedKey() {\n  hasRedKey = true;\n  $("#red-key").text("Taken");\n}\n\nfunction takeBlueKey() {\n  hasBlueKey = true;\n  $("#blue-key").text("Taken");\n}\n\nfunction openVault() {\n  if (hasRedKey && hasBlueKey) {\n    $("#vault").text("Open");\n  } else {\n    $("#vault").text("Locked");\n  }\n}\n\n$("#red-key").on("click", takeRedKey);\n$("#blue-key").on("click", takeBlueKey);\n$("#open").on("click", openVault);',
    reward: 20,
    source:
      "Lecture: Advanced Conditionals — slides 4 and 6, Logical Operators: &&",
    tests: [
      test("No keys: the vault stays locked", [text("#vault", "Locked")], {
        steps: [click("#open")],
      }),
      test("The red key alone is not enough", [text("#vault", "Locked")], {
        steps: [click("#red-key"), click("#open")],
      }),
      test("The blue key alone is not enough", [text("#vault", "Locked")], {
        steps: [click("#blue-key"), click("#open")],
      }),
      test("Both keys open the vault", [text("#vault", "Open")], {
        steps: [click("#red-key"), click("#blue-key"), click("#open")],
      }),
    ],
  },
  {
    id: 18,
    title: "Enter the guild",
    chapter: "Guild hall",
    concept: "The || (OR) operator",
    description:
      "The guild guard lets in anyone level 5 or higher, or anyone wearing a guild badge. Either one is enough.",
    objectives: [
      "When #enter is clicked, set #guard to Welcome if level >= 5 || hasBadge.",
      "Otherwise set #guard to Go away.",
      "Leave the training and badge buttons working as given.",
    ],
    steps: [
      "Inside enterGuild, write if (level >= 5 || hasBadge).",
      'Set #guard to "Welcome" in that branch and "Go away" in the else.',
      "Leave train, takeBadge, and the .on() lines as given. Run spell.",
    ],
    syntax:
      "if (isWeekend || isHoliday) {\n  // runs when at least one is true\n} else {\n  // runs only when both are false\n}",
    explanation:
      "|| (OR) is true when at least one side is true; it is false only when both sides are false. In the slides, if (user.age >= 18 || user.isAdmin) replaces an if and an else if that did the same thing. A comparison like level >= 5 and a boolean like hasBadge can sit on either side.",
    starter:
      '// Training raises the hero\'s level, and the badge button gives a\n// badge. When #enter is clicked, if the level is 5 or more OR the hero\n// has a badge, set the guard\'s text to "Welcome". Otherwise, set it to\n// "Go away".\nlet level = 1;\nlet hasBadge = false;\n\nfunction train() {\n  level += 1;\n  $("#level").text(level);\n}\n\nfunction takeBadge() {\n  hasBadge = true;\n  $("#badge").text("Badge worn");\n}\n\nfunction enterGuild() {\n\n}\n\n$("#train").on("click", train);\n$("#badge").on("click", takeBadge);\n$("#enter").on("click", enterGuild);',
    html: '<section id="battle"><p>Level: <span id="level">1</span></p><button id="train" type="button">Train</button><button id="badge" type="button">Take badge</button><button id="enter" type="button">Enter guild</button><p id="guard">Halt</p></section>',
    scene: [
      ["#guard", "villager", [[4, 1]]],
      ["#level", "label", [[2, 6]]],
    ],
    hints: [
      "Use >= so level 5 counts.",
      "|| goes between the two conditions.",
      "hasBadge is already a boolean; no === true needed.",
    ],
    solution:
      'let level = 1;\nlet hasBadge = false;\n\nfunction train() {\n  level += 1;\n  $("#level").text(level);\n}\n\nfunction takeBadge() {\n  hasBadge = true;\n  $("#badge").text("Badge worn");\n}\n\nfunction enterGuild() {\n  if (level >= 5 || hasBadge) {\n    $("#guard").text("Welcome");\n  } else {\n    $("#guard").text("Go away");\n  }\n}\n\n$("#train").on("click", train);\n$("#badge").on("click", takeBadge);\n$("#enter").on("click", enterGuild);',
    reward: 20,
    source:
      "Lecture: Advanced Conditionals — slides 5–6, Code Challenge: refactor with ||",
    tests: [
      test(
        "Level 1 without a badge is turned away",
        [text("#guard", "Go away")],
        {
          steps: [click("#enter")],
        },
      ),
      test(
        "Level 4 is still too low",
        [text("#level", "4"), text("#guard", "Go away")],
        {
          steps: [...times(3, click("#train")), click("#enter")],
        },
      ),
      test("A badge is enough at level 1", [text("#guard", "Welcome")], {
        steps: [click("#badge"), click("#enter")],
      }),
      test(
        "Level 5 is enough without a badge",
        [text("#level", "5"), text("#guard", "Welcome")],
        {
          steps: [...times(4, click("#train")), click("#enter")],
        },
      ),
    ],
  },
  {
    id: 19,
    title: "The boss door",
    chapter: "Guild hall",
    concept: "Combining &&, || & parentheses",
    description:
      "The goblin king's door needs the boss key, plus either level 5 or a guild badge. The key alone isn't enough, and neither is a badge without the key.",
    objectives: [
      "When #open is clicked, set #door to Open if hasKey && (level >= 5 || hasBadge).",
      "Otherwise set #door to Sealed.",
      "Leave the training, badge, and key buttons working as given.",
    ],
    steps: [
      "Inside openDoor, write if (hasKey && (level >= 5 || hasBadge)).",
      "The inner parentheses turn the || part into one boolean before && joins it with hasKey.",
      'Set #door to "Open" in the if and "Sealed" in the else. Run spell.',
    ],
    syntax:
      "if (hasTicket && (age >= 18 || withAdult)) {\n  // a ticket, plus at least one of the others\n}",
    explanation:
      "As in math, parentheses decide what is worked out first. In hasKey && (level >= 5 || hasBadge), the || resolves first, then && also requires the key. Without the parentheses, && goes before ||, so hasKey && level >= 5 || hasBadge would open for a badge alone. This is answer D from the slides' A, B, C, and or D puzzle.",
    starter:
      '// Opening the door needs the boss key AND either level 5 or more OR a\n// badge. When #open is clicked, if all that is true, set the door\'s\n// text to "Open". Otherwise, set it to "Sealed".\nlet level = 1;\nlet hasBadge = false;\nlet hasKey = false;\n\nfunction train() {\n  level += 1;\n  $("#level").text(level);\n}\n\nfunction takeBadge() {\n  hasBadge = true;\n  $("#badge").text("Badge worn");\n}\n\nfunction takeKey() {\n  hasKey = true;\n  $("#key").text("Key taken");\n}\n\nfunction openDoor() {\n\n}\n\n$("#train").on("click", train);\n$("#badge").on("click", takeBadge);\n$("#key").on("click", takeKey);\n$("#open").on("click", openDoor);',
    html: '<section id="battle"><p>Level: <span id="level">1</span></p><button id="train" type="button">Train</button><button id="badge" type="button">Take badge</button><button id="key" type="button">Boss key</button><button id="open" type="button">Open door</button><p id="door">Closed</p><p id="boss">Goblin king</p></section>',
    scene: [
      ["#door", "gate", [[4, 0]], (el) => el.textContent === "Open"],
      ["#boss", "boss", [[5, 2]]],
      ["#key", "label", [[1, 2]]],
      ["#level", "label", [[2, 6]]],
    ],
    hints: [
      "Start the condition with hasKey &&.",
      "Wrap level >= 5 || hasBadge in its own parentheses.",
      'The else sets "Sealed".',
    ],
    solution:
      'let level = 1;\nlet hasBadge = false;\nlet hasKey = false;\n\nfunction train() {\n  level += 1;\n  $("#level").text(level);\n}\n\nfunction takeBadge() {\n  hasBadge = true;\n  $("#badge").text("Badge worn");\n}\n\nfunction takeKey() {\n  hasKey = true;\n  $("#key").text("Key taken");\n}\n\nfunction openDoor() {\n  if (hasKey && (level >= 5 || hasBadge)) {\n    $("#door").text("Open");\n  } else {\n    $("#door").text("Sealed");\n  }\n}\n\n$("#train").on("click", train);\n$("#badge").on("click", takeBadge);\n$("#key").on("click", takeKey);\n$("#open").on("click", openDoor);',
    reward: 20,
    source: "Lecture: Advanced Conditionals — slides 7–8, A, B, C and or D?",
    tests: [
      test("The key alone is not enough", [text("#door", "Sealed")], {
        steps: [click("#key"), click("#open")],
      }),
      test("A badge without the key is not enough", [text("#door", "Sealed")], {
        steps: [click("#badge"), click("#open")],
      }),
      test("Level 5 without the key is not enough", [text("#door", "Sealed")], {
        steps: [...times(4, click("#train")), click("#open")],
      }),
      test("The key and a badge open it", [text("#door", "Open")], {
        steps: [click("#key"), click("#badge"), click("#open")],
      }),
      test("The key and level 5 open it", [text("#door", "Open")], {
        steps: [click("#key"), ...times(4, click("#train")), click("#open")],
      }),
    ],
  },
  {
    id: 20,
    title: "Empty the quiver",
    chapter: "Guild hall",
    concept: "Truthy & falsy values",
    description:
      "The hero has 3 arrows, and each shot uses one. When the quiver is empty, the goblin laughs and the count never drops below 0.",
    objectives: [
      "Use arrows itself as the condition: if (arrows).",
      "While arrows remain, subtract 1, show the count in #arrows, and set #goblin to Hit!.",
      "When arrows is 0, set #goblin to Ha ha! and leave the count at 0.",
    ],
    steps: [
      "Inside shoot, write if (arrows), with no comparison.",
      'In the if: arrows -= 1; then $("#arrows").text(arrows); then set #goblin to "Hit!".',
      'In the else, set #goblin to "Ha ha!". Run spell: the tests shoot for you.',
    ],
    syntax:
      "let potions = 2;\nif (potions) {\n  // runs for any number except 0\n}",
    explanation:
      'Inside the (parentheses) of an if, JavaScript forces the value to become true or false: this is a boolean context. Falsy values become false: null, undefined, 0, "", false, and NaN. Everything else is truthy. So if (arrows) runs while arrows is 3, 2, or 1, and stops at 0. if (arrows > 0) also passes the checks; the short form is the point of this quest.',
    starter:
      '// The hero starts with 3 arrows. When #shoot is clicked, use the\n// number of arrows itself as the condition. If any are left, subtract\n// 1, show the new count in #arrows, and set the goblin\'s text to\n// "Hit!". Otherwise, set the goblin\'s text to "Ha ha!".\nlet arrows = 3;\n\nfunction shoot() {\n\n}\n\n$("#shoot").on("click", shoot);',
    html: '<section id="battle"><p>Arrows: <span id="arrows">3</span></p><button id="shoot" type="button">Shoot</button><p id="goblin">Goblin</p></section>',
    scene: [
      ["#goblin", "goblin", [[5, 2]], (el) => el.textContent === "Hit!"],
      ["#arrows", "label", [[2, 6]]],
    ],
    hints: [
      "if (arrows) is false only when arrows is 0.",
      "Subtract inside the if, so an empty quiver stays at 0.",
      "Show the count after subtracting.",
    ],
    solution:
      'let arrows = 3;\n\nfunction shoot() {\n  if (arrows) {\n    arrows -= 1;\n    $("#arrows").text(arrows);\n    $("#goblin").text("Hit!");\n  } else {\n    $("#goblin").text("Ha ha!");\n  }\n}\n\n$("#shoot").on("click", shoot);',
    reward: 20,
    source:
      "Lecture: Advanced Conditionals — slides 9–10, Boolean Context and Truthy & Falsey",
    tests: [
      test("Nothing fires before a click", [
        text("#arrows", "3"),
        text("#goblin", "Goblin"),
      ]),
      test(
        "One shot hits and uses an arrow",
        [text("#arrows", "2"), text("#goblin", "Hit!")],
        {
          steps: [click("#shoot")],
        },
      ),
      test(
        "A fourth shot finds the quiver empty",
        [text("#arrows", "0"), text("#goblin", "Ha ha!")],
        {
          steps: times(4, click("#shoot")),
        },
      ),
      test(
        "The count never drops below 0",
        [text("#arrows", "0"), text("#goblin", "Ha ha!")],
        {
          steps: times(6, click("#shoot")),
        },
      ),
      test(
        "All three arrows hit",
        [text("#arrows", "0"), text("#goblin", "Hit!")],
        {
          steps: times(3, click("#shoot")),
        },
      ),
    ],
  },
  {
    id: 21,
    title: "Join the party",
    chapter: "Goblin king",
    concept: "Falsy strings & !",
    description:
      "A slime wants to join the party before the last fight, but it needs a name first. An empty name is falsy, so ! catches it.",
    objectives: [
      "When #join is clicked, read #recruit-name with .val().",
      "If !name, set #message to Name required and leave #recruit alone.",
      "Otherwise set #recruit to the name and #message to Welcome, followed by the name.",
    ],
    steps: [
      'Inside join, save the value: const name = $("#recruit-name").val();',
      'Write if (!name) and set #message to "Name required".',
      'In the else, set #recruit to name and #message to "Welcome, " + name. Run spell.',
    ],
    syntax:
      'const answer = $("#answer").val();\nif (!answer) {\n  // runs when answer is "" (falsy)\n}',
    explanation:
      '"" (the empty string) is falsy, so !name is true exactly when nothing was typed. Every other string is truthy, even "0". This is the slides\' !user.ID trick: ! flips truthiness, so a missing or empty value becomes true. + joins strings: "Welcome, " + name.',
    starter:
      '// When #join is clicked, get the value of the name input. If the name\n// is empty, set the message to "Name required". Otherwise, set the\n// recruit\'s text to the name and set the message to "Welcome, "\n// followed by the name.\nfunction join() {\n\n}\n\n$("#join").on("click", join);',
    html: '<section id="battle"><label>Name <input id="recruit-name" value=""></label><button id="join" type="button">Join party</button><p id="recruit">Recruit</p><p id="message">Who goes there?</p></section>',
    scene: [
      ["#recruit", "slime", [[1, 5]], (el) => el.textContent !== "Recruit"],
      ["#message", "label", [[3, 6]]],
    ],
    hints: [
      "! goes right before the variable: if (!name).",
      '"Welcome, " + name joins the strings, including the comma and space.',
      "Read the value inside join so each click checks the current text.",
    ],
    solution:
      'function join() {\n  const name = $("#recruit-name").val();\n  if (!name) {\n    $("#message").text("Name required");\n  } else {\n    $("#recruit").text(name);\n    $("#message").text("Welcome, " + name);\n  }\n}\n\n$("#join").on("click", join);',
    reward: 20,
    source:
      "Lecture: Advanced Conditionals — slides 10–12, Truthy & Falsey and the ! operator",
    tests: [
      test(
        "An empty name is refused",
        [text("#message", "Name required"), text("#recruit", "Recruit")],
        { steps: [click("#join")] },
      ),
      test(
        "The name 0 is still a name",
        [text("#recruit", "0"), text("#message", "Welcome, 0")],
        {
          steps: [value("#recruit-name", "0"), click("#join")],
        },
      ),
      test(
        "Clearing the name is refused again",
        [text("#message", "Name required"), text("#recruit", "Moss")],
        {
          steps: [
            value("#recruit-name", "Moss"),
            click("#join"),
            value("#recruit-name", ""),
            click("#join"),
          ],
        },
      ),
      test(
        "A name joins the party",
        [text("#recruit", "Fern"), text("#message", "Welcome, Fern")],
        { steps: [value("#recruit-name", "Fern"), click("#join")] },
      ),
    ],
  },
  {
    id: 22,
    title: "Flip the coin",
    chapter: "Goblin king",
    concept: "The ternary operator",
    description:
      "Flip a coin for the hero's blessing before the final battle. Heads glows gold; tails glows silver.",
    objectives: [
      "On each #flip click, use condition ? a : b to pick Heads when Math.random() > 0.5 and Tails otherwise.",
      "Show the result in #hero.",
      "Use a second ternary to set the color of #hero to gold for Heads and silver for Tails.",
    ],
    steps: [
      'Inside flip: const result = Math.random() > 0.5 ? "Heads" : "Tails";',
      'Show it with $("#hero").text(result);',
      'Then: $("#hero").css("color", result === "Heads" ? "gold" : "silver"); Run spell.',
    ],
    syntax: 'const label = score >= 50 ? "Pass" : "Fail";',
    explanation:
      "The expression condition ? a : b resolves to a when the condition is true and to b when it is false. It replaces an if/else whose only job is to choose a value, so it fits inside a const or a method call. Draw Math.random() once and reuse result, or the color could disagree with the text. The checks look at results, so an if/else also passes; the ternary is the shorter spell.",
    starter:
      '// When #flip is clicked, use the ternary operator to save "Heads" if a\n// random number is above 0.5 and "Tails" otherwise. Show the result on\n// the hero, then use another ternary to set the hero\'s text color to\n// gold for "Heads" and silver for "Tails".\nfunction flip() {\n\n}\n\n$("#flip").on("click", flip);',
    html: '<section id="battle"><p id="hero" style="color:white">Waiting</p><button id="flip" type="button">Flip coin</button><p class="goblin">Goblin</p></section>',
    scene: [
      ["#hero", "hero", [[2, 4]]],
      [".goblin", "goblin", [[5, 2]]],
    ],
    hints: [
      "The shape is condition ? valueIfTrue : valueIfFalse.",
      "Save the first ternary in const result.",
      'The second ternary checks result === "Heads".',
    ],
    solution:
      'function flip() {\n  const result = Math.random() > 0.5 ? "Heads" : "Tails";\n  $("#hero").text(result);\n  $("#hero").css("color", result === "Heads" ? "gold" : "silver");\n}\n\n$("#flip").on("click", flip);',
    reward: 20,
    source: "Lecture: Advanced Conditionals — slides 13–14, Ternary Operator",
    tests: [
      test("Nothing flips before a click", [
        text("#hero", "Waiting"),
        css("#hero", "color", "rgb(255, 255, 255)"),
      ]),
      test(
        "A high draw is Heads in gold",
        [text("#hero", "Heads"), css("#hero", "color", "rgb(255, 215, 0)")],
        { random: [0.9], steps: [click("#flip")] },
      ),
      test(
        "A low draw is Tails in silver",
        [text("#hero", "Tails"), css("#hero", "color", "rgb(192, 192, 192)")],
        { random: [0.1], steps: [click("#flip")] },
      ),
      test("Exactly 0.5 is Tails", [text("#hero", "Tails")], {
        random: [0.5],
        steps: [click("#flip")],
      }),
      test(
        "Every flip draws again",
        [text("#hero", "Heads"), css("#hero", "color", "rgb(255, 215, 0)")],
        {
          random: [0.2, 0.7],
          steps: [
            click("#flip"),
            check(
              text("#hero", "Tails"),
              css("#hero", "color", "rgb(192, 192, 192)"),
            ),
            click("#flip"),
          ],
        },
      ),
    ],
  },
  {
    id: 23,
    title: "Catch the goblin king",
    chapter: "Final battle",
    concept: "Collision detection: doCollide",
    description:
      "Walk the hero into the goblin king. Two boxes collide only when they overlap both across and down; touching edges don't count.",
    objectives: [
      "Make doCollide(a, b) return true only when box a overlaps box b.",
      "Compare opposite sides: a's left with b's right, a's right with b's left, and the same for top and bottom.",
      "After every move, set #boss to Hit! if doCollide(hero, boss) is true, otherwise Clear.",
    ],
    steps: [
      "In doCollide, work out each side: left is x, right is x + width, top is y, bottom is y + height.",
      "Return true only if a's left < b's right && a's right > b's left && a's top < b's bottom && a's bottom > b's top. Otherwise return false.",
      'In update, below the .css() line: $("#boss").text(doCollide(hero, boss) ? "Hit!" : "Clear"); Run spell: the tests walk the hero for you.',
    ],
    syntax:
      "const box = { x: 10, y: 20, width: 50, height: 30 };\nconst left = box.x;\nconst right = box.x + box.width;\nconst top = box.y;\nconst bottom = box.y + box.height;",
    explanation:
      "A box's x and y mark its top-left corner, and y grows downward. Its sides are left = x, right = x + width, top = y, and bottom = y + height. Two boxes overlap only when each starts before the other ends, both across (a's left < b's right and a's right > b's left) and down (a's top < b's bottom and a's bottom > b's top). Using < and > means boxes that only touch don't collide. .css(\"left\", hero.x) and .css(\"top\", hero.y) move the hero; in the arena, 50px is one tile.",
    starter:
      '// Each box has an x, y, width, and height. doCollide returns true only\n// if box a overlaps box b. After every move, show the hero at its new\n// position, then set the boss\'s text to "Hit!" if the boxes collide\n// and "Clear" if they don\'t.\nconst hero = { x: 0, y: 0, width: 50, height: 50 };\nconst boss = { x: 100, y: 100, width: 50, height: 50 };\n\nfunction doCollide(a, b) {\n\n}\n\nfunction update() {\n  $("#hero").css("left", hero.x).css("top", hero.y);\n\n}\n\nfunction moveRight() {\n  hero.x += 25;\n  update();\n}\n\nfunction moveDown() {\n  hero.y += 25;\n  update();\n}\n\n$("#right").on("click", moveRight);\n$("#down").on("click", moveDown);',
    html: '<section id="battle"><p id="hero" style="left:0px;top:0px">Hero</p><p id="boss" style="left:100px;top:100px">Clear</p><button id="right" type="button">Step right</button><button id="down" type="button">Step down</button></section>',
    scene: [
      ["#hero", "hero", [[1, 1]]],
      ["#boss", "boss", [[1, 1]], (el) => el.textContent === "Hit!"],
    ],
    hints: [
      "a.x + a.width is a's right side; a.y + a.height is its bottom.",
      "All four comparisons must be true, so join them with &&.",
      "Use < and >, not <= and >=: touching edges are not a hit.",
    ],
    solution:
      'const hero = { x: 0, y: 0, width: 50, height: 50 };\nconst boss = { x: 100, y: 100, width: 50, height: 50 };\n\nfunction doCollide(a, b) {\n  const aRight = a.x + a.width;\n  const aBottom = a.y + a.height;\n  const bRight = b.x + b.width;\n  const bBottom = b.y + b.height;\n  if (a.x < bRight && aRight > b.x && a.y < bBottom && aBottom > b.y) {\n    return true;\n  } else {\n    return false;\n  }\n}\n\nfunction update() {\n  $("#hero").css("left", hero.x).css("top", hero.y);\n  $("#boss").text(doCollide(hero, boss) ? "Hit!" : "Clear");\n}\n\nfunction moveRight() {\n  hero.x += 25;\n  update();\n}\n\nfunction moveDown() {\n  hero.y += 25;\n  update();\n}\n\n$("#right").on("click", moveRight);\n$("#down").on("click", moveDown);',
    reward: 20,
    source:
      "Lecture: Advanced Conditionals — slides 16–20 and 23, doCollide, Object Borders, and the jQuery Reference",
    tests: [
      test("The hero starts clear", [text("#boss", "Clear")]),
      test("Beside the boss but higher up is clear", [text("#boss", "Clear")], {
        steps: times(3, click("#right")),
      }),
      test(
        "Level with the boss but off to the left is clear",
        [text("#boss", "Clear")],
        {
          steps: times(3, click("#down")),
        },
      ),
      test("Touching edges is clear", [text("#boss", "Clear")], {
        steps: [...times(2, click("#right")), ...times(3, click("#down"))],
      }),
      test("Walking past the boss is clear", [text("#boss", "Clear")], {
        steps: [...times(7, click("#right")), ...times(3, click("#down"))],
      }),
      test("Walking below the boss is clear", [text("#boss", "Clear")], {
        steps: [...times(3, click("#right")), ...times(7, click("#down"))],
      }),
      test("Overlapping the boss is a hit", [text("#boss", "Hit!")], {
        steps: [
          ...times(3, click("#right")),
          ...times(2, click("#down")),
          check(text("#boss", "Clear")),
          click("#down"),
        ],
      }),
    ],
  },
];
