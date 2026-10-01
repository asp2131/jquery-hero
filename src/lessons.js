// The runner checks observable state (the DOM, the console, return values),
// never a particular spelling of a solution.
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
// Console quests: what was logged, and what a learner's function returns.
const logs = (...lines) => ({ type: "logs", value: lines });
const returns = (fn, args, value) => ({ type: "returns", fn, args, value });
const call = (fn, ...args) => ({ type: "call", fn, args });
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
  // Advanced Conditionals quests are plain JavaScript, like the lecture's examples:
  // the tests call the learner's functions and read the console. No jQuery.
  {
    id: 12,
    title: "Guests only",
    chapter: "Dungeon gate",
    concept: "The ! (NOT) operator",
    console: true,
    description:
      "The dungeon gate opens for guests: anyone who is not an admin. Use ! to flip the user's isAdmin boolean.",
    objectives: [
      "isGuest(user) returns true when user.isAdmin is false.",
      "It returns false when user.isAdmin is true.",
    ],
    steps: [
      "Try it out first: add console.log(!true); and console.log(!false); and run to see them in the console tab.",
      "Inside isGuest, return !user.isAdmin;",
      "Run spell: the tests try an admin and a guest.",
    ],
    syntax: "console.log(!true); // false\nconsole.log(!false); // true",
    explanation:
      "Logical operators act on boolean expressions and resolve to a new boolean. ! (NOT) flips one boolean: !true is false and !false is true. Because !user.isAdmin is already true or false, you can return it directly; no if is needed.",
    starter:
      '// isGuest receives a user like { name: "John", age: 25, isAdmin: false }\n// and returns true if the user is not an admin, and false if they are.\nfunction isGuest(user) {\n\n}',
    html: '<section id="battle"><p id="door">Locked</p><p id="hero">Hero</p></section>',
    won: '<section id="battle"><p id="door">Open</p><p id="hero">Hero</p></section>',
    scene: [
      ["#door", "gate", [[4, 0]], (el) => el.textContent === "Open"],
      ["#hero", "hero", [[3, 3]]],
    ],
    hints: [
      "The boolean lives on the object: user.isAdmin.",
      "! goes right before the value: !user.isAdmin.",
      "return sends the flipped boolean back.",
    ],
    solution: "function isGuest(user) {\n  return !user.isAdmin;\n}",
    reward: 20,
    source: "Lecture: Advanced Conditionals — slide 4, Logical Operators: !",
    tests: [
      test("A user who isn't an admin is a guest", [
        returns("isGuest", [{ name: "John", age: 25, isAdmin: false }], true),
      ]),
      test("An admin is not a guest", [
        returns("isGuest", [{ name: "Ana", age: 30, isAdmin: true }], false),
      ]),
    ],
  },
  {
    id: 13,
    title: "Cast a spell",
    chapter: "Dungeon gate",
    concept: "The && (AND) operator",
    console: true,
    description:
      "A spell needs mana and a wand. Missing either one, and it fizzles.",
    objectives: [
      "canCast(hasMana, hasWand) returns true only when both are true.",
      "It returns false for every other combination.",
    ],
    steps: [
      "Try it out first: console.log(true && false); Predict the answer, then run and check the console tab.",
      "Inside canCast, return hasMana && hasWand;",
      "Run spell: the tests try all four combinations.",
    ],
    syntax:
      "console.log(true && true); // true\nconsole.log(true && false); // false\nconsole.log(false && true); // false\nconsole.log(false && false); // false",
    explanation:
      "&& (AND) is true only if both sides are true. Out of the four combinations of two booleans, only true && true is true. Read it as \"this and that\".",
    starter:
      "// canCast receives two booleans: whether the hero has mana and whether\n// the hero has a wand. It returns true only if the hero has both.\nfunction canCast(hasMana, hasWand) {\n\n}",
    html: '<section id="battle"><p id="hero">Hero</p><p class="goblin">Goblin</p></section>',
    won: '<section id="battle"><p id="hero">Spell cast!</p><p class="goblin">Hit!</p></section>',
    scene: [
      ["#hero", "hero", [[2, 4]], (el) => el.textContent === "Spell cast!"],
      [".goblin", "goblin", [[5, 2]], (el) => el.textContent === "Hit!"],
    ],
    hints: [
      "&& goes between the two booleans.",
      "Both parameters are already booleans; no === true needed.",
      "return hasMana && hasWand; is the whole function.",
    ],
    solution:
      "function canCast(hasMana, hasWand) {\n  return hasMana && hasWand;\n}",
    reward: 20,
    source: "Lecture: Advanced Conditionals — slide 4, Logical Operators: &&",
    tests: [
      test("true && true is true", [returns("canCast", [true, true], true)]),
      test("true && false is false", [
        returns("canCast", [true, false], false),
      ]),
      test("false && true is false", [
        returns("canCast", [false, true], false),
      ]),
      test("false && false is false", [
        returns("canCast", [false, false], false),
      ]),
    ],
  },
  {
    id: 14,
    title: "Find a way out",
    chapter: "Dungeon gate",
    concept: "The || (OR) operator",
    console: true,
    description:
      "The hero is trapped in a pit. A rope or a key gets them out; either one is enough.",
    objectives: [
      "canEscape(hasRope, hasKey) returns true when at least one is true.",
      "It returns false only when both are false.",
    ],
    steps: [
      "Try it out first: console.log(false || true); Predict the answer, then run and check the console tab.",
      "Inside canEscape, return hasRope || hasKey;",
      "Run spell: the tests try all four combinations.",
    ],
    syntax:
      "console.log(true || true); // true\nconsole.log(true || false); // true\nconsole.log(false || true); // true\nconsole.log(false || false); // false",
    explanation:
      "|| (OR) is true if at least one side is true. Out of the four combinations of two booleans, only false || false is false. Read it as \"this or that, or both\".",
    starter:
      "// canEscape receives two booleans: whether the hero has a rope and\n// whether the hero has a key. It returns true if the hero has at least\n// one of them.\nfunction canEscape(hasRope, hasKey) {\n\n}",
    html: '<section id="battle"><p id="door">Locked</p><p id="hero">Hero</p></section>',
    won: '<section id="battle"><p id="door">Open</p><p id="hero">Free!</p></section>',
    scene: [
      ["#door", "gate", [[4, 0]], (el) => el.textContent === "Open"],
      ["#hero", "hero", [[3, 3]]],
    ],
    hints: [
      "|| is two vertical bars, usually Shift + the backslash key.",
      "|| goes between the two booleans.",
      "return hasRope || hasKey; is the whole function.",
    ],
    solution:
      "function canEscape(hasRope, hasKey) {\n  return hasRope || hasKey;\n}",
    reward: 20,
    source: "Lecture: Advanced Conditionals — slide 4, Logical Operators: ||",
    tests: [
      test("true || true is true", [returns("canEscape", [true, true], true)]),
      test("true || false is true", [
        returns("canEscape", [true, false], true),
      ]),
      test("false || true is true", [
        returns("canEscape", [false, true], true),
      ]),
      test("false || false is false", [
        returns("canEscape", [false, false], false),
      ]),
    ],
  },
  {
    id: 15,
    title: "Hello John",
    chapter: "Treasure vault",
    concept: "Combining ! and &&",
    console: true,
    description:
      "The vault keeper greets John, but only when he visits as a regular user, not as an admin. The starter nests one if inside another. Refactor it into a single condition.",
    objectives: [
      "greet(user) logs hello John when the user is named John and is not an admin.",
      "It logs nothing for anyone else, including John as an admin.",
      "Use one if with ! and &&, not two nested ifs.",
    ],
    steps: [
      'Replace the two nested ifs with one: if (!user.isAdmin && user.name === "John").',
      'Inside it, console.log("hello John");',
      "Run spell: the tests visit as John and as other users.",
    ],
    syntax:
      'if (!user.isAdmin && user.name === "John") {\n  console.log("hello John");\n}',
    explanation:
      "In the slides' code challenge, an if nested inside another if runs only when both conditions are true. That is exactly what && means, so the two ifs become one: !user.isAdmin && user.name === \"John\". The ! flips isAdmin first, then && requires both sides to be true.",
    starter:
      '// greet receives a user like { name: "John", age: 25, isAdmin: false }\n// and logs "hello John" only if the user is John and is not an admin.\nfunction greet(user) {\n  if (!user.isAdmin) {\n    if (user.name === "John") {\n\n    }\n  }\n}',
    html: '<section id="battle"><p id="keeper">Keeper</p><p id="hero">Hero</p></section>',
    won: '<section id="battle"><p id="keeper">hello John</p><p id="hero">John</p></section>',
    scene: [
      ["#keeper", "villager", [[4, 1]]],
      ["#hero", "hero", [[2, 4]]],
    ],
    hints: [
      "A nested if is the same as joining both conditions with &&.",
      "! goes before user.isAdmin.",
      '"John" is a string, so compare with === and quotes.',
    ],
    solution:
      'function greet(user) {\n  if (!user.isAdmin && user.name === "John") {\n    console.log("hello John");\n  }\n}',
    reward: 20,
    source:
      "Lecture: Advanced Conditionals — slides 5–6, Code Challenge: refactor with ! and &&",
    tests: [
      test("John as a regular user is greeted", [logs("hello John")], {
        steps: [call("greet", { name: "John", age: 25, isAdmin: false })],
      }),
      test("John as an admin is not", [logs()], {
        steps: [call("greet", { name: "John", age: 25, isAdmin: true })],
      }),
      test("Someone else is not", [logs()], {
        steps: [call("greet", { name: "Ana", age: 30, isAdmin: false })],
      }),
      test("An admin who isn't John is not", [logs()], {
        steps: [call("greet", { name: "Ana", age: 30, isAdmin: true })],
      }),
    ],
  },
  {
    id: 16,
    title: "Raise the shield",
    chapter: "Treasure vault",
    concept: "Boolean values & the ! operator",
    console: true,
    description:
      "A goblin swings at the hero. A raised shield blocks it. The hero object remembers whether the shield is up with a boolean.",
    objectives: [
      "blockAttack(hero) returns Blocked when hero.shieldUp is true and Ouch! when it is false.",
      "toggleShield(shieldUp) returns the opposite boolean, using the ! operator.",
    ],
    steps: [
      'In blockAttack, write if (hero.shieldUp) and return "Blocked". It is already a boolean, so no === true is needed.',
      'Add an else that returns "Ouch!".',
      "In toggleShield, return !shieldUp; Try console.log(!true); to watch ! flip a boolean.",
    ],
    syntax:
      'const user = { isAdmin: false };\n\nif (user.isAdmin) {\n  // runs only when isAdmin is true\n}\n\nconsole.log(!true); // false',
    explanation:
      "A boolean expression can be a plain boolean value, like user.isAdmin from the slides. if (hero.shieldUp) needs no comparison, because shieldUp is already true or false. The ! (NOT) operator flips a boolean: !true is false and !false is true.",
    starter:
      '// Each hero object has a shieldUp boolean, like { shieldUp: true }.\n// blockAttack returns "Blocked" when the shield is up and "Ouch!" when\n// it is down. toggleShield returns the opposite of the boolean it gets.\nfunction blockAttack(hero) {\n\n}\n\nfunction toggleShield(shieldUp) {\n\n}',
    html: '<section id="battle"><p id="hero">Shield down</p><p class="goblin">Goblin</p><p class="goblin">Goblin</p></section>',
    won: '<section id="battle"><p id="hero">Shield up</p><p class="goblin">Goblin</p><p class="goblin">Goblin</p></section>',
    scene: [
      ["#hero", "hero", [[2, 4]], (el) => el.textContent === "Shield up"],
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
      "Read the boolean with hero.shieldUp.",
      "if (hero.shieldUp) works without === true.",
      "! goes right before the value: !shieldUp.",
    ],
    solution:
      'function blockAttack(hero) {\n  if (hero.shieldUp) {\n    return "Blocked";\n  } else {\n    return "Ouch!";\n  }\n}\n\nfunction toggleShield(shieldUp) {\n  return !shieldUp;\n}',
    reward: 20,
    source:
      "Lecture: Advanced Conditionals — slides 3–4, constant booleans and the ! operator",
    tests: [
      test("A raised shield blocks", [
        returns("blockAttack", [{ shieldUp: true }], "Blocked"),
      ]),
      test("A lowered shield doesn't", [
        returns("blockAttack", [{ shieldUp: false }], "Ouch!"),
      ]),
      test("! lowers a raised shield", [
        returns("toggleShield", [true], false),
      ]),
      test("! raises a lowered shield", [
        returns("toggleShield", [false], true),
      ]),
    ],
  },
  {
    id: 17,
    title: "Open the vault",
    chapter: "Treasure vault",
    concept: "The && (AND) operator",
    console: true,
    description:
      "The treasure vault has two locks. It opens only when the hero holds the red key and the blue key.",
    objectives: [
      "openVault(hero) returns Open only if hero.hasRedKey && hero.hasBlueKey.",
      "Otherwise it returns Locked.",
    ],
    steps: [
      "Inside openVault, write if (hero.hasRedKey && hero.hasBlueKey).",
      'Return "Open" inside the if, and "Locked" in an else.',
      "Run spell: the tests try every mix of keys.",
    ],
    syntax:
      "if (hasTicket && hasSeat) {\n  // runs only when both are true\n} else {\n  // runs when either one is false\n}",
    explanation:
      "Logical operators act on boolean expressions and resolve to a new boolean. && (AND) is true only when both sides are true: true && true is true, while true && false, false && true, and false && false are all false. One key is not enough.",
    starter:
      '// Each hero object has two booleans: hasRedKey and hasBlueKey.\n// openVault returns "Open" only when the hero has both keys, and\n// "Locked" otherwise.\nfunction openVault(hero) {\n\n}',
    html: '<section id="battle"><p id="vault">Sealed</p><p id="hero">Hero</p></section>',
    won: '<section id="battle"><p id="vault">Open</p><p id="hero">Hero</p></section>',
    scene: [
      ["#vault", "gate", [[4, 0]], (el) => el.textContent === "Open"],
      ["#hero", "hero", [[3, 3]]],
    ],
    hints: [
      "Both keys live on the hero object: hero.hasRedKey and hero.hasBlueKey.",
      "&& sits between the two conditions inside one pair of parentheses.",
      "The else covers every other case.",
    ],
    solution:
      'function openVault(hero) {\n  if (hero.hasRedKey && hero.hasBlueKey) {\n    return "Open";\n  } else {\n    return "Locked";\n  }\n}',
    reward: 20,
    source:
      "Lecture: Advanced Conditionals — slides 4 and 6, Logical Operators: &&",
    tests: [
      test("No keys: locked", [
        returns(
          "openVault",
          [{ hasRedKey: false, hasBlueKey: false }],
          "Locked",
        ),
      ]),
      test("Red key alone: locked", [
        returns("openVault", [{ hasRedKey: true, hasBlueKey: false }], "Locked"),
      ]),
      test("Blue key alone: locked", [
        returns("openVault", [{ hasRedKey: false, hasBlueKey: true }], "Locked"),
      ]),
      test("Both keys: open", [
        returns("openVault", [{ hasRedKey: true, hasBlueKey: true }], "Open"),
      ]),
    ],
  },
  {
    id: 18,
    title: "Enter the guild",
    chapter: "Guild hall",
    concept: "The || (OR) operator",
    console: true,
    description:
      "The guild guard lets in adults and admins. The starter checks this with an if and an else if that do the same thing. Refactor them into one condition, and turn everyone else away.",
    objectives: [
      "checkAccess(user) logs access granted if user.age >= 18 || user.isAdmin.",
      "Otherwise it logs access denied.",
      "Each call logs exactly one line.",
    ],
    steps: [
      "Combine the two conditions into one: if (user.age >= 18 || user.isAdmin).",
      'Keep one console.log("access granted") inside it and delete the else if.',
      'Add an else that logs "access denied". Run spell.',
    ],
    syntax:
      "if (isWeekend || isHoliday) {\n  // runs when at least one is true\n} else {\n  // runs only when both are false\n}",
    explanation:
      "|| (OR) is true when at least one side is true; it is false only when both sides are false. In the slides' code challenge, if (user.age >= 18 || user.isAdmin) replaces an if and an else if that did the same thing. A comparison like user.age >= 18 and a boolean like user.isAdmin can sit on either side.",
    starter:
      '// checkAccess receives a user like { name: "John", age: 25, isAdmin: false }\n// and logs "access granted" for adults (18 or older) and admins, and\n// "access denied" for everyone else.\nfunction checkAccess(user) {\n  if (user.age >= 18) {\n    console.log("access granted");\n  } else if (user.isAdmin) {\n    console.log("access granted");\n  }\n}',
    html: '<section id="battle"><p id="guard">Halt</p><p id="hero">Hero</p></section>',
    won: '<section id="battle"><p id="guard">Welcome</p><p id="hero">Hero</p></section>',
    scene: [
      ["#guard", "villager", [[4, 1]]],
      ["#hero", "hero", [[2, 4]]],
    ],
    hints: [
      "Use >= so an 18-year-old counts.",
      "|| goes between the two conditions.",
      "user.isAdmin is already a boolean; no === true needed.",
    ],
    solution:
      'function checkAccess(user) {\n  if (user.age >= 18 || user.isAdmin) {\n    console.log("access granted");\n  } else {\n    console.log("access denied");\n  }\n}',
    reward: 20,
    source:
      "Lecture: Advanced Conditionals — slides 5–6, Code Challenge: refactor with ||",
    tests: [
      test("An adult gets in", [logs("access granted")], {
        steps: [call("checkAccess", { name: "John", age: 25, isAdmin: false })],
      }),
      test("Exactly 18 gets in", [logs("access granted")], {
        steps: [call("checkAccess", { name: "Ana", age: 18, isAdmin: false })],
      }),
      test("A young admin gets in", [logs("access granted")], {
        steps: [call("checkAccess", { name: "Kai", age: 16, isAdmin: true })],
      }),
      test("Everyone else is denied", [logs("access denied")], {
        steps: [call("checkAccess", { name: "Kai", age: 16, isAdmin: false })],
      }),
    ],
  },
  {
    id: 19,
    title: "Four guild doors",
    chapter: "Guild hall",
    concept: "Combining &&, || & parentheses",
    console: true,
    description:
      "The guild hall has four doors, A to D, each with its own rule. Log the letter of every door a user may pass. More than one can open.",
    objectives: [
      "checkDoors(user) logs A if the user is not an admin.",
      "It logs B if the user is an admin or 18 or older, and C if the user is named John and is an admin.",
      "It logs D if the user is named John and is either an admin or 18 or older.",
    ],
    steps: [
      "Write four separate if statements, not a chain: more than one door can open.",
      'A is if (!user.isAdmin), B uses ||, and C uses &&. Each one logs its letter, like console.log("A").',
      'D is user.name === "John" && (user.isAdmin || user.age >= 18). Keep the parentheses. Run spell.',
    ],
    syntax:
      "if (hasTicket && (age >= 18 || withAdult)) {\n  // a ticket, plus at least one of the others\n}",
    explanation:
      "As in math, parentheses decide what is worked out first. In D, the || resolves first, then && also requires the name John. Without the parentheses, && goes before ||, so anyone 18 or older would pass D. Separate if statements are each checked, unlike a chain, which is why the slides' John (25, not an admin) gets A, B, and D.",
    starter:
      '// checkDoors receives a user like { name: "John", age: 25, isAdmin: false }\n// and logs the letter of every door the user may pass, in order:\n// A for non-admins, B for admins or anyone 18 or older, C for an admin\n// named John, and D for John if he is an admin or 18 or older.\nfunction checkDoors(user) {\n\n}',
    html: '<section id="battle"><p id="door">Closed</p><p id="boss">Goblin king</p><p id="hero">Hero</p></section>',
    won: '<section id="battle"><p id="door">Open</p><p id="boss">Goblin king</p><p id="hero">Hero</p></section>',
    scene: [
      ["#door", "gate", [[4, 0]], (el) => el.textContent === "Open"],
      ["#boss", "boss", [[5, 2]]],
      ["#hero", "hero", [[2, 4]]],
    ],
    hints: [
      "Four ifs, no else: each door is checked on its own.",
      "! goes before user.isAdmin for door A.",
      "Wrap user.isAdmin || user.age >= 18 in its own parentheses for D.",
    ],
    solution:
      'function checkDoors(user) {\n  if (!user.isAdmin) {\n    console.log("A");\n  }\n  if (user.isAdmin || user.age >= 18) {\n    console.log("B");\n  }\n  if (user.name === "John" && user.isAdmin) {\n    console.log("C");\n  }\n  if (user.name === "John" && (user.isAdmin || user.age >= 18)) {\n    console.log("D");\n  }\n}',
    reward: 20,
    source: "Lecture: Advanced Conditionals — slides 7–8, A, B, C and or D?",
    tests: [
      test("The slides' John gets A, B, and D", [logs("A", "B", "D")], {
        steps: [call("checkDoors", { name: "John", age: 25, isAdmin: false })],
      }),
      test("Young admin John gets B, C, and D", [logs("B", "C", "D")], {
        steps: [call("checkDoors", { name: "John", age: 16, isAdmin: true })],
      }),
      test("Young John gets only A", [logs("A")], {
        steps: [call("checkDoors", { name: "John", age: 16, isAdmin: false })],
      }),
      test("An adult who isn't John gets A and B", [logs("A", "B")], {
        steps: [call("checkDoors", { name: "Ana", age: 30, isAdmin: false })],
      }),
    ],
  },
  {
    id: 20,
    title: "Empty the quiver",
    chapter: "Guild hall",
    concept: "Truthy & falsy values",
    console: true,
    description:
      "The hero has 3 arrows, and each shot uses one. When the quiver is empty, the goblin laughs and the count never drops below 0.",
    objectives: [
      "Use arrows itself as the condition: if (arrows).",
      "While arrows remain, shoot() subtracts 1 and returns Hit!.",
      "When arrows is 0, shoot() returns Ha ha! and leaves arrows at 0.",
    ],
    steps: [
      "Inside shoot, write if (arrows), with no comparison.",
      'Inside it, subtract one with arrows -= 1; and return "Hit!".',
      'Add an else that returns "Ha ha!". Run spell: the tests shoot until the quiver is empty.',
    ],
    syntax:
      "const user = { age: 25, id: 0 };\n\nif (user.age) {\n  // this will happen!\n}\nif (user.id) {\n  // this will NOT happen!\n}",
    explanation:
      "The (parentheses) of an if are a boolean context: JavaScript turns whatever is inside into true or false. The falsy values are null, undefined, 0, \"\", false, and NaN; everything else is truthy. So if (arrows) is true for 3, 2, and 1, and false only at 0.",
    starter:
      '// The hero starts with 3 arrows. Each call to shoot uses one arrow and\n// returns "Hit!", until the quiver is empty: then shoot returns "Ha ha!"\n// and arrows stays at 0.\nlet arrows = 3;\n\nfunction shoot() {\n\n}',
    html: '<section id="battle"><p id="goblin">Goblin</p><p id="hero">Hero</p></section>',
    won: '<section id="battle"><p id="goblin">Hit!</p><p id="hero">Hero</p></section>',
    scene: [
      ["#goblin", "goblin", [[5, 2]], (el) => el.textContent === "Hit!"],
      ["#hero", "hero", [[2, 4]]],
    ],
    hints: [
      "if (arrows) is false only when arrows is 0.",
      "Subtract inside the if, so an empty quiver stays at 0.",
      "Check first, then subtract: the third shot still hits.",
    ],
    solution:
      'let arrows = 3;\n\nfunction shoot() {\n  if (arrows) {\n    arrows -= 1;\n    return "Hit!";\n  } else {\n    return "Ha ha!";\n  }\n}',
    reward: 20,
    source:
      "Lecture: Advanced Conditionals — slides 9–10, Boolean Context and Truthy & Falsey",
    tests: [
      test("The first shot hits", [returns("shoot", [], "Hit!")]),
      test(
        "Three arrows, three hits",
        times(3, returns("shoot", [], "Hit!")),
      ),
      test("An empty quiver makes the goblin laugh", [
        ...times(3, returns("shoot", [], "Hit!")),
        returns("shoot", [], "Ha ha!"),
      ]),
      test("It stays empty", [
        ...times(3, returns("shoot", [], "Hit!")),
        ...times(3, returns("shoot", [], "Ha ha!")),
      ]),
    ],
  },
  {
    id: 21,
    title: "Join the party",
    chapter: "Goblin king",
    concept: "Falsy strings & !",
    console: true,
    description:
      "A slime wants to join the party before the last fight, but it needs a name first. An empty or missing name is falsy, so ! catches it.",
    objectives: [
      "recruit(name) returns Name required if !name.",
      "Otherwise it returns Welcome, followed by the name, like Welcome, Goo.",
    ],
    steps: [
      'Inside recruit, write if (!name) and return "Name required".',
      'Add an else that returns "Welcome, " + name.',
      'Try console.log(recruit("0")); and console.log(recruit()); then Run spell.',
    ],
    syntax:
      'if (!nickname) {\n  // runs for "" and undefined, which are falsy\n} else {\n  // runs for any non-empty string\n}',
    explanation:
      '"" is falsy, so !"" is true. A missing argument is undefined, which is falsy too. Any string with at least one character is truthy, even "0" or " ", so ! makes it false. In the slides, !user.ID is truthy because user.ID is undefined.',
    starter:
      '// recruit takes the slime\'s name. With no name (an empty string or\n// nothing at all), it returns "Name required". Otherwise it returns\n// "Welcome, " followed by the name.\nfunction recruit(name) {\n\n}',
    html: '<section id="battle"><p id="recruit">Recruit</p><p id="hero">Hero</p></section>',
    won: '<section id="battle"><p id="recruit">Goo</p><p id="hero">Hero</p></section>',
    scene: [
      ["#recruit", "slime", [[1, 5]], (el) => el.textContent !== "Recruit"],
      ["#hero", "hero", [[2, 4]]],
    ],
    hints: [
      "! goes right before the variable: if (!name).",
      'Join text with +: "Welcome, " + name.',
      "There is a space after the comma.",
    ],
    solution:
      'function recruit(name) {\n  if (!name) {\n    return "Name required";\n  } else {\n    return "Welcome, " + name;\n  }\n}',
    reward: 20,
    source:
      "Lecture: Advanced Conditionals — slides 10–12, Truthy & Falsey and the ! operator",
    tests: [
      test("An empty name is required", [
        returns("recruit", [""], "Name required"),
      ]),
      test("A missing name is required", [
        returns("recruit", [], "Name required"),
      ]),
      test("A name is welcomed", [returns("recruit", ["Goo"], "Welcome, Goo")]),
      test('"0" is a truthy string', [returns("recruit", ["0"], "Welcome, 0")]),
    ],
  },
  {
    id: 22,
    title: "Flip the coin",
    chapter: "Goblin king",
    concept: "The ternary operator",
    console: true,
    description:
      "Flip a coin for the hero's blessing before the final battle. Heads glows gold; tails glows silver.",
    objectives: [
      "flip() uses condition ? a : b to return Heads when Math.random() > 0.5 and Tails otherwise.",
      "coinColor(result) uses another ternary to return gold for Heads and silver for Tails.",
    ],
    steps: [
      'Inside flip: return Math.random() > 0.5 ? "Heads" : "Tails";',
      'Inside coinColor: return result === "Heads" ? "gold" : "silver";',
      "Try console.log(flip()); a few times, then Run spell.",
    ],
    syntax: 'const label = score >= 50 ? "Pass" : "Fail";',
    explanation:
      "The expression condition ? a : b resolves to a when the condition is true and to b when it is false. It replaces an if/else whose only job is to choose a value, so it fits in a return or a const. The checks look at results, so an if/else also passes; the ternary is the shorter spell.",
    starter:
      '// flip returns "Heads" when a random number is above 0.5 and "Tails"\n// otherwise. coinColor returns "gold" for "Heads" and "silver" for\n// "Tails". Both use the ternary operator.\nfunction flip() {\n\n}\n\nfunction coinColor(result) {\n\n}',
    html: '<section id="battle"><p id="hero">Waiting</p><p class="goblin">Goblin</p></section>',
    won: '<section id="battle"><p id="hero" style="color:gold">Heads</p><p class="goblin">Goblin</p></section>',
    scene: [
      ["#hero", "hero", [[2, 4]], (el) => el.textContent === "Heads"],
      [".goblin", "goblin", [[5, 2]]],
    ],
    hints: [
      "The shape is condition ? valueIfTrue : valueIfFalse.",
      "Put return in front of the whole ternary.",
      'coinColor checks result === "Heads".',
    ],
    solution:
      'function flip() {\n  return Math.random() > 0.5 ? "Heads" : "Tails";\n}\n\nfunction coinColor(result) {\n  return result === "Heads" ? "gold" : "silver";\n}',
    reward: 20,
    source: "Lecture: Advanced Conditionals — slides 13–14, Ternary Operator",
    tests: [
      test("A high draw is Heads", [returns("flip", [], "Heads")], {
        random: [0.9],
      }),
      test("A low draw is Tails", [returns("flip", [], "Tails")], {
        random: [0.1],
      }),
      test("Exactly 0.5 is Tails", [returns("flip", [], "Tails")], {
        random: [0.5],
      }),
      test(
        "Every flip draws again",
        [returns("flip", [], "Tails"), returns("flip", [], "Heads")],
        { random: [0.2, 0.7] },
      ),
      test("Heads glows gold, Tails silver", [
        returns("coinColor", ["Heads"], "gold"),
        returns("coinColor", ["Tails"], "silver"),
      ]),
    ],
  },
  {
    id: 23,
    title: "Catch the goblin king",
    chapter: "Final battle",
    concept: "Collision detection: doCollide",
    console: true,
    description:
      "Close in on the goblin king. Two boxes collide only when they overlap both across and down; touching edges don't count.",
    objectives: [
      "doCollide(a, b) returns true only when box a overlaps box b, and false otherwise.",
      "Compare opposite sides: a's left with b's right, a's right with b's left, and the same for top and bottom.",
    ],
    steps: [
      "In doCollide, work out each side: left is x, right is x + width, top is y, bottom is y + height.",
      "Return true only if a's left < b's right && a's right > b's left && a's top < b's bottom && a's bottom > b's top.",
      "Otherwise return false. Try console.log(doCollide(hero, boss)); then Run spell.",
    ],
    syntax:
      "const box = { x: 10, y: 20, width: 50, height: 30 };\nconst left = box.x;\nconst right = box.x + box.width;\nconst top = box.y;\nconst bottom = box.y + box.height;",
    explanation:
      "A box's x and y mark its top-left corner, and y grows downward. Its sides are left = x, right = x + width, top = y, and bottom = y + height. Two boxes overlap only when each starts before the other ends, both across (a's left < b's right and a's right > b's left) and down (a's top < b's bottom and a's bottom > b's top). Using < and > means boxes that only touch don't collide.",
    starter:
      "// Each box has an x, y, width, and height. doCollide returns true only\n// if box a overlaps box b, and false otherwise.\nconst hero = { x: 0, y: 0, width: 50, height: 50 };\nconst boss = { x: 100, y: 100, width: 50, height: 50 };\n\nfunction doCollide(a, b) {\n\n}",
    html: '<section id="battle"><p id="hero">Hero</p><p id="boss">Clear</p></section>',
    won: '<section id="battle"><p id="hero" style="left:75px;top:75px">Hero</p><p id="boss">Hit!</p></section>',
    scene: [
      ["#hero", "hero", [[1, 1]]],
      ["#boss", "boss", [[3, 3]], (el) => el.textContent === "Hit!"],
    ],
    hints: [
      "a.x + a.width is a's right side; a.y + a.height is its bottom.",
      "All four comparisons must be true, so join them with &&.",
      "Use < and >, not <= and >=: touching edges are not a hit.",
    ],
    solution:
      "const hero = { x: 0, y: 0, width: 50, height: 50 };\nconst boss = { x: 100, y: 100, width: 50, height: 50 };\n\nfunction doCollide(a, b) {\n  const aRight = a.x + a.width;\n  const aBottom = a.y + a.height;\n  const bRight = b.x + b.width;\n  const bBottom = b.y + b.height;\n  if (a.x < bRight && aRight > b.x && a.y < bBottom && aBottom > b.y) {\n    return true;\n  } else {\n    return false;\n  }\n}",
    reward: 20,
    source:
      "Lecture: Advanced Conditionals — slides 16–20 and 23, doCollide and Object Borders",
    tests: [
      ...[
        ["Far apart is clear", 0, 0, false],
        ["Beside the boss but higher up is clear", 75, 0, false],
        ["Level with the boss but off to the left is clear", 0, 75, false],
        ["Touching a side edge is clear", 50, 75, false],
        ["Touching the top edge is clear", 75, 50, false],
        ["Past the boss is clear", 175, 75, false],
        ["Below the boss is clear", 75, 175, false],
        ["Overlapping the boss is a hit", 75, 75, true],
      ].map(([label, x, y, hit]) =>
        test(label, [
          returns(
            "doCollide",
            [
              { x, y, width: 50, height: 50 },
              { x: 100, y: 100, width: 50, height: 50 },
            ],
            hit,
          ),
        ]),
      ),
      test("A big box around the boss is a hit, either way round", [
        returns(
          "doCollide",
          [
            { x: 0, y: 0, width: 300, height: 300 },
            { x: 100, y: 100, width: 50, height: 50 },
          ],
          true,
        ),
        returns(
          "doCollide",
          [
            { x: 100, y: 100, width: 50, height: 50 },
            { x: 0, y: 0, width: 300, height: 300 },
          ],
          true,
        ),
      ]),
    ],
  },
];

// A quest's topic is its lecture. Each topic's first quest is always open.
export const topicOf = (lesson) =>
  lesson.source.split(" — ")[0].replace("Lecture: ", "");
